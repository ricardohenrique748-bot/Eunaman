'use client'

import { Search, Filter, Calendar, X, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import SearchInput from '@/app/dashboard/pcm/os/SearchInput'

export default function OsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get current values from URL
    const currentStatus = searchParams.get('status') || ''
    const currentTipo = searchParams.get('tipo') || ''
    const searchQuery = searchParams.get('q') || ''

    const updateFilters = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        
        router.push(`/dashboard/pcm/os?${params.toString()}`)
        router.refresh()
    }, [router, searchParams])

    const clearFilters = () => {
        router.push('/dashboard/pcm/os')
        router.refresh()
    }

    const hasFilters = currentStatus || currentTipo || searchQuery

    return (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full p-2">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
                <SearchInput defaultValue={searchQuery} />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide no-scrollbar">
                {/* Status Selector */}
                <select 
                    value={currentStatus}
                    onChange={(e) => updateFilters({ status: e.target.value })}
                    className="bg-surface border border-border-color rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:border-primary/30 transition-all outline-none cursor-pointer appearance-none min-w-[140px]"
                >
                    <option value="">Todos Status</option>
                    <option value="ABERTA">Aberta</option>
                    <option value="PLANEJADA">Planejada</option>
                    <option value="EM_EXECUCAO">Em Execução</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>

                {/* Type Selector */}
                <select 
                    value={currentTipo}
                    onChange={(e) => updateFilters({ tipo: e.target.value })}
                    className="bg-surface border border-border-color rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:border-primary/30 transition-all outline-none cursor-pointer appearance-none min-w-[160px]"
                >
                    <option value="">Todos Tipos</option>
                    <option value="PREVENTIVA">Preventiva</option>
                    <option value="CORRETIVA">Corretiva</option>
                    <option value="INSPECAO">Inspeção</option>
                    <option value="MELHORIA">Melhoria</option>
                </select>

                {/* Clear Filters Button */}
                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    >
                        <X className="w-3.5 h-3.5" />
                        Limpar Filtros
                    </button>
                )}
            </div>
        </div>
    )
}
