// import Analyzer from "@/components/Analyzer";
// import { Shield, BrainCircuit, Lock, Globe } from "lucide-react";

// export default function Home() {
//   return (
//     <div className="pb-20">
      
//       {/* HERO SECTION */}
//       <div className="text-center space-y-6 py-16 md:py-24 relative">
//         {/* Background Gradient Blob */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />

//         <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
//           Is that Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Real or Fake?</span>
//         </h1>
//         <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
//           The world's first <span className="text-blue-200 font-semibold">AI-powered scam detection system</span>. 
//           Paste a job description below and let our Neural Network analyze the risk.
//         </p>
//       </div>

//       {/* SCANNER COMPONENT (The Brain) */}
//       <Analyzer />

//       {/* FEATURES GRID (The Trust Signals) */}
//       <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
//         {/* Card 1 */}
//         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
//           <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
//             <BrainCircuit className="w-6 h-6 text-blue-400" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">Natural Language AI</h3>
//           <p className="text-gray-400 text-sm">
//             Uses Random Forest & TF-IDF to analyze grammar, style, and urgency patterns in the text description.
//           </p>
//         </div>

//         {/* Card 2 */}
//         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
//           <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
//             <Globe className="w-6 h-6 text-purple-400" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">Domain Forensics</h3>
//           <p className="text-gray-400 text-sm">
//             Instantly checks domain age and WHOIS data. Flags sites created less than 30 days ago.
//           </p>
//         </div>

//         {/* Card 3 */}
//         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
//           <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
//             <Lock className="w-6 h-6 text-green-400" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">Pattern Recognition</h3>
//           <p className="text-gray-400 text-sm">
//             Detects "Money Traps" like security deposits, registration fees, and hidden Telegram links.
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }


import Analyzer from "@/components/Analyzer";
import { BrainCircuit, Lock, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="relative pb-32 overflow-hidden">

      {/* GLOBAL BACKGROUND GLOW SYSTEM */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-blue-600/10 blur-[160px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-purple-600/10 blur-[160px] rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />

      {/* ================= HERO SECTION ================= */}
      <section className="text-center space-y-8 py-24 md:py-32 relative max-w-6xl mx-auto px-6">

        {/* AI Status Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          AI Neural Engine Active
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white">
          Is that Job{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 animate-gradient-x">
            Real or Fake?
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          The world’s first{" "}
          <span className="text-blue-200 font-semibold">
            AI-powered job scam intelligence system
          </span>
          . Paste a job description and let our neural network perform
          domain forensics, pattern recognition, and sentiment intelligence.
        </p>

      </section>

      {/* ================= ANALYZER ================= */}
      <div className="relative z-10">
        <Analyzer />
      </div>

      {/* ================= FEATURES ================= */}
      <section className="mt-40 max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight text-white mb-4">
            Multi-Layer Threat Detection
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our system doesn’t just read job descriptions. It performs
            full-spectrum AI and OSINT analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">

          {/* Card 1 */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/40 to-transparent hover:from-blue-500 transition-all">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-3 transition-all duration-500">

              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 shadow-inner">
                <BrainCircuit className="w-7 h-7 text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Neural Language AI
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Uses advanced NLP models including Random Forest & TF-IDF
                to detect urgency manipulation, grammar anomalies,
                and coercive language patterns.
              </p>

            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 to-transparent hover:from-purple-500 transition-all">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-3 transition-all duration-500">

              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 shadow-inner">
                <Globe className="w-7 h-7 text-purple-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Domain Forensics
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Performs WHOIS analysis, domain age verification,
                and digital footprint checks to flag suspicious
                newly created websites.
              </p>

            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-green-500/40 to-transparent hover:from-green-500 transition-all">
            <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-xl hover:-translate-y-3 transition-all duration-500">

              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30 shadow-inner">
                <Lock className="w-7 h-7 text-green-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Pattern Recognition
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Detects hidden “money traps” like security deposits,
                registration fees, crypto payments, and Telegram-based
                recruitment scams.
              </p>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}