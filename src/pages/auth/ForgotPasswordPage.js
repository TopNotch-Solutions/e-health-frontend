import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '28rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Forgot password</h1>
      <p style={{ color: '#64748b' }}>Password self-service is not enabled yet. Please contact your system administrator.</p>
      <p>
        <Link to="/">Back to login</Link>
      </p>
    </main>
  );
}
