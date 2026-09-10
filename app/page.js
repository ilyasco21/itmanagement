'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ITSupportLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [kategori, setKategori] = useState('Hardware')
  const [namaPerangkat, setNamaPerangkat] = useState('')
  const [deskripsiTrouble, setDeskripsiTrouble] = useState('')
  const [langkahPenanganan, setLangkahPenanganan] = useState('')
  const [status, setStatus] = useState('Done')
  const [namaTeknisi, setNamaTeknisi] = useState('')

  const listKategori = ['Hardware', 'Software', 'Jaringan', 'Printer/CCTV', 'Lain-lain']

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('it_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setLogs(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!namaPerangkat || !deskripsiTrouble) {
      return alert('Nama Perangkat dan Deskripsi Trouble wajib diisi!')
    }

    const { error } = await supabase.from('it_logs').insert([
      {
        tanggal,
        kategori,
        nama_perangkat: namaPerangkat,
        deskripsi_trouble: deskripsiTrouble,
        langkah_penanganan: langkahPenanganan,
        status,
        nama_teknisi: namaTeknisi || 'IT Support',
      },
    ])

    if (error) {
      alert('Gagal menyimpan log: ' + error.message)
    } else {
      alert('Log pekerjaan berhasil disimpan!')
      setNamaPerangkat('')
      setDeskripsiTrouble('')
      setLangkahPenanganan('')
      fetchLogs()
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus log pekerjaan ini?')) return
    const { error } = await supabase.from('it_logs').delete().eq('id', id)
    if (!error) fetchLogs()
  }

  // Export CSV / Excel
  function exportToCSV() {
    if (filteredLogs.length === 0) return alert('Tidak ada data untuk diekspor!')

    const headers = ['Tanggal', 'Teknisi', 'Kategori', 'Perangkat', 'Trouble', 'Penanganan', 'Status']
    const csvRows = [headers.join(',')]

    filteredLogs.forEach((item) => {
      const row = [
        `"${item.tanggal}"`,
        `"${item.nama_teknisi || '-'}"`,
        `"${item.kategori}"`,
        `"${(item.nama_perangkat || '').replace(/"/g, '""')}"`,
        `"${(item.deskripsi_trouble || '').replace(/"/g, '""')}"`,
        `"${(item.langkah_penanganan || '').replace(/"/g, '""')}"`,
        `"${item.status}"`,
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `IT_Support_Log_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredLogs = logs.filter((item) => {
    const matchSearch =
      item.nama_perangkat?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi_trouble?.toLowerCase().includes(search.toLowerCase()) ||
      item.langkah_penanganan?.toLowerCase().includes(search.toLowerCase()) ||
      item.nama_teknisi?.toLowerCase().includes(search.toLowerCase())

    const matchKat = filterKategori === 'Semua' || item.kategori === filterKategori
    const matchStat = filterStatus === 'Semua' || item.status === filterStatus

    return matchSearch && matchKat && matchStat
  })

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Dashboard */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>💻 IT Support Log & Rekap Kerja</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Catatan Penanganan Trouble Hardware, Software, & Network</p>
        </div>
        <button onClick={exportToCSV} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
          📊 Export CSV / Excel
        </button>
      </div>

      {/* Form Input Log Baru */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>📝 Input Jobdesk / Trouble Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>TANGGAL</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>KATEGORI</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
              {listKategori.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>NAMA PERANGKAT / USER</label>
            <input type="text" placeholder="misal: PC Kasir / Router Utama" value={namaPerangkat} onChange={(e) => setNamaPerangkat(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>TEKNISI / PENANGGUNG JAWAB</label>
            <input type="text" placeholder="Nama Teknisi IT" value={namaTeknisi} onChange={(e) => setNamaTeknisi(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>DESKRIPSI TROUBLE</label>
            <input type="text" placeholder="Detail kendala yang terjadi..." value={deskripsiTrouble} onChange={(e) => setDeskripsiTrouble(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>LANGKAH PENANGANAN / SOLUSI</label>
            <input type="text" placeholder="Langkah perbaikan yang dilakukan..." value={langkahPenanganan} onChange={(e) => setLangkahPenanganan(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>STATUS</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
              <option value="Done">Done (Selesai)</option>
              <option value="Pending">Pending (Proses)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              + Simpan Log
            </button>
          </div>

        </form>
      </div>

      {/* Bar Filter & Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Cari perangkat, trouble, solusi, teknisi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <option value="Semua">Semua Kategori</option>
          {listKategori.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <option value="Semua">Semua Status</option>
          <option value="Done">Done</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Tabel Data Log */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Memuat data log...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Tgl</th>
              <th style={{ padding: '10px' }}>Kategori</th>
              <th style={{ padding: '10px' }}>Perangkat</th>
              <th style={{ padding: '10px' }}>Deskripsi Trouble</th>
              <th style={{ padding: '10px' }}>Langkah Penanganan</th>
              <th style={{ padding: '10px' }}>Teknisi</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  Tidak ada catatan log pekerjaan.
                </td>
              </tr>
            ) : (
              filteredLogs.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', color: '#64748b', fontSize: '12px' }}>{item.tanggal}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>
                      {item.kategori}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#0f172a' }}>{item.nama_perangkat}</td>
                  <td style={{ padding: '10px', color: '#334155' }}>{item.deskripsi_trouble}</td>
                  <td style={{ padding: '10px', color: '#64748b', fontSize: '13px' }}>{item.langkah_penanganan || '-'}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb' }}>{item.nama_teknisi || '-'}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ background: item.status === 'Done' ? '#dcfce7' : '#fef9c3', color: item.status === 'Done' ? '#166534' : '#854d0e', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(item.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

    </div>
  )
}
