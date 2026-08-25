import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function LegalPage({ eyebrow, title, intro, updated='August 25, 2026', sections=[] }){
  return <main className="legal-page">
    <section className="legal-hero">
      <div className="shell legal-hero-inner">
        <Link className="legal-back" to="/"><ArrowLeft size={14}/> Rabbit Chain</Link>
        <span className="page-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className="legal-meta"><ShieldCheck size={15}/><span>Official Rabbit Chain legal information</span><b>Last updated · {updated}</b></div>
      </div>
    </section>

    <section className="shell legal-layout">
      <aside className="legal-toc">
        <span>ON THIS PAGE</span>
        {sections.map((section,index)=><a key={section.id} href={`#${section.id}`}>{String(index+1).padStart(2,'0')} · {section.title}</a>)}
      </aside>
      <article className="legal-content">
        {sections.map((section)=><section id={section.id} key={section.id} className="legal-section">
          <h2>{section.title}</h2>
          {section.paragraphs?.map((text,i)=><p key={i}>{text}</p>)}
          {section.items?.length>0&&<ul>{section.items.map((item,i)=><li key={i}>{item}</li>)}</ul>}
        </section>)}
        <div className="legal-note"><strong>Important</strong><p>These pages describe the official Rabbit Chain web services and protocol interfaces. Independent nodes, wallets, exchanges, applications and other third-party services may operate under separate terms and policies.</p></div>
      </article>
    </section>
  </main>
}
