"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"

interface Card3DProps {
  children: React.ReactNode
  className?: string
  glowColor?: "emerald" | "teal" | "cyan" | "mint"
  depth?: number
  onClick?: () => void
}

export function Card3D({
  children,
  className = "",
  glowColor = "emerald",
  depth = 20,
  onClick
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    setRotX(rotateX)
    setRotY(rotateY)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotX(0)
    setRotY(0)
  }

  const glowStyles = {
    emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
    teal: "from-teal-500/20 via-emerald-500/10 to-transparent",
    cyan: "from-cyan-500/20 via-teal-500/10 to-transparent",
    mint: "from-mint-400/20 via-emerald-500/10 to-transparent"
  }

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        animate={{
          rotateX: rotX,
          rotateY: rotY,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#082218]/90 via-[#061811]/95 to-[#030e09] border border-emerald-500/20 shadow-2xl backdrop-blur-2xl transition-shadow duration-300 ${
          isHovered ? "shadow-[0_20px_50px_rgba(5,_150,_105,_0.35)] border-emerald-400/50" : ""
        } ${className}`}
      >
        {/* Dynamic Specular Light Sweep on Hover */}
        <div 
          className={`absolute inset-0 rounded-3xl bg-gradient-to-tr ${glowStyles[glowColor]} opacity-0 transition-opacity duration-500 pointer-events-none ${
            isHovered ? "opacity-100" : ""
          }`} 
        />

        {/* Content with 3D Depth Elevation */}
        <div style={{ transform: `translateZ(${depth}px)` }} className="relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
