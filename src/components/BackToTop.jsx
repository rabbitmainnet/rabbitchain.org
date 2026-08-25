import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop(){
  const [visible,setVisible]=useState(false)
  useEffect(()=>{
    const onScroll=()=>setVisible(window.scrollY>650)
    onScroll()
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>window.removeEventListener('scroll',onScroll)
  },[])
  if(!visible)return null
  return <button className="back-to-top" aria-label="Back to top" title="Back to top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><ArrowUp size={18}/><span>Top</span></button>
}
