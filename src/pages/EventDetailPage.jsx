import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MapPin, Users, ArrowLeft, User, Pencil, Trash2, X, Check } from 'lucide-react';
import { eventsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending:  { label: 'Pendente',  bg: '#FAEEDA', text: '#633806' },
  approved: { label: 'Aprovado',  bg: '#EAF3DE', text: '#3B6D11' },
  rejected: { label: 'Rejeitado', bg: '#FCEBEB', text: '#A32D2D' },
};

const TERRITORY_COLORS = {
  Brazil: { bg: '#EAF3DE', text: '#3B6D11' },
  Mexico: { bg: '#FAEEDA', text: '#633806' },
  NOLA:   { bg: '#E6F1FB', text: '#0C447C' },
  SOLA:   { bg: '#EEEDFE', text: '#3C3489' },
};

const COUNTRIES = ['Argentina','Bolivia','Brazil','Chile','Colombia','Costa Rica','Cuba','Dominican Republic','Ecuador','El Salvador','Guatemala','Haiti','Honduras','Jamaica','Mexico','Nicaragua','Panama','Paraguay','Peru','Puerto Rico','Trinidad and Tobago','Uruguay','Venezuela'];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAdmin } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => eventsApi.update(id, data),
    onSuccess: () => {
      toast.success('Evento atualizado!');
      setEditing(false);
      qc.invalidateQueries(['event', id]);
      qc.invalidateQueries(['events']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao atualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsApi.remove(id),
    onSuccess: () => {
      toast.success('Evento deletado!');
      navigate('/events');
      qc.invalidateQueries(['events']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao deletar'),
  });

  function startEdit() {
    setEditForm({
      name: event.name,
      description: event.description || '',
      city: event.city,
      country: event.country,
      event_date: event.event_date ? event.event_date.split('T')[0] : '',
    });
    setEditing(true);
  }

  if (isLoading) return <p style={{ color: '#888' }}>Carregando...</p>;
  if (isError || !event) return <p style={{ color: '#E24B4A' }}>Evento não encontrado.</p>;

  const status = STATUS_MAP[event.status];
  const tColors = TERRITORY_COLORS[event.territory] || { bg: '#F1EFE8', text: '#5F5E5A' };
  const canEdit = isAdmin() || (event.created_by === user?.id && event.status === 'pending');
  const canDelete = isAdmin() || (event.created_by === user?.id && event.status === 'pending');

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: '0 0 20px' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: tColors.bg, color: tColors.text }}>{event.territory || 'Sem território'}</span>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: status.bg, color: status.text }}>{status.label}</span>
          </div>
          {!editing && (canEdit || canDelete) && (
            <div style={{ display: 'flex', gap: 8 }}>
              {canEdit && (
                <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#185FA5' }}>
                  <Pencil size={13} /> Editar
                </button>
              )}
              {canDelete && (
                <button onClick={() => { if (window.confirm('Deletar este evento?')) deleteMutation.mutate(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #F09595', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#A32D2D' }}>
                  <Trash2 size={13} /> Deletar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        {editing ? (
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Nome do Evento *</label>
              <input style={inputStyle} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Descrição</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Cidade *</label>
                <input style={inputStyle} value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>País *</label>
                <select style={inputStyle} value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Data</label>
              <input type="date" style={inputStyle} value={editForm.event_date} onChange={e => setEditForm({ ...editForm, event_date: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#888' }}>
                <X size={13} /> Cancelar
              </button>
              <button onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <Check size={13} /> {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 16px', color: '#222', lineHeight: 1.3 }}>{event.name}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: MapPin, label: 'Local', value: `${event.city}, ${event.country}` },
                { icon: Users, label: 'Convidados', value: `${event.guests?.length || 0} pessoa(s)` },
                { icon: User, label: 'Cadastrado por', value: event.creator_name || 'Anônimo' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Icon size={14} style={{ color: '#888', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 14, color: '#222' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {event.description && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginBottom: 20 }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descrição</p>
                <p style={{ margin: 0, fontSize: 14, color: '#222', lineHeight: 1.7 }}>{event.description}</p>
              </div>
            )}
            {event.guests?.length > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lista de Convidados ({event.guests.length})</p>
                <div style={{ display: 'grid', gap: 6 }}>
                  {event.guests.map((g) => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f5f5f5', borderRadius: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#185FA5', flexShrink: 0 }}>
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{g.name}</p>
                        {g.email && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{g.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {event.status === 'rejected' && event.rejection_reason && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 500, color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motivo da Rejeição</p>
                <p style={{ margin: 0, fontSize: 14, color: '#222' }}>{event.rejection_reason}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
