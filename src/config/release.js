import { NETWORKS } from './networks'

export const RELEASE = {
  stage: NETWORKS.testnet.networkLive ? 'testnet-live' : 'prelaunch',
  testnetLive: NETWORKS.testnet.networkLive,
  mainnetLive: NETWORKS.mainnet.networkLive,
  platformLive: Object.values(NETWORKS.testnet.platform).some(Boolean),
  whitepaperLive: false,
  downloadsLive: false,
}

export function releaseLabel() {
  return RELEASE.testnetLive ? 'PUBLIC TESTNET LIVE' : 'PUBLIC TESTNET · COMING SOON'
}
