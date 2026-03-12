"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio } from "lucide-react";

// Use exactly 127.0.0.1 to match Python's default host and avoid CORS strictness
const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"], 
  reconnectionAttempts: 5,
});

type ScanEvent = {
  id: string;
  company_name: string;
};

export default function LiveTicker() {
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);

  useEffect(() => {
    console.log("🟡 0. Component Mounted: Attempting connection to Python...");

    socket.on("connect", () => {
      console.log("🟢 1. WEBSOCKET FULLY CONNECTED! Socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🟠 2. WEBSOCKET DISCONNECTED. Reason:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 3. WEBSOCKET CONNECTION ERROR:", err.message);
      console.error("Full Error Object:", err);
    });

    socket.on("live_scan_feed", (data) => {
      console.log("🔥 4. BINGO! BROADCAST RECEIVED IN REACT:", data);
      
      const newScanId = Math.random().toString(36).substring(7);
      setRecentScans((prev) => [{ id: newScanId, company_name: data.company_name }, ...prev].slice(0, 3));

      setTimeout(() => {
        setRecentScans((current) => current.filter((s) => s.id !== newScanId));
      }, 4500);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("live_scan_feed");
    };
  }, []);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {recentScans.map((scan) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }}
              className="bg-[#0f172a]/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl p-4 flex items-center gap-4 pointer-events-auto"
            >
              <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">Global Radar Alert</p>
                <p className="text-sm font-semibold text-white">
                  Active scan on <span className="text-blue-400 font-black">{scan.company_name}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}