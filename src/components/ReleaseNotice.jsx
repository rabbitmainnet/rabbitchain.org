import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Testnet software update">
      <div>
        <strong>Update to Rabbit Core {RELEASE.requiredVersion} for mining recovery and clear penalty status.</strong>
        <p>This release prevents a slow peer from blocking LCQ delivery to other peers, retries failed recovery downloads and displays canonical penalties in English with the end block and remaining blocks. Operational status refreshes approximately every 10 to 12 seconds. Keep your existing wallet and blockchain data. No new hard fork is introduced. A missed-turn penalty reports the consensus reason; the node log is needed to investigate the underlying technical cause.</p>
      </div>
      <Link className="button secondary" to="/releases">Download and upgrade</Link>
    </aside>
  )
}
