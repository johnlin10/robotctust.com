'use client'

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react'
import FloatingActionBar, { ActionItem } from '@/app/components/FloatingActionBar/FloatingActionBar'

export type FabAction = ActionItem & { id: string; priority: number }

interface CourseMobileFabContextType {
  registerAction: (action: FabAction) => void
  unregisterAction: (id: string) => void
}

const CourseMobileFabContext = createContext<CourseMobileFabContextType | undefined>(undefined)

export const CourseMobileFabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<FabAction[]>([])

  const registerAction = useCallback((newAction: FabAction) => {
    setActions((prev) => {
      // Check if action with same id exists to update it, or add new
      const exists = prev.some((a) => a.id === newAction.id)
      if (exists) {
        return prev.map((a) => (a.id === newAction.id ? newAction : a))
      }
      return [...prev, newAction]
    })
  }, [])

  const unregisterAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Sort actions based on priority before passing to FloatingActionBar
  const sortedActions = useMemo(() => {
    return [...actions]
      .sort((a, b) => a.priority - b.priority)
      // We can map them directly back to ActionItem since it inherits natively,
      // but to be perfectly typed we just return the array as ActionItem[].
      .map((a) => a as ActionItem)
  }, [actions])

  return (
    <CourseMobileFabContext.Provider value={{ registerAction, unregisterAction }}>
      {children}
      {sortedActions.length > 0 && (
        <FloatingActionBar
          actions={sortedActions}
          align="right"
          position="bottom"
          showBackground={false} // FAB buttons look good individually, or True for a unified capsule
        />
      )}
    </CourseMobileFabContext.Provider>
  )
}

export const useCourseMobileFab = () => {
  const context = useContext(CourseMobileFabContext)
  if (!context) {
    throw new Error('useCourseMobileFab must be used within a CourseMobileFabProvider')
  }
  return context
}
