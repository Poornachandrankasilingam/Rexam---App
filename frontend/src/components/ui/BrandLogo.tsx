"use client"

import { motion } from "framer-motion"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero3d"
  showText?: boolean
  className?: string
  with3dEffect?: boolean
}

export function BrandLogo({
  size = "md",
  showText = true,
  className = "",
  with3dEffect = true
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: "h-8 w-8", text: "text-lg", sub: "text-[9px]" },
    md: { img: "h-10 w-10", text: "text-xl", sub: "text-[10px]" },
    lg: { img: "h-14 w-14", text: "text-2xl", sub: "text-xs" },
    xl: { img: "h-20 w-20", text: "text-3xl", sub: "text-sm" },
    hero3d: { img: "h-28 w-28 md:h-36 md:w-36", text: "text-4xl md:text-5xl", sub: "text-xs md:text-sm" }
  }

  const currentSize = sizeMap[size]

  if (size === "hero3d") {
    return (
      <div className={`flex flex-col items-center justify-center text-center group perspective-1000 ${className}`}>
        {/* 3D Floating Holographic Logo Container */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotateX: [0, 4, 0, -4, 0],
            rotateY: [-5, 5, -5]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative transform-gpu transition-transform duration-500 group-hover:scale-105"
        >
          {/* 3D Ambient Glowing Halos */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-3xl blur-md opacity-75" />

          {/* 3D Card Base with Logo */}
          <div className="relative p-4 md:p-6 rounded-3xl bg-slate-950/80 border-2 border-cyan-400/50 shadow-[0_20px_50px_rgba(8,_112,_184,_0.5)] backdrop-blur-2xl flex items-center justify-center overflow-hidden">
            {/* Specular Light Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <img
              src="/logo.png"
              alt="Rexam AI Official Logo"
              className={`${currentSize.img} object-contain rounded-2xl drop-shadow-[0_10px_20px_rgba(0,180,255,0.4)]`}
            />
          </div>
        </motion.div>

        {showText && (
          <div className="mt-5 space-y-1">
            <h2 className={`${currentSize.text} font-black tracking-tight font-outfit text-white flex items-center justify-center`}>
              <span>REXAM</span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent ml-1">
                -AI
              </span>
            </h2>
            <p className={`${currentSize.sub} font-bold tracking-widest uppercase text-cyan-300/90 font-mono`}>
              Study Purpose | Intelligent Learning Platform
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {/* 3D Interactive Emblem */}
      <div className="relative flex-shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-300" />
        <div className={`relative ${currentSize.img} rounded-2xl p-0.5 bg-slate-950/90 border border-cyan-400/40 shadow-lg shadow-blue-500/20 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
          <img
            src="/logo.png"
            alt="Rexam AI"
            className="h-full w-full object-contain rounded-xl"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-extrabold tracking-tight font-outfit text-white leading-none flex items-center`}>
            REXAM<span className="text-cyan-400">.AI</span>
          </span>
          <span className="text-[9px] font-bold text-cyan-300/80 tracking-wider uppercase font-mono mt-0.5">
            Intelligent Platform
          </span>
        </div>
      )}
    </div>
  )
}
