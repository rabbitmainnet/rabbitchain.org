import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.2.3-r1'
export const RELEASE_COMMIT = '314bf780cb16703cdfa8188cb9801f485a244e1c'
export const REQUIRED_VERSION = 'V2.2.3'
export const STABILIZATION_BLOCK = 50500

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.2.3-r1'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.2.3-r1'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.2.3-windows-amd64.zip`,
    sha256: 'e92966df4d196f23e7105571f2922cc71a9d1720f254e6ebbb70dedb8430d2f3',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.2.3-linux-amd64.tar.gz`,
    sha256: 'ab99fdb3c33742c83a4b425045e117fd8f727dd645b599ab5767a495ecb33765',
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
}

export function releaseLabel() {
  return RELEASE.testnetLive
    ? 'PUBLIC TESTNET LIVE'
    : 'PUBLIC TESTNET · COMING SOON'
}
