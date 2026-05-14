export default function RoleHome({ title, description }) {
  return (
    <main style={{ padding: '1.5rem', maxWidth: '48rem' }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {description ? <p style={{ lineHeight: 1.5 }}>{description}</p> : null}
    </main>
  );
}
