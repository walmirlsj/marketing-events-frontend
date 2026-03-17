import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Plus, Search } from 'lucide-react';
import { eventsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const TERRITORY_COLORS = {
  Brazil: { bg: '#EAF3DE', text: '#3B6D11' },
  Mexico: { bg: '#FAEEDA', text: '#633806' },
  NOLA:   { bg: '#E6F1FB', text: '#0C447C' },
  SOLA:   { bg: '#EEEDFE', text: '#3C3489' },
};

function TBadge({ t }) {
  const c = TERRITORY_COLORS[t] || { bg: '#F1EFE8', text: '#5F5E5A' };
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: c.bg, color: c.text }}>
      {t || 'Sem território'}
    </span>
  );
}

export default function EventsPage() {
  const { isAdmin } = useAuthStore();
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['events', { search, territory, page }],
    queryFn: () => eventsApi.list({
      status: isAdmin() ? undefined : 'approved',
      search: search || undefined,
      territory: territory || undefined,
      page, limit: 12,
    }).then((r) => r.data),
    keepPreviousData: true,
  });

  const events = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Eventos de Marketing</h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Base oficial aprovada</p>
        </div>
        <Link to="/events/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#185FA5', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          <Plus size={15} /> Novo Evento
        </Link>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar eventos..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <select value={territory} onChange={(e) => { setTerritory(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
          <option value="">Todos os territórios</option>
          {['Brazil','Mexico','NOLA','SOLA'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {isLoading ? (
        <p style={{ color: '#888' }}>Carregando...</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
          <p style={{ fontSize: 16 }}>Nenhum evento encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ccc'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <TBadge t={event.territory} />
                  {isAdmin() && event.status !== 'approved' && (
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: '#FAEEDA', color: '#633806', fontWeight: 500 }}>{event.status}</span>
                  )}
                </div>
                <h3 style={{ margin: '8px 0 6px', fontSize: 15, fontWeight: 500, color: '#222', lineHeight: 1.3 }}>{event.name}</h3>
                {event.description && (
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#888', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {event.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
                    <MapPin size={11} /> {event.city}, {event.country}
                  </span>
                  {event.guests?.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
                      <Users size={11} /> {event.guests.length}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', background: p === page ? '#185FA5' : 'transparent', color: p === page ? '#fff' : '#888', fontSize: 13 }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
