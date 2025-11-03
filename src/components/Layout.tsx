'use client'

import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}