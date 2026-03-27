'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Filters {
  status: string
  unidadeId: string
  searchQuery: string
}

interface UserContextType {
  filters: Filters
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void
}

const defaultFilters: Filters = {
  status: 'TODAS',
  unidadeId: '',
  searchQuery: ''
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<Filters>(defaultFilters)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('eunaman-filters')
    if (saved) {
      try {
        setFiltersState(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse filters', e)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('eunaman-filters', JSON.stringify(filters))
  }, [filters])

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFiltersState(defaultFilters)
  }

  return (
    <UserContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
