// "use client";

// import { useEffect, useState, useRef } from "react";
// import { io } from "socket.io-client";
// import { motion, AnimatePresence } from "framer-motion";
// import { Activity, Radio, Flame } from "lucide-react";

// const socket = io("http://localhost:5000", {
//   transports: ["websocket", "polling"],
//   reconnectionAttempts: 5,
// });

// type ScanEvent = {
//   id: string;
//   company_name: string;
//   count: number; // 👈 NEW: Tracks how many times it was scanned
// };

// export default function LiveTicker() {
//   const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  
//   // 🧠 THE MEMORY BANK: Remembers how many times each company is scanned
//   const scanFrequency = useRef<Record<string, number>>({});

//   useEffect(() => {
//    socket.on("live_scan_feed", (data) => {
//       // 🛑 SENDER EXCLUSION: Check the fingerprint
//       const myTabId = sessionStorage.getItem("tab_id");
//       if (data.sender_id === myTabId) {
//         console.log("🙈 Ignored my own scan broadcast.");
//         return; // Kill the function! Do not show the popup.
//       }

//       const company = data.company_name;
      
//       // Increment the count for this specific company
//       scanFrequency.current[company] = (scanFrequency.current[company] || 0) + 1;
//       const currentCount = scanFrequency.current[company];

//       const newScanId = Math.random().toString(36).substring(7);
//       const newScan = { id: newScanId, company_name: company, count: currentCount };

//       setRecentScans((prev) => [newScan, ...prev].slice(0, 3));

//       setTimeout(() => {
//         setRecentScans((current) => current.filter((s) => s.id !== newScanId));
//       }, 4500);
//     });

//     return () => {
//       socket.off("live_scan_feed");
//     };
//   }, []);

//   return (
//     <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
//       <div className="flex flex-col gap-3">
//         <AnimatePresence>
//           {recentScans.map((scan) => {
//             // 🔥 THE TRENDING TRIGGER 🔥
//             // If it's scanned 3 or more times, it upgrades to Trending!
//             const isTrending = scan.count >= 3;

//             return (
//               <motion.div
//                 key={scan.id}
//                 initial={{ opacity: 0, y: -50, scale: 0.9 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }}
//                 // Changes from Blue (Normal) to Orange (Trending)
//                 className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 flex items-center gap-4 pointer-events-auto transition-colors duration-500
//                   ${isTrending ? "bg-[#2a150f]/95 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]" : "bg-[#0f172a]/95 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"}
//                 `}
//               >
//                 <div className={`p-2 rounded-full ${isTrending ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
//                   {isTrending ? <Flame className="w-5 h-5 animate-pulse" /> : <Radio className="w-5 h-5 animate-pulse" />}
//                 </div>
//                 <div>
//                   <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1 ${isTrending ? "text-orange-400" : "text-gray-400"}`}>
//                     <Activity className={`w-3 h-3 ${isTrending ? "text-orange-400" : "text-blue-400"}`} />
//                     {isTrending ? "Trending Threat Vector" : "Global Radar Alert"}
//                   </p>
//                   <p className="text-sm font-semibold text-white">
//                     {isTrending ? (
//                       <>Mass scans detected on <span className="text-orange-400 font-black">{scan.company_name}</span> ({scan.count}x)</>
//                     ) : (
//                       <>Active scan on <span className="text-blue-400 font-black">{scan.company_name}</span></>
//                     )}
//                   </p>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, Flame } from "lucide-react";
import { usePathname } from "next/navigation";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
});

type ScanEvent = {
  id: string;
  company_name: string;
  count: number;
};

export default function LiveTicker() {
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const scanFrequency = useRef<Record<string, number>>({});

  const pathname = usePathname();

  useEffect(() => {
  socket.on("live_scan_feed", (data) => {

    const myTabId = sessionStorage.getItem("tab_id");
    if (data.sender_id === myTabId) return;

    const company = data.company_name;

    scanFrequency.current[company] =
      (scanFrequency.current[company] || 0) + 1;

    const currentCount = scanFrequency.current[company];

    const newScanId = Math.random().toString(36).substring(7);

    const newScan = {
      id: newScanId,
      company_name: company,
      count: currentCount,
    };

    setRecentScans((prev) => [newScan, ...prev].slice(0, 3));

    setTimeout(() => {
      setRecentScans((current) =>
        current.filter((s) => s.id !== newScanId)
      );
    }, 4200);
  });

  return () => {
    socket.off("live_scan_feed");
  };

}, []);

// If we are on the login page (or signup), do not show the UI!
  if (pathname === '/login' || pathname === '/signup') {
    return null; 
  }

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">

      <div className="flex flex-col gap-3">

        <AnimatePresence>

          {recentScans.map((scan) => {

            const isTrending = scan.count >= 3;

            return (

              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: -60, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.92 }}
                transition={{ duration: 0.35 }}
                className={`relative p-[1px] rounded-xl pointer-events-auto
                ${isTrending
                    ? "bg-gradient-to-r from-orange-500/50 via-red-500/30 to-orange-500/50"
                    : "bg-gradient-to-r from-blue-500/40 via-cyan-500/30 to-blue-500/40"
                  }`}
              >

                <div
                  className={`relative flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl border
                  ${isTrending
                      ? "bg-[#1a120e]/95 border-orange-500/30"
                      : "bg-[#0f172a]/95 border-blue-500/20"
                    }`}
                >

                  {/* subtle glow */}
                  <div className={`absolute inset-0 rounded-xl blur-2xl opacity-20
                  ${isTrending ? "bg-orange-500/20" : "bg-blue-500/20"}`} />

                  {/* Icon */}
                  <div
                    className={`relative z-10 p-2 rounded-lg
                    ${isTrending
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-blue-500/20 text-blue-400"
                      }`}
                  >
                    {isTrending ? (
                      <Flame className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Radio className="w-4 h-4 animate-pulse" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="relative z-10 flex-1">

                    <div className="flex items-center gap-2 mb-[2px]">

                      <Activity
                        className={`w-3 h-3
                        ${isTrending ? "text-orange-400" : "text-blue-400"}`}
                      />

                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.25em]
                        ${isTrending ? "text-orange-400" : "text-blue-400"}`}
                      >
                        {isTrending
                          ? "Trending Investigation"
                          : "Live Scan Detected"}
                      </p>

                      <span className="ml-auto text-[9px] px-2 py-[2px] rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                        LIVE
                      </span>

                    </div>

                    <p className="text-sm font-semibold text-white leading-tight">

                      {isTrending ? (
                        <>
                          Multiple scans on{" "}
                          <span className="text-orange-400 font-bold">
                            {scan.company_name}
                          </span>{" "}
                          ({scan.count}x)
                        </>
                      ) : (
                        <>
                          Investigation started for{" "}
                          <span className="text-blue-400 font-bold">
                            {scan.company_name}
                          </span>
                        </>
                      )}

                    </p>

                  </div>
                </div>
              </motion.div>

            );
          })}

        </AnimatePresence>

      </div>
    </div>
  );
}