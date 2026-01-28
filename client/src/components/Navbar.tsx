"use client";

import { ShieldCheck, Menu, X, Github } from "lucide-react"; // Added Github Icon & X for close
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShieldCheck className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              JobGuard AI
            </span>
          </Link>

          {/* Desktop Links  */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md font-medium text-sm">
                Scanner
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md font-medium text-sm">
                How it Works
              </Link>
              
              {/* GitHub Button */}
              <a 
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]"
              >
                <Github size={16} />
                <span>GitHub Repo</span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button (Visible on Phone) */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f172a] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-white/5 px-3 py-3 rounded-md text-base font-medium"
              >
                Scanner
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-white/5 px-3 py-3 rounded-md text-base font-medium"
              >
                How it Works
              </Link>
              
              {/* Mobile GitHub Button */}
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 px-3 py-3 rounded-md text-base font-medium"
              >
                <Github size={18} />
                GitHub Repo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}