// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import {
//   ArrowLeft, MessageSquare, Hash,
//   Users, BrainCircuit, ExternalLink,
//   CheckCircle, Loader2, ShieldCheck,
//   Activity, Target
// } from "lucide-react";

// export default function DeepDiveReport() {
//   const params = useParams();
//   const router = useRouter();
//   const companyName = decodeURIComponent(params.companyName as string);
//   const { data: session } = useSession();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.post("http://127.0.0.1:5000/report", {
//           company_name: companyName,
//         });
//         setData(res.data);
//       } catch {
//         console.error("Failed to load report");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (session !== undefined) fetchData();
//   }, [companyName, session]);

//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white relative overflow-hidden">
//         <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
//         <div className="relative flex flex-col items-center gap-6">
//           <Loader2 className="w-14 h-14 text-blue-400 animate-spin" />
//           <p className="text-blue-300 uppercase tracking-[0.3em] text-sm animate-pulse">
//             Gathering Intelligence on {companyName}
//           </p>
//         </div>
//       </div>
//     );

//   const trustColor =
//     data?.trust_score >= 80
//       ? "from-emerald-400 to-green-500"
//       : data?.trust_score >= 50
//         ? "from-yellow-400 to-orange-400"
//         : "from-red-400 to-rose-500";

//   return (
//     <div className="min-h-screen bg-[#0b1120] text-white p-6 md:p-14 relative overflow-hidden">

//       {/* GLOBAL BACKGROUND GLOW */}
//       <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full" />
//       <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[160px] rounded-full" />

//       {/* HEADER */}
//       <button
//         onClick={() => router.back()}
//         className="relative z-10 mb-10 flex items-center gap-2 text-gray-400 hover:text-white transition"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         <span className="uppercase tracking-widest text-xs font-bold">
//           Back to Scanner
//         </span>
//       </button>

//       <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pb-10 border-b border-white/10">

//         <div>
//           <h1 className="text-6xl font-black tracking-tight mb-3">
//             {data?.company_name}
//           </h1>
//           <p className="text-blue-400 uppercase tracking-[0.4em] text-xs font-bold">
//             Report ID: {data?.report_id}
//           </p>
//         </div>

//         <div className="mt-6 md:mt-0 text-right">
//           <div
//             className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${trustColor} animate-pulse`}
//           >
//             {data?.trust_score}
//           </div>
//           <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
//             Composite Trust Score
//           </p>
//         </div>
//       </div>

//       {/* ================= AI EXECUTIVE BRIEFING (Keep Your Previous Upgraded Version Here) ================= */}
//       {/* 🧠 NEXT-GEN AI EXECUTIVE BRIEFING */}
//       <div className="relative mb-20">

//         {/* Animated Background Glow */}
//         <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
//         <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

//         {/* Header */}
//         <div className="relative z-10 flex items-center justify-between flex-wrap gap-4 mb-10">
//           <div className="flex items-center gap-4">
//             <div className="relative p-4 bg-gradient-to-br from-blue-500/30 to-indigo-600/20 rounded-2xl border border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.3)] backdrop-blur-xl">
//               <BrainCircuit className="w-9 h-9 text-blue-400 animate-pulse" />
//               <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
//             </div>
//             <div>
//               <h2 className="font-heading text-3xl font-black text-white tracking-tight">
//                 AI Executive Briefing
//               </h2>
//               <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.3em] mt-1">
//                 Nexus-CISO Neural Intelligence System
//               </p>
//             </div>
//           </div>

//           {/* AI System Badge */}
//           <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-bold tracking-widest animate-pulse">
//             AI SYSTEM ACTIVE
//           </div>
//         </div>

//         {data?.ai_summary ? (
//           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">

//             {(() => {
//               const sentences = data.ai_summary.split(/(?<=\.)\s+/).filter((s: string) => s.trim().length > 0);
//               const s1 = sentences[0] || "Analyzing entity legitimacy...";
//               const s2 = sentences[1] || "Evaluating digital footprint and threat vectors...";
//               const s3 = sentences.slice(2).join(' ') || "Awaiting final strategic directive.";

