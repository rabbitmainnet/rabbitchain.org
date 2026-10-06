import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.7'
export const RELEASE_COMMIT = 'f30179c3d5abf19e1aae62b35d73a3a7a1a0aec2'
export const REQUIRED_VERSION = 'V2.4.7'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Availability V2 activated at block 173057 in v2.4.6. v2.4.7 adds authenticated relay without a new fork.
export const VRF_AVAILABILITY_V2_BLOCK = 173057
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const VRF_LIVENESS_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const MINING_REWARD_V5_BLOCK = 153601
export const GENESIS_SHA256 = '17bfe51321f6e7befe8719ee35c34b1b876fda3e93672204903bd7b6d6bb69ba'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.7'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.7'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.7-windows-amd64.zip`,
    sha256: '7b999ce12a9b352e29625e92dacd461269c2b2e1ffb0e81ad3dc81cd25e1d0dc',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.7-linux-amd64.tar.gz`,
    sha256: '88c5221b4f5fd41c496ab9c29dc513c0d63f0ff824fa202fa67aa6ff8faf7f93',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.7-darwin-amd64.tar.gz`,
    sha256: '1d3d1fb8cb195560823d866da5f472552ba1d4894ec5a03a80db99e311651e4a',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.7-darwin-arm64.tar.gz`,
    sha256: 'd7bcca04aa34a3ec8cbead8483110ba65030824ac4fa65d82a8919ddc1bbdb07',
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
  consensusLivenessV4Block: LIVENESS_V4_BLOCK,
  vrfLivenessBlock: VRF_LIVENESS_BLOCK,
  vrfProtocolBlock: VRF_PROTOCOL_BLOCK,
  vrfAvailabilityV2Block: VRF_AVAILABILITY_V2_BLOCK,
  genesisSha256: GENESIS_SHA256,
  miningRewardV5Block: MINING_REWARD_V5_BLOCK,
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
