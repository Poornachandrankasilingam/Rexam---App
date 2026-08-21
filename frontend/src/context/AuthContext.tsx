"use client"

import React, { createContext, useContext, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "SUPER_ADMIN" | "ADMIN" | "STUDENT"
  avatar?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const storedUser = localStorage.getItem("rexam_user")
      const token = localStorage.getItem("rexam_token")
      if (storedUser && token) {
        return JSON.parse(storedUser)
      }
    } catch (e) {
      console.error("Failed to parse stored user", e)
    }
    return null
  })
  const [loading] = useState(false)

  const login = (token: string, userData: User) => {
    localStorage.setItem("rexam_token", token)
    localStorage.setItem("rexam_user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("rexam_token")
    localStorage.removeItem("rexam_user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