//               return (
//                 <>
//                   {/* CARD 1 */}
//                   <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/40 to-transparent hover:from-blue-500 transition-all duration-500">
//                     <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 hover:border-blue-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2">

//                       <div className="flex items-center gap-3 mb-5">
//                         <ShieldCheck className="w-6 h-6 text-blue-400" />
//                         <h3 className="text-xs text-blue-300 font-bold uppercase tracking-widest">
//                           Entity Legitimacy
//                         </h3>
//                       </div>

//                       <p className="text-xl font-semibold text-white leading-relaxed group-hover:text-blue-100 transition-colors">
//                         {s1}
//                       </p>

//                       {/* Subtle Scan Effect */}
//                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700 pointer-events-none" />
//                     </div>
//                   </div>

//                   {/* CARD 2 */}
//                   <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-transparent hover:from-purple-500 transition-all duration-500">
//                     <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 hover:border-purple-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2">

//                       <div className="flex items-center gap-3 mb-5">
//                         <Activity className="w-6 h-6 text-purple-400" />
//                         <h3 className="text-xs text-purple-300 font-bold uppercase tracking-widest">
//                           Threat Vectors
//                         </h3>
//                       </div>

//                       <p className="text-xl font-semibold text-white leading-relaxed group-hover:text-purple-100 transition-colors">
//                         {s2}
//                       </p>

//                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700 pointer-events-none" />
//                     </div>
//                   </div>

//                   {/* STRATEGIC DIRECTIVE – PREMIUM HERO CARD */}
//                   <div className="md:col-span-2 relative group p-[1px] rounded-3xl bg-gradient-to-r from-indigo-500/60 via-blue-500/40 to-purple-500/60 hover:opacity-100 transition-all duration-500">

//                     <div className="relative bg-gradient-to-br from-[#0f172a]/95 via-[#111827]/90 to-[#0f172a]/95 backdrop-blur-3xl p-6 md:p-12 rounded-3xl border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.25)] hover:shadow-[0_0_90px_rgba(99,102,241,0.4)] transition-all duration-500">

//                       {/* Floating Icon */}
//                       <div className="absolute -top-8 left-10 p-5 bg-indigo-600/20 border border-indigo-500/50 rounded-2xl shadow-lg backdrop-blur-xl">
//                         <Target className="w-8 h-8 text-indigo-400" />
//                       </div>

//                       <div className="mt-8">
//                         <h3 className="text-xs text-indigo-300 font-bold uppercase tracking-[0.3em] mb-6">
//                           Strategic Directive
//                         </h3>

//                         <p className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
//                           {s3}
//                         </p>
//                       </div>

//                       {/* Glow Pulse */}
//                       <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
//                     </div>
//                   </div>
//                 </>
//               );
//             })()}
//           </div>
//         ) : (
//           <div className="relative z-10 bg-[#0f172a]/70 backdrop-blur-xl p-16 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-6 shadow-2xl">
//             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//             <span className="text-xl text-blue-400 font-bold uppercase tracking-[0.4em] animate-pulse">
//               Compiling Neural Analysis...
//             </span>
//           </div>
//         )}
//       </div>

//       {/* ================= GRID SECTION ================= */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">

//         {/* LEFT COLUMN */}
//         <div className="space-y-8">

//           {/* Leadership */}
//           <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-transparent hover:from-purple-500 transition">
//             <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">
//               <h3 className="text-xs text-purple-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
//                 <Users className="w-4 h-4" />
//                 Leadership Intelligence
//               </h3>

