import Brand from './Brand'
import { SITE } from '../config/site'

export default function Footer() {
  return <footer className="site-footer"><Brand/><p>Permissionless EVM Layer 1 powered by LCQ Consensus.</p><div><a href={SITE.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={SITE.x} target="_blank" rel="noreferrer">X ↗</a></div><span>RABBIT CHAIN · 2026</span></footer>
}
