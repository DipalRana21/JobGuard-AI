"use client";
import { useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, XCircle, Search, Loader2, Globe, ShieldAlert, Briefcase, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { MessageSquare, ThumbsDown, ThumbsUp, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the shape of the API response (TypeScript Magic)
interface ScanResult {
  prediction: "Real" | "Fake" | "Suspicious";
  risk_score: number;
  domain_status: string;
  domain_age_days: number | string;
  company_analysis?: {
    status: string;
    score: number;
    sources: { source: string; title: string; url: string; icon: string }[];
  };
  sentiment_analysis?: {
    average_score: number;
    status: string;
    mentions: { source: string; text: string; url: string; sentiment: string }[];
  };
}

export default function Analyzer() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showReport, setShowReport] = useState(false);

  const router = useRouter();

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Connect to your Python Backend
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text: text,
        url: url,
        company_name: companyName
      });
      setResult(response.data);
    } catch (err) {
      setError("Server Error. Is the Python backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Traffic Light Logic for Colors
  const getStatusColor = (status: string) => {
    if (status === "Fake") return "from-red-500/20 to-red-900/20 border-red-500/50 text-red-200";
    if (status === "Suspicious") return "from-yellow-500/20 to-yellow-900/20 border-yellow-500/50 text-yellow-200";
    return "from-green-500/20 to-green-900/20 border-green-500/50 text-green-200";
  };

  const getIcon = (status: string) => {
    if (status === "Fake") return <XCircle className="w-12 h-12 text-red-500" />;
    if (status === "Suspicious") return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    return <CheckCircle className="w-12 h-12 text-green-500" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* INPUT CARD: Glassmorphism Style */}
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Job Description</label>
            <textarea
              className="w-full h-40 bg-[#0f172a]/60 border border-blue-500/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              placeholder="Paste the job post here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Company Name (For Background Check)</label>
            <input
              type="text"
              className="w-full bg-[#0f172a]/60 border border-blue-500/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="e.g. Infosys, Sharma Startups Pvt Ltd"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text}
            className={clsx(
              "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
              loading || !text
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-1"
            )}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            {loading ? "Scanning Neural Network..." : "Analyze Job Risk"}
          </button>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>

      {/* RESULT CARD: Animated Pop-up */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
              "mt-8 p-1 rounded-2xl bg-gradient-to-br shadow-2xl overflow-hidden",
              getStatusColor(result.prediction)
            )}
          >
            <div className="bg-[#0f172a]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Left: Verdict Icon & Text */}
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-inner">
                    {getIcon(result.prediction)}
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-1">
                      AI Verdict
                    </h3>
                    <h2 className={clsx("text-4xl font-black tracking-tight",
                      result.prediction === "Fake" ? "text-red-400" :
                        result.prediction === "Suspicious" ? "text-yellow-400" : "text-green-400"
                    )}>
                      {result.prediction.toUpperCase()}
                    </h2>
                  </div>
                </div>

                {/* Right: Risk Score */}
                <div className="text-center md:text-right">
                  <div className="text-5xl font-mono font-bold text-white mb-1">
                    {result.risk_score}%
                  </div>
                  <div className="text-sm text-gray-400">Probability of Fraud</div>
                </div>
              </div>

              <div className="w-full h-px bg-white/10 my-6" />

              {/* Analysis Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-blue-300">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Domain Analysis</span>
                  </div>
                  <p className="text-gray-300 text-sm">

                    Age: <span className="text-white font-mono">
                      {typeof result.domain_age_days === 'number'
                        ? `${result.domain_age_days} days`
                        : "N/A (Hidden/Proxy)"}
                    </span>

                  </p>
                </div>

                {/* COMPANY ANALYSIS CARD */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-purple-300">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Company Background</span>
                    </div>

                    {result.company_analysis?.status !== "Not Analyzed" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span className={clsx(
                            "font-medium",
                            result.company_analysis?.score! >= 60 ? "text-green-400" : "text-red-400"
                          )}>
                            {result.company_analysis?.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No company name provided.</p>
                    )}
                  </div>

                  {/* NEW: View Report Button */}
                  {result.company_analysis?.sources && result.company_analysis.sources.length > 0 && (
                    <button
                      onClick={() => (router.push(`/report/${encodeURIComponent(companyName)}`) , setShowReport(true))}
                      className="mt-4 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-3 h-3" />
                      View Intelligence Report
                    </button>
                  )}
                </div>


                {/* COMMUNITY SENTIMENT CARD */}
                <div className="md:col-span-2 bg-white/5 p-6 rounded-lg border border-white/5 mt-4">
                  <div className="flex items-center gap-2 mb-4 text-pink-300">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase">Community Sentinel (Reddit/Twitter/Glassdoor)</span>
                  </div>

                  {result.sentiment_analysis ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: The Meter */}
                      <div className="flex flex-col justify-center items-center">
                        <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.sentiment_analysis.average_score}%` }}
                            className={clsx("h-full rounded-full transition-all duration-1000",
                              result.sentiment_analysis.average_score < 40 ? "bg-red-500" :
                                result.sentiment_analysis.average_score < 70 ? "bg-yellow-500" : "bg-green-500"
                            )}
                          />
                        </div>
                        <div className="flex justify-between w-full text-xs text-gray-400 mt-2">
                          <span>Toxic</span>
                          <span>Neutral</span>
                          <span>Safe</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mt-2">{result.sentiment_analysis.status}</h3>
                      </div>

                      {/* Right: Discussions OR Clean Record Message */}
                      <div className="space-y-3">
                        {result.sentiment_analysis.mentions.length > 0 ? (
                          result.sentiment_analysis.mentions.map((m, i) => (
                            <a key={i} href={m.url} target="_blank" className="block bg-[#0f172a] p-3 rounded-lg border border-white/5 hover:border-pink-500/30 transition-all text-xs group">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-pink-400 group-hover:text-pink-300">{m.source}</span>
                                <span className={clsx("px-2 py-0.5 rounded text-[10px]",
                                  m.sentiment === "Negative" ? "bg-red-500/20 text-red-300" :
                                    m.sentiment === "Positive" ? "bg-green-500/20 text-green-300" : "bg-gray-700 text-gray-300"
                                )}>{m.sentiment}</span>
                              </div>
                              <p className="text-gray-300 truncate">{m.text}</p>
                            </a>
                          ))
                        ) : (
                          // THIS IS THE NEW "HONEST" UI FOR B2B COMPANIES
                          <div className="flex flex-col items-center justify-center h-full p-4 bg-green-500/5 border border-green-500/20 rounded-lg text-center">
                            <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                            <h4 className="text-white font-bold text-sm">No Red Flags Found</h4>
                            <p className="text-xs text-gray-400 mt-1">
                              We searched Reddit, Quora, and Glassdoor but found no verified scam reports or toxic discussions. This is a positive sign.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No community data available.</p>
                  )}
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-blue-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Safety Log</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {result.domain_status}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED REPORT MODAL */}
      <AnimatePresence>
        {showReport && result?.company_analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Digital Footprint Report</h2>
                    <p className="text-sm text-purple-300">Target: {companyName}</p>
                  </div>
                </div>
                <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Score Section */}
                <div className="flex items-center gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-center">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-blue-500">
                      {result.company_analysis.score}/100
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Trust Score</div>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div>
                    <h3 className="text-white font-medium mb-1">{result.company_analysis.status}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Our OSINT engine has scanned regulatory databases and professional networks.
                      {result.company_analysis.score >= 60
                        ? " The entity has a confirmed digital presence."
                        : " The entity lacks a standard digital footprint."}
                    </p>
                  </div>
                </div>

                {/* Evidence List */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verified Sources Found</h4>
                  <div className="space-y-3">
                    {result.company_analysis.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        // FIX: Added 'overflow-hidden' to the main container
                        className="flex items-center gap-4 p-4 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-white/5 rounded-xl transition-all group overflow-hidden"
                      >
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        {/* FIX: Added 'min-w-0' to allow truncation within a flex child */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-white font-medium text-sm group-hover:text-blue-200 transition-colors truncate">
                            {source.title}
                          </h5>
                          {/* FIX: 'truncate' now works because of the parent's 'min-w-0' */}
                          <p className="text-xs text-gray-500 mt-1 truncate block">{source.url}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/20 text-center border-t border-white/5">
                <p className="text-xs text-gray-500">Generated by JobGuard OSINT Engine • Live Web Search</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}