import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText, Bot, ArrowRight, Check } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import './TutorialModal.css';

const TutorialModal = () => {
  const user = useAuthStore(state => state.user);
  const completeTutorialFn = useAuthStore(state => state.completeTutorialFn);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!user || user.has_seen_tutorial) return null;

  const slides = [
    {
      icon: <Database size={48} color="var(--accent-color)" />,
      title: "Welcome to Contexta!",
      description: "Contexta is your private RAG ecosystem. The first step is to create a Knowledge Base to organize your documents logically."
    },
    {
      icon: <FileText size={48} color="var(--accent-color)" />,
      title: "Upload & Combine",
      description: "Open your Knowledge Base and drag-and-drop PDFs or text files. Contexta extracts and vectorizes the knowledge instantly."
    },
    {
      icon: <Bot size={48} color="var(--accent-color)" />,
      title: "File-Specific Chats",
      description: "Check the exact files you want to include in a conversation, then click 'Chat with Selected'. Contexta will strictly answer questions using ONLY those files!"
    }
  ];

  const nextStep = () => {
    if (step < slides.length - 1) setStep(step + 1);
  };

  const finishTutorial = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/tutorial');
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      completeTutorialFn();
    } catch (e) {
      console.error('Failed to complete tutorial', e);
      completeTutorialFn(); // Optistically hide it anyway
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutorial-overlay">
      <motion.div 
        className="tutorial-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="tutorial-progress">
          {slides.map((_, i) => (
            <div key={i} className={`progress-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            className="tutorial-slide"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tutorial-icon-wrap">{slides[step].icon}</div>
            <h2>{slides[step].title}</h2>
            <p>{slides[step].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="tutorial-footer">
          {step < slides.length - 1 ? (
             <button className="primary-btn glass" onClick={nextStep}>
               Next <ArrowRight size={16} />
             </button>
          ) : (
             <button className="primary-btn" onClick={finishTutorial} disabled={loading}>
               Got it! <Check size={16} />
             </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialModal;
