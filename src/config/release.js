import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.2.5'
export const RELEASE_COMMIT = 'ed6fb1692392ce93886d112d84142b8aa487fceb'
export const REQUIRED_VERSION = 'V2.2.5'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.2.5'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.2.5'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.2.5-windows-amd64.zip`,
    sha256: '08a7cf8d79b8183cdde641fa06157b60c92329105e31965492ccc1b32031c945',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.2.5-linux-amd64.tar.gz`,
    sha256: 'f376de87e944624834ea9128018ed4ee42df7ab6e55779dfded5085aacf7ca35',
  },
]

export const RELEASE = {
  stage: NETWORKS.testnet.networkLive ? 'testnet-live' : 'prelaunch',
  testnetLive: NETWORKS.testnet.networkLive,
  mainnetLive: NETWORKS.mainnet.networkLive,
  platformLive: Object.values(NETWORKS.testnet.platform).some(Boolean),
  whitepaperLive: true,
  downloadsLive: true,
  tag: RELEASE_TAG,
  commit: RELEASE_COMMIT,
  url: RELEASE_URL,
  requiredVersion: REQUIRED_VERSION,
  stabilizationBlock: STABILIZATION_BLOCK,
  fairnessBlock: FAIRNESS_BLOCK,
}

export function releaseLabel() {
  return RELEASE.testnetLive
    ? 'PUBLIC TESTNET LIVE'
    : 'PUBLIC TESTNET · COMING SOON'
}
