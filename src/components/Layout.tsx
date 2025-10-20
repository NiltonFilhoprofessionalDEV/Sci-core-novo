'use client'

import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#7a5b3e] via-[#cdbdae] to-[#fafafa] ${className}`}>
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}