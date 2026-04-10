import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, FileText, Bot, ShieldCheck, Zap, ArrowRight, LayoutDashboard, Search } from 'lucide-react';
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
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (isAuthenticated) return null;

  return (
    <div className="landing-container">
      {/* Decorative Background */}
      <div className="landing-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <nav className="landing-nav">
        <div className="nav-logo">
          <Bot size={28} className="logo-icon" />
          <h2>Contexta</h2>
        </div>
        <div className="nav-actions">
          <button className="primary-btn outline" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="primary-btn glow" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </nav>

      <main className="landing-main">
        <motion.section 
          className="landing-hero"
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <span className="pulse-dot"></span> Reimagining RAG Architecture
          </motion.div>
          <motion.h1 variants={itemVariants}>
            Turn Your <span className="gradient-text">Documents</span> into <br/> Intelligent Conversations
          </motion.h1>
          <motion.p variants={itemVariants} className="landing-subtitle">
            Contexta is an advanced, flexible RAG platform. Upload PDFs, build isolated Knowledge Bases, and chat with your exact files using state-of-the-art AI models.
          </motion.p>
          <motion.div variants={itemVariants} className="hero-actions">
            <button className="primary-btn large glow" onClick={() => navigate('/login')}>
              Start Chatting Free <ArrowRight size={20} />
            </button>
          </motion.div>
        </motion.section>

        {/* Unified Features Section */}
        <motion.section 
          className="features-section"
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">Everything you need to talk to your data</h2>
            <p className="section-subtitle">Powerful features designed to give you precise control and perfect answers.</p>
          </motion.div>
          
          <div className="features-grid">
            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper purple">
                <Database size={24} />
              </div>
              <h3>Infinite Knowledge Bases</h3>
              <p>Organize your context logically. Create multiple distinct knowledge silos to isolate your workspaces and keep data organized.</p>
            </motion.div>
            
            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper blue">
                <Search size={24} />
              </div>
              <h3>File-Specific Granularity</h3>
              <p>Don't want to chat with everything? Select the exact PDFs or text files you want Contexta to analyze for highly accurate, hallucination-free generation.</p>
            </motion.div>

            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper pink">
                <Bot size={24} />
              </div>
              <h3>Pluggable AI Models</h3>
              <p>Choose your preferred brain. Natively switch between Gemini 1.5, OpenAI GPT-4o, and Hugging Face open-source models seamlessly.</p>
            </motion.div>

            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper green">
                <LayoutDashboard size={24} />
              </div>
              <h3>Local & Cloud Ready</h3>
              <p>Works out of the box with a beautiful mock UI for testing, but fully integrates with our robust local backend and PostgreSQL database.</p>
            </motion.div>

            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper orange">
                <ShieldCheck size={24} />
              </div>
              <h3>Secure Authentication</h3>
              <p>Enterprise-grade security using Google OAuth ensures your private documents and conversation history remain strictly yours.</p>
            </motion.div>

            <motion.div className="feature-card glass-panel" variants={itemVariants}>
              <div className="icon-wrapper yellow">
                <Zap size={24} />
              </div>
              <h3>Lightning Fast Rag</h3>
              <p>Built with pgvector for instant vector similarity search across thousands of pages to pull the exact paragraph you need in milliseconds.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section 
          className="bottom-cta"
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="cta-box glass-panel" variants={itemVariants}>
            <h2>Ready to extract value from your documents?</h2>
            <p>Join Contexta today and experience the future of local-first RAG.</p>
            <button className="primary-btn large fluid" onClick={() => navigate('/login')}>
              Log In with Google
            </button>
          </motion.div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Contexta AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
