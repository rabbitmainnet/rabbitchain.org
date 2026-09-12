import { useEffect, useMemo, useState } from 'react'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { SafeAppProvider } from '@safe-global/safe-apps-provider'
import RabbitLiquidityPanel from '../components/RabbitLiquidityPanel'
import RabbitTokenFactoryPanel from '../components/RabbitTokenFactoryPanel'

const RABBIT_CHAIN_ID = 9280

const TOOLS = {
  liquidity: {
    title: 'Rabbit Liquidity',
    Component: RabbitLiquidityPanel,
  },
  factory: {
    title: 'Rabbit Token Factory',
    Component: RabbitTokenFactoryPanel,
  },
}

function parseChainId(value) {
  if (typeof value === 'number') return value

  const raw = String(value || '').trim()
  if (!raw) return null

  const n = raw.startsWith('0x')
    ? Number.parseInt(raw, 16)
    : Number.parseInt(raw, 10)

  return Number.isFinite(n) ? n : null
}

function ExplorerStatus({ title, text }) {
  return (
    <main className="rabbit-explorer-embed">
      <section className="rabbit-explorer-wallet-status">
        <img src="/rabbit-wallet-icon.png" alt="" />
        <span>RABBIT EXPLORER</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </section>
    </main>
  )
}

export default function ExplorerPlatformTools({ tool, toast }) {
  const config = TOOLS[tool]

  const sdk = useMemo(() => new SafeAppsSDK({
    debug: false,
  }), [])

  const [session, setSession] = useState({
    loading: true,
    provider: null,
    account: null,
    chainId: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function boot() {
      if (!config) {
        if (!cancelled) {
          setSession({
            loading: false,
            provider: null,
            account: null,
            chainId: null,
            error: 'Unknown Rabbit Explorer application.',
          })
        }
        return
      }

      if (window.self === window.top) {
        if (!cancelled) {
          setSession({
            loading: false,
            provider: null,
            account: null,
            chainId: null,
            error: `Open ${config.title} from Rabbit Explorer.`,
          })
        }
        return
      }

      try {
        const info = await Promise.race([
          sdk.safe.getInfo(),
          new Promise((_, reject) =>
            window.setTimeout(
              () => reject(new Error('Explorer wallet bridge timed out.')),
              8000,
            ),
          ),
        ])

        const provider = new SafeAppProvider(info, sdk)

        let accounts = []
        let rawChainId = null

        try {
          accounts = await provider.request({ method: 'eth_accounts' })
        } catch {}

        try {
          rawChainId = await provider.request({ method: 'eth_chainId' })
        } catch {}

        const account =
          (Array.isArray(accounts) && accounts[0]) ||
          info?.safeAddress ||
          null

        const chainId =
          parseChainId(rawChainId) ??
          parseChainId(info?.chainId)

        if (!account) {
          throw new Error(
            'Connect your wallet using the Explorer Connect button first.',
          )
        }

        if (chainId !== RABBIT_CHAIN_ID) {
          throw new Error(
            `${config.title} requires Rabbit Testnet (Chain ID ${RABBIT_CHAIN_ID}).`,
          )
        }

        if (cancelled) return

        setSession({
          loading: false,
          provider,
          account,
          chainId,
          error: null,
        })
      } catch (error) {
        if (cancelled) return

        setSession({
          loading: false,
          provider: null,
          account: null,
          chainId: null,
          error:
            error?.message ||
            `Connect your wallet in Rabbit Explorer and reopen ${config.title}.`,
        })
      }
    }

    boot()

    return () => {
      cancelled = true
    }
  }, [config, sdk])

  if (!config) {
    return (
      <ExplorerStatus
        title="Rabbit Explorer"
        text="Unknown application."
      />
    )
  }

  if (session.loading) {
    return (
      <ExplorerStatus
        title="Connecting Explorer wallet…"
        text="Using the wallet already connected to Rabbit Explorer."
      />
    )
  }

  if (
    session.error ||
    !session.provider ||
    !session.account ||
    session.chainId !== RABBIT_CHAIN_ID
  ) {
    return (
      <ExplorerStatus
        title="Connect in Rabbit Explorer"
        text={
          session.error ||
          'Connect your wallet using the Explorer Connect button.'
        }
      />
    )
  }

  const walletState = {
    account: session.account,
    chainId: session.chainId,
    chainIdHex: `0x${session.chainId.toString(16)}`,
  }

  const ToolComponent = config.Component

  return (
    <main className="rabbit-explorer-embed">
      <div className="rabbit-explorer-embed-inner">
        <ToolComponent
          walletState={walletState}
          walletProvider={session.provider}
          onConnect={() => {}}
          onSwitchNetwork={() => {}}
          toast={toast}
        />
      </div>
    </main>
  )
}
