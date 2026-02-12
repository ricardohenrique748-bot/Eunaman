'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, AlertCircle } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Minimalist Glow - Only Green */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Forgot Password Modal */}
      {showForgotPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-border-color p-8 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setShowForgotPass(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Recuperar Senha</h3>
              <p className="text-xs text-gray-500 mt-1">Informe seu email corporativo para receber as instruções.</p>
            </div>

            {resetStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">Solicitação enviada!</p>
                <p className="text-xs text-emerald-400 mt-1">Verifique seu email ou contate o administrador.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPass} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="seu.email@eunaman.com.br"
                    className="w-full bg-surface-highlight border border-border-color rounded-lg p-3 text-foreground focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                {resetStatus === 'error' && (
                  <p className="text-xs text-red-500 text-center">Erro ao enviar solicitação. Tente novamente.</p>
                )}
                <button
                  type="submit"
                  disabled={resetStatus === 'loading'}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {resetStatus === 'loading' ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-border-color p-8 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Alteração de Senha Obrigatória</h3>
              <p className="text-xs text-gray-500 mt-1">Por segurança, defina uma nova senha para continuar.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="hidden" name="email" value={emailForChange || ''} />
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Nova Senha</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-surface-highlight border border-border-color rounded-lg p-3 text-foreground focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'ATUALIZANDO...' : 'ATUALIZAR SENHA'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm p-8 z-10 relative">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-32 h-32 mb-6 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors duration-1000 animate-pulse" />
            <Image
              src="/logo.png"
              alt="Eunaman"
              fill
              className="object-contain drop-shadow-2xl animate-logo-spin animate-logo-glow relative z-10 transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          {/* Removed Text Title - Logo speaks for itself in minimalist design */}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Email Corporativo</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="usuario@eunaman.com"
                required
                className="w-full bg-surface-highlight border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full bg-surface-highlight border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700 transition-colors">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPass(true)}
                className="text-xs font-medium text-primary hover:text-orange-600 transition-colors outline-none"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-dashed border-gray-700 pt-6">
          <div className="flex justify-center space-x-4 text-gray-600">
            <span className="text-xs flex items-center gap-1">🔒 SSL Secure</span>
            <span className="text-xs flex items-center gap-1">🛡️ Protected</span>
          </div>
          <p className="text-[10px] text-gray-700 mt-4 uppercase tracking-widest">v1.0.0 • Eunaman Corp</p>
        </div>
      </div>
    </div>
  )
}
