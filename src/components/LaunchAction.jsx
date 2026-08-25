import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LaunchAction({ icon: Icon, label, title, text, to, disabled = false, badge }) {
  const content = <>
    <div className="launch-action-icon"><Icon size={21}/></div>
    <div className="launch-action-copy"><span>{label}</span><h3>{title}</h3><p>{text}</p></div>
    <div className="launch-action-end">{badge && <small>{badge}</small>}{disabled ? <LockKeyhole size={16}/> : <ArrowUpRight size={16}/>}</div>
  </>
  if(disabled)return <div className="launch-action disabled">{content}</div>
  if(/^https?:\/\//.test(to||''))return <a className="launch-action" href={to} target="_blank" rel="noreferrer">{content}</a>
  return <Link className="launch-action" to={to}>{content}</Link>
}
