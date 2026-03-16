'use client'

import Link from 'next/link'
import { LogOut, LayoutDashboard, Truck, Wrench } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Suspense } from 'react'
import LogoAnimation from '@/components/ui/LogoAnimation'

export default function ChecklistAppShell({ children, user }: { children: React.ReactNode, user: any }) {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><LogoAnimation fill className="scale-150" /></div>}>
            <ChecklistAppShellContent user={user}>
                {children}
            </ChecklistAppShellContent>
        </Suspense>
    )
}

function ChecklistAppShellContent({ children, user }: { children: React.ReactNode, user: any }) {
    const pathname = usePathname()
    const isOperacional = user?.perfil === 'OPERACIONAL'

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar - HIDDEN on mobile, visible on tablet/desktop */}
            <aside className="hidden lg:flex w-64 bg-surface border-r border-border-color flex-col z-20 shadow-2xl">
                <div className="h-28 flex items-center px-4 border-b border-border-color/50 justify-center">
                    <div className="relative w-48 h-16 flex items-center justify-center mix-blend-multiply">
                        <LogoAnimation fill className="scale-[1.8]" />
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    <NavItem
                        href="/checklist-app"
                        icon={LayoutDashboard}
                        label="Meu Histórico"
                        active={pathname === '/checklist-app'}
                    />
                    <NavItem
                        href="/checklist-app/novo"
                        icon={Wrench}
                        label="Novo Checklist"
                        active={pathname?.startsWith('/checklist-app/novo') || pathname?.startsWith('/checklist-app/preencher')}
                    />

                    {!isOperacional && (
                        <div className="pt-4 mt-4 border-t border-border-color/50">
                            <NavItem
                                href="/dashboard"
                                icon={Truck}
                                label="Voltar ao Painel"
                                active={false}
                            />
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-border-color">
                    <Link href="/" className="flex items-center w-full px-4 py-3 text-[11px] font-black text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group uppercase tracking-widest">
                        <LogOut className="w-4 h-4 mr-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        Sair
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header / Top Bar */}
                <header className="h-14 bg-background/80 backdrop-blur-md border-b border-border-color flex items-center justify-between px-4 z-30 sticky top-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Wrench className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/80">Checklist v1.0</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-[10px] shadow-lg shadow-primary/20">
                                {user?.nome?.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 relative scroll-smooth custom-scrollbar pb-24 lg:pb-8">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Nav - Float bar style */}
                <div className="lg:hidden absolute bottom-4 left-4 right-4 z-40">
                    <nav className="h-16 bg-surface/90 backdrop-blur-lg border border-border-color/50 rounded-2xl shadow-2xl flex items-center justify-around px-2">
                        <Link
                            href="/checklist-app"
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-xl transition-all ${pathname === '/checklist-app' ? 'text-primary bg-primary/5' : 'text-gray-400'}`}
                        >
                            <LayoutDashboard className={`w-5 h-5 ${pathname === '/checklist-app' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Histórico</span>
                        </Link>

                        <div className="w-px h-8 bg-border-color/30" />

                        <Link
                            href="/checklist-app/novo"
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-xl transition-all ${pathname?.includes('/novo') || pathname?.includes('/preencher') ? 'text-primary bg-primary/5' : 'text-gray-400'}`}
                        >
                            <Wrench className={`w-5 h-5 ${pathname?.includes('/novo') || pathname?.includes('/preencher') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Iniciar</span>
                        </Link>

                        <div className="w-px h-8 bg-border-color/30" />

                        <Link
                            href="/"
                            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-400"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Sair</span>
                        </Link>
                    </nav>
                </div>
            </main>
        </div>
    )
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link href={href} className={`flex items-center px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all group ${active ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}>
            <Icon className={`w-4 h-4 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
            {label}
        </Link>
    )
}
