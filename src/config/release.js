import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.22'
export const RELEASE_COMMIT = 'e959000aa59d568374dbda1066e08d1f4f9ff316'
export const REQUIRED_VERSION = 'V2.4.22'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Historical activations remain unchanged; WorkSeat liveness V2 activated at 323800; v2.4.22 adds no new fork.
export const FORK_2414_BLOCK = 320000
export const WORK_SEAT_LIVENESS_V2_BLOCK = 323800
export const VRF_AVAILABILITY_V2_BLOCK = 173057
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const VRF_LIVENESS_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const MINING_REWARD_V5_BLOCK = 153601
export const GENESIS_SHA256 = '4970159f077b62b7aa9bde1f81cb61ae837b42ef64861d7b23241e1af4d75c9f'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.22'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.22'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.22-windows-amd64.zip`,
    sha256: 'c43053ca74a3514550dc665beb9a07bed44729cf55d15865ec8efaa558ca38be',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.22-linux-amd64.tar.gz`,
    sha256: 'ea9f7c32bd5691b2216352cd525f63e22247d7f5d0f0ed0421789f3d9c6fa9df',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.22-darwin-amd64.tar.gz`,
    sha256: '187a3ebcd2199ffac04f0420909f3afcdd39e0e6f3e3536b0ae2e9a02c5b2f92',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.22-darwin-arm64.tar.gz`,
    sha256: 'f9d91b237211f2d0d7eec080c4aa0ccbc423f3dbb1aa9643a156fa100667043c',
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
  forkBlock: FORK_2414_BLOCK,
  vrfEconomicsV2Block: FORK_2414_BLOCK,
  workSeatAdmissionV2Block: FORK_2414_BLOCK,
  workSeatLivenessV2Block: WORK_SEAT_LIVENESS_V2_BLOCK,
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
