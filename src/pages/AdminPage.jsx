import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, MapPin, Users, Clock } from 'lucide-react';
import { eventsApi } from '../services/api';

const TERRITORY_COLORS = {
  Brazil: { bg: '#EAF3DE', text: '#3B6D11' },
  Mexico: { bg: '#FAEEDA', text: '#633806' },
  NOLA:   { bg: '#E6F1FB', text: '#0C447C' },
  SOLA:   { bg: '#EEEDFE', text: '#3C3489' },
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingEvents = [], isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: () => eventsApi.getPending().then((r) => r.data),
    refetchInterval: 20_000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }) => eventsApi.review(id, action, reason),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? '✅ Evento aprovado!' : '❌ Evento rejeitado');
      qc.invalidateQueries(['admin-pending']);
      qc.invalidateQueries(['events']);
      setRejectModal(null);
      setRejectReason('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao revisar evento'),
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Painel Administrativo</h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Eventos aguardando aprovação.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pendentes', value: pendingEvents.length, bg: '#FAEEDA', color: '#633806' },
          { label: 'Sem território', value: pendingEvents.filter(e => !e.territory).length, bg: '#f5f5f5', color: '#888' },
          { label: 'Total revisados', value: 0, bg: '#EAF3DE', color: '#3B6D11' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      {isLoading ? (
        <p style={{ color: '#888' }}>Carregando...</p>
      ) : pendingEvents.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <CheckCircle size={32} style={{ color: '#3B6D11', marginBottom: 8 }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Tudo em dia! Nenhum evento pendente.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pendingEvents.map((event) => {
            const tColors = TERRITORY_COLORS[event.territory] || { bg: '#f5f5f5', text: '#888' };
            return (
              <div key={event.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{event.name}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: tColors.bg, color: tColors.text }}>{event.territory || 'Sem território'}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}><MapPin size={12} /> {event.city}, {event.country}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}><Users size={12} /> {event.guest_count || 0} convidados</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Cadastrado por: <strong>{event.creator_name || 'Anônimo'}</strong>{event.creator_email && ` (${event.creator_email})`}</p>
                    {event.description && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#888', lineHeight: 1.5, borderLeft: '2px solid #eee', paddingLeft: 10 }}>{event.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => reviewMutation.mutate({ id: event.id, action: 'approve' })} disabled={reviewMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      <CheckCircle size={14} /> Aprovar
                    </button>
                    <button onClick={() => { setRejectModal(event.id); setRejectReason(''); }} disabled={reviewMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #F09595', borderRadius: 8, background: 'transparent', color: '#A32D2D', cursor: 'pointer', fontSize: 13 }}>
                      <XCircle size={14} /> Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 24, width: 400 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 500 }}>Rejeitar Evento</h3>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>O cadastrador será notificado com o motivo.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Motivo da rejeição (opcional)..." style={{ width: '100%', minHeight: 80, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setRejectModal(null)} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#888' }}>Cancelar</button>
              <button onClick={() => reviewMutation.mutate({ id: rejectModal, action: 'reject', reason: rejectReason })} disabled={reviewMutation.isPending} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {reviewMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
