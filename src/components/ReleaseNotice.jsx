import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Testnet software update">
      <div>
        <strong>Update to Rabbit Core {RELEASE.requiredVersion} for authenticated VRF relay.</strong>
        <p>This release forwards authenticated, encrypted VRF messages through public peers when miners have no direct connection. No new hard fork is introduced. Keep your existing wallet, blockchain data and participation state. Confirm request completion, randomness and proof on the canonical chain before using a result.</p>
      </div>
      <Link className="button secondary" to="/releases">Download and upgrade</Link>
    </aside>
  )
}
