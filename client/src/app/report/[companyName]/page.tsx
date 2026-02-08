"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MessageSquare, TrendingUp, Hash, 
  Code, Users, BrainCircuit, ExternalLink, CheckCircle 
} from "lucide-react"; // Import new icons

export default function DeepDiveReport() {
  const params = useParams();
  const router = useRouter();
  const companyName = decodeURIComponent(params.companyName as string);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post("http://127.0.0.1:5000/report", { company_name: companyName });
        setData(res.data);
      } catch (e) {
        console.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyName]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        <p className="text-blue-300 animate-pulse">Gathering Intelligence on {companyName}...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
      {/* HEADER */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Scanner
      </button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2 text-white">{data?.company_name}</h1>
          <p className="text-blue-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
            Report ID: {data?.report_id}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {data?.trust_score}
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider">Composite Trust Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: INTELLIGENCE CARDS --- */}
        <div className="space-y-6">
          
          {/* 1. LEADERSHIP CARD (New) */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"/>
            <h3 className="text-xs font-bold text-purple-300 uppercase mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Leadership Intelligence
            </h3>
            {data?.leadership ? (
               <div>
                 <p className="text-lg font-bold text-white leading-tight mb-2">
                   {data.leadership.source_title.split("-")[0]} 
                 </p>
                 <a href={data.leadership.url} target="_blank" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                   Verify on LinkedIn <ExternalLink className="w-3 h-3"/>
                 </a>
               </div>
            ) : (
              <p className="text-gray-500 text-sm">Leadership data hidden or private.</p>
            )}
          </div>

          {/* 2. INTERVIEW DIFFICULTY (New) */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold text-orange-300 uppercase mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> Interview Difficulty
            </h3>
            <div className="flex items-end gap-2 mb-2">
               <span className="text-3xl font-bold text-white">{data?.interview_difficulty}%</span>
               <span className="text-sm text-gray-400 mb-1">Hardness</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${data?.interview_difficulty > 50 ? 'bg-orange-500' : 'bg-green-500'}`} 
                 style={{ width: `${data?.interview_difficulty}%` }}
               />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data?.interview_difficulty > 60 ? "Heavy focus on DSA/LeetCode." : "Mostly behavioral & basic tech."}
            </p>
          </div>

          {/* 3. TECH STACK (New) */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold text-blue-300 uppercase mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" /> Tech Stack Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {data?.tech_stack?.length > 0 ? data.tech_stack.map((tech: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 font-mono">
                  {tech}
                </span>
              )) : <p className="text-gray-500 text-sm">No specific tech stack found.</p>}
            </div>
          </div>

           {/* 4. KEY THEMES (Renamed "Talking Points") */}
           <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold text-pink-300 uppercase mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4" /> Common Talking Points
            </h3>
            <div className="space-y-3">
              {data?.themes?.length > 0 ? data.themes.map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                   <span className="text-gray-300">{t.topic}</span>
                   <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                     {t.mentions} mentions
                   </span>
                </div>
              )) : <p className="text-gray-500 text-sm italic">No recurring patterns.</p>}
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: LIVE FEED (Scrollable) --- */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[750px]">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-md">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Live Intelligence Feed
              </h3>
              <div className="flex gap-2">
                 <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"/>
                 <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Live</span>
              </div>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {data?.feed?.map((item: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      item.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      item.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {item.sentiment}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {item.source}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-gray-200 group-hover:text-blue-300 transition-colors">
                    {item.text}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3 font-medium opacity-80">
                    {item.snippet}
                  </p>
                  <a href={item.url} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline">
                    Read Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
              
              {data?.feed?.length === 0 && (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500/20 mb-4" />
                  <p className="text-lg font-medium text-gray-400">Clean Digital Record</p>
                  <p className="text-sm mt-2 max-w-xs">Our forensic bots searched the web but found no significant public controversies.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}