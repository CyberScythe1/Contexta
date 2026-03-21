const db = require('../config/db');
const pdfParse = require('pdf-parse');
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'mock-key');

const getKnowledgeBases = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.query(
      'SELECT * FROM knowledge_bases WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KBs' });
  }
};

const createKnowledgeBase = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    if (!process.env.DATABASE_URL) return res.json({ id: 'mock-kb-id', name, user_id: req.user.id });

    const result = await db.query(
      'INSERT INTO knowledge_bases (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create KB' });
  }
};

const deleteKnowledgeBase = async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const kbId = req.params.id;
      // Native explicit CASCADE to satisfy strict PostgreSQL foreign key constraints 
      // 1. Delete all explicit junction locks mapping documents to chats
      await db.query('DELETE FROM chat_documents WHERE chat_id IN (SELECT id FROM chats WHERE knowledge_base_id = $1)', [kbId]);
      
      // 2. Delete all chat messages directly bound to any chat inside this KB
      await db.query('DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE knowledge_base_id = $1)', [kbId]);
      
      // 3. Delete completely empty nested chats in this KB
      await db.query('DELETE FROM chats WHERE knowledge_base_id = $1', [kbId]);
      
      // 4. Delete the heavy vectorized chunks tied to explicit documents
      await db.query('DELETE FROM document_chunks WHERE document_id IN (SELECT id FROM documents WHERE knowledge_base_id = $1)', [kbId]);
      
      // 5. Delete pointer references to documents in knowledge base
      await db.query('DELETE FROM documents WHERE knowledge_base_id = $1', [kbId]);
      
      // 6. Delete the Knowledge Base object perfectly constraint-free
      await db.query('DELETE FROM knowledge_bases WHERE id = $1 AND user_id = $2', [kbId, req.user.id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete KB due to constraint locks' });
  }
};

const getDocuments = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.query(
      'SELECT id, file_name, file_type, status, created_at FROM documents WHERE knowledge_base_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

const chunkText = (text, maxLength = 1000, overlap = 200) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxLength));
    i += maxLength - overlap;
  }
  return chunks;
};

const uploadDocument = async (req, res) => {
  let docId = 'mock-doc-id';
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const kbId = req.params.id;

    // 1. Save document as pending
    if (process.env.DATABASE_URL) {
      const docResult = await db.query(
        'INSERT INTO documents (knowledge_base_id, file_name, file_type, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [kbId, req.file.originalname, req.file.mimetype, 'PROCESSING']
      );
      docId = docResult.rows[0].id;
    }

    // 2. Extract text with robust fallback mapping
    let text = '';
    if (req.file.originalname.toLowerCase().endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
       const pdfData = await pdfParse(req.file.buffer);
       text = pdfData.text;
    } else {
       text = req.file.buffer.toString('utf-8');
    }

    // 3. Chunk text natively
    const chunks = chunkText(text);

    // 4. Send response safely
    res.status(202).json({ id: docId, message: 'Processing started', status: 'PROCESSING' });

    // 5. Process embeddings in async background loop
    if (process.env.HUGGINGFACE_API_KEY && process.env.DATABASE_URL) {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk.trim()) continue;
        
        const embeddingArray = await hf.featureExtraction({
          model: 'BAAI/bge-small-en-v1.5',
          inputs: chunk,
        });
        const vectorStr = `[${embeddingArray.join(',')}]`;

        await db.query(
           'INSERT INTO document_chunks (document_id, content, embedding, page_number) VALUES ($1, $2, $3, $4)',
           [docId, chunk, vectorStr, 1] 
        );
      }
      await db.query('UPDATE documents SET status = $1 WHERE id = $2', ['READY', docId]);
    } else if (process.env.DATABASE_URL) {
       await db.query('UPDATE documents SET status = $1 WHERE id = $2', ['READY', docId]);
    }

  } catch (error) {
    console.error('Upload Error explicitly caught:', error);
    
    // Safety Net: Unbind the Ghosting lock by forcing an exact database update on error!
    if (docId !== 'mock-doc-id' && process.env.DATABASE_URL) {
       try { await db.query('UPDATE documents SET status = $1 WHERE id = $2', ['ERROR', docId]); } 
       catch (dbErr) { console.error('Double fault updating status hook:', dbErr); }
    }
    
    if (!res.headersSent) res.status(500).json({ error: 'Document extraction or vector processing explicitly failed' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    if (process.env.DATABASE_URL) {
       // Cascade constraints logic manually for individual documents
       await db.query('DELETE FROM chat_documents WHERE document_id = $1', [docId]);
       await db.query('DELETE FROM document_chunks WHERE document_id = $1', [docId]);
       await db.query('DELETE FROM documents WHERE id = $1 AND knowledge_base_id = $2', [docId, id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete Document' });
  }
};

module.exports = { getKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase, getDocuments, uploadDocument, deleteDocument };
