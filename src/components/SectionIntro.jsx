export default function SectionIntro({ index, label, title, text, children }) {
  return <div className="section-intro"><div><span>{index} / {label}</span><h2>{title}</h2></div>{text && <p>{text}</p>}{children}</div>
}