//               {data?.leadership ? (
//                 <>
//                   <p className="text-2xl font-bold mb-4">
//                     {data.leadership.source_title.split("-")[0]}
//                   </p>
//                   <a
//                     href={data.leadership.url}
//                     target="_blank"
//                     className="text-purple-400 hover:text-purple-300 text-xs uppercase tracking-widest flex items-center gap-1"
//                   >
//                     Verify on LinkedIn <ExternalLink className="w-3 h-3" />
//                   </a>
//                 </>
//               ) : (
//                 <p className="text-gray-500 italic text-sm">
//                   Leadership data hidden or private.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* ================= RISK INTELLIGENCE PANEL ================= */}
//           <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-red-500/40 to-transparent hover:from-red-500 transition">
//             <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">

//               <h3 className="text-xs text-red-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
//                 <ShieldCheck className="w-4 h-4" />
//                 Risk Breakdown
//               </h3>

//               <div className="space-y-5">

//                 {[
//                   { label: "Domain Credibility", value: data?.risk_breakdown?.domain || 70 },
//                   { label: "Leadership Transparency", value: data?.risk_breakdown?.leadership || 60 },
//                   { label: "Public Sentiment", value: data?.risk_breakdown?.sentiment || 75 },
//                   { label: "Scam Signal Detection", value: data?.risk_breakdown?.scam_signals || 40 },
//                 ].map((item, idx) => (
//                   <div key={idx}>
//                     <div className="flex justify-between text-xs mb-2 text-gray-300">
//                       <span>{item.label}</span>
//                       <span>{item.value}%</span>
//                     </div>

//                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full bg-gradient-to-r ${item.value >= 75
//                           ? "from-emerald-400 to-green-500"
//                           : item.value >= 50
//                             ? "from-yellow-400 to-orange-400"
//                             : "from-red-400 to-rose-500"
//                           }`}
//                         style={{ width: `${item.value}%` }}
//                       />
//                     </div>
//                   </div>
//                 ))}

//               </div>
//             </div>
//           </div>

//           {/* ================= AI RISK FACTORS ================= */}
//           <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-orange-500/40 to-transparent hover:from-orange-500 transition">
//             <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">

//               <h3 className="text-xs text-orange-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
//                 <Activity className="w-4 h-4" />
//                 AI Risk Factors
//               </h3>

//               {data?.risk_flags?.length > 0 ? (
//                 <ul className="space-y-3 text-sm text-gray-300">
//                   {data.risk_flags.map((flag: string, i: number) => (
//                     <li key={i} className="flex items-start gap-2">
//                       <span className="w-2 h-2 mt-2 bg-red-500 rounded-full" />
//                       {flag}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-gray-500 italic text-sm">
//                   No major red flags detected.
//                 </p>
//               )}

//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN - LIVE FEED */}
//         <div className="lg:col-span-2">
//           <div className="bg-[#111827]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[750px] overflow-hidden">

//             <div className="p-8 border-b border-white/10 flex justify-between items-center">
//               <h3 className="text-sm uppercase tracking-[0.3em] font-bold flex items-center gap-3">
//                 <MessageSquare className="w-5 h-5 text-emerald-400" />
//                 Live Intelligence Feed
//               </h3>
//               <span className="text-emerald-400 text-xs uppercase tracking-widest animate-pulse font-bold">
//                 LIVE
//               </span>
//             </div>

//             <div className="overflow-y-auto p-8 space-y-6">

//               {data?.feed?.map((item: any, idx: number) => (
//                 <div
//                   key={idx}
//                   className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/40 transition-all hover:-translate-y-1"
//                 >
//                   <div className="flex justify-between mb-3">
//                     <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold ${item.sentiment === "Positive"
//                       ? "bg-green-500/10 text-green-400"
//                       : item.sentiment === "Negative"
//                         ? "bg-red-500/10 text-red-400"
//                         : "bg-gray-500/10 text-gray-400"
//                       }`}>
//                       {item.sentiment}
//                     </span>
//                     <span className="text-gray-500 text-xs font-bold">
//                       {item.source}
//                     </span>
//                   </div>

//                   <h4 className="font-bold text-gray-200 mb-2">
//                     {item.text}
//                   </h4>

