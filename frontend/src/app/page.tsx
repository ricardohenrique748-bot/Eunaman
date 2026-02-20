'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, AlertCircle, Shield } from 'lucide-react'
import Image from 'next/image'
import LogoAnimation from '@/components/ui/LogoAnimation'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white selection:bg-primary/20">
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

      {/* Change Password Modal */}
      {showChangePass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl border border-white p-8 rounded-3xl w-full max-w-md relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => {
                setShowChangePass(false)
                setEmailForChange(null)
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-full"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Definir Nova Senha</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Por segurança, você precisa criar uma nova senha para sua conta.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <input type="hidden" name="email" value={emailForChange || ''} />

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Nova Senha</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="Sua nova senha segura"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center font-bold">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
              >
                {loading ? 'PROCESSANDO...' : 'CRIAR SENHA E ACESSAR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Login Container */}
      <div className="w-full min-h-screen z-10 relative flex flex-col items-center justify-center px-4 py-12">

        <div className="w-full max-w-2xl flex flex-col items-center justify-center">

          <div className="mb-10 flex flex-col items-center w-full">
            <div className="relative w-full max-w-[500px] aspect-[16/7] pr-6 mb-2">
              <LogoAnimation fill className="relative z-10 transition-transform duration-1000 hover:scale-105 scale-125 origin-center" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase text-center mt-2">Acesse sua conta</h2>
            <p className="text-slate-500 font-medium mt-1 text-center text-sm">Bem-vindo(a) de volta à Eunaman.</p>
          </div>

          <div className="w-full max-w-[360px]">

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 font-bold" />
                </div>
                <span className="font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group/input">
                  <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="usuario@eunaman.com"
                    required
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold shadow-sm"
                  />
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center group cursor-pointer">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="hidden peer"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-md mr-3 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-800 transition-colors">Lembrar-me</span>
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
                className="w-full relative group/btn overflow-hidden rounded-2xl bg-primary py-4 px-6 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_30px_rgb(22,163,74,0.3)] ring-offset-2 focus:ring-4 focus:ring-primary/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm">
                  {loading ? 'AGUARDE...' : 'ENTRAR NO SISTEMA'}
                </span>
              </button>

              {/* Security Info moved below button */}
              <div className="pt-4 flex items-center justify-center gap-6 opacity-30 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-900 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                  SSL Secured
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-900 uppercase tracking-widest">
                  <Shield className="w-3 h-3 text-primary" />
                  Safe Login
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>



      <style jsx global>{`
        body {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  )
}
