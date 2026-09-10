export const metadata = {
  title: 'IT Support Log & Rekap Kerja',
  description: 'Dashboard Rekapitulasi Catatan Pekerjaan IT Support',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#0f172a', fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
