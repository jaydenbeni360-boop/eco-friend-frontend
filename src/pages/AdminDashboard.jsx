import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';
import MapComponent from '../components/MapComponent';
import {
  Calendar, Package, LogOut, CheckCircle,
  Clock, TrendingUp, Trash2, RefreshCw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://eco-friend-api.vercel.app';

const AdminDashboard = () => {
  const { user, logoutUser } = useMobile();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [activeTab, setActiveTab] = useState('schedules');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eco_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [schedRes, pickRes] = await Promise.all([
        fetch(`${API_BASE}/api/schedules`, { headers }),
        fetch(`${API_BASE}/api/pickups`, { headers }),
      ]);

      if (schedRes.ok) setSchedules(await schedRes.json());
      if (pickRes.ok) setPickups(await pickRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
    setLoading(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleMarkComplete = async (id) => {
    try {
      const token = localStorage.getItem('eco_token');
      await fetch(`${API_BASE}/api/schedules/${id}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(prev =>
        prev.map(s => s.id === id ? { ...s, status: 'Completed' } : s)
      );
    } catch (err) {
      console.error('Mark complete error:', err);
    }
  };

  const handleSetPayment = async (id) => {
    try {
      const token = localStorage.getItem('eco_token');
      const weightInput = window.prompt('Enter measured weight (kg):');
      if (weightInput === null) return; // cancelled
      const amountInput = window.prompt('Enter amount to charge (e.g., 12.50):');
      if (amountInput === null) return;
      const weight = parseFloat(weightInput);
      const amount = parseFloat(amountInput);
      await fetch(`${API_BASE}/api/schedules/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weight, amount_due: amount, payment_status: 'pending', price: amount })
      });
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, weight, amount_due: amount, payment_status: 'pending', price: amount } : s));
      // Inform admin locally
      alert('Payment details saved and customer marked pending payment.');
    } catch (err) {
      console.error('Set payment error:', err);
      alert('Failed to set payment details. Check console.');
    }
  };

  const handleNotify = async (id) => {
    try {
      // For now we reuse the payment endpoint to ensure schedule is marked pending before notifying
      const token = localStorage.getItem('eco_token');
      await fetch(`${API_BASE}/api/schedules/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status: 'pending' })
      });
      alert('Customer notified (please implement real notification backend).');
    } catch (err) {
      console.error('Notify error:', err);
      alert('Failed to notify customer.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Stats
  const totalSchedules = schedules.length;
  const upcoming = schedules.filter(s => s.status === 'Upcoming').length;
  const completed = schedules.filter(s => s.status === 'Completed').length;
  const totalPoints = pickups.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div style={S.page}>
      {/* ── TOP HEADER ── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoIcon}>
            <img src="/copilot_ 20260525_085633.png" alt="Eco Friend Logo" style={S.logoImg} />
          </div>
          <div>
            <p style={S.headerSub}>ADMIN PANEL</p>
            <h1 style={S.headerTitle}>EcoFriend Control</h1>
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.adminBadge}>
            <span style={S.adminDot} />
            {user?.name || 'Admin'}
          </div>
          <button onClick={handleLogout} style={S.logoutBtn} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── STATS ROW ── */}
      <div style={S.statsRow}>
        <div style={{ ...S.statCard, borderColor: '#bbf7d0' }}>
          <Calendar size={20} color="#10b981" />
          <div style={S.statVal}>{totalSchedules}</div>
          <div style={S.statLabel}>Total Schedules</div>
        </div>
        <div style={{ ...S.statCard, borderColor: '#fde68a' }}>
          <Clock size={20} color="#f59e0b" />
          <div style={{ ...S.statVal, color: '#f59e0b' }}>{upcoming}</div>
          <div style={S.statLabel}>Upcoming</div>
        </div>
        <div style={{ ...S.statCard, borderColor: '#a7f3d0' }}>
          <CheckCircle size={20} color="#059669" />
          <div style={{ ...S.statVal, color: '#059669' }}>{completed}</div>
          <div style={S.statLabel}>Completed</div>
        </div>
        <div style={{ ...S.statCard, borderColor: '#c7d2fe' }}>
          <TrendingUp size={20} color="#6366f1" />
          <div style={{ ...S.statVal, color: '#6366f1' }}>{totalPoints}</div>
          <div style={S.statLabel}>Points Issued</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={S.tabs}>
        <button
          onClick={() => setActiveTab('schedules')}
          style={{ ...S.tab, ...(activeTab === 'schedules' ? S.activeTab : {}) }}
        >
          <Calendar size={14} /> Scheduled Pickups
        </button>
        <button
          onClick={() => setActiveTab('pickups')}
          style={{ ...S.tab, ...(activeTab === 'pickups' ? S.activeTab : {}) }}
        >
          <Package size={14} /> Pickup Logs
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{ ...S.tab, ...(activeTab === 'map' ? S.activeTab : {}) }}
        >
          📍 Map View
        </button>
        <button onClick={fetchData} style={S.refreshBtn} title="Refresh data">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── TABLE CONTENT ── */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>
            <RefreshCw size={28} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading data…</p>
          </div>
        ) : activeTab === 'schedules' ? (
          schedules.length === 0 ? (
            <div style={S.empty}>
              <Calendar size={32} color="#94a3b8" />
              <p style={{ color: '#94a3b8' }}>No scheduled pickups yet.</p>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['User', 'Email', 'Phone', 'Date', 'Time', 'Waste Type', 'Weight', 'Price', 'Address', 'Status', 'Action'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={s.id} style={{ ...S.tr, background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={S.td}><strong>{s.user_name || '—'}</strong></td>
                    <td style={S.td}>{s.user_email || '—'}</td>
                    <td style={S.td}>{s.user_phone || '—'}</td>
                    <td style={S.td}>{s.date ? new Date(s.date).toLocaleDateString('en-GB') : '—'}</td>
                    <td style={S.td}>{s.time || '—'}</td>
                    <td style={S.td}>{s.waste_type || '—'}</td>
                    <td style={S.td}>{s.weight || '—'} kg</td>
                    <td style={S.td}>${s.price || '—'}</td>
                    <td style={S.td}>{s.address || '—'}</td>
                    <td style={S.td}>
                      <span style={s.status === 'Completed' ? S.badgeDone : S.badgePending}>
                        {s.status}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {s.status !== 'Completed' && (
                          <button onClick={() => handleMarkComplete(s.id)} style={S.completeBtn}>
                            <CheckCircle size={12} /> Mark Done
                          </button>
                        )}
                        <button onClick={() => handleSetPayment(s.id)} style={S.actionBtn}>Set Weight / Price</button>
                        <button onClick={() => handleNotify(s.id)} style={S.notifyBtn}>Notify</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : activeTab === 'map' ? (
          <MapComponent />
        ) : (
          pickups.length === 0 ? (
            <div style={S.empty}>
              <Trash2 size={32} color="#94a3b8" />
              <p style={{ color: '#94a3b8' }}>No pickup logs yet.</p>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['User', 'Email', 'Waste Type', 'Weight (kg)', 'Points', 'Collected At'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pickups.map((p, i) => (
                  <tr key={p.id} style={{ ...S.tr, background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={S.td}><strong>{p.user_name || '—'}</strong></td>
                    <td style={S.td}>{p.user_email || '—'}</td>
                    <td style={S.td}>{p.type}</td>
                    <td style={S.td}>{p.weight}</td>
                    <td style={S.td}>
                      <span style={S.pointsBadge}>+{p.points} pts</span>
                    </td>
                    <td style={S.td}>
                      {p.collected_at ? new Date(p.collected_at).toLocaleString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

// ── STYLES ──────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
    overflowY: 'auto',
  },
  header: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  logoImg: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
  },
  headerSub: {
    fontSize: '9px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.75)',
    margin: 0,
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'white',
    margin: 0,
    fontFamily: "'Sora', sans-serif",
    letterSpacing: '-0.5px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
  },
  adminDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#bbf7d0',
    display: 'inline-block',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)',
    color: 'white',
    borderRadius: '10px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    padding: '20px 24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '18px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statVal: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: '-1px',
    fontFamily: "'Sora', sans-serif",
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tabs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 24px 16px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    background: 'white',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: '#10b981',
    borderColor: '#10b981',
    color: 'white',
    boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
  },
  refreshBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'color 0.2s',
  },
  tableWrap: {
    margin: '0 24px 24px',
    background: 'white',
    borderRadius: '18px',
    border: '1.5px solid #e2e8f0',
    overflow: 'auto',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '10px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1.5px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    color: '#334155',
    whiteSpace: 'nowrap',
    fontSize: '12px',
  },
  badgePending: {
    background: '#fef9c3',
    color: '#a16207',
    border: '1px solid #fde68a',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'inline-block',
  },
  badgeDone: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'inline-block',
  },
  pointsBadge: {
    background: '#ede9fe',
    color: '#5b21b6',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '10px',
    fontWeight: '800',
    display: 'inline-block',
  },
  completeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#d1fae5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  actionBtn: {
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#4338ca',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  notifyBtn: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#92400e',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default AdminDashboard;
