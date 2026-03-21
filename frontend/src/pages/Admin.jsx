import React, { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare } from 'lucide-react';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalDocs: 0, totalQueries: 0 });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (e) {
        console.error('Admin API error. Make sure you are logged in as ADMIN.', e);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Global statistics and user management.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24}/></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon docs"><FileText size={24}/></div>
          <div className="stat-info">
            <h3>Total Documents</h3>
            <p>{stats.totalDocs}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon queries"><MessageSquare size={24}/></div>
          <div className="stat-info">
            <h3>Total Queries</h3>
            <p>{stats.totalQueries}</p>
          </div>
        </div>
      </div>

      <div className="users-section">
        <h2>User Management</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id.substring(0,8)}...</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td>{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No users found. Note: Ensure you have ADMIN level token.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
