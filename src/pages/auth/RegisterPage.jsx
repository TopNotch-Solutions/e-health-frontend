import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <main className="max-w-md p-8 font-sans">
      <h1 className="mt-0 text-2xl font-bold text-slate-900">Request access</h1>
      <p className="text-slate-500">
        New accounts are issued by your facility administrator. If you need access, please contact them.
      </p>
      <p>
        <Link to="/" className="font-semibold text-blue-600 hover:underline">
          Back to login
        </Link>
      </p>
    </main>
  );
}
