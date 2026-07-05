const fs = require('fs');
const file = 'frontend/src/pages/MachineManagement.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Interfaces
const interfaceInsertionPoint = `type Tab = 'machines' | 'labor' | 'statistics' | 'history';`;
const newInterfaces = `
interface LaborLog {
  id: number;
  date: string;
  adminHours: number;
  proHours: number;
  cleanHours: number;
  project?: { name: string; code: string };
  createdAt: string;
}

interface LaborStat {
  adminPercent: number;
  proPercent: number;
  cleanPercent: number;
  totalHours: number;
  loggedDays: number;
  maxExpectedHours: number;
}

interface LaborStatsResponse {
  daily: LaborStat;
  weekly: LaborStat;
  monthly: LaborStat;
  projects: { projectId: number; projectName: string; projectCode: string; totalHours: number; percent: number }[];
}

interface AdminLaborStat {
  userId: number;
  userName: string;
  department: string;
  loggedDays: number;
  adminPercent: number;
  proPercent: number;
  cleanPercent: number;
}

`;
content = content.replace(interfaceInsertionPoint, newInterfaces + interfaceInsertionPoint);

// 2. Add State & fetch methods
const stateInsertionPoint = `  const [stats, setStats] = useState<MachineStat[]>([]);`;
const newState = `
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([]);
  const [laborStats, setLaborStats] = useState<LaborStatsResponse | null>(null);
  const [adminLaborStats, setAdminLaborStats] = useState<AdminLaborStat[]>([]);
  
  const [laborForm, setLaborForm] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    adminHours: '',
    proHours: '',
    cleanHours: ''
  });
  
  const [laborMonth, setLaborMonth] = useState(new Date().toISOString().substring(0, 7));
`;
content = content.replace(stateInsertionPoint, stateInsertionPoint + newState);

// 3. Modals state update
content = content.replace(
  `const [modal, setModal] = useState<'none' | 'import' | 'edit' | 'consume'>('none');`,
  `const [modal, setModal] = useState<'none' | 'import' | 'edit' | 'consume' | 'labor'>('none');`
);

// 4. Fetch logic
const fetchLogicInsertion = `  const fetchStats = useCallback(async () => {`;
const fetchLaborLogic = `
  const fetchLaborLogs = useCallback(async () => {
    try {
      const res = await apiClient.get<LaborLog[]>('/labor/my-logs');
      setLaborLogs(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchLaborStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LaborStatsResponse>('/labor/my-statistics');
      setLaborStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminLaborStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<AdminLaborStat[]>('/labor/admin-statistics?month=' + laborMonth);
      setAdminLaborStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [laborMonth]);

`;
content = content.replace(fetchLogicInsertion, fetchLaborLogic + fetchLogicInsertion);

// 5. Update fetchStats logic
content = content.replace(
  `if (statType !== 'machine') return;`,
  `if (statType === 'labor') { fetchAdminLaborStats(); return; }`
);

// 6. useEffects for labor
const useEffectInsertion = `  useEffect(() => { if (activeTab === 'statistics') fetchStats(); }, [activeTab, fetchStats]);`;
const newUseEffects = `
  useEffect(() => { if (activeTab === 'labor') { fetchLaborLogs(); fetchLaborStats(); } }, [activeTab, fetchLaborLogs, fetchLaborStats]);
`;
content = content.replace(useEffectInsertion, useEffectInsertion + newUseEffects);

// 7. submit handler for labor
const submitHandlerInsertion = `  return (`;
const laborSubmitHandler = `
  const handleLaborSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/labor', laborForm);
      setModal('none');
      setLaborForm({ date: new Date().toISOString().split('T')[0], projectId: '', adminHours: '', proHours: '', cleanHours: '' });
      fetchLaborLogs();
      fetchLaborStats();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Lỗi thêm giờ công');
    }
  };

`;
content = content.replace(submitHandlerInsertion, laborSubmitHandler + submitHandlerInsertion);

