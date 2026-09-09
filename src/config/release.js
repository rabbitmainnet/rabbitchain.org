import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.2.1'
export const RELEASE_COMMIT = '743ac6d8d5d47961da6ae31fc13b37d04b4a0cf9'
export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.2.1'
export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.2.1'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    filename: 'rabbit-core-testnet-v2.2.1-windows-amd64.zip',
    sha256: '89d43310eb61cdc6e9bc320834ad99e8909a0986627806cc343913eb7119c82e',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'tar.gz',
    filename: 'rabbit-core-testnet-v2.2.1-linux-amd64.tar.gz',
    sha256: '267d62412d512bb26e945876a4d2cef0ccc5bc88c7a653548269ecfb8e0da1ab',
  },
].map((download) => ({
  ...download,
  url: `${RELEASE_DOWNLOAD_BASE}/${download.filename}`,
}))

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
}

export function releaseLabel() {
  return RELEASE.testnetLive ? 'PUBLIC TESTNET LIVE' : 'PUBLIC TESTNET · COMING SOON'
}
