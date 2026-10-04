import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.5'
export const RELEASE_COMMIT = '56db31a4fcfe3a93297fb633ccb41a6cb14167e8'
export const REQUIRED_VERSION = 'V2.4.5'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Rabbit Core v2.4.5: Windows VRF key persistence fix; existing fork schedule unchanged.
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const VRF_LIVENESS_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const MINING_REWARD_V5_BLOCK = 153601
export const GENESIS_SHA256 = '17bfe51321f6e7befe8719ee35c34b1b876fda3e93672204903bd7b6d6bb69ba'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.5'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.5'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.5-windows-amd64.zip`,
    sha256: '0420d1b9aa21a29ac5a557f6f5f583e706a6353c50ee96447a90195607989b21',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.5-linux-amd64.tar.gz`,
    sha256: '81fd1bb54b1de0972bfc91e8c3e97a8228055c8724325e0948e46f04ed807f6c',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.5-darwin-amd64.tar.gz`,
    sha256: '5c4a5a187cb9fa51231c0c8d4807557c18c86917b5c6d5c79b6eb6198475a3e0',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.5-darwin-arm64.tar.gz`,
    sha256: '975b69cdaccd1d9b8695f0dd63c144cd0d25941666d6693ab27fd204017e0ba1',
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
