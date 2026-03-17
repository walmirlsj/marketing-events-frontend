import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Globe } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Senha mínima: 8 caracteres');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Conta criada!');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Globe size={22} color="#185FA5" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>Criar conta</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          {[
            { key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
            { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
            { key: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>{label}</label>
              <input type={type} required style={inputStyle} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ padding: '10px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          Já tem conta? <Link to="/login" style={{ color: '#185FA5', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