//                   <p className="text-sm text-gray-400 mb-4">
//                     {item.snippet}
//                   </p>

//                   <a
//                     href={item.url}
//                     target="_blank"
//                     className="text-blue-400 text-xs uppercase tracking-widest hover:underline flex items-center gap-1"
//                   >
//                     Read Source <ExternalLink className="w-3 h-3" />
//                   </a>
//                 </div>
//               ))}

//               {data?.feed?.length === 0 && (
//                 <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//                   <CheckCircle className="w-16 h-16 text-green-500/20 mb-4" />
//                   <p className="uppercase tracking-widest font-bold">
//                     Clean Digital Record
//                   </p>
//                   <p className="text-sm mt-2 text-center max-w-sm">
//                     No significant public controversies found.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ================= SENTIMENT OVERVIEW ================= */}
//           <div className="p-8 border-b border-white/10">
//             <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">
//               Sentiment Overview
//             </h4>

//             {[
//               { label: "Positive", value: data?.sentiment?.positive || 65, color: "bg-green-500" },
//               { label: "Neutral", value: data?.sentiment?.neutral || 20, color: "bg-gray-500" },
//               { label: "Negative", value: data?.sentiment?.negative || 15, color: "bg-red-500" },
//             ].map((item, idx) => (
//               <div key={idx} className="mb-4">
//                 <div className="flex justify-between text-xs text-gray-400 mb-2">
//                   <span>{item.label}</span>
//                   <span>{item.value}%</span>
//                 </div>
//                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
//                   <div
//                     className={`${item.color} h-full`}
//                     style={{ width: `${item.value}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion"; // <-- Added framer-motion here
import {
  ArrowLeft, MessageSquare, Hash,
  Users, BrainCircuit, ExternalLink,
  CheckCircle, Loader2, ShieldCheck,
  Activity, Target
} from "lucide-react";

