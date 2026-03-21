import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, FileText, Bot, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (isAuthenticated) return null;

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <h2>Contexta</h2>
        <button className="primary-btn glass" onClick={() => navigate('/login')}>
          Login
        </button>
      </nav>

      <main className="landing-main">
        <motion.div className="landing-hero" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants}>
            Talk to Your <span className="gradient-text">Documents</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="landing-subtitle">
            Contexta is an advanced RAG (Retrieval-Augmented Generation) application. 
            Upload your PDFs and text files, build focused Knowledge Bases, and chat with an AI that knows exactly what you feed it.
          </motion.p>
          <motion.div variants={itemVariants} className="hero-actions">
            <button className="primary-btn large" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>

        <motion.div className="features-grid" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="feature-card glass-panel" variants={itemVariants}>
             <Database className="feature-icon" color="var(--accent-color)" size={32} />
             <h3>Live Knowledge Bases</h3>
             <p>Organize your context logically. Create multiple distinct knowledge silos to isolate your workspaces efficiently.</p>
          </motion.div>
          
          <motion.div className="feature-card glass-panel" variants={itemVariants}>
             <FileText className="feature-icon" color="var(--accent-color)" size={32} />
             <h3 style={{lineHeight: 1.5}}>File-Specific Granularity</h3>
             <p>Don't want to chat with everything? Select the exact files you want Contexta to analyze for highly accurate RAG generation.</p>
          </motion.div>

          <motion.div className="feature-card glass-panel" variants={itemVariants}>
             <Bot className="feature-icon" color="var(--accent-color)" size={32} />
             <h3>Powered by Qwen 2.5</h3>
             <p>Backed by Hugging Face API, Contexta utilizes absolute state-of-the-art 72B parameter LLMs for brilliant conversational reasoning.</p>
          </motion.div>
        </motion.div>
      </main>
      
      <div className="landing-blobs">
         <div className="blob blob-1"></div>
         <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default Landing;
