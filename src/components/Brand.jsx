import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return (
    <Link className="brand notranslate" translate="no" to="/" aria-label="Rabbit Chain home">
      <span className="brand-mark"><img src="/rabbit-mark.png" alt="" /></span>
      {!compact && <span className="brand-type"><strong>RABBIT</strong><small>CHAIN</small></span>}
    </Link>
  )
}
