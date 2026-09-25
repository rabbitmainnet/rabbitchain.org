import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from '@reown/appkit/react'

import {
  disconnectRabbitRemoteWallets,
  ensureRabbitRemoteWallets,
  isRabbitWalletConnectProvider,
  rabbitRemoteNetwork,
  rabbitRouteProvider,
  RABBIT_REMOTE_CHAIN_HEX,
  RABBIT_REMOTE_CHAIN_ID,
  walletConnectSessionHasRabbit,
} from '../lib/remoteWallets'

//
// AppKit precisa existir antes dos hooks.
//
ensureRabbitRemoteWallets()

function numericChainId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : null
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  const raw =
    String(value).trim().toLowerCase()

  if (!raw) return null

  if (raw.startsWith('0x')) {
    const parsed =
      Number.parseInt(raw, 16)

    return Number.isFinite(parsed)
      ? parsed
      : null
  }

  if (raw.startsWith('eip155:')) {
    const parsed =
      Number(raw.slice(7))

    return Number.isFinite(parsed)
      ? parsed
      : null
  }

  const parsed = Number(raw)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function walletName(provider) {
  return (
    provider?.session?.peer?.metadata?.name ||
    provider?.providerInfo?.name ||
    'WalletConnect wallet'
  )
}

export default function RemoteWalletBridge({
  onConnected,
  onDisconnected,
  onIncompatible,
}) {
  ensureRabbitRemoteWallets()

  const callbacks = useRef({
    onConnected,
    onDisconnected,
    onIncompatible,
  })

  useEffect(() => {
    callbacks.current = {
      onConnected,
      onDisconnected,
      onIncompatible,
    }
  }, [
    onConnected,
    onDisconnected,
    onIncompatible,
  ])

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

  const hadConnection =
    useRef(false)

  const incompatibleKey =
    useRef('')

  const currentChainId =
    useMemo(
      () => numericChainId(chainId),
      [chainId]
    )

  useEffect(() => {
    if (
      !isConnected ||
      !address ||
      !walletProvider
    ) {
      if (hadConnection.current) {
        hadConnection.current = false

        callbacks.current
          .onDisconnected?.()
      }

      return
    }

    const remote =
      isRabbitWalletConnectProvider(
        walletProvider
      )

    const name =
      walletName(walletProvider)

    if (remote) {
      if (
        !walletConnectSessionHasRabbit(
          walletProvider
        )
      ) {
        const key =
          `${name}:${address}`

        if (
          incompatibleKey.current !== key
        ) {
          incompatibleKey.current = key

          callbacks.current
            .onIncompatible?.(name)
        }

        void disconnectRabbitRemoteWallets()

        return
      }

      incompatibleKey.current = ''

      hadConnection.current = true

      callbacks.current.onConnected?.({
        provider:
          rabbitRouteProvider(
            walletProvider
          ),

        name,

        state: {
          account: address,
          chainId:
            RABBIT_REMOTE_CHAIN_ID,
          chainIdHex:
            RABBIT_REMOTE_CHAIN_HEX,
        },
      })

      return
    }

    //
    // Provider injected pelo AppKit:
    // primeiro muda realmente para Rabbit.
    //
    if (
      currentChainId !==
      RABBIT_REMOTE_CHAIN_ID
    ) {
      void Promise.resolve(
        switchNetwork(
          rabbitRemoteNetwork
        )
      ).catch(() => {})

      return
    }

    hadConnection.current = true

    callbacks.current.onConnected?.({
      provider: walletProvider,

      name,

      state: {
        account: address,
        chainId:
          RABBIT_REMOTE_CHAIN_ID,
        chainIdHex:
          RABBIT_REMOTE_CHAIN_HEX,
      },
    })
  }, [
    address,
    currentChainId,
    isConnected,
    switchNetwork,
    walletProvider,
  ])

  return null
}
