'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (value !== defaultValue) {
                const params = new URLSearchParams(searchParams.toString())
                if (value) {
                    params.set('q', value)
                } else {
                    params.delete('q')
                }
                router.push(`/dashboard/pcm/os?${params.toString()}`)
            }
        }, 500) // Debounce 500ms

        return () => clearTimeout(timer)
    }, [value, defaultValue, router, searchParams])

    return (
        <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Buscar placa, TAG ou problema..."
                className="w-full bg-surface border border-border-color rounded-2xl pl-12 pr-4 py-3.5 text-xs font-black text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-tighter"
            />
        </div>
    )
}
