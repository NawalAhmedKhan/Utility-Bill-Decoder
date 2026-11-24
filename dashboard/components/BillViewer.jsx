'use client'
import { useRef, useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { REGIONS } from '@/lib/regions'

export default function BillViewer({ bill, hl }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [imgOk, setImgOk] = useState(true)
  const drag = useRef(null)
  const box = hl ? REGIONS[hl] : null
  const clamp = (v) => Math.min(4, Math.max(0.4, v))

  return (
    <div
      className="relative h-full cursor-grab touch-none overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:22px_22px] active:cursor-grabbing"
      onPointerDown={(e) => { drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y } }}
      onPointerMove={(e) => drag.current && setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
      onWheel={(e) => setZoom((z) => clamp(z - e.deltaY * 0.001))}
    >
      <div
        className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button className="p-2 hover:text-cyan-400" onClick={() => setZoom((z) => clamp(z - 0.2))}><ZoomOut size={16} /></button>
        <span className="w-12 text-center font-mono text-xs text-zinc-400">{Math.round(zoom * 100)}%</span>
        <button className="p-2 hover:text-cyan-400" onClick={() => setZoom((z) => clamp(z + 0.2))}><ZoomIn size={16} /></button>
        <button className="p-2 hover:text-cyan-400" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}><RotateCcw size={16} /></button>
      </div>

      <div
        className="absolute left-1/2 top-1/2 w-[520px]"
        style={{ transform: `translate(-50%,-50%) translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}
      >
        <div className="relative">
          {imgOk && bill.image ? (
            <img src={bill.image} alt={bill.id} draggable={false} onError={() => setImgOk(false)} className="w-full rounded shadow-2xl shadow-black" />
          ) : (
            <div className="grid aspect-[3/4] place-items-center rounded bg-zinc-900 p-6 text-center text-sm text-zinc-500">
              Put {bill.id}.png in public/bills/
            </div>
          )}
          {box && (
            <div
              className="spot pointer-events-none absolute rounded border-2 border-cyan-400"
              style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
            />
          )}
        </div>
      </div>
    </div>
  )
}