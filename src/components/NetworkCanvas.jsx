import { useEffect, useRef } from 'react'

export default function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: 0.5, y: 0.5 }
    let nodes = []

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = width < 700 ? 32 : 58
      nodes = Array.from({ length: count }, (_, i) => ({
        angle: (Math.PI * 2 * i) / count + Math.random() * 0.25,
        radius: 0.18 + Math.random() * 0.42,
        speed: (0.00008 + Math.random() * 0.00015) * (Math.random() > 0.5 ? 1 : -1),
        size: 1 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2
      }))
    }

    const onPointer = (event) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width
      pointer.y = (event.clientY - rect.top) / rect.height
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height)
      const cx = width * (0.56 + (pointer.x - 0.5) * 0.025)
      const cy = height * (0.50 + (pointer.y - 0.5) * 0.025)
      const min = Math.min(width, height)
      const points = nodes.map((n) => {
        const a = n.angle + time * n.speed
        const rx = min * n.radius * 1.24
        const ry = min * n.radius * 0.74
        return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, size: n.size, phase: n.phase }
      })

      ctx.save()
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, min * 0.5)
      grad.addColorStop(0, 'rgba(151,30,255,.14)')
      grad.addColorStop(0.4, 'rgba(236,31,159,.055)')
      grad.addColorStop(1, 'rgba(21,20,255,0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(cx, cy, min * 0.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i]
          const b = points[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < min * 0.16) {
            ctx.strokeStyle = `rgba(126,90,255,${Math.max(0, 0.12 - dist / (min * 1.5))})`
            ctx.lineWidth = 0.7
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }

      points.forEach((p, idx) => {
        const pulse = 0.55 + 0.45 * Math.sin(time * 0.0014 + p.phase)
        ctx.fillStyle = idx % 5 === 0 ? `rgba(239,42,165,${0.45 + pulse * 0.5})` : `rgba(110,92,255,${0.35 + pulse * 0.4})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size + pulse * 0.7, 0, Math.PI * 2); ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onPointer)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />
}
