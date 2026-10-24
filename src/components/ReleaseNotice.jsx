import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Rabbit Testnet recovery update">
      <div>
        <strong>Rabbit Core {RELEASE.requiredVersion}: Testnet recovery preview. Fork at block 320,000.</strong>
        <p>Windows downloads are available again with the startup recovery fix. Existing-wallet startup and initial synchronization were tested; full recovery and post-fork validation remain in progress. Stop the previous launcher normally, then use the new package with your existing data directory. Preserve blockchain, encrypted wallet, node identity and participation data. Initial peer discovery may take several minutes; do not open duplicate instances or delete files. A locally accepted admission proof is not canonical activation. Mining rewards remain 70/30 and blocks retain a 10-second target.</p>
      </div>
      <Link className="button secondary" to="/releases">Preview downloads and upgrade guide</Link>
    </aside>
  )
}
