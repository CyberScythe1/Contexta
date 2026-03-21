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
      await db.query('DELETE FROM knowledge_bases WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete KB' });
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
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const kbId = req.params.id;

    // 1. Save document as pending
    let docId = 'mock-doc-id';
    if (process.env.DATABASE_URL) {
      const docResult = await db.query(
        'INSERT INTO documents (knowledge_base_id, file_name, file_type, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [kbId, req.file.originalname, req.file.mimetype, 'PROCESSING']
      );
      docId = docResult.rows[0].id;
    }

    // 2. Extract text
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
       const pdfData = await pdfParse(req.file.buffer);
       text = pdfData.text;
    } else {
       text = req.file.buffer.toString('utf-8');
    }

    // 3. Chunk text
    const chunks = chunkText(text);

    // 4. Send response early to not block UI, process embeddings async
    res.status(202).json({ id: docId, message: 'Processing started', status: 'PROCESSING' });

    // Process embeddings if we have the API key
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
    console.error('Upload Error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Document upload failed' });
  }
};

module.exports = { getKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase, getDocuments, uploadDocument };
