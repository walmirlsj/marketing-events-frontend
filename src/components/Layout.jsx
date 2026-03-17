import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Calendar, List, Plus, Shield, Bell, LogOut, LogIn, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { notificationsApi } from '../services/api';

export default function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (ids) => notificationsApi.markRead(ids),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const unread = notifications.filter((n) => !n.read);

  function handleNotifOpen() {
    setNotifOpen((v) => !v);
    if (!notifOpen && unread.length > 0) markRead.mutate(unread.map((n) => n.id));
  }

  const navItems = [
    { to: '/events', icon: List, label: 'Eventos' },
    { to: '/calendar', icon: Calendar, label: 'Calendário' },
    { to: '/events/new', icon: Plus, label: 'Novo Evento' },
    ...(isAdmin() ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={20} color="#185FA5" />
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Marketing Events</p>
            <p style={{ fontSize: 11, margin: 0, color: '#888' }}>Platform</p>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 14, textDecoration: 'none',
              color: isActive ? '#185FA5' : '#666',
              background: isActive ? '#E6F1FB' : 'transparent',
            })}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid #eee' }}>
          {isAuthenticated ? (
            <div>
              <div style={{ padding: '8px 12px', marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{user.role === 'admin' ? '👑 Admin' : 'Usuário'}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#666' }}>
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#666' }}>
              <LogIn size={14} /> Entrar
            </button>
          )}
        </div>
      </aside>
      <div style={{ flex: 1, marginLeft: 220 }}>
        <header style={{ height: 52, background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button onClick={handleNotifOpen} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#666' }}>
                <Bell size={18} />
                {unread.length > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#E24B4A', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread.length}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 320, maxHeight: 400, overflowY: 'auto', background: '#fff', border: '1px solid #eee', borderRadius: 12, zIndex: 300 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>Notificações</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ padding: 16, color: '#888', fontSize: 13 }}>Nenhuma notificação</p>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #eee', background: n.read ? 'transparent' : '#E6F1FB' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{n.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>
        <main style={{ padding: '24px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
