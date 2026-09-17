"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Sparkles, MessageSquare, ChevronRight, Loader2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export function FloatingAiCoach() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hi! Need quick help with a formula, doubt, or shortcut? Ask me anything!"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userText }])
    setLoading(true)

    try {
      const res = await api.post("/student/ai-chat/message", {
        message: userText,
        chatHistory: messages.slice(-4)
      })

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply || "I have analyzed your question." }
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 border-2 border-emerald-300 transition-all transform hover:scale-105 group relative"
          title="Open AI Coach"
        >
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-300 animate-ping" />
          <Bot className="h-7 w-7 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* Expanded Quick Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-[#090d16]/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-tight leading-tight">Rexam AI Quick Coach</h4>
                <span className="text-[10px] text-emerald-100 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Multi-LLM Engine
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Link to="/student/ai-coach" onClick={() => setIsOpen(false)}>
                <button className="text-[10px] px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg font-bold text-white transition-colors border border-white/10">
                  Full Room ↗
                </button>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs bg-transparent">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none font-medium shadow-md shadow-emerald-600/20"
                      : "bg-secondary/60 border border-white/10 text-slate-200 rounded-tl-none shadow-sm space-y-1"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary/60 border border-white/10 p-3 rounded-2xl text-[11px] font-bold text-slate-300 flex items-center space-x-2 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>Analyzing concept...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Mock Room Banner */}
          <div className="px-3.5 py-2 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-300">Want live oral viva?</span>
            <Link
              to="/student/ai-coach"
              onClick={() => setIsOpen(false)}
              className="text-emerald-400 font-extrabold flex items-center hover:underline"
            >
              <span>Launch Mock Drill</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-secondary/30 border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a formula or doubt..."
              className="flex-1 p-2.5 rounded-xl bg-secondary/50 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || loading}
              className="rounded-xl h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
