export default function SectionHeader({ eyebrow, title, text, align = 'split' }) {
  return (
    <div className={`section-header section-header-${align}`}>
      <div>
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  )
}
