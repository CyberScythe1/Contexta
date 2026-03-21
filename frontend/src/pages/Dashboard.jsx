import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, MessageSquare, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';
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
    if (!newKbName.trim()) return;
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
      navigate(`/chat/${res.data.id}`);
    } catch (e) {
      console.error(e);
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

  if (loading) return <div className="loader blur-loader"></div>;

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Welcome Back</h1>
        <p>Manage your knowledge bases and recent chats.</p>
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
              <div key={kb.id} className="card kb-card">
                <div className="card-info">
                  <Folder className="icon accent" />
                  <div>
                    <h3>{kb.name}</h3>
                    <small>{new Date(kb.created_at || Date.now()).toLocaleDateString()}</small>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="secondary-btn" onClick={() => handleCreateChat(kb.id)}>Chat</button>
                  <Link to={`/kb/${kb.id}`} className="secondary-btn outline">Manage</Link>
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
                <Link to={`/chat/${chat.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit', textDecoration: 'none', flex: 1 }}>
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
