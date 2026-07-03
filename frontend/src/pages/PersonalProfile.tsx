import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Navbar } from '../components/Navbar';

export const PersonalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/users/${id}`);
        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải thông tin hồ sơ...</div>;
  }

  if (error || !user) {
    return (
      <div className="content-area">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>Lỗi Tải Dữ Liệu</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error || 'Không tìm thấy hồ sơ người dùng.'}</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>
            Quay lại Bảng Điều Khiển
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (n?: string) => {
    if (!n) return 'V';
    const parts = n.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return n.charAt(0).toUpperCase();
  };

  const renderRow = (label: string, value: React.ReactNode | null | undefined) => {
    const hasValue = value !== undefined && value !== null && value !== '';
    return (
      <div style={{
        display: 'flex',
        padding: '1.1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        alignItems: 'flex-start',
        gap: '1.5rem'
      }}>
        <div style={{ width: '220px', minWidth: '180px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.92rem', paddingTop: '0.15rem' }}>
          {label}
        </div>
        <div style={{ flex: 1, fontSize: '0.95rem', color: hasValue ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {hasValue ? (
            <span style={{ fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.5 }}>
              {value}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Chưa cập nhật</span>
          )}
        </div>
      </div>
    );
  };

  const avatarValue = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
      ) : (
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
          {getInitials(user.name)}
        </div>
      )}
      <div>
        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>{user.name}</div>
        <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', marginTop: '0.25rem', display: 'inline-block' }}>{user.role}</span>
      </div>
    </div>
  );

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img 
            src="/logo.png" 
            alt="VIGH Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white', padding: '2px' }} 
          />
        </div>

        <nav className="sidebar-menu">
          <button className="menu-item" onClick={() => navigate('/dashboard')}>
            <span>Tiến độ đề tài</span>
          </button>
          <button className="menu-item active" onClick={() => navigate('/dashboard?tab=personnel')}>
            <span>Quản lý nhân sự</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>Hệ Thống Nội Bộ VIGH</div>
            <div>2026</div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <Navbar />

        <div className="content-area" style={{ padding: '1.5rem 2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard?tab=personnel')}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'rgba(52, 144, 139, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              Quay lại danh sách nhân sự
            </button>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Thông tin chung
                </h3>
              </div>
            </div>

            {/* Table Rows */}
            <div>
              {renderRow('Nhân sự', avatarValue)}
              {renderRow('Đơn vị công tác', user.department)}
              {renderRow('Cơ quan liên kết', user.affiliations && user.affiliations.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {user.affiliations.map((aff: string, idx: number) => (
                    <span key={idx} style={{ backgroundColor: 'rgba(0, 114, 229, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {aff}
                    </span>
                  ))}
                </div>
              ) : null)}
              {renderRow('Email', user.email ? <a href={`mailto:${user.email}`} style={{ color: 'var(--primary)' }}>{user.email}</a> : null)}
              {renderRow('Số điện thoại', user.phone)}
              {renderRow('Mã ORCID', user.orcid ? (
                <a href={`https://orcid.org/${user.orcid}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <img src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" alt="ORCID iD icon" style={{ width: '16px' }} />
                  {user.orcid}
                </a>
              ) : null)}
              {renderRow('Google Scholar', user.scholar ? (
                <a href={`https://scholar.google.com/citations?user=${user.scholar}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z" />
                  </svg>
                  {user.name}
                </a>
              ) : null)}
              {renderRow('Hướng nghiên cứu chính', user.researchInterests && user.researchInterests.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {user.researchInterests.map((interest: string, idx: number) => (
                    <span key={idx} className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              ) : null)}
              {renderRow('Lý lịch khoa học / Giới thiệu', user.bio ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{user.bio}</div>
              ) : null)}
            </div>
          </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>Các Đề Tài / Dự Án Đang Tham Gia</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {user.projects && user.projects.map((p: any) => (
            <div key={p.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">Chủ nhiệm đề tài</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.code}</span>
              </div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.5rem' }}>{p.name}</h3>
              <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{p.status}</span>
            </div>
          ))}

          {user.memberProjects && user.memberProjects.map((p: any) => (
            <div key={p.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--secondary)', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-secondary">Thành viên đề tài</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.code}</span>
              </div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.5rem' }}>{p.name}</h3>
              <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{p.status}</span>
            </div>
          ))}
          
          {(!user.projects || user.projects.length === 0) && (!user.memberProjects || user.memberProjects.length === 0) && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', gridColumn: '1 / -1' }}>Cán bộ chưa tham gia đề tài nào.</div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
