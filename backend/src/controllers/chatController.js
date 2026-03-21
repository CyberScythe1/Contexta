const db = require('../config/db');
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'mock-key');

const getChats = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.query(
      `SELECT c.*, kb.name as kb_name 
       FROM chats c 
       JOIN knowledge_bases kb ON c.knowledge_base_id = kb.id 
       WHERE c.user_id = $1 
         AND EXISTS (SELECT 1 FROM messages m WHERE m.chat_id = c.id)
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

const createChat = async (req, res) => {
  try {
    const { knowledgeBaseId, title, documentIds } = req.body;
    if (!knowledgeBaseId) return res.status(400).json({ error: 'Knowledge base ID is required' });

    if (!process.env.DATABASE_URL) return res.json({ id: 'mock-chat', title: title || 'New Chat', knowledge_base_id: knowledgeBaseId });

    const result = await db.query(
      'INSERT INTO chats (user_id, knowledge_base_id, title) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, knowledgeBaseId, title || 'New Chat']
    );
    const newChat = result.rows[0];

    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      for (const docId of documentIds) {
        await db.query('INSERT INTO chat_documents (chat_id, document_id) VALUES ($1, $2)', [newChat.id, docId]);
      }
    }

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

const getMessages = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    const messages = result.rows.map(row => ({
      ...row,
      sources: row.sources ? (typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources) : []
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  const { content } = req.body;
  const chatId = req.params.id;

  if (!content) return res.status(400).json({ error: 'Message content required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    let kbId = 'mock-kb';
    if (process.env.DATABASE_URL) {
      const chatDetails = await db.query('SELECT knowledge_base_id FROM chats WHERE id = $1 AND user_id = $2', [chatId, req.user.id]);
      if (chatDetails.rows.length === 0) {
        res.write('data: {"error": "Chat not found"}\n\n');
        return res.end();
      }
      kbId = chatDetails.rows[0].knowledge_base_id;
      await db.query('INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)', [chatId, 'user', content]);
    }

    let sources = [];
    let contextText = '';

    if (process.env.HUGGINGFACE_API_KEY && process.env.DATABASE_URL) {
      const queryEmbedding = await hf.featureExtraction({
        model: 'BAAI/bge-small-en-v1.5',
        inputs: content,
      });
      const queryVectorStr = `[${queryEmbedding.join(',')}]`;

      const chatDocsRes = await db.query('SELECT document_id FROM chat_documents WHERE chat_id = $1', [chatId]);
      let searchResult;
      
      if (chatDocsRes.rows.length > 0) {
        searchResult = await db.query(`
          SELECT dc.content, dc.page_number, d.file_name, dc.embedding <=> $1::vector AS distance
          FROM document_chunks dc
          JOIN documents d ON dc.document_id = d.id
          WHERE dc.document_id IN (SELECT document_id FROM chat_documents WHERE chat_id = $2)
          ORDER BY distance ASC
          LIMIT 5
        `, [queryVectorStr, chatId]);
      } else {
        searchResult = await db.query(`
          SELECT dc.content, dc.page_number, d.file_name, dc.embedding <=> $1::vector AS distance
          FROM document_chunks dc
          JOIN documents d ON dc.document_id = d.id
          WHERE d.knowledge_base_id = $2
          ORDER BY distance ASC
          LIMIT 5
        `, [queryVectorStr, kbId]);
      }

      sources = searchResult.rows.map(r => ({
        file: r.file_name,
        page: r.page_number,
        content: r.content
      }));

      contextText = sources.map((s, idx) => `[Source ${idx+1} - ${s.file}]:\n${s.content}`).join('\n\n');
    } else {
      sources = [{ file: 'mock.pdf', page: 1, content: 'Mock context to simulate missing APIs.' }];
      contextText = "This is a local environment mock without the APIs connected. Please review my provided 'missing API lists' to fully deploy.";
    }

    const systemPrompt = `You are a helpful assistant. Use ONLY the given context to answer the user's question. 
If the answer is not contained in the context, strictly reply with "Not found in your knowledge base."
Do not attempt to answer using external knowledge.
Context:
${contextText}`;

    if (process.env.HUGGINGFACE_API_KEY) {
      const stream = hf.chatCompletionStream({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ],
        max_tokens: 500
      });

      let fullAssistantMessage = '';
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        fullAssistantMessage += text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      if (process.env.DATABASE_URL) {
         await db.query('INSERT INTO messages (chat_id, role, content, sources) VALUES ($1, $2, $3, $4)', 
             [chatId, 'assistant', fullAssistantMessage, JSON.stringify(sources)]);
      }

      res.write(`data: ${JSON.stringify({ sources, done: true })}\n\n`);
      res.end();
    } else {
      const words = ("Based on the mock context, " + contextText).split(' ');
      let fullAssistantMessage = '';
      for (const word of words) {
         fullAssistantMessage += word + ' ';
         res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
         await new Promise(r => setTimeout(r, 50));
      }

      if (process.env.DATABASE_URL) {
        await db.query('INSERT INTO messages (chat_id, role, content, sources) VALUES ($1, $2, $3, $4)', 
           [chatId, 'assistant', fullAssistantMessage, JSON.stringify(sources)]);
      }

      res.write(`data: ${JSON.stringify({ sources, done: true })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Chat Error:', error);
    res.write('data: {"error": "Failed to generate response"}\n\n');
    res.end();
  }
};

const updateChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    if (!process.env.DATABASE_URL) return res.json({ id: req.params.id, title });
    
    const result = await db.query(
      'UPDATE chats SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    if (process.env.DATABASE_URL) {
      await db.query('DELETE FROM chat_documents WHERE chat_id = $1', [chatId]);
      await db.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);
      await db.query('DELETE FROM chats WHERE id = $1 AND user_id = $2', [chatId, req.user.id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

module.exports = { getChats, createChat, getMessages, sendMessage, updateChat, deleteChat };
