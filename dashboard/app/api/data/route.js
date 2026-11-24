import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

export const dynamic = 'force-dynamic'

const read = (f) =>
  Papa.parse(fs.readFileSync(path.join(process.cwd(), 'data', f), 'utf8'), { header: true, skipEmptyLines: true }).data

export function GET() {
  try {
    const l1 = read('level1.csv')
    const l2 = read('level2.csv')
    const bills = l1
      .map((r) => {
        let data = null
        try { data = JSON.parse(r.json) } catch {}
        if (!data) return null
        const file = ['png', 'jpg', 'jpeg']
          .map((e) => `${r.bill_id}.${e}`)
          .find((f) => fs.existsSync(path.join(process.cwd(), 'public', 'bills', f)))
        return {
          id: r.bill_id,
          image: file ? `/bills/${file}` : null,
          l1: data,
          qa: l2
            .filter((q) => q.bill_id === r.bill_id)
            .map((q) => ({ id: q.question_id, question: q.question, answer: q.answer })),
        }
      })
      .filter(Boolean)
    return Response.json({ bills })
  } catch (e) {
    return Response.json({ error: 'Could not read data/level1.csv and data/level2.csv: ' + e.message }, { status: 500 })
  }
}