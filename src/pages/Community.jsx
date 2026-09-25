import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

const channels = [
  {
    icon: '/social/github.svg',
    eyebrow: 'SOURCE',
    title: 'GitHub',
    text: 'Code, release history and official public repositories.',
    link: 'https://github.com/rabbitmainnet',
    label: 'github.com/rabbitmainnet',
  },
  {
    icon: '/social/x.svg',
    eyebrow: 'UPDATES',
    title: 'X / Twitter',
    text: 'Testnet announcements, launch updates and public project communication.',
    link: 'https://x.com/rabbit_mainnet',
    label: '@rabbit_mainnet',
  },
  {
    icon: '/social/discord.svg',
    eyebrow: 'COMMUNITY',
    title: 'Discord',
    text: 'Join the official Rabbit Chain community for testnet participation, discussion and coordination.',
    link: 'https://discord.gg/TBWspuEZss',
    label: 'discord.gg/TBWspuEZss',
  },
  {
    icon: '/social/instagram.svg',
    eyebrow: 'SOCIAL',
    title: 'Instagram',
    text: 'Follow Rabbit Chain visuals, ecosystem updates and community highlights.',
    link: 'https://www.instagram.com/rabbit_chain/',
    label: '@rabbit_chain',
  },
  {
    icon: '/social/facebook.svg',
    eyebrow: 'SOCIAL',
    title: 'Facebook',
    text: 'Follow Rabbit Chain announcements, project updates and community posts.',
    link: 'https://web.facebook.com/people/Rabbit-Chain/61594695301840/',
    label: 'Rabbit Chain',
  },
]

export default function Community() {
  return (
    <main>
      <section className="page-hero community-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> RABBIT COMMUNITY</span>
            <h1>Build the network <em>in public.</em></h1>
            <p>Follow development, inspect the source and participate through official Rabbit channels and independent infrastructure.</p>
          </div>

          <div className="community-brand-card">
            <img src="/rabbit-mark.png" alt="Rabbit Chain" />
            <strong>RABBIT CHAIN</strong>
            <span>OPEN SOURCE · P2P · PERMISSIONLESS</span>
            <p>One wallet. One fair chance.</p>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="OFFICIAL CHANNELS"
          title="Know where Rabbit actually lives."
          text="Project communication should be easy to verify before users follow links, download software or connect wallets."
        />

        <div className="community-grid">
          {channels.map((channel) => (
            <a
              className="community-card"
              key={channel.title}
              href={channel.link}
              target="_blank"
              rel="noreferrer"
            >
              <div className="community-card-icon">
                <img src={channel.icon} alt="" />
              </div>

              <span>{channel.eyebrow}</span>
              <h3>{channel.title}</h3>
              <p>{channel.text}</p>

              <b>
                {channel.label} <ArrowUpRight size={14} />
              </b>
            </a>
          ))}

          <article className="community-card">
            <div className="community-card-icon community-card-icon-security">
              <ShieldCheck size={20} />
            </div>

            <span>VERIFY</span>
            <h3>Security first</h3>
            <p>Never share seed phrases or private keys. Verify software and endpoints before use.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
