import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.3.0'
export const RELEASE_COMMIT = '7128cb6db44dbecff608a54b4890a03f5e426647'
export const REQUIRED_VERSION = 'V2.3.0'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.3.0'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.3.0'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.3.0-windows-amd64.zip`,
    sha256: 'a23662ee6def886b62336ce0dedd5b0d6bf8daeb0cb12cc96eadae435c12ab0e',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.3.0-linux-amd64.tar.gz`,
    sha256: 'e5d75d1b3c71b31420a1999043a369f661bea794afc4aaefdff5e157262ec2ad',
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
  livenessV3Block: LIVENESS_V3_BLOCK,
}

export function releaseLabel() {
  return RELEASE.testnetLive
    ? 'PUBLIC TESTNET LIVE'
    : 'PUBLIC TESTNET · COMING SOON'
}
