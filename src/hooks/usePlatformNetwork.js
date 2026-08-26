import { useCallback, useEffect, useState } from 'react'
import {
  PLATFORM_DEFAULT_NETWORK,
  PLATFORM_NETWORKS,
} from '../config/platform'

const STORAGE_KEY = 'rabbit-platform-network'
const EVENT_NAME = 'rabbit-platform-network-change'

function validNetwork(value) {
  return Boolean(PLATFORM_NETWORKS[value])
}

function readNetwork() {
  if (typeof window === 'undefined') {
    return PLATFORM_DEFAULT_NETWORK
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  return validNetwork(stored)
    ? stored
    : PLATFORM_DEFAULT_NETWORK
}

export function usePlatformNetwork() {
  const [platformNetwork, setState] = useState(readNetwork)

  useEffect(() => {
    function sync(event) {
      const value = event?.detail

      if (validNetwork(value)) {
        setState(value)
      }
    }

    function syncStorage(event) {
      if (
        event.key === STORAGE_KEY &&
        validNetwork(event.newValue)
      ) {
        setState(event.newValue)
      }
    }

    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener('storage', syncStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])

  const setPlatformNetwork = useCallback((value) => {
    if (!validNetwork(value)) return

    window.localStorage.setItem(STORAGE_KEY, value)
    setState(value)

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: value,
      })
    )
  }, [])

  return {
    platformNetwork,
    setPlatformNetwork,
    network: PLATFORM_NETWORKS[platformNetwork],
  }
}
