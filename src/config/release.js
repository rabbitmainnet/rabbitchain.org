import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.23'
export const RELEASE_COMMIT = 'ec4e2132a88dc7696e8718c207dbc9a05b626f13'
export const REQUIRED_VERSION = 'V2.4.23'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Historical activations remain unchanged; WorkSeat liveness V2 activated at 323800; v2.4.23 adds no new fork.
export const FORK_2414_BLOCK = 320000
export const WORK_SEAT_LIVENESS_V2_BLOCK = 323800
export const VRF_AVAILABILITY_V2_BLOCK = 173057
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const VRF_LIVENESS_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const MINING_REWARD_V5_BLOCK = 153601
export const GENESIS_SHA256 = '4970159f077b62b7aa9bde1f81cb61ae837b42ef64861d7b23241e1af4d75c9f'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.23'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.23'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.23-windows-amd64.zip`,
    sha256: '0f66529c508c2fd3664f937a2b3937e1715387ac456fd59e22354804ca2369b7',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.23-linux-amd64.tar.gz`,
    sha256: '9405d547c51a1a5ccc824b02cfd8a5abc04d5238d7b270cbd225bf6f76b01db4',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.23-darwin-amd64.tar.gz`,
    sha256: '7dd628a70877fc0e3a9e21440d203569d5af67c7cd1acaef551f53e3d1475f8e',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.23-darwin-arm64.tar.gz`,
    sha256: '57fe8ce19235399f0865904298484d8b2d647415f6a2447c790e5039a9b59e33',
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
