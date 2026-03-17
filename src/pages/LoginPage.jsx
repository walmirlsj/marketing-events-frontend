import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo!');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login');
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
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>Marketing Events</h1>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Entre na sua conta</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>E-mail</label>
            <input type="email" required style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>Senha</label>
            <input type="password" required style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          Não tem conta? <Link to="/register" style={{ color: '#185FA5', textDecoration: 'none' }}>Cadastre-se</Link>
        </p>
        <div style={{ marginTop: 16, padding: '10px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 12, color: '#888' }}>
          <strong>Admin:</strong> admin@marketingevents.com / admin123
        </div>
      </div>
    </div>
  );
}
