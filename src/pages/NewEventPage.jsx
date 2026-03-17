import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, X, Upload, FileText } from 'lucide-react';
import { eventsApi } from '../services/api';

const COUNTRIES = ['Argentina','Bolivia','Brazil','Chile','Colombia','Costa Rica','Cuba','Dominican Republic','Ecuador','El Salvador','Guatemala','Haiti','Honduras','Jamaica','Mexico','Nicaragua','Panama','Paraguay','Peru','Puerto Rico','Trinidad and Tobago','Uruguay','Venezuela'];

export default function NewEventPage() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [tab, setTab] = useState('manual');
  const [form, setForm] = useState({ name: '', description: '', city: '', country: '', event_date: '' });
  const [guests, setGuests] = useState([{ name: '', email: '' }]);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => eventsApi.create(data),
    onSuccess: () => { toast.success('Evento cadastrado! Aguardando aprovação.'); navigate('/events'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao criar evento'),
  });

  const importMutation = useMutation({
    mutationFn: (file) => eventsApi.import(file),
    onSuccess: (res) => { setImportResult(res.data); toast.success(`${res.data.inserted} evento(s) importado(s)!`); },
    onError: (err) => toast.error(err.response?.data?.error || 'Erro ao importar'),
  });

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>Registrar Evento</h1>
      <p style={{ color: '#888', fontSize: 14, margin: '0 0 24px' }}>Todo evento entra com status <strong>Pendente</strong> e precisa de aprovação.</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #eee' }}>
        {[{ id: 'manual', label: 'Manual' }, { id: 'import', label: 'Importar CSV / Excel' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', background: 'transparent', fontSize: 14, color: tab === t.id ? '#185FA5' : '#888', borderBottom: tab === t.id ? '2px solid #185FA5' : '2px solid transparent', fontWeight: tab === t.id ? 500 : 400, marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'manual' && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, guests: guests.filter(g => g.name.trim()) }); }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome do Evento *</label>
                <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Summit de Marketing LATAM 2025" />
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o objetivo do evento..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Cidade *</label>
                  <input style={inputStyle} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" />
                </div>
                <div>
                  <label style={labelStyle}>País *</label>
                  <select style={inputStyle} required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                    <option value="">Selecione...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {form.country && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#185FA5' }}>Território classificado automaticamente</p>}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Data do Evento</label>
                <input type="date" style={inputStyle} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 10 }}>Lista de Convidados</label>
                <div style={{ display: 'grid', gap: 8 }}>
                  {guests.map((g, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="Nome do convidado" value={g.name} onChange={(e) => { const u = [...guests]; u[i].name = e.target.value; setGuests(u); }} />
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="E-mail (opcional)" type="email" value={g.email} onChange={(e) => { const u = [...guests]; u[i].email = e.target.value; setGuests(u); }} />
                      <button type="button" onClick={() => setGuests(guests.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setGuests([...guests, { name: '', email: '' }])} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px dashed #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#888', width: 'fit-content' }}>
                    <Plus size={13} /> Adicionar convidado
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => navigate('/events')} style={{ padding: '9px 18px', border: '1px solid #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#888' }}>Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, opacity: createMutation.isPending ? 0.7 : 1 }}>
              {createMutation.isPending ? 'Cadastrando...' : 'Cadastrar Evento'}
            </button>
          </div>
        </form>
      )}
      {tab === 'import' && (
        <form onSubmit={(e) => { e.preventDefault(); if (!importFile) return toast.error('Selecione um arquivo'); importMutation.mutate(importFile); }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 32 }}>
            <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#0C447C', fontWeight: 500 }}>Formato CSV — separador: ponto e vírgula (;)</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#0C447C' }}>Colunas: nome_evento;descricao;cidade;pais;convidados;data</p>
            </div>
            <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed #ddd', borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: importFile ? '#EAF3DE' : '#f9f9f9' }}>
              {importFile ? (
                <div><FileText size={32} style={{ color: '#3B6D11', marginBottom: 8 }} /><p style={{ margin: 0, fontWeight: 500, color: '#3B6D11' }}>{importFile.name}</p></div>
              ) : (
                <div><Upload size={32} style={{ color: '#888', marginBottom: 8 }} /><p style={{ margin: 0, color: '#888', fontSize: 14 }}>Clique para selecionar o arquivo</p><p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>.csv ou .xlsx, máx 10MB</p></div>
              )}
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => { setImportFile(e.target.files[0] || null); setImportResult(null); }} />
            </div>
            {importResult && (
              <div style={{ marginTop: 16, background: '#EAF3DE', borderRadius: 8, padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#3B6D11', fontWeight: 500 }}>✅ {importResult.inserted} evento(s) importado(s) com status "Pendente"</p>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={!importFile || importMutation.isPending} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', cursor: importFile ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 500, opacity: (!importFile || importMutation.isPending) ? 0.5 : 1 }}>
              {importMutation.isPending ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
