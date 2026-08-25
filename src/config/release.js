export const RELEASE = {
  stage: 'prelaunch',
  testnetLive: false,
  mainnetLive: false,
  platformLive: false,
  whitepaperLive: false,
  downloadsLive: false,
}

export function releaseLabel() {
  return RELEASE.testnetLive ? 'PUBLIC TESTNET LIVE' : 'PUBLIC TESTNET · COMING SOON'
}
