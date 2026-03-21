const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { 
  getKnowledgeBases, 
  createKnowledgeBase, 
  deleteKnowledgeBase, 
  uploadDocument, 
  getDocuments,
  deleteDocument
} = require('../controllers/kbController');

const router = express.Router();

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.get('/', getKnowledgeBases);
router.post('/', createKnowledgeBase);
router.delete('/:id', deleteKnowledgeBase);

router.get('/:id/documents', getDocuments);
router.post('/:id/documents', upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId', deleteDocument);

module.exports = router;
