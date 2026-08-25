export default function SectionHeader({ eyebrow, title, text, align = 'left' }) {
  return <div className={`section-header ${align === 'center' ? 'center' : ''}`}>
    <span>{eyebrow}</span>
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>
}
