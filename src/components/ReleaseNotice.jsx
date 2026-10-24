import { Link } from 'react-router-dom'

export default function ReleaseNotice() {
  return (
    <aside className="release-update-notice shell" aria-label="Rabbit Testnet fork update">
      <div>
        <strong>Rabbit Core v2.4.14: Testnet fork scheduled at block 320,000.</strong>
        <p>The v2.4.14 release is undergoing final validation; new downloads are not public yet. Existing downloads remain available. Preserve your blockchain, encrypted wallet, node identity and participation data. From activation, VRF pricing targets 0.005 tRUSD with 50% development / 30% validated signers / 20% fulfillment producer. Blocks retain a 10-second target and mining rewards remain 70/30.</p>
      </div>
      <Link className="button secondary" to="/releases">Current downloads and upgrade guide</Link>
    </aside>
  )
}