// 8. Action buttons for Labor
const buttonGroupStr = `{activeTab === 'machines' && (`;
const laborButtonGroupStr = `
          {activeTab === 'labor' && (
            <button className="btn btn-primary" onClick={() => setModal('labor')}>
              <Plus size={18} /> Thêm giờ công
            </button>
          )}
          {activeTab === 'machines' && (
`;
content = content.replace(buttonGroupStr, laborButtonGroupStr);

// 9. Labor Tab UI
const laborTabUIStr = `{/* TAB: LABOR (Placeholder) */}`;
const laborTabUI = `
      {/* TAB: LABOR */}
      {activeTab === 'labor' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* STATS */}
          {laborStats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="card">
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Hôm nay</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Hành chính:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{laborStats.daily.adminPercent.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Chuyên môn:</span>
                    <span style={{ color: '#096dd9', fontWeight: 700 }}>{laborStats.daily.proPercent.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Dọn dẹp:</span>
                    <span style={{ color: '#d46b08', fontWeight: 700 }}>{laborStats.daily.cleanPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Tuần này</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Hành chính:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{laborStats.weekly.adminPercent.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Chuyên môn:</span>
                    <span style={{ color: '#096dd9', fontWeight: 700 }}>{laborStats.weekly.proPercent.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Dọn dẹp:</span>
                    <span style={{ color: '#d46b08', fontWeight: 700 }}>{laborStats.weekly.cleanPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Tháng này (Theo dự án)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                  {laborStats.projects.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
                  {laborStats.projects.map(p => (
                    <div key={p.projectId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }} title={p.projectName}>{p.projectCode || p.projectName}:</span>
                      <span style={{ color: '#389e0d', fontWeight: 700 }}>{p.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1.1rem' }}>
              Lịch sử ghi nhận giờ công
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Ngày</th>
                    <th style={{ padding: '1rem' }}>Dự án</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Hành chính (H)</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Chuyên môn (H)</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Dọn dẹp (H)</th>
                  </tr>
                </thead>
                <tbody>
                  {laborLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có ghi nhận nào</td></tr>
                  ) : laborLogs.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{l.project?.name || '—'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{l.adminHours}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{l.proHours}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{l.cleanHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
`;
// Replace the old activeTab === 'labor' which is empty placeholder if exists.
// I will just append it after {/* TAB: MACHINES */} section
const machinesTabEnd = `                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
`;
content = content.replace(machinesTabEnd, machinesTabEnd + laborTabUI);

// 10. Update Statistics Tab for admin (VienTruong, VienPho, SuperAdmin)
const statTabSearchStr = `                  <th style={{ padding: '1rem' }}>Mã tài sản</th>`;
const newStatTable = `
              {statType === 'machine' ? (
                <>
                  <th style={{ padding: '1rem' }}>Mã tài sản</th>
                  <th style={{ padding: '1rem' }}>Tên tài sản</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Tổng giờ tiêu hao</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>% Sử dụng (Dự kiến)</th>
                  <th style={{ padding: '1rem' }}>Chi tiết Dự án</th>
                </>
              ) : (
                <>
                  <th style={{ padding: '1rem' }}>Nhân sự</th>
                  <th style={{ padding: '1rem' }}>Phòng ban</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Số ngày làm</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Hành chính (%)</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Chuyên môn (%)</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Dọn dẹp (%)</th>
                </>
              )}
`;
content = content.replace(
  `<th style={{ padding: '1rem' }}>Mã tài sản</th>
                  <th style={{ padding: '1rem' }}>Tên tài sản</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Tổng giờ tiêu hao</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>% Sử dụng (Dự kiến)</th>
                  <th style={{ padding: '1rem' }}>Chi tiết Dự án</th>`, 
  newStatTable
);

const statTableBodyStr = `                  {stats.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Không có dữ liệu trong tháng này</td></tr>
                  ) : stats.map(s => (`;

