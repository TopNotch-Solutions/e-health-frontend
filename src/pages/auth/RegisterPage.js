import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '28rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Request access</h1>
      <p style={{ color: '#64748b' }}>New accounts are issued by your facility administrator. If you need access, please contact them.</p>
      <p>
        <Link to="/">Back to login</Link>
      </p>
    </main>
  );
}
