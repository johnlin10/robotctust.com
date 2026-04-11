'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AsideContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleAside: () => void
}

const AsideContext = createContext<AsideContextType | undefined>(undefined)

export const AsideProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleAside = () => setIsOpen((prev) => !prev)

  return (
    <AsideContext.Provider value={{ isOpen, setIsOpen, toggleAside }}>
      {children}
    </AsideContext.Provider>
  )
}

export const useAside = () => {
  const context = useContext(AsideContext)
  if (context === undefined) {
    throw new Error('useAside must be used within an AsideProvider')
  }
  return context
}
