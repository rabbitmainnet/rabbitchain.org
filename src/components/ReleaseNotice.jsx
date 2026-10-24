import { Link } from 'react-router-dom'
import { RELEASE } from '../config/release'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Rabbit Testnet fork update">
      <div>
        <strong>Rabbit Core {RELEASE.requiredVersion}: Testnet fork at block 320,000.</strong>
        <p><strong>Windows upgrade temporarily paused:</strong> a startup recovery failure has been reported with v2.4.14. Do not delete or reset your blockchain or wallet. Windows downloads are paused pending a tested fix.</p>
        <p>Testnet pre-release: historical synchronization validation is still in progress. Upgrade miners and nodes before activation. Keep your existing blockchain, encrypted wallet, node identity and participation data. Fresh installations retain automatic verified bootstrap. Blocks remain at a 10-second target; mining rewards remain 70% producer / 30% committee.</p>
      </div>
      <Link className="button secondary" to="/releases">Downloads and upgrade guide</Link>
    </aside>
  )
}
