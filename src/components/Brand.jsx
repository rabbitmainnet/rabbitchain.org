import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand-compact' : ''}`} to="/" aria-label="Rabbit Chain home">
      <span className="brand-icon"><img src="/rabbit-mark.png" alt="" /></span>
      {!compact && <span className="brand-type"><b>RABBIT</b><i>CHAIN</i></span>}
    </Link>
  )
}