export default function DeepDiveReport() {
  const params = useParams();
  const router = useRouter();
  const companyName = decodeURIComponent(params.companyName as string);
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post("http://127.0.0.1:5000/report", {
          company_name: companyName,
        });
        setData(res.data);
      } catch {
        console.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (session !== undefined) fetchData();
  }, [companyName, session]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
        <div className="relative flex flex-col items-center gap-6">
          <Loader2 className="w-14 h-14 text-blue-400 animate-spin" />
          <p className="text-blue-300 uppercase tracking-[0.3em] text-sm animate-pulse">
            Gathering Intelligence on {companyName}
          </p>
        </div>
      </div>
    );

  const trustColor =
    data?.trust_score >= 80
      ? "from-emerald-400 to-green-500"
      : data?.trust_score >= 50
        ? "from-yellow-400 to-orange-400"
        : "from-red-400 to-rose-500";

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6 md:p-14 relative overflow-hidden">

      {/* GLOBAL BACKGROUND GLOW */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <button
        onClick={() => router.back()}
        className="relative z-10 mb-10 flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="uppercase tracking-widest text-xs font-bold">
          Back to Scanner
        </span>
      </button>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pb-10 border-b border-white/10">

        <div>
          <h1 className="text-6xl font-black tracking-tight mb-3">
            {data?.company_name}
          </h1>
          <p className="text-blue-400 uppercase tracking-[0.4em] text-xs font-bold">
            Report ID: {data?.report_id}
          </p>
        </div>

        <div className="mt-6 md:mt-0 text-right">
          <div
            className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${trustColor} animate-pulse`}
          >
            {data?.trust_score}
          </div>
          <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
            Composite Trust Score
          </p>
        </div>
      </div>

      {/* 🧠 NEXT-GEN AI EXECUTIVE BRIEFING */}
      <div className="relative mb-20">

        {/* Animated Background Glow */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative p-4 bg-gradient-to-br from-blue-500/30 to-indigo-600/20 rounded-2xl border border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.3)] backdrop-blur-xl">
              <BrainCircuit className="w-9 h-9 text-blue-400 animate-pulse" />
              <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                AI Executive Briefing
              </h2>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.3em] mt-1">
                Nexus-CISO Neural Intelligence System
              </p>
            </div>
          </div>

          {/* AI System Badge */}
          <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-bold tracking-widest animate-pulse">
            AI SYSTEM ACTIVE
          </div>
        </div>

        {data?.ai_summary ? (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">

            {(() => {
              const sentences = data.ai_summary.split(/(?<=\.)\s+/).filter((s: string) => s.trim().length > 0);
              const s1 = sentences[0] || "Analyzing entity legitimacy...";
              const s2 = sentences[1] || "Evaluating digital footprint and threat vectors...";
              const s3 = sentences.slice(2).join(' ') || "Awaiting final strategic directive.";

              return (
                <>
                  {/* CARD 1 */}
                  <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/40 to-transparent hover:from-blue-500 transition-all duration-500">
                    <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 hover:border-blue-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 h-full">

                      <div className="flex items-center gap-3 mb-5">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xs text-blue-300 font-bold uppercase tracking-widest">
                          Entity Legitimacy
                        </h3>
                      </div>

                      <p className="text-xl font-semibold text-white leading-relaxed group-hover:text-blue-100 transition-colors">
                        {s1}
                      </p>

                      {/* Subtle Scan Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700 pointer-events-none rounded-3xl" />
                    </div>
                  </div>

                  {/* CARD 2 */}
                  <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-transparent hover:from-purple-500 transition-all duration-500">
                    <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 hover:border-purple-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 h-full">

                      <div className="flex items-center gap-3 mb-5">
                        <Activity className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xs text-purple-300 font-bold uppercase tracking-widest">
                          Threat Vectors
                        </h3>
                      </div>

                      <p className="text-xl font-semibold text-white leading-relaxed group-hover:text-purple-100 transition-colors">
                        {s2}
                      </p>

                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700 pointer-events-none rounded-3xl" />
                    </div>
                  </div>

                  {/* STRATEGIC DIRECTIVE – PREMIUM HERO CARD */}
                  <div className="md:col-span-2 relative group p-[1px] rounded-3xl bg-gradient-to-r from-indigo-500/60 via-blue-500/40 to-purple-500/60 hover:opacity-100 transition-all duration-500">

                    <div className="relative bg-gradient-to-br from-[#0f172a]/95 via-[#111827]/90 to-[#0f172a]/95 backdrop-blur-3xl p-6 md:p-12 rounded-3xl border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.25)] hover:shadow-[0_0_90px_rgba(99,102,241,0.4)] transition-all duration-500">

                      {/* Floating Icon */}
                      <div className="absolute -top-8 left-10 p-5 bg-indigo-600/20 border border-indigo-500/50 rounded-2xl shadow-lg backdrop-blur-xl">
                        <Target className="w-8 h-8 text-indigo-400" />
                      </div>

                      <div className="mt-8">
                        <h3 className="text-xs text-indigo-300 font-bold uppercase tracking-[0.3em] mb-6">
                          Strategic Directive
                        </h3>

                        <p className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
                          {s3}
                        </p>
                      </div>

                      {/* Glow Pulse */}
                      <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="relative z-10 bg-[#0f172a]/70 backdrop-blur-xl p-16 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-6 shadow-2xl">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <span className="text-xl text-blue-400 font-bold uppercase tracking-[0.4em] animate-pulse">
              Compiling Neural Analysis...
            </span>
          </div>
        )}
      </div>

      {/* ================= GRID SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">

        {/* LEFT COLUMN */}
        <div className="space-y-8">

          {/* Leadership */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-transparent hover:from-purple-500 transition">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">
              <h3 className="text-xs text-purple-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
                <Users className="w-4 h-4" />
                Leadership Intelligence
              </h3>

              {data?.leadership ? (
                <>
                  <p className="text-2xl font-bold mb-4">
                    {data.leadership.source_title.split("-")[0]}
                  </p>
                  <a
                    href={data.leadership.url}
                    target="_blank"
                    className="text-purple-400 hover:text-purple-300 text-xs uppercase tracking-widest flex items-center gap-1"
                  >
                    Verify on LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  Leadership data hidden or private.
                </p>
              )}
            </div>
          </div>

          {/* ================= RISK INTELLIGENCE PANEL (NOW ANIMATED) ================= */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-red-500/40 to-transparent hover:from-red-500 transition">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">

              <h3 className="text-xs text-red-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Risk Breakdown
              </h3>

              <div className="space-y-5">

                {[
                  { label: "Domain Credibility", value: data?.risk_breakdown?.domain ?? 70 },
                  { label: "Leadership Transparency", value: data?.risk_breakdown?.leadership ?? 60 },
                  { label: "Public Sentiment", value: data?.risk_breakdown?.sentiment ?? 75 },
                  { label: "Scam Signal Detection", value: data?.risk_breakdown?.scam_signals ?? 40 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-2 text-gray-300">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>

                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      {/* Using framer-motion here */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r ${item.value >= 75
                            ? "from-emerald-400 to-green-500"
                            : item.value >= 50
                              ? "from-yellow-400 to-orange-400"
                              : "from-red-400 to-rose-500"
                          }`}
                      />
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* ================= AI RISK FACTORS ================= */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-orange-500/40 to-transparent hover:from-orange-500 transition">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-2 transition-all duration-500">

              <h3 className="text-xs text-orange-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 font-bold">
                <Activity className="w-4 h-4" />
                AI Risk Factors
              </h3>

              {data?.risk_flags?.length > 0 ? (
                <ul className="space-y-3 text-sm text-gray-300">
                  {data.risk_flags.map((flag: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-1.5 shrink-0 bg-red-500 rounded-full" />
                      <span className="leading-relaxed">{flag}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  No major red flags detected.
                </p>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - LIVE FEED */}
        <div className="lg:col-span-2">
          <div className="bg-[#111827]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[750px] overflow-hidden">

            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-sm uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Live Intelligence Feed
              </h3>
              <span className="text-emerald-400 text-xs uppercase tracking-widest animate-pulse font-bold">
                LIVE
              </span>
            </div>

            <div className="overflow-y-auto p-8 space-y-6">

              {data?.feed?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/40 transition-all hover:-translate-y-1"
                >
                  <div className="flex justify-between mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold ${item.sentiment === "Positive"
                        ? "bg-green-500/10 text-green-400"
                        : item.sentiment === "Negative"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}>
                      {item.sentiment}
                    </span>
                    <span className="text-gray-500 text-xs font-bold">
                      {item.source}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-200 mb-2">
                    {item.text}
                  </h4>

                  <p className="text-sm text-gray-400 mb-4">
                    {item.snippet}
                  </p>

                  <a
                    href={item.url}
                    target="_blank"
                    className="text-blue-400 text-xs uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    Read Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}

              {data?.feed?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <CheckCircle className="w-16 h-16 text-green-500/20 mb-4" />
                  <p className="uppercase tracking-widest font-bold">
                    Clean Digital Record
                  </p>
                  <p className="text-sm mt-2 text-center max-w-sm">
                    No significant public controversies found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= SENTIMENT OVERVIEW (NOW ANIMATED) ================= */}
          <div className="p-8 border-b border-white/10">
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">
              Sentiment Overview
            </h4>

            {[
              { label: "Positive", value: data?.sentiment?.positive ?? 65, color: "bg-green-500" },
              { label: "Neutral", value: data?.sentiment?.neutral ?? 20, color: "bg-gray-500" },
              { label: "Negative", value: data?.sentiment?.negative ?? 15, color: "bg-red-500" },
            ].map((item, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  {/* Using framer-motion here */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.2 }}
                    className={`${item.color} h-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}