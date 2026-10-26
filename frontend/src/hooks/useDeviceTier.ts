import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { noNavegador } from '@/lib/ambiente'

export type DeviceTier = 'full' | 'lite'

function suportaWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export function useDeviceTier(): DeviceTier {
  const reduzirMovimento = useReducedMotion()

  return useMemo(() => {
    if (!noNavegador) return 'lite'
    const forcado = new URLSearchParams(window.location.search).get('altar')
    if (forcado === 'lite' || forcado === 'full') return forcado

    if (reduzirMovimento || !suportaWebGL2()) return 'lite'

    const nav = navigator as Navigator & {
      deviceMemory?: number
      connection?: { saveData?: boolean; effectiveType?: string }
    }
    if (nav.connection?.saveData || /(^|-)[23]g$/.test(nav.connection?.effectiveType ?? '')) return 'lite'

    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'lite'
    if (navigator.hardwareConcurrency <= 4) return 'lite'
    return window.matchMedia('(pointer: coarse)').matches ? 'lite' : 'full'
  }, [reduzirMovimento])
}
