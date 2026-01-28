import Analyzer from "@/components/Analyzer";
import { Shield, BrainCircuit, Lock, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="pb-20">
      
      {/* HERO SECTION */}
      <div className="text-center space-y-6 py-16 md:py-24 relative">
        {/* Background Gradient Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
          Is that Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Real or Fake?</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The world's first <span className="text-blue-200 font-semibold">AI-powered scam detection system</span>. 
          Paste a job description below and let our Neural Network analyze the risk.
        </p>
      </div>

      {/* SCANNER COMPONENT (The Brain) */}
      <Analyzer />

      {/* FEATURES GRID (The Trust Signals) */}
      <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Natural Language AI</h3>
          <p className="text-gray-400 text-sm">
            Uses Random Forest & TF-IDF to analyze grammar, style, and urgency patterns in the text description.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Domain Forensics</h3>
          <p className="text-gray-400 text-sm">
            Instantly checks domain age and WHOIS data. Flags sites created less than 30 days ago.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pattern Recognition</h3>
          <p className="text-gray-400 text-sm">
            Detects "Money Traps" like security deposits, registration fees, and hidden Telegram links.
          </p>
        </div>

      </div>
    </div>
  );
}