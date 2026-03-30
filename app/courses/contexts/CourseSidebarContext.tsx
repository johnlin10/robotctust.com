'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CourseSidebarContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
}

const CourseSidebarContext = createContext<CourseSidebarContextType | undefined>(undefined)

export const CourseSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen((prev) => !prev)

  return (
    <CourseSidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </CourseSidebarContext.Provider>
  )
}

export const useCourseSidebar = () => {
  const context = useContext(CourseSidebarContext)
  if (context === undefined) {
    throw new Error('useCourseSidebar must be used within a CourseSidebarProvider')
  }
  return context
}
