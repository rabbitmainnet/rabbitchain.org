import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop(){
  const [visible,setVisible]=useState(false)
  const [progress,setProgress]=useState(0)

  useEffect(()=>{
    const onScroll=()=>{
      const doc=document.documentElement
      const max=Math.max(1,doc.scrollHeight-window.innerHeight)
      const value=Math.max(0,Math.min(1,window.scrollY/max))
      setProgress(value)
      setVisible(window.scrollY>520)
    }
    onScroll()
    window.addEventListener('scroll',onScroll,{passive:true})
    window.addEventListener('resize',onScroll)
    return()=>{
      window.removeEventListener('scroll',onScroll)
      window.removeEventListener('resize',onScroll)
    }
  },[])

  return <button
    className={`back-to-top ${visible?'is-visible':''}`}
    style={{'--back-progress':`${progress*360}deg`}}
    aria-label="Back to top"
    title="Back to top"
    onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
  >
    <span className="back-to-top-inner"><ArrowUp size={17}/></span>
  </button>
}
