import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <main className="max-w-md p-8 font-sans">
      <h1 className="mt-0 text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="text-slate-500">
        Password self-service is not enabled yet. Please contact your system administrator.
      </p>
      <p>
        <Link to="/" className="font-semibold text-blue-600 hover:underline">
          Back to login
        </Link>
      </p>
    </main>
  );
}
