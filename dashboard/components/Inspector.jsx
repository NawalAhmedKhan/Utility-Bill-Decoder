// 'use client'
// import { useState } from 'react'
// import { ChevronDown, Copy, Check, Send, ShieldCheck } from 'lucide-react'

// const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
// const label = (t) => t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
// const Mono = ({ children, className = '' }) => <span className={`font-mono ${className}`}>{children}</span>

// const highlight = (json) =>
//   json
//     .replace(/&/g, '&amp;').replace(/</g, '&lt;')
//     .replace(/("(\\.|[^\\"])*"(\s*:)?|-?\d+(?:\.\d+)?)/g, (m) => {
//       const c = /^"/.test(m) ? (/:$/.test(m) ? 'text-cyan-300' : 'text-emerald-300') : 'text-amber-300'
//       return `<span class="${c}">${m}</span>`
//     })

// function Stat({ label, value, color }) {
//   return (
//     <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
//       <div className="text-[11px] text-zinc-400">{label}</div>
//       <Mono className={`mt-1 block text-base ${color}`}>{value}</Mono>
//     </div>
//   )
// }

// function Section({ title, total, region, rows, hl, setHl }) {
//   const [open, setOpen] = useState(true)
//   return (
//     <div
//       onMouseEnter={() => setHl(region)}
//       onMouseLeave={() => setHl(null)}
//       className={`rounded-lg border bg-zinc-900 p-3 transition ${hl === region ? 'border-cyan-400' : 'border-zinc-800'}`}
//     >
//       <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm">
//         <span>{title}</span>
//         <span className="flex items-center gap-2">
//           <Mono className="text-xs text-amber-400">{total}</Mono>
//           <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
//         </span>
//       </button>
//       {open && (
//         <div className="mt-2 space-y-1 text-xs text-zinc-300">
//           {rows.map(([k, v], i) => (
//             <div key={i} className="flex justify-between"><span>{k}</span><Mono>{v}</Mono></div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function Level1({ l1, hl, setHl }) {
//   const [raw, setRaw] = useState(false)
//   const [copied, setCopied] = useState(false)
//   const json = JSON.stringify(l1, null, 2)
//   const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500) }
//   const list = (items) => (items || []).map((x) => [label(x.type), fmt(x.amount)])
//   const taxRows = l1.taxes?.length ? list(l1.taxes) : l1.total_taxes != null ? [['Combined taxes', fmt(l1.total_taxes)]] : []

//   return (
//     <div className="space-y-2">
//       <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
//         <span>Provider <Mono className="text-zinc-200">{l1.provider ?? '-'}</Mono></span>
//         <span>Tariff <Mono className="text-zinc-200">{l1.tariff ?? '-'}</Mono></span>
//         <span>Load <Mono className="text-zinc-200">{l1.sanctioned_load_kw ?? '-'} kW</Mono></span>
//         <span>Month <Mono className="text-zinc-200">{l1.bill_month ?? '-'}</Mono></span>
//         <span>Issued <Mono className="text-zinc-200">{l1.issue_date ?? '-'}</Mono></span>
//       </div>
//       <Section title="Meter readings" region="meter" total={`${l1.units_consumed ?? '-'} kWh`} hl={hl} setHl={setHl}
//         rows={[['Reading date', l1.reading_date ?? '-'], ['Previous', l1.previous_reading ?? '-'], ['Current', l1.current_reading ?? '-']]} />
//       <Section title="Charges" region="charges" total={`PKR ${fmt(l1.total_charges)}`} hl={hl} setHl={setHl} rows={list(l1.charges)} />
//       <Section title="Taxes" region="taxes" total={`PKR ${fmt(l1.total_taxes)}`} hl={hl} setHl={setHl} rows={taxRows} />
//       <Section title="Payable" region="payable" total={`PKR ${fmt(l1.payable_within_due_date)}`} hl={hl} setHl={setHl}
//         rows={[['Current bill', fmt(l1.current_bill)], ['Arrears', fmt(l1.arrears)], ['Within due date', fmt(l1.payable_within_due_date)], ['After due date', fmt(l1.payable_after_due_date)]]} />
//       <div className="flex items-center justify-between pt-2 text-xs text-zinc-400">
//         <button onClick={() => setRaw(!raw)} className="hover:text-cyan-400">{raw ? 'Hide' : 'Show'} raw JSON</button>
//         {raw && <button onClick={copy} className="flex items-center gap-1 hover:text-cyan-400">{copied ? <Check size={12} /> : <Copy size={12} />} Copy</button>}
//       </div>
//       {raw && (
//         <pre className="overflow-auto rounded-lg border border-zinc-800 bg-black p-3 font-mono text-[11px] leading-relaxed"
//           dangerouslySetInnerHTML={{ __html: highlight(json) }} />
//       )}
//     </div>
//   )
// }

