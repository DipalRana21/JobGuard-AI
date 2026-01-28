"use client";
import { useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, XCircle, Search, Loader2, Globe, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Define the shape of the API response (TypeScript Magic)
interface ScanResult {
  prediction: "Real" | "Fake" | "Suspicious";
  risk_score: number;
  domain_status: string;
  domain_age_days: number | string;
}

export default function Analyzer() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Connect to your Python Backend
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text: text,
        url: url || "https://example.com"
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
            <label className="block text-sm font-medium text-blue-200 mb-2">Company Website (Optional)</label>
            <div className="relative">
              <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                className="w-full bg-[#0f172a]/60 border border-blue-500/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. google.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
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
                    Age: <span className="text-white font-mono">{result.domain_age_days} days</span>
                  </p>
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
    </div>
  );
}