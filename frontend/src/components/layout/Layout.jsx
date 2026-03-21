import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, Settings, Moon, Sun, LogOut, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import './Layout.css';

const Layout = () => {
  const [theme, setTheme] = useState('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isDesktopCollapsed ? 'desktop-collapsed' : ''}`}>
        <div className="sidebar-header">
          <Menu className="icon menu-btn" onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} />
          {!isDesktopCollapsed && <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer', margin: 0 }}>Contexta</h2>}
          <X className="icon close-btn" onClick={() => setIsSidebarOpen(false)} />
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <Home className="icon"/> 
            {!isDesktopCollapsed && <span>Dashboard</span>}
          </Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="nav-item">
               <Settings className="icon"/> 
               {!isDesktopCollapsed && <span>Admin</span>}
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
           {user && !isDesktopCollapsed && (
             <div className="user-profile">
               <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
               <div className="user-info">
                 <span className="user-name">{user.name || 'User'}</span>
                 <span className="user-email">{user.email || ''}</span>
               </div>
             </div>
           )}
           <button onClick={toggleTheme} className="nav-item border-btn" title="Toggle Theme">
             {theme === 'light' ? <Moon className="icon"/> : <Sun className="icon"/>} 
             {!isDesktopCollapsed && <span>Theme</span>}
           </button>
           <button onClick={handleLogout} className="nav-item border-btn danger" title="Logout">
             <LogOut className="icon"/> 
             {!isDesktopCollapsed && <span>Logout</span>}
           </button>
        </div>
      </aside>
      <main className="main-content">
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="icon" />
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
