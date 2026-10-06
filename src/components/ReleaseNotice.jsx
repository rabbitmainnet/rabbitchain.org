import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Testnet software update">
      <div>
        <strong>Update to Rabbit Core {RELEASE.requiredVersion} before block {RELEASE.vrfAvailabilityV2Block.toLocaleString('en-US')}.</strong>
        <p>The VRF availability V2 hard fork applies from this block. This release also improves chain convergence, synchronization, mining recovery and VRF delivery. The 70% producer / 30% eligible committee model stays the same. Existing wallets, chain history and participation state are preserved; earlier missed rewards are not automatically repaid.</p>
      </div>
      <Link className="button secondary" to="/releases">Download and upgrade</Link>
    </aside>
  )
}
