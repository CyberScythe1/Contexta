import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Trash2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import api from '../services/api';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await api.get(`/kb/${id}/documents`);
      setDocuments(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => {
    setDragging(false);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/kb/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // In a real app we might poll for status='READY', but for here we refetch immediately
      await fetchDocs();
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
  };

  const handleStartSelectiveChat = async () => {
    try {
      const res = await api.post('/chats', { 
        knowledgeBaseId: id, 
        title: `Chat with ${selectedDocs.length} file(s)`,
        documentIds: selectedDocs 
      });
      navigate(`/dashboard/chat/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to launch selective chat');
    }
  };

  const handleDeleteDoc = async (docId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this document and its vectorized memory?")) return;
    try {
      await api.delete(`/kb/${id}/documents/${docId}`);
      setDocuments(documents.filter(d => d.id !== docId));
      setSelectedDocs(selectedDocs.filter(d => d !== docId));
      alert("Successfully deleted Document.");
    } catch (e) {
      console.error(e);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="kb-container">
      <header className="page-header">
        <h1>Knowledge Base Documents</h1>
        <p>Upload PDF or TXT files to train your assistant.</p>
      </header>

      <div 
        className={`dropzone ${dragging ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <UploadCloud size={48} className="drop-icon" />
        <h3>Drag & Drop files here</h3>
        <p>or</p>
        <label className="primary-btn shrink">
          Browse Files
          <input type="file" accept=".pdf,.txt" hidden onChange={onFileChange} />
        </label>
        {uploading && <p className="uploading-text">Uploading and processing...</p>}
      </div>

      <div className="doc-list">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, padding: 0, border: 'none' }}>Uploaded Documents</h2>
          {selectedDocs.length > 0 && (
            <button className="primary-btn" onClick={handleStartSelectiveChat}>
              <MessageSquare size={16}/> Chat with Selected ({selectedDocs.length})
            </button>
          )}
        </div>
        {documents.length === 0 ? <p className="empty-state">No documents found.</p> : null}
        {documents.map(doc => (
          <div key={doc.id} className="doc-row">
            <div className="doc-info" style={{ cursor: 'pointer' }} onClick={() => toggleDocSelection(doc.id)}>
              <input 
                 type="checkbox" 
                 checked={selectedDocs.includes(doc.id)} 
                 onChange={(e) => { e.stopPropagation(); toggleDocSelection(doc.id); }} 
                 style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
              />
              <FileText className="icon" />
              <span>{doc.file_name}</span>
            </div>
            <div className="doc-status">
              {doc.status === 'READY' ? (
                <span className="status ready"><CheckCircle size={16}/> Ready</span>
              ) : doc.status === 'ERROR' ? (
                <span className="status error" style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={16}/> Failed</span>
              ) : (
                <span className="status pending"><Clock size={16}/> Processing...</span>
              )}
              <button 
                className="icon-btn danger" 
                onClick={(e) => handleDeleteDoc(doc.id, e)}
                title="Delete Document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
