import { useEffect, useMemo, useRef } from 'react'

import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from '@reown/appkit/react'

import {
  ensureRabbitAppKit,
  RABBIT_TESTNET_CHAIN_HEX,
  rabbitTestnetAppKitNetwork,
} from '../lib/rabbitAppKit'

//
// Igual à INRI: AppKit precisa existir ANTES dos hooks.
//
ensureRabbitAppKit()

function toHexChainId(value) {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'bigint') {
    return `0x${value.toString(16)}`
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `0x${value.toString(16)}`
  }

  const raw = String(value).trim().toLowerCase()

  if (!raw) return null

  if (raw.startsWith('0x')) {
    return raw
  }

  if (raw.startsWith('eip155:')) {
    const id = Number(raw.slice(7))

    return Number.isFinite(id)
      ? `0x${id.toString(16)}`
      : null
  }

  const id = Number(raw)

  return Number.isFinite(id)
    ? `0x${id.toString(16)}`
    : null
}

function numericChainId(chainIdHex) {
  if (!chainIdHex) return null

  const id = Number.parseInt(chainIdHex, 16)

  return Number.isFinite(id)
    ? id
    : null
}

function detectWalletName(provider) {
  const peerName =
    provider?.session?.peer?.metadata?.name

  if (peerName) return peerName

  if (provider?.providerInfo?.name) {
    return provider.providerInfo.name
  }

  if (provider?.isMetaMask) return 'MetaMask'
  if (provider?.isCoinbaseWallet) return 'Coinbase Wallet'
  if (provider?.isTrust) return 'Trust Wallet'

  return 'Connected wallet'
}

export default function RabbitAppKitBridge({
  onConnected,
  onDisconnected,
}) {
  ensureRabbitAppKit()

  const {
    address,
    isConnected,
  } = useAppKitAccount()

  const {
    chainId,
    switchNetwork,
  } = useAppKitNetwork()

  const {
    walletProvider,
  } = useAppKitProvider('eip155')

  const switchAttempt = useRef('')
  const hadConnection = useRef(false)

  const chainIdHex = useMemo(
    () => toHexChainId(chainId),
    [chainId],
  )

  const rabbitReady =
    chainIdHex?.toLowerCase() === RABBIT_TESTNET_CHAIN_HEX

  //
  // Igual à INRI:
  // a wallet pode conectar por uma rede compatível;
  // depois direcionamos para Rabbit Testnet.
  //
  useEffect(() => {
    if (!isConnected || !address || !chainIdHex) {
      return
    }

    if (rabbitReady) {
      switchAttempt.current = ''
      return
    }

    const key = `${address}:${chainIdHex}`

    if (switchAttempt.current === key) {
      return
    }

    switchAttempt.current = key

    void Promise.resolve(
      switchNetwork(rabbitTestnetAppKitNetwork),
    ).catch(() => {
      // O usuário ainda pode selecionar Rabbit Testnet no AppKit.
    })
  }, [
    address,
    chainIdHex,
    isConnected,
    rabbitReady,
    switchNetwork,
  ])

  useEffect(() => {
    if (isConnected && address && walletProvider) {
      hadConnection.current = true

      onConnected?.({
        provider: walletProvider,

        name: detectWalletName(walletProvider),

        state: {
          account: address,
          chainId: numericChainId(chainIdHex),
          chainIdHex,
        },
      })

      return
    }

    //
    // Não dispara "disconnect" no primeiro render vazio.
    //
    if (hadConnection.current) {
      hadConnection.current = false
      onDisconnected?.()
    }
  }, [
    address,
    chainIdHex,
    isConnected,
    onConnected,
    onDisconnected,
    walletProvider,
  ])

  return null
}
