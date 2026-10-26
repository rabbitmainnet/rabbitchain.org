import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Rabbit Testnet recovery update">
      <div>
        <strong>Rabbit Core {RELEASE.requiredVersion}: WorkSeat liveness update. Upgrade before block 323,800.</strong>
        <p>Rabbit Core V2.4.16 schedules the WorkSeat liveness correction at block 323,800. Upgrade before activation. Stop the previous launcher normally, then use the verified package with your existing data directory. Preserve blockchain data, encrypted wallet, node identity and persistent participation state. Existing VRF rules and the block 320,000 economics and admission rules remain unchanged. Mining rewards remain 70/30. The block target remains 10 seconds; actual intervals depend on network participation and availability.</p>
      </div>
      <Link className="button secondary" to="/releases">Downloads and upgrade guide</Link>
    </aside>
  )
}
