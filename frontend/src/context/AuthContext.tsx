"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  role: "SUPER_ADMIN" | "ADMIN" | "STUDENT"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("rexam_user")
    const token = localStorage.getItem("rexam_token")
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
      // Potentially verify token here
    }
    setLoading(false)
  }, [])

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
