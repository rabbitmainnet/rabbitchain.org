import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { formatSlippagePercent } from '../hooks/useRabbitSlippage'

const PRESETS = [10, 50, 100]

function cleanPercent(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '')
  const first = cleaned.indexOf('.')
  if (first === -1) return cleaned
  return `${cleaned.slice(0, first + 1)}${cleaned.slice(first + 1).replace(/\./g, '')}`
}

export default function RabbitSlippageSettings({ slippageBps, setSlippageBps, triggerText }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(formatSlippagePercent(slippageBps))

  useEffect(() => setCustom(formatSlippagePercent(slippageBps)), [slippageBps])

  function updateCustom(next) {
    const cleaned = cleanPercent(next)
    setCustom(cleaned)
    const percent = Number(cleaned)
    if (!Number.isFinite(percent) || percent < 0.01 || percent > 50) return
    setSlippageBps(Math.round(percent * 100))
  }

  const warning = slippageBps > 500
    ? 'High slippage increases the amount you may lose to price movement.'
    : slippageBps < 10
      ? 'Very low slippage may cause transactions to revert in a moving pool.'
      : null

  return (
    <div className="rabbit-slippage-control">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {triggerText || `Slippage ${formatSlippagePercent(slippageBps)}%`}<Settings2 size={14} />
      </button>

      {open && (
        <div className="rabbit-slippage-popover">
          <div className="rabbit-slippage-head"><b>Slippage tolerance</b><small>Minimum-output protection for this browser.</small></div>
          <div className="rabbit-slippage-presets">
            {PRESETS.map((bps) => (
              <button key={bps} type="button" className={slippageBps === bps ? 'active' : ''} onClick={() => setSlippageBps(bps)}>
                {formatSlippagePercent(bps)}%
              </button>
            ))}
          </div>
          <label className="rabbit-slippage-custom"><span>Custom</span><div><input inputMode="decimal" value={custom} onChange={(event) => updateCustom(event.target.value)} /><b>%</b></div></label>
          <small className="rabbit-slippage-range">Allowed range: 0.01%–50%. Default: 0.50%.</small>
          {warning && <p className="rabbit-slippage-warning">{warning}</p>}
        </div>
      )}
    </div>
  )
}
