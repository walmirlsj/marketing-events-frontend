import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { regionsApi } from '../services/api';
import api from '../services/api';

const TERRITORIES = ['Brazil', 'Mexico', 'NOLA', 'SOLA'];
const TERRITORY_COLORS = {
  Brazil: { bg: '#EAF3DE', text: '#3B6D11' },
  Mexico: { bg: '#FAEEDA', text: '#633806' },
  NOLA:   { bg: '#E6F1FB', text: '#0C447C' },
  SOLA:   { bg: '#EEEDFE', text: '#3C3489' },
};

export default function RegionsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ country_name: '', country_code: '', territory: '' });
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: regions = [], isLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionsApi.list().then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/regions', data),
    onSuccess: () => {
      toast.success('País adicionado!');
      setForm({ country_name: '', country_code: '', territory: '' });
      qc.invalidateQueries(['regions']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao adicionar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/regions/${id}`),
    onSuccess: () => { qc.invalidateQueries(['regions']); },
    onError: () => toast.error('Erro ao remover'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/regions/${id}`, data),
    onSuccess: () => {
      toast.success('País atualizado!');
      setEditingId(null);
      qc.invalidateQueries(['regions']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao atualizar'),
  });

  const filtered = regions.filter(r =>
    r.country_name.toLowerCase().includes(filter.toLowerCase()) ||
    r.territory.toLowerCase().includes(filter.toLowerCase())
  );

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(r => r.id));
    }
  }

  async function deleteSelected() {
    if (!window.confirm(`Remover ${selected.length} país(es) selecionado(s)?`)) return;
    await Promise.all(selected.map(id => deleteMutation.mutateAsync(id)));
    toast.success(`${selected.length} país(es) removido(s)!`);
    setSelected([]);
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditForm({ country_name: r.country_name, country_code: r.country_code || '', territory: r.territory });
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const cellInput = { padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Países x Territórios</h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Gerencie a classificação automática de territórios por país.</p>
      </div>

      {/* Formulário de adição */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 500 }}>Adicionar novo país</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Nome do País *</label>
            <input style={inputStyle} value={form.country_name} onChange={e => setForm({ ...form, country_name: e.target.value })} placeholder="Ex: Colombia" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Código</label>
            <input style={inputStyle} value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value })} placeholder="Ex: CO" maxLength={5} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Território *</label>
            <select style={inputStyle} value={form.territory} onChange={e => setForm({ ...form, territory: e.target.value })}>
              <option value="">Selecione...</option>
              {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => { if (!form.country_name || !form.territory) return toast.error('Nome e território são obrigatórios'); addMutation.mutate(form); }} disabled={addMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Países cadastrados ({regions.length})</p>
            {selected.length > 0 && (
              <button onClick={deleteSelected} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <Trash2 size={13} /> Remover {selected.length} selecionado(s)
              </button>
            )}
          </div>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar por país ou território..." style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, width: 260 }} />
        </div>
        {isLoading ? (
          <p style={{ padding: 20, color: '#888' }}>Carregando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9' }}>
                <th style={{ padding: '10px 16px', width: 40 }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                {['País', 'Código', 'Território', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const tColors = TERRITORY_COLORS[r.territory] || { bg: '#f5f5f5', text: '#888' };
                const isEditing = editingId === r.id;
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #eee', background: selected.includes(r.id) ? '#f0f7ff' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isEditing ? (
                        <input value={editForm.country_name} onChange={e => setEditForm({ ...editForm, country_name: e.target.value })} style={cellInput} />
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{r.country_name}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isEditing ? (
                        <input value={editForm.country_code} onChange={e => setEditForm({ ...editForm, country_code: e.target.value })} style={{ ...cellInput, width: 70 }} maxLength={5} />
                      ) : (
                        <span style={{ fontSize: 13, color: '#888' }}>{r.country_code || '—'}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isEditing ? (
                        <select value={editForm.territory} onChange={e => setEditForm({ ...editForm, territory: e.target.value })} style={{ ...cellInput, width: 120 }}>
                          {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: tColors.bg, color: tColors.text }}>{r.territory}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => updateMutation.mutate({ id: r.id, data: editForm })} style={{ background: '#EAF3DE', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 8px', color: '#3B6D11', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <Check size={13} /> Salvar
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 8px', color: '#888', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <X size={13} /> Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => startEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#185FA5', padding: 4 }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => { if (window.confirm(`Remover "${r.country_name}"?`)) deleteMutation.mutate(r.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E24B4A', padding: 4 }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
