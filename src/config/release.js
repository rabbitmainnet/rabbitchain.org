import { NETWORKS } from './networks'

export const RELEASE_TAG = 'v2.4.15'
export const RELEASE_COMMIT = '0ed187dffbe7a516ccc4f9196c6a6b165c8a6500'
export const REQUIRED_VERSION = 'V2.4.15'
export const STABILIZATION_BLOCK = 50500
export const FAIRNESS_BLOCK = 73000
export const LIVENESS_V3_BLOCK = 77000
export const LIVENESS_V4_BLOCK = 97991
export const LIVENESS_V5_BLOCK = 115000
export const LIVENESS_V6_BLOCK = 115022

// Historical activations remain unchanged; the v2.4.15 Testnet fork is scheduled at 320000.
export const FORK_2414_BLOCK = 320000
export const VRF_AVAILABILITY_V2_BLOCK = 173057
export const VRF_DKG_PREPARATION_BLOCK = 136065
export const VRF_LIVENESS_BLOCK = 136193
export const VRF_PROTOCOL_BLOCK = 136193
export const MINING_REWARD_V5_BLOCK = 153601
export const GENESIS_SHA256 = '4970159f077b62b7aa9bde1f81cb61ae837b42ef64861d7b23241e1af4d75c9f'

export const RELEASE_URL =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/v2.4.15'

export const RELEASE_DOWNLOAD_BASE =
  'https://github.com/rabbitmainnet/rabbit-geth/releases/download/v2.4.15'

export const DOWNLOADS = [
  {
    key: 'windows-amd64',
    platform: 'Windows',
    architecture: 'AMD64',
    format: 'ZIP',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.15-windows-amd64.zip`,
    sha256: '3523c5cb605d2ad7d7e464e8a340b8698df84675ad73bce7840905735172b14d',
  },
  {
    key: 'linux-amd64',
    platform: 'Linux',
    architecture: 'AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.15-linux-amd64.tar.gz`,
    sha256: 'bdc5875f4239a3c33c6ba13179b459a2cec3060a8dce584e92c70a7d413b1fa0',
  },
  {
    key: 'darwin-amd64',
    platform: 'macOS',
    architecture: 'Intel / AMD64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.15-darwin-amd64.tar.gz`,
    sha256: 'b92e39bd4e76e93ebe4508c35babffa496d580af648eecdbe3c8591eee88c6e2',
  },
  {
    key: 'darwin-arm64',
    platform: 'macOS',
    architecture: 'Apple Silicon / ARM64',
    format: 'TAR.GZ',
    url: `${RELEASE_DOWNLOAD_BASE}/rabbit-core-testnet-v2.4.15-darwin-arm64.tar.gz`,
    sha256: 'e9efa24d7f453953ed4b1f4ad0c4594a789179a6cd434e4c38fcaaf3391d217a',
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
