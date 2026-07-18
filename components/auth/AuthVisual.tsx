export default function AuthVisual({ version = 'V1.0.0' }: { version?: string }) {
  return (
    <div className="auth-visual">
      <div className="auth-visual__ring auth-visual__ring--1" />
      <div className="auth-visual__ring auth-visual__ring--2" />
      <span className="auth-visual__version">{version}</span>
    </div>
  );
}
