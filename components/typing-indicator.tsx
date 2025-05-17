"use client"

import { useState, useEffect } from "react"

export function TypingIndicator() {
  const [visible, setVisible] = useState(false)

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`flex transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-gray-800/90 text-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
        <div className="flex space-x-2 items-center h-6">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing-dot" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing-dot" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