// function Level2({ items, setItems, setHl }) {
//   const [open, setOpen] = useState(null)
//   const [q, setQ] = useState('')
//   const ask = (e) => {
//     e.preventDefault()
//     if (!q.trim()) return
//     // TODO: call your Python pipeline here, e.g. fetch('/api/ask', { method: 'POST', body: JSON.stringify({ question: q }) })
//     setItems([...items, { id: `C${items.length + 1}`, question: q, answer: 'Connect /api/ask to your Gemini pipeline.', region: null }])
//     setQ('')
//   }
//   return (
//     <div className="flex min-h-0 flex-1 flex-col">
//       <div className="flex-1 space-y-2 overflow-auto">
//         {items.map((it, i) => (
//           <div key={it.id} onMouseEnter={() => setHl(it.region)} onMouseLeave={() => setHl(null)}
//             className={`rounded-lg border bg-zinc-900 ${open === i ? 'border-cyan-400' : 'border-zinc-800'}`}>
//             <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 p-3 text-left text-sm">
//               <Mono className="text-[11px] text-zinc-500">{it.id}</Mono>
//               <span className="flex-1">{it.question}</span>
//               <ChevronDown size={14} className={open === i ? 'rotate-180' : ''} />
//             </button>
//             {open === i && (
//               <div className="space-y-3 px-3 pb-3">
//                 <div>
//                   <div className="mb-1 text-[10px] tracking-widest text-emerald-400">ANSWER</div>
//                   <p className="text-sm text-zinc-200">{it.answer}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={ask} className="mt-3 flex gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 pl-3">
//         <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about this bill"
//           className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" />
//         <button className="flex items-center gap-1 rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950"><Send size={12} /> Ask</button>
//       </form>
//     </div>
//   )
// }

// export default function Inspector({ bill, hl, setHl }) {
//   const [tab, setTab] = useState('l1')
//   const [items, setItems] = useState(bill.qa)
//   const l1 = bill.l1
//   const tabCls = (k) => `border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-cyan-400 text-zinc-100' : 'border-transparent text-zinc-500'}`

//   return (
//     <div className="flex h-full flex-col gap-4 p-5">
//       <div className="flex gap-2.5">
//         <Stat label="Total payable" value={`PKR ${fmt(l1.payable_within_due_date)}`} color="text-emerald-400" />
//         <Stat label="Due date" value={l1.due_date ?? '-'} color="text-amber-400" />
//         <Stat label="Units" value={`${l1.units_consumed} kWh`} color="text-cyan-400" />
//       </div>
//       <div className="flex items-center gap-2 text-xs text-emerald-400"><ShieldCheck size={14} /> Validated by Pydantic</div>
//       <div className="flex border-b border-zinc-800">
//         <button className={tabCls('l1')} onClick={() => setTab('l1')}>Level 1 · Extraction</button>
//         <button className={tabCls('l2')} onClick={() => setTab('l2')}>Level 2 · Copilot</button>
//       </div>
//       <div className="flex min-h-0 flex-1 flex-col overflow-auto">
//         {tab === 'l1' ? <Level1 l1={l1} hl={hl} setHl={setHl} /> : <Level2 items={items} setItems={setItems} setHl={setHl} />}
//       </div>
//     </div>
//   )
// }
'use client'
import { useState } from 'react'
import { ChevronDown, Copy, Check, Send, ShieldCheck } from 'lucide-react'
import { askBill } from '@/lib/api'

const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const label = (t) => t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
const Mono = ({ children, className = '' }) => <span className={`font-mono ${className}`}>{children}</span>

const highlight = (json) =>
  json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/("(\\.|[^\\"])*"(\s*:)?|-?\d+(?:\.\d+)?)/g, (m) => {
      const c = /^"/.test(m) ? (/:$/.test(m) ? 'text-cyan-300' : 'text-emerald-300') : 'text-amber-300'
      return `<span class="${c}">${m}</span>`
    })

function Stat({ label, value, color }) {
  return (
    <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <div className="text-[11px] text-zinc-400">{label}</div>
      <Mono className={`mt-1 block text-base ${color}`}>{value}</Mono>
    </div>
  )
}

function Section({ title, total, region, rows, hl, setHl }) {
  const [open, setOpen] = useState(true)
  return (
    <div
      onMouseEnter={() => setHl(region)}
      onMouseLeave={() => setHl(null)}
      className={`rounded-lg border bg-zinc-900 p-3 transition ${hl === region ? 'border-cyan-400' : 'border-zinc-800'}`}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm">
        <span>{title}</span>
        <span className="flex items-center gap-2">
          <Mono className="text-xs text-amber-400">{total}</Mono>
          <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-xs text-zinc-300">
          {rows.map(([k, v], i) => (
            <div key={i} className="flex justify-between"><span>{k}</span><Mono>{v}</Mono></div>
          ))}
        </div>
      )}
    </div>
  )
}

