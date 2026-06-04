export default function RoleHome({ title, description }) {
  return (
    <main className="max-w-3xl p-6 font-sans">
      <h1 className="mt-0 text-2xl font-bold text-slate-900">{title}</h1>
      {description ? <p className="leading-relaxed text-slate-600">{description}</p> : null}
    </main>
  );
}