const newStatTableBody = `
                  {statType === 'machine' && stats.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Không có dữ liệu trong tháng này</td></tr>}
                  {statType === 'labor' && adminLaborStats.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Không có dữ liệu trong tháng này</td></tr>}
                  
                  {statType === 'machine' && stats.map(s => (
`;
content = content.replace(statTableBodyStr, newStatTableBody);

const statTableEndRowStr = `                    </tr>
                  ))}
                </tbody>`;
const newStatTableEndRow = `                    </tr>
                  ))}

                  {statType === 'labor' && adminLaborStats.map(s => (
                    <tr key={s.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{s.userName}</td>
                      <td style={{ padding: '1rem' }}>{s.department || '—'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>{s.loggedDays}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{s.adminPercent.toFixed(1)}%</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#096dd9' }}>{s.proPercent.toFixed(1)}%</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#d46b08' }}>{s.cleanPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>`;
content = content.replace(statTableEndRowStr, newStatTableEndRow);

const statFiltersStr = `              <select className="input-field" style={{ width: '200px' }} value={statType} onChange={e => setStatType(e.target.value as 'machine' | 'labor')}>
                <option value="machine">Thiết bị máy móc</option>
                <option value="labor" disabled>Nhân công (Sắp ra mắt)</option>
              </select>`;
const newStatFilters = `
              <select className="input-field" style={{ width: '200px' }} value={statType} onChange={e => setStatType(e.target.value as 'machine' | 'labor')}>
                <option value="machine">Thiết bị máy móc</option>
                <option value="labor">Nhân công</option>
              </select>
`;
content = content.replace(statFiltersStr, newStatFilters);
content = content.replace(
  `              <input type="month" className="input-field" style={{ width: '150px' }} value={statMonth} onChange={e => setStatMonth(e.target.value)} />`,
  `              <input type="month" className="input-field" style={{ width: '150px' }} value={statType === 'machine' ? statMonth : laborMonth} onChange={e => statType === 'machine' ? setStatMonth(e.target.value) : setLaborMonth(e.target.value)} />`
);

// 11. Modal for Labor Input
const consumeModalEnd = `      )}
    </div>`;

const laborModal = `
      {/* MODAL: NHÂN CÔNG */}
      {modal === 'labor' && (
        <div className="modal-overlay" onClick={() => { setModal('none'); setError(null); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Khai báo Giờ công</div>
              <button className="modal-close-btn" onClick={() => { setModal('none'); setError(null); }}>Đóng</button>
            </div>
            <form onSubmit={handleLaborSubmit}>
              <div className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Ngày ghi nhận (*)</label>
                  <input type="date" className="input-field" required value={laborForm.date} onChange={e => setLaborForm({...laborForm, date: e.target.value})} />
                </div>

                <div className="input-group">
                  <label className="input-label">Dự án thực hiện (*)</label>
                  <select className="input-field" required value={laborForm.projectId} onChange={e => setLaborForm({...laborForm, projectId: e.target.value})}>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code ? \`\${p.code} - \${p.name}\` : p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Hành chính (H)</label>
                    <input type="number" step="0.5" min="0" max="24" className="input-field" value={laborForm.adminHours} onChange={e => setLaborForm({...laborForm, adminHours: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Chuyên môn (H)</label>
                    <input type="number" step="0.5" min="0" max="24" className="input-field" value={laborForm.proHours} onChange={e => setLaborForm({...laborForm, proHours: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Dọn dẹp (H)</label>
                    <input type="number" step="0.5" min="0" max="24" className="input-field" value={laborForm.cleanHours} onChange={e => setLaborForm({...laborForm, cleanHours: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setModal('none'); setError(null); }}>Huỷ</button>
                <button type="submit" className="btn btn-primary">Ghi nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(consumeModalEnd, consumeModalEnd.replace('    </div>', laborModal + '\n    </div>'));

fs.writeFileSync(file, content);
console.log('File updated successfully');
