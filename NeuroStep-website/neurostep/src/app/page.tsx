'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import ParticlesBackground from '@/components/particles-background';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground intensity="high" className="absolute inset-0 z-0" />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center">
        {/* NEUROSTEP Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent"
        >
          NEUROSTEP
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-lg md:text-xl text-gray-200"
        >
          Advanced Gait Analysis Platform
        </motion.p>
        
        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex space-x-6"
        >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="#learn-more">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Learn More
              </motion.button>
            </Link>
        </motion.div>
      </div>
    </div>
  );
}
