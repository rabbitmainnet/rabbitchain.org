import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.2'
export const RELEASE_COMMIT = '3a3bbeea19c6ac93ab877f7f63dd3f9ab86451d6'
export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.2'
export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.2'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    filename: 'rabbit-core-testnet-v2.2-windows-amd64.zip',
    sha256: '6da08da207dc423a012f3bee3ecb23c70a02472ff7a06ef068e453b54c11149a',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'tar.gz',
    filename: 'rabbit-core-testnet-v2.2-linux-amd64.tar.gz',
    sha256: '4c56dfff60fb3e45c0a7f2e529740ece141713cb2b7310aa16fe58415b0308b1',
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
