const API = 'http://localhost:8000'
const DOWN = 'Cannot reach the backend. Start it: cd source, then uvicorn api:app --port 8000'

async function post(path, fd) {
  let r
  try {
    r = await fetch(`${API}${path}`, { method: 'POST', body: fd })
  } catch {
    throw new Error(DOWN)
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.detail || 'Request failed')
  }
  return r.json()
}

export async function extractBill(file) {
  const fd = new FormData()
  fd.append('file', file)
  return post('/extract', fd)
}

export async function askBill(bill, question) {
  let blob = bill.file
  if (!blob) {
    if (!bill.image) throw new Error('No image for this bill in public/bills')
    blob = await (await fetch(bill.image)).blob()
  }
  const fd = new FormData()
  fd.append('file', blob, 'bill.png')
  fd.append('question', question)
  fd.append('ref', JSON.stringify(bill.l1))
  return (await post('/ask', fd)).answer
}