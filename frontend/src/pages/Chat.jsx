import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import './Chat.css';

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chats/${id}/messages`);
        setMessages(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setStreamingMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/chats/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: userMsg.content })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let currentMsg = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunks = decoder.decode(value).split('\n\n');
        for (const chunk of chunks) {
          if (chunk.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(chunk.replace('data: ', ''));
              if (data.error) {
                 console.error(data.error);
                 break;
              }
              if (data.text) {
                currentMsg += data.text;
                setStreamingMessage(currentMsg);
              }
              if (data.done) {
                 setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: currentMsg, sources: data.sources }]);
                 setStreamingMessage('');
                 setIsTyping(false);
              }
            } catch (err) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-wrapper ${msg.role}`}
            >
              <div className="avatar">
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-container">
                    <span>Sources:</span>
                    {msg.sources.map((src, idx) => (
                      <div key={idx} className="source-chip" title={src.content}>
                        {src.file} (Pg {src.page})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {streamingMessage && (
            <motion.div className="message-wrapper assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="avatar"><Bot size={20} /></div>
              <div className="message-content">
                <p>{streamingMessage}<span className="cursor blink">▋</span></p>
              </div>
            </motion.div>
          )}

          {isTyping && !streamingMessage && (
             <motion.div className="message-wrapper assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div className="avatar"><Bot size={20} /></div>
               <div className="message-content typing-indicator">
                 <span>.</span><span>.</span><span>.</span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
           type="text" 
           placeholder="Ask any question about your documents..." 
           value={input}
           onChange={(e) => setInput(e.target.value)}
           disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()}><Send size={20} /></button>
      </form>
    </div>
  );
};

export default Chat;
