'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    onSelect: (value: string) => void
    placeholder?: string
    name?: string
    required?: boolean
    className?: string
    defaultValue?: string
}

export function SearchableSelect({
    options,
    onSelect,
    placeholder = 'Selecione uma opção',
    name,
    required,
    className,
    defaultValue = ''
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedValue, setSelectedValue] = useState(defaultValue)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = useMemo(() =>
        options.find(opt => opt.value === selectedValue),
        [options, selectedValue]
    )

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options
        const term = searchTerm.toLowerCase()
        return options.filter(opt =>
            opt.label.toLowerCase().includes(term)
        )
    }, [options, searchTerm])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (value: string) => {
        setSelectedValue(value)
        onSelect(value)
        setIsOpen(false)
        setSearchTerm('')
    }

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedValue('')
        onSelect('')
        setIsOpen(false)
    }

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={selectedValue} required={required} />

            {/* Select Button */}
            <div
                className={cn(
                    "w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold flex items-center justify-between cursor-pointer transition-all hover:bg-surface-highlight",
                    isOpen && "ring-2 ring-primary border-primary",
                    !selectedValue && "text-gray-400"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {selectedValue && (
                        <X
                            className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors"
                            onClick={clearSelection}
                        />
                    )}
                    <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border-color rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="p-3 border-b border-border-color bg-surface-highlight/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Digitar para buscar..."
                                className="w-full bg-background border border-border-color rounded-lg pl-9 pr-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setIsOpen(false)
                                }}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-200">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "px-4 py-3 text-sm font-bold cursor-pointer transition-all flex items-center justify-between group",
                                        selectedValue === option.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-highlight"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className="flex-1">{option.label}</span>
                                    {selectedValue === option.value && <Check className="w-4 h-4 text-primary shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhum resultado encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
