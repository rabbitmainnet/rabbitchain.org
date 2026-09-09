import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v2.2.2'
export const RELEASE_COMMIT = '249380bdd23582c4a1194b71e9f12f4cdd214472'
export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.2.2'
export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v2.2.2'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    filename: 'rabbit-core-testnet-v2.2.2-windows-amd64.zip',
    sha256: '7b3cdc9f0971a82daa97f42a64b72543a6da5055dcff0eebef2a05e5614cf6e4',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'tar.gz',
    filename: 'rabbit-core-testnet-v2.2.2-linux-amd64.tar.gz',
    sha256: '722262eec170c819946574c2321d50d3e04558506f653fc38d4c79ff6c323ba8',
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
