import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, MessageSquare, Edit2, Check, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import TutorialModal from '../components/TutorialModal';
import './Dashboard.css';

const Dashboard = () => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [chats, setChats] = useState([]);
  const [newKbName, setNewKbName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kbRes, chatRes] = await Promise.all([
          api.get('/kb'),
          api.get('/chats')
        ]);
        setKnowledgeBases(kbRes.data);
        setChats(chatRes.data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateKb = async (e) => {
    e.preventDefault();
    if (!newKbName.trim()) {
      alert('Please fill in a valid Knowledge Base name before clicking Create.');
      return;
    }
    try {
      const res = await api.post('/kb', { name: newKbName });
      setKnowledgeBases([res.data, ...knowledgeBases]);
      setNewKbName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChat = async (kbId) => {
    try {
      const res = await api.post('/chats', { knowledgeBaseId: kbId, title: 'New Chat' });
      navigate(`/dashboard/chat/${res.data.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKB = async (kbId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this Knowledge Base and all its uploaded documents and chats?")) return;
    try {
      await api.delete(`/kb/${kbId}`);
      setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== kbId));
      alert("Successfully deleted Knowledge Base.");
    } catch (e) {
      console.error(e);
      alert('Failed to delete knowledge base');
    }
  };

  const submitEditChat = async (chatId) => {
    if (!editTitle.trim()) { setEditingChatId(null); return; }
    try {
      const res = await api.put(`/chats/${chatId}`, { title: editTitle });
      setChats(chats.map(c => c.id === chatId ? { ...c, title: res.data.title } : c));
      setEditingChatId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this specific chat thread?")) return;
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(chats.filter(c => c.id !== chatId));
      alert("Successfully deleted Chat.");
    } catch (e) {
      console.error(e);
      alert('Failed to delete chat');
    }
  };

  if (loading) return <div className="loader blur-loader"></div>;

  return (
    <div className="dashboard-container">
      <TutorialModal />
      <header className="page-header">
        <h1>Welcome back</h1>
        <p>Manage your Knowledge Bases and Recent Chats.</p>
      </header>
      
      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Knowledge Bases</h2>
          </div>
          <form className="create-form" onSubmit={handleCreateKb}>
            <input 
              type="text" 
              placeholder="New Knowledge Base Name..." 
              value={newKbName}
              onChange={(e) => setNewKbName(e.target.value)}
            />
            <button type="submit" className="primary-btn"><Plus size={18}/> Create</button>
          </form>
          
          <div className="card-list">
            {knowledgeBases.length === 0 ? <p className="empty-state">No knowledge bases yet.</p> : null}
            {knowledgeBases.map(kb => (
              <div key={kb.id} className="card kb-card-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                <Link to={`/dashboard/kb/${kb.id}`} className="kb-card-link" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit', textDecoration: 'none', flex: 1 }}>
                  <Folder className="icon" />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{kb.name}</h3>
                    <small style={{ color: 'var(--text-secondary)' }}>Created: {new Date(kb.created_at || Date.now()).toLocaleDateString()}</small>
                  </div>
                </Link>
                <div className="card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                   <Link to={`/dashboard/kb/${kb.id}`} className="primary-btn sm outline" style={{textDecoration: 'none', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>Manage</Link>
                   <button className="primary-btn sm" onClick={(e) => { e.stopPropagation(); handleCreateChat(kb.id) }}>Chat</button>
                   <button className="icon-btn danger" style={{ padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--danger-color)' }} onClick={(e) => handleDeleteKB(kb.id, e)}><X size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Chats</h2>
          <div className="card-list">
            {chats.length === 0 ? <p className="empty-state">No recent chats.</p> : null}
            {chats.map(chat => (
              <div key={chat.id} className="card">
                <Link to={`/dashboard/chat/${chat.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit', textDecoration: 'none', flex: 1 }}>
                  <MessageSquare className="icon" />
                  <div>
                    {editingChatId === chat.id ? (
                      <input 
                        type="text" 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        onClick={e => e.preventDefault()}
                        autoFocus
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
                      />
                    ) : (
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{chat.title}</h3>
                    )}
                    <small style={{ color: 'var(--text-secondary)' }}>KB: {chat.kb_name} • {new Date(chat.created_at || Date.now()).toLocaleDateString()}</small>
                  </div>
                </Link>
                {editingChatId === chat.id ? (
                  <div className="card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--success-color)' }} onClick={() => submitEditChat(chat.id)}><Check size={18}/></button>
                    <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--danger-color)' }} onClick={() => setEditingChatId(null)}><X size={18}/></button>
                  </div>
                ) : (
                  <div className="card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }} onClick={() => { setEditingChatId(chat.id); setEditTitle(chat.title); }}><Edit2 size={16}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
