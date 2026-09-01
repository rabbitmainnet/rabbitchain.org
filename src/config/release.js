import { NETWORKS } from './networks'

export const RELEASE_TAG = 'rabbit-core-testnet-v1'
export const RELEASE_COMMIT = '2ccacecbb6c701a34ec095c9e19993cfbfd5e31d'
export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v1'
export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/rabbit-core-testnet-v1'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    filename: 'rabbit-core-testnet-v1-windows-amd64.zip',
    sha256: 'b8f0285d456c2de92a68a2eb8ae28e841a6190a2f489ba08ae9061723b0ae40d',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'tar.gz',
    filename: 'rabbit-core-testnet-v1-linux-amd64.tar.gz',
    sha256: 'd2c7de850f2c10e84308c7ed33e71e91115fb93665242d199db0f40413248098',
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
