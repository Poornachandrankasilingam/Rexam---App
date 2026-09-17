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
    hero3d: { img: "w-72 sm:w-96 md:w-[480px] max-w-full h-auto", text: "text-4xl md:text-5xl", sub: "text-xs md:text-sm" }
  }

  const currentSize = sizeMap[size]

  if (size === "hero3d") {
    return (
      <div className={`flex flex-col items-center justify-center text-center group perspective-1000 ${className}`}>
        {/* 3D Floating Holographic Brand Centerpiece */}
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotateX: [0, 2.5, 0, -2.5, 0],
            rotateY: [-3.5, 3.5, -3.5]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative transform-gpu transition-transform duration-500 group-hover:scale-105"
        >
          {/* 3D Ambient Glowing Halos */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-600 via-teal-400 to-green-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-md opacity-60" />

          {/* 3D Card Base with Full Brand Logo */}
          <div className="relative p-5 sm:p-7 md:p-8 rounded-3xl bg-[#0a0f1d] border-2 border-emerald-400/50 shadow-[0_20px_50px_rgba(5,_150,_105,_0.25)] backdrop-blur-2xl flex items-center justify-center overflow-hidden">
            {/* Specular Light Sweep Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <img
              src="/logo.png"
              alt="REXAM-AI: Intelligent Examination Platform"
              className={`${currentSize.img} object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(16,185,129,0.25)]`}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {/* 3D Interactive Emblem */}
      <div className="relative flex-shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300" />
        <div className={`relative ${currentSize.img} rounded-2xl p-1 bg-[#0a0f1d] border border-emerald-500/40 shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
          <img
            src="/logo.png"
            alt="Rexam AI"
            className="h-full w-full object-contain rounded-xl"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`${currentSize.text} font-black tracking-tight font-outfit text-white leading-none flex items-center`}>
            REXAM<span className="text-emerald-400">.AI</span>
          </span>
          <span className="text-[9px] font-extrabold text-emerald-400/90 tracking-widest uppercase font-mono mt-0.5">
            Intelligent Platform
          </span>
        </div>
      )}
    </div>
  )
}
