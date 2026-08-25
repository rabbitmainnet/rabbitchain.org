import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound(){
  return <main><section className="not-found"><div className="shell not-found-inner"><span>404 · RABBIT CHAIN</span><h1>This route is not part of the network portal.</h1><p>Return to Rabbit Chain or jump directly into the public Testnet hub.</p><div><Link className="button primary" to="/"><ArrowLeft size={15}/>Home</Link><Link className="button secondary" to="/testnet"><Search size={15}/>Testnet hub</Link></div></div></section></main>
}
