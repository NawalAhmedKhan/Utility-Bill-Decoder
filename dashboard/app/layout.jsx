import './globals.css'

export const metadata = { title: 'BillLens | WTQ Bill Intelligence' }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-200 antialiased">{children}</body>
    </html>
  )
}