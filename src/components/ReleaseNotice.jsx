import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Testnet software update">
      <div>
        <strong>Rabbit Core {RELEASE.requiredVersion}: automatic bootstrap for new miners.</strong>
        <p>New installations create or reuse an encrypted mining wallet, download and verify the official Testnet bootstrap, synchronize remaining blocks and start LCQ participation automatically. Existing miners must preserve their wallet, blockchain and participation data. No new hard fork is introduced.</p>
      </div>
      <Link className="button secondary" to="/releases">Download and upgrade</Link>
    </aside>
  )
}