function Level1({ l1, hl, setHl }) {
  const [raw, setRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(l1, null, 2)
  const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const list = (items) => (items || []).map((x) => [label(x.type), fmt(x.amount)])
  const taxRows = l1.taxes?.length ? list(l1.taxes) : l1.total_taxes != null ? [['Combined taxes', fmt(l1.total_taxes)]] : []

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
        <span>Provider <Mono className="text-zinc-200">{l1.provider ?? '-'}</Mono></span>
        <span>Tariff <Mono className="text-zinc-200">{l1.tariff ?? '-'}</Mono></span>
        <span>Load <Mono className="text-zinc-200">{l1.sanctioned_load_kw ?? '-'} kW</Mono></span>
        <span>Month <Mono className="text-zinc-200">{l1.bill_month ?? '-'}</Mono></span>
        <span>Issued <Mono className="text-zinc-200">{l1.issue_date ?? '-'}</Mono></span>
      </div>
      <Section title="Meter readings" region="meter" total={`${l1.units_consumed ?? '-'} kWh`} hl={hl} setHl={setHl}
        rows={[['Reading date', l1.reading_date ?? '-'], ['Previous', l1.previous_reading ?? '-'], ['Current', l1.current_reading ?? '-']]} />
      <Section title="Charges" region="charges" total={`PKR ${fmt(l1.total_charges)}`} hl={hl} setHl={setHl} rows={list(l1.charges)} />
      <Section title="Taxes" region="taxes" total={`PKR ${fmt(l1.total_taxes)}`} hl={hl} setHl={setHl} rows={taxRows} />
      <Section title="Payable" region="payable" total={`PKR ${fmt(l1.payable_within_due_date)}`} hl={hl} setHl={setHl}
        rows={[['Current bill', fmt(l1.current_bill)], ['Arrears', fmt(l1.arrears)], ['Within due date', fmt(l1.payable_within_due_date)], ['After due date', fmt(l1.payable_after_due_date)]]} />
      <div className="flex items-center justify-between pt-2 text-xs text-zinc-400">
        <button onClick={() => setRaw(!raw)} className="hover:text-cyan-400">{raw ? 'Hide' : 'Show'} raw JSON</button>
        {raw && <button onClick={copy} className="flex items-center gap-1 hover:text-cyan-400">{copied ? <Check size={12} /> : <Copy size={12} />} Copy</button>}
      </div>
      {raw && (
        <pre className="overflow-auto rounded-lg border border-zinc-800 bg-black p-3 font-mono text-[11px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlight(json) }} />
      )}
    </div>
  )
}

function Level2({ bill, items, setItems, setHl }) {
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  const ask = async (e) => {
    e.preventDefault()
    const question = q.trim()
    if (!question || busy) return
    setQ('')
    setBusy(true)
    const id = `C${items.length + 1}`
    let answer
    try {
      answer = await askBill(bill, question)
    } catch (err) {
      answer = err.message
    }
    setItems((prev) => [...prev, { id, question, answer, region: null }])
    setOpen(items.length)
    setBusy(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-auto">
        {items.length === 0 && <div className="text-sm text-zinc-500">No answers yet. Ask a question below.</div>}
        {items.map((it, i) => (
          <div key={it.id} onMouseEnter={() => setHl(it.region)} onMouseLeave={() => setHl(null)}
            className={`rounded-lg border bg-zinc-900 ${open === i ? 'border-cyan-400' : 'border-zinc-800'}`}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 p-3 text-left text-sm">
              <Mono className="text-[11px] text-zinc-500">{it.id}</Mono>
              <span className="flex-1">{it.question}</span>
              <ChevronDown size={14} className={open === i ? 'rotate-180' : ''} />
            </button>
            {open === i && (
              <div className="space-y-3 px-3 pb-3">
                <div>
                  <div className="mb-1 text-[10px] tracking-widest text-emerald-400">ANSWER</div>
                  <p className="text-sm text-zinc-200">{it.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={ask} className="mt-3 flex gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 pl-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about this bill"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" />
        <button disabled={busy} className="flex items-center gap-1 rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950 disabled:opacity-60">
          <Send size={12} /> {busy ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </div>
  )
}

export default function Inspector({ bill, hl, setHl }) {
  const [tab, setTab] = useState('l1')
  const [items, setItems] = useState(bill.qa)
  const l1 = bill.l1
  const tabCls = (k) => `border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-cyan-400 text-zinc-100' : 'border-transparent text-zinc-500'}`

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex gap-2.5">
        <Stat label="Total payable" value={`PKR ${fmt(l1.payable_within_due_date)}`} color="text-emerald-400" />
        <Stat label="Due date" value={l1.due_date ?? '-'} color="text-amber-400" />
        <Stat label="Units" value={`${l1.units_consumed ?? '-'} kWh`} color="text-cyan-400" />
      </div>
      {/* <div className="flex items-center gap-2 text-xs text-emerald-400"><ShieldCheck size={14} /> Validated by Pydantic</div> */}
      <div className="flex border-b border-zinc-800">
        <button className={tabCls('l1')} onClick={() => setTab('l1')}>Level 1 · Extraction</button>
        <button className={tabCls('l2')} onClick={() => setTab('l2')}>Level 2 · Copilot</button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {tab === 'l1' ? <Level1 l1={l1} hl={hl} setHl={setHl} /> : <Level2 bill={bill} items={items} setItems={setItems} setHl={setHl} />}
      </div>
    </div>
  )
}