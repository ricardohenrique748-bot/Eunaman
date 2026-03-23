'use client'

import { Plus, Wrench } from 'lucide-react'
import Link from 'next/link'
import OsTable from './OsTable'
import OsFilters from './OsFilters'
import OsStatsCards from './OsStatsCards'

interface PCMOrdersContentProps {
    ordens: any[]
    searchParams: any
}

export default function PCMOrdersContent({ ordens, searchParams }: PCMOrdersContentProps) {
    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 transition-transform duration-500 hover:rotate-12">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col text-left">
                            <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                                PCM
                                <span className="text-primary ml-1">.</span>
                            </h1>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 opacity-70">Ordens de Serviço</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Link href="/dashboard/pcm/os/nova">
                        <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-all transform hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-primary/20">
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                            Abrir Nova O.S.
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Section */}
            <OsStatsCards ordens={ordens} />

            {/* Main Content Area */}
            <div className="flex flex-col gap-8">
                {/* Advanced Search & Filtering Area */}
                <div className="bg-surface/50 border border-border-color rounded-[40px] p-2 shadow-sm backdrop-blur-3xl">
                    <OsFilters />
                </div>

                {/* Table Section */}
                <OsTable ordens={ordens} />
            </div>
        </div>
    )
}
