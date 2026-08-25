export default function StatusDot({ tone = 'neutral', children }) {
  return <span className={`status-pill ${tone}`}><i/>{children}</span>
}
