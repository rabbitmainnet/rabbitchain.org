import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.0'
export const RELEASE_COMMIT = '68974ea4c520262070088b23a09530124c477648'
export const REQUIRED_VERSION = 'V2.4.0'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Rabbit Core Testnet v2.4.0 fork gates.
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const CONSENSUS_LIVENESS_V4_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const GENESIS_SHA256 = '36017cac04b88ccddf81f1f963dafe227071f9963925a2616aa7f41b3f24299b'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.0'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.0'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.0-windows-amd64.zip`,
    sha256: '5621762e53b0388d52c55f15d8148403a6d639bfcebdc9a7f5ca101915e09e3f',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.0-linux-amd64.tar.gz`,
    sha256: '94a81ee418cac9574c10a6af5e0073535e704a441177ef42f2a285f8fae937ac',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.0-darwin-amd64.tar.gz`,
    sha256: 'bf292a4b1a84b1dc5a7def34908f908b6c3ef28da6d9163af29c0af4629bbc01',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.0-darwin-arm64.tar.gz`,
    sha256: '1c1aa68eaeede17bea184f5d33c8dcddce5cb1214ea0f55fc8c9cf562bfde430',
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
  livenessV4Block: LIVENESS_V4_BLOCK,
  livenessV5Block: LIVENESS_V5_BLOCK,
  vrfDkgPreparationBlock: VRF_DKG_PREPARATION_BLOCK,
  consensusLivenessV4Block: CONSENSUS_LIVENESS_V4_BLOCK,
  vrfProtocolBlock: VRF_PROTOCOL_BLOCK,
  genesisSha256: GENESIS_SHA256,
}

export function releaseLabel() {
  return RELEASE.testnetLive
    ? 'PUBLIC TESTNET LIVE'
    : 'PUBLIC TESTNET · COMING SOON'
}

export const TESTNET_ENDPOINTS = {
  chainId: 9280,
  currency: 'tRAB',
  rpc: 'https://rpc-testnet.rabbitchain.org',
  ws: 'wss://rpc-testnet.rabbitchain.org/ws',
  explorer: 'https://explorer-testnet.rabbitchain.org',
}

export const TESTNET_BOOTNODES = [
  'enode://2fac5ffabae5e2202666279e2d06f86b6f3f11977fa0818ad795889a55b32e2d4bd651bb5860fc6e88072a01cad23df475a36487cdcd496e97932909600b7791@157.245.245.16:30303',
  'enode://d106f46d3e37a5b8487b1a4b70a11519e77cf8c4532065a3508ebf943e44840867eaff2a4fa8e525e4dea6680d1aef7cb1c2824f3613fc3482b92eb026d357d4@24.144.112.140:30303',
]
