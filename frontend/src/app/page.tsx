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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc] selection:bg-primary/20">
      {/* Premium Light Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Forgot Password Modal */}
      {showForgotPass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl border border-white p-8 rounded-3xl w-full max-w-md relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowForgotPass(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-full"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recuperar Acesso</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Enviaremos um link de recuperação para o seu email corporativo.</p>
            </div>

            {resetStatus === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in slide-in-from-bottom-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-base font-bold text-emerald-700">Email Enviado!</p>
                <p className="text-sm text-emerald-600/60 mt-1">Verifique sua caixa de entrada em instantes.</p>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                {resetStatus === 'error' && (
                  <p className="text-xs text-red-500 text-center font-bold">Ocorreu um erro. Tente novamente ou fale com o Suporte.</p>
                )}
                <button
                  type="submit"
                  disabled={resetStatus === 'loading'}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
                >
                  {resetStatus === 'loading' ? 'PROCESSANDO...' : 'ENVIAR INSTRUÇÕES'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Login Container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 z-10 relative bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] mx-4">

        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.05)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-sm font-black text-slate-400 tracking-[0.3em] uppercase">Enterprise v1.0</span>
            </div>

            {/* Visual Branding: Eunaman Unit Photo */}
            <div className="relative w-full aspect-[5/4] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 transition-transform duration-500 hover:scale-[1.02] group/banner">
              <Image
                src="/background-photo.jpg"
                alt="Eunaman Unidade Operacional"
                fill
                className="object-cover transition-transform duration-[10s] group-hover/banner:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-primary uppercase tracking-widest shadow-lg">
                  Unidade Operacional
                </span>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 bg-white border-l border-slate-100 relative flex flex-col justify-center">
          <div className="mb-12 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-10 group">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-1000 animate-pulse" />
              <Image
                src="/logo.png"
                alt="Eunaman"
                fill
                className="object-contain drop-shadow-sm animate-logo-spin animate-logo-glow relative z-10 transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase text-center">Acesse sua conta</h2>
            <p className="text-slate-500 font-medium mt-2 text-center">Bem-vindo(a) de volta ao Hub Eunaman.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
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
                  <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="usuario@eunaman.com"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
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
                <div className="w-5 h-5 border-2 border-slate-200 rounded-md mr-3 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-700 transition-colors">Lembrar-me</span>
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
              className="w-full relative group/btn overflow-hidden rounded-2xl bg-primary py-4 px-6 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm">
                {loading ? 'Aguarde...' : 'ENTRAR NO SISTEMA'}
              </span>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SSL Cryptography
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
              <Shield className="w-3 h-3 text-primary" />
              Threat Detection
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none opacity-40">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.5em] font-black">EUNAMAN CORP — OPERATIONAL EXCELLENCE</p>
      </div>

      <style jsx global>{`
        body {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  )
}
