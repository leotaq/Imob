import { useMemo, useState } from 'react'
import supabase from '@/lib/supabase'

type TestResult = { ok: boolean; data?: any; error?: string }

export default function Diagnostics() {
  const [apiHealth, setApiHealth] = useState<TestResult | null>(null)
  const [dbHealth, setDbHealth] = useState<TestResult | null>(null)
  const [sbAuth, setSbAuth] = useState<TestResult | null>(null)
  const [sbStorage, setSbStorage] = useState<TestResult | null>(null)

  const env = useMemo(() => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL
    const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    const mask = (v?: string) => (v ? `${v.slice(0, 6)}...${v.slice(-4)}` : 'NOT_SET')
    return {
      VITE_SUPABASE_URL: url || 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: mask(anon),
    }
  }, [])

  async function runApiHealth() {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const data = await res.json()
      setApiHealth({ ok: res.ok, data, error: res.ok ? undefined : JSON.stringify(data) })
    } catch (e: any) {
      setApiHealth({ ok: false, error: e.message })
    }
  }

  async function runDbHealth() {
    try {
      const res = await fetch('/api/db-health', { cache: 'no-store' })
      const data = await res.json()
      setDbHealth({ ok: res.ok, data, error: res.ok ? undefined : JSON.stringify(data) })
    } catch (e: any) {
      setDbHealth({ ok: false, error: e.message })
    }
  }

  async function runSupabaseAuth() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) return setSbAuth({ ok: false, error: error.message })
      setSbAuth({ ok: true, data })
    } catch (e: any) {
      setSbAuth({ ok: false, error: e.message })
    }
  }

  async function runSupabaseStorage() {
    try {
      const { data, error } = await (supabase as any).storage.listBuckets()
      if (error) return setSbStorage({ ok: false, error: error.message })
      setSbStorage({ ok: true, data })
    } catch (e: any) {
      setSbStorage({ ok: false, error: e.message })
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Diagnostics</h1>
      <p style={{ color: '#555', marginBottom: 16 }}>Use esta página para validar o deploy na Vercel e a conexão com o Supabase.</p>

      <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Env (Frontend)</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>VITE_SUPABASE_URL</b>: {env.VITE_SUPABASE_URL}</li>
          <li><b>VITE_SUPABASE_ANON_KEY</b>: {env.VITE_SUPABASE_ANON_KEY}</li>
        </ul>
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>API da Vercel</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button onClick={runApiHealth}>Testar /api/health</button>
          <button onClick={runDbHealth}>Testar /api/db-health</button>
        </div>
        {apiHealth && (
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            /api/health: {apiHealth.ok ? 'OK' : 'FAIL'}\n{JSON.stringify(apiHealth.data || { error: apiHealth.error }, null, 2)}
          </pre>
        )}
        {dbHealth && (
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            /api/db-health: {dbHealth.ok ? 'OK' : 'FAIL'}\n{JSON.stringify(dbHealth.data || { error: dbHealth.error }, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Supabase (Frontend)</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button onClick={runSupabaseAuth}>Testar auth.getSession()</button>
          <button onClick={runSupabaseStorage}>Testar storage.listBuckets()</button>
        </div>
        {sbAuth && (
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            auth.getSession: {sbAuth.ok ? 'OK' : 'FAIL'}\n{JSON.stringify(sbAuth.data || { error: sbAuth.error }, null, 2)}
          </pre>
        )}
        {sbStorage && (
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            storage.listBuckets: {sbStorage.ok ? 'OK' : 'FAIL'}\n{JSON.stringify(sbStorage.data || { error: sbStorage.error }, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
