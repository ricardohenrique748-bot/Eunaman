'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, AlertCircle, Shield } from 'lucide-react'
import Image from 'next/image'
import { login } from '@/app/actions/auth-actions'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForgotPass, setShowForgotPass] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [showChangePass, setShowChangePass] = useState(false)
  const [emailForChange, setEmailForChange] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // @ts-ignore
    const res = await login(formData)

    if (res.success) {
      router.push('/dashboard')
    } else if (res.mustChangePassword) {
      setEmailForChange(res.email)
      setShowChangePass(true)
      setLoading(false)
    } else {
      setError(res.error || 'Erro ao entrar')
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const { updatePassword } = await import('@/app/actions/auth-actions')

    // @ts-ignore
    const res = await updatePassword(formData)

    if (res.success) {
      setLoading(false)
      setShowChangePass(false)
      router.push('/dashboard')
    } else {
      setError(res.error || 'Erro ao atualizar senha')
      setLoading(false)
    }
  }

  const handleForgotPass = async (e: React.FormEvent) => {

    e.preventDefault()
    setResetStatus('loading')

    // Import dynamically to avoid circular dependencies if any, or just use the imported one
    const { requestPasswordReset } = await import('@/app/actions/auth-actions')

    const res = await requestPasswordReset(resetEmail)

    if (res.success) {
      setResetStatus('success')
      setTimeout(() => {
        setShowForgotPass(false)
        setResetStatus('idle')
        setResetEmail('')
      }, 3000)
    } else {
      setResetStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0b1121] selection:bg-primary/30">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Forgot Password Modal */}
      {showForgotPass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#151e32]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-full max-w-md relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowForgotPass(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-lg shadow-primary/20">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Recuperar Acesso</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium">Enviaremos um link de recuperação para o seu email corporativo.</p>
            </div>

            {resetStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in slide-in-from-bottom-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-base font-bold text-emerald-500">Email Enviado!</p>
                <p className="text-sm text-emerald-500/60 mt-1">Verifique sua caixa de entrada em instantes.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPass} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="seu.email@eunaman.com.br"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                {resetStatus === 'error' && (
                  <p className="text-xs text-red-500 text-center font-bold">Ocorreu um erro. Tente novamente ou fale com o Suporte.</p>
                )}
                <button
                  type="submit"
                  disabled={resetStatus === 'loading'}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-primary/20 uppercase tracking-widest text-sm"
                >
                  {resetStatus === 'loading' ? 'PROCESSANDO...' : 'ENVIAR INSTRUÇÕES'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Login Container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 z-10 relative bg-[#151e32]/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] mx-4">

        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-sm font-black text-white tracking-[0.3em] uppercase opacity-50">Enterprise v1.0</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
              Gestão Inteligente<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Para Ativos de Alta Performance</span>
            </h1>
            <p className="text-lg text-gray-400 font-medium max-w-sm">
              Potencialize sua operação com a plataforma centralizada da Eunaman. Controle total em tempo real.
            </p>
          </div>

          <div className="relative z-10 flex gap-4">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex-1">
              <span className="text-2xl font-black text-white block">99.9%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Uptime Operacional</span>
            </div>
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex-1">
              <span className="text-2xl font-black text-white block">+2.4k</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black inline-flex items-center gap-1">
                Ativos Monitorados
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 bg-[#0b1121]/80 border-l border-white/5 relative flex flex-col justify-center">
          <div className="mb-12 flex flex-col items-center lg:items-start">
            <div className="relative w-24 h-24 mb-10 group">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-3xl group-hover:bg-primary/60 transition-colors duration-1000 animate-pulse" />
              <Image
                src="/logo.png"
                alt="Eunaman"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-logo-spin animate-logo-glow relative z-10 transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase lg:text-left text-center">Acesse sua conta</h2>
            <p className="text-gray-500 font-medium mt-2">Bem-vindo(a) de volta ao Hub Eunaman.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 font-bold" />
              </div>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Credenciais de Acesso</label>
              <div className="space-y-4">
                <div className="relative group/input">
                  <User className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="usuario@eunaman.com"
                    required
                    className="w-full bg-[#151e32] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#151e32] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
              <label className="flex items-center group cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="hidden peer"
                />
                <div className="w-5 h-5 border-2 border-white/10 rounded-md mr-3 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">Lembrar-me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPass(true)}
                className="text-xs font-black text-primary hover:text-primary/80 transition-colors outline-none uppercase tracking-widest"
              >
                Esqueci a Senha
              </button>
            </div>

            <button
              disabled={loading}
              className="w-full relative group/btn overflow-hidden rounded-2xl bg-primary py-4 px-6 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Aguarde...
                  </>
                ) : 'ENTRAR NO SISTEMA'}
              </span>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SSL Cryptography
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
              <Shield className="w-3 h-3 text-primary" />
              Threat Detection
            </div>
          </div>
        </div>
      </div>

      {/* Background Orbs Group (Optional refined footer) */}
      <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none opacity-20">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em] font-black">EUNAMAN CORP © 2026 — OPERATIONAL EXCELLENCE</p>
      </div>

      <style jsx global>{`
        body {
          background-color: #0b1121;
        }
      `}</style>
    </div>
  )
}
