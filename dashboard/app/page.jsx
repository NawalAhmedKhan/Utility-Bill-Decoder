// 'use client'
// import { useEffect, useState } from 'react'
// import BillViewer from '@/components/BillViewer'
// import Inspector from '@/components/Inspector'

// export default function Page() {
//   const [bills, setBills] = useState(null)
//   const [err, setErr] = useState(null)
//   const [billId, setBillId] = useState(null)
//   const [hl, setHl] = useState(null) // active region key, shared by canvas and sidebar

//   useEffect(() => {
//     fetch('/api/data')
//       .then((r) => r.json())
//       .then((d) => {
//         if (d.error) throw new Error(d.error)
//         setBills(d.bills)
//         setBillId(d.bills[0]?.id)
//       })
//       .catch((e) => setErr(e.message))
//   }, [])

//   if (err) return <div className="grid h-screen place-items-center p-8 text-center text-sm text-red-400">{err}</div>
//   if (!bills) return <div className="grid h-screen place-items-center text-sm text-zinc-500">Loading...</div>
//   const bill = bills.find((b) => b.id === billId)
//   if (!bill) return <div className="grid h-screen place-items-center text-sm text-zinc-500">No bills found in data/level1.csv</div>

//   return (
//     <div className="flex h-screen flex-col">
//       <header className="flex h-14 items-center gap-5 border-b border-zinc-800 px-5">
//         <div className="font-semibold"><span className="text-cyan-400">Bill</span>Lens</div>
//         <div className="flex gap-1.5 overflow-auto">
//           {bills.map((b) => (
//             <button
//               key={b.id}
//               onClick={() => { setBillId(b.id); setHl(null) }}
//               className={`rounded-md border px-2.5 py-1.5 font-mono text-xs ${
//                 b.id === billId ? 'border-cyan-400 bg-cyan-950 text-cyan-300' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
//               }`}
//             >
//               {b.id}
//             </button>
//           ))}
//         </div>
//       </header>
//       <main className="flex min-h-0 flex-1">
//         <section className="w-[60%]"><BillViewer key={bill.id} bill={bill} hl={hl} /></section>
//         <aside className="w-[40%] border-l border-zinc-800 bg-zinc-950"><Inspector key={bill.id} bill={bill} hl={hl} setHl={setHl} /></aside>
//       </main>
//     </div>
//   )
// }
'use client'
import { useEffect, useState } from 'react'
import BillViewer from '@/components/BillViewer'
import Inspector from '@/components/Inspector'
import { extractBill } from '@/lib/api'

export default function Page() {
  const [bills, setBills] = useState(null)
  const [loadErr, setLoadErr] = useState(null)
  const [billId, setBillId] = useState(null)
  const [hl, setHl] = useState(null) // active region key, shared by canvas and sidebar
  const [busy, setBusy] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setBills(d.bills)
        setBillId(d.bills[0]?.id)
      })
      .catch((e) => { setLoadErr(e.message); setBills([]) })
  }, [])

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setUploadErr(null)
    try {
      const l1 = await extractBill(file)
      const id = `UPLOAD_${file.name.replace(/\.[^.]+$/, '')}`
      setBills((b) => [...b.filter((x) => x.id !== id), { id, image: URL.createObjectURL(file), file, l1, qa: [] }])
      setBillId(id)
      setHl(null)
    } catch (err) {
      setUploadErr(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!bills) return <div className="grid h-screen place-items-center text-sm text-zinc-500">Loading...</div>
  const bill = bills.find((b) => b.id === billId)

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-5 border-b border-zinc-800 px-5">
        <div className="font-semibold"><span className="text-cyan-400">Bill</span>Lens</div>
        <div className="flex flex-1 gap-1.5 overflow-auto">
          {bills.map((b) => (
            <button
              key={b.id}
              onClick={() => { setBillId(b.id); setHl(null) }}
              className={`whitespace-nowrap rounded-md border px-2.5 py-1.5 font-mono text-xs ${
                b.id === billId ? 'border-cyan-400 bg-cyan-950 text-cyan-300' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {b.id}
            </button>
          ))}
        </div>
        <label className={`whitespace-nowrap rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 ${busy ? 'opacity-60' : 'cursor-pointer'}`}>
          {busy ? 'Reading bill...' : 'Upload bill'}
          <input type="file" accept="image/png,image/jpeg" className="hidden" disabled={busy} onChange={onUpload} />
        </label>
      </header>
      {uploadErr && <div className="bg-red-950 px-5 py-2 text-xs text-red-300">{uploadErr}</div>}
      {bill ? (
        <main className="flex min-h-0 flex-1">
          <section className="w-[60%]"><BillViewer key={bill.id} bill={bill} hl={hl} /></section>
          <aside className="w-[40%] border-l border-zinc-800 bg-zinc-950"><Inspector key={bill.id} bill={bill} hl={hl} setHl={setHl} /></aside>
        </main>
      ) : (
        <div className="grid flex-1 place-items-center p-8 text-center text-sm text-zinc-500">
          {loadErr || 'No bills yet. Click Upload bill.'}
        </div>
      )}
    </div>
  )
}