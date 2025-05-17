"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "../utils"
import type { MessageType } from "./NewsChat"
import ReactMarkdown from "react-markdown"

// Info Icon
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

interface ChatMessageProps {
  message: MessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [visible, setVisible] = useState(false)
  const [showTimestamp, setShowTimestamp] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Show timestamp after message appears
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setShowTimestamp(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const isUser = message.role === "user"

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div
      ref={messageRef}
      className={cn(
        "flex w-full transition-all duration-500 ease-out group",
        isUser ? "justify-end" : "justify-start",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none hover:shadow-blue-900/30 hover:shadow-lg"
            : "bg-gray-800/90 text-gray-100 rounded-tl-none hover:shadow-gray-900/20 hover:shadow-lg",
          "group-hover:translate-y-[-2px]",
        )}
      >
        <div className="flex flex-col">
          <div className="text-sm sm:text-base">
            {isUser ? (
              message.content
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <div className="flex items-center mt-1 gap-1">
            {message.hasContext && (
              <div
                className={cn(
                  "flex items-center text-xs gap-1 transition-all duration-500",
                  isUser ? "text-blue-200" : "text-blue-400",
                  visible ? "opacity-100" : "opacity-0",
                )}
              >
                <InfoIcon width={12} height={12} className="animate-pulse" />
                <span>Contextualized answer</span>
              </div>
            )}
            <span
              className={cn(
                "text-xs ml-auto transition-all duration-500",
                isUser ? "text-blue-200/70" : "text-gray-400/70",
                showTimestamp ? "opacity-70" : "opacity-0",
                "group-hover:opacity-100",
              )}
            >
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
