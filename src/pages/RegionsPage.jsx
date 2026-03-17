import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
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
    onSuccess: () => { toast.success('País removido!'); qc.invalidateQueries(['regions']); },
    onError: () => toast.error('Erro ao remover'),
  });

  const filtered = regions.filter(r =>
    r.country_name.toLowerCase().includes(filter.toLowerCase()) ||
    r.territory.toLowerCase().includes(filter.toLowerCase())
  );

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };

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
          <button
            onClick={() => {
              if (!form.country_name || !form.territory) return toast.error('Nome e território são obrigatórios');
              addMutation.mutate(form);
            }}
            disabled={addMutation.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Países cadastrados ({regions.length})</p>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar por país ou território..." style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, width: 260 }} />
        </div>
        {isLoading ? (
          <p style={{ padding: 20, color: '#888' }}>Carregando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9' }}>
                {['País', 'Código', 'Território', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const tColors = TERRITORY_COLORS[r.territory] || { bg: '#f5f5f5', text: '#888' };
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{r.country_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{r.country_code || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: tColors.bg, color: tColors.text }}>{r.territory}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => { if (window.confirm(`Remover "${r.country_name}"?`)) deleteMutation.mutate(r.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E24B4A', padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
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
