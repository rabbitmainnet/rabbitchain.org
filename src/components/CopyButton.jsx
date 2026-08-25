import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ value, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 1400)
    } catch {
      setDone(false)
    }
  }
  return <button className="copy-button" onClick={copy}>{done ? <Check size={14}/> : <Copy size={14}/>} {done ? 'Copied' : label}</button>
}
