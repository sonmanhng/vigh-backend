import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-main)',
      padding: '1rem',
      background: 'linear-gradient(135deg, #EEEEEE 0%, #E2E8F0 100%)'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '2.5rem', 
        boxShadow: 'var(--shadow-lg)',
        borderTop: '6px solid var(--primary)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Viện VIGH Logo" style={{ maxHeight: '70px', maxWidth: '85%', objectFit: 'contain', margin: '0 auto 1rem auto', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
            VIỆN NGHIÊN CỨU VIGH
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Hệ Thống Quản Lý Đề Tài & Nhân Sự
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.875rem', 
            backgroundColor: 'rgba(250, 103, 129, 0.15)', 
            color: 'var(--accent-red)', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem', 
            textAlign: 'center', 
            fontWeight: 600,
            border: '1px solid rgba(250, 103, 129, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Cán Bộ (*)</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nguyenvana@vigh.org"
              required 
            />
          </div>
          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label className="input-label">Mật Khẩu (*)</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Đang Xác Thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          * Tài khoản mới chỉ có thể được cấp phát bởi Ban Lãnh Đạo hoặc Quản trị viên hệ thống (SuperAdmin / Trưởng Phòng).
        </div>
      </div>
    </div>
  );
};
