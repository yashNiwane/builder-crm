export default function ErrorPage() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>Oops!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Something went wrong. Please try again.</p>
        <a href="/login" className="btn btn-primary">Back to Login</a>
      </div>
    </div>
  )
}
