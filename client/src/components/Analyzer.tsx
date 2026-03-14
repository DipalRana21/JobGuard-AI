"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, XCircle, Search, Loader2, Globe, ShieldAlert, Briefcase, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { MessageSquare, ThumbsDown, ThumbsUp, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

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
  const { data: session } = useSession();

  useEffect(() => {
    const savedText = localStorage.getItem("draft_text");
    const savedCompany = localStorage.getItem("draft_company");
    const savedUrl = localStorage.getItem("draft_url");

    if (savedText) setText(savedText);
    if (savedCompany) setCompanyName(savedCompany);
    if (savedUrl) setUrl(savedUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem("draft_text", text);
    localStorage.setItem("draft_company", companyName);
    localStorage.setItem("draft_url", url);
  }, [text, companyName, url]);

 const handleAnalyze = async () => {
    if (!text) return;

    if (!session) {
      // signIn() automatically handles the redirect. 
      signIn(undefined, { callbackUrl: '/' }); 
      return; 
    }

    setLoading(true);
    setError("");
    setResult(null);

   // 🕵️‍♂️ 1. GET OR CREATE A DIGITAL FINGERPRINT FOR THIS TAB
    let myTabId = sessionStorage.getItem("tab_id");
    if (!myTabId) {
      myTabId = Math.random().toString(36).substring(7);
      sessionStorage.setItem("tab_id", myTabId);
    }

    // 📡 2. FIRE THE RADAR (Include your fingerprint!)
    try {
      await fetch("http://127.0.0.1:5000/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          company_name: companyName || "Unknown",
          sender_id: myTabId // 👈 Send it to Python
        }), 
      });
    } catch (err) {
      console.log("Radar ping failed", err);
    }

    try {
      // 🐢 2. NOW START THE HEAVY ML PREDICTION
      // By the time this runs, the blue alert is already sliding down the screen
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text: text,
        url: url,
        company_name: companyName
      });

      const mlData = response.data;
      setResult(mlData);

      // 3. DIRECTLY SAVE THE EXACT ML RISK SCORE TO DATABASE
      if (session?.user && companyName) {
        const generatedReportId = `REP-${companyName.substring(0, 3).toUpperCase()}-${Date.now()}`;

        await axios.post("/api/scans", {
          reportId: generatedReportId,
          companyName: companyName,
          riskScore: mlData.risk_score,
        });
        console.log("✅ Exact ML Risk Score saved to database!");

      // Clear the browser memory since the scan was successful
      localStorage.removeItem("draft_text");
      localStorage.removeItem("draft_company");
      localStorage.removeItem("draft_url");
      }
      
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
    <div className="relative w-full max-w-5xl mx-auto">

      {/* ================= INPUT CARD ================= */}
      <div className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/40 to-transparent mb-10">
        <div className="bg-[#0f172a]/90 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">

          <div className="space-y-6">
            <div>
              <label className="font-heading block text-sm font-bold text-blue-300 mb-2 uppercase tracking-widest">
                Job Description
              </label>
              <textarea
                className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500/40 transition resize-none"
                placeholder="Paste the job post here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/40 transition"
            />

            <input
              type="url"
              placeholder="Application Link (Optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/40 transition"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !text}
              className={clsx(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                loading || !text
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
              )}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              {loading ? "Running Neural Scan..." : "Launch AI Scan"}
            </button>

            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          </div>
        </div>
      </div>

      {/* ================= RESULT PANEL ================= */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mt-12 group"
          >
            {/* === DANCING BACKGROUND LIGHTS === */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />

            {/* === GRADIENT BORDER WRAPPER === */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40 transition-all duration-700">

              <div className="relative bg-gradient-to-br from-[#0b1220]/95 via-[#0f172a]/95 to-[#0b1220]/95 backdrop-blur-3xl p-12 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden">

                {/* Subtle scan overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* ================= VERDICT SECTION ================= */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">

                  {/* LEFT */}
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                      <div className="relative p-6 rounded-full bg-black/40 border border-white/10 shadow-inner">
                        {getIcon(result.prediction)}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">
                        AI Verdict
                      </p>
                      <h2 className={clsx(
                        "text-5xl font-black tracking-tight",
                        result.prediction === "Fake" && "text-red-400",
                        result.prediction === "Suspicious" && "text-yellow-400",
                        result.prediction === "Real" && "text-green-400"
                      )}>
                        {result.prediction.toUpperCase()}
                      </h2>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-center md:text-right">
                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 animate-pulse">
                      {result.risk_score}%
                    </div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">
                      Fraud Probability
                    </p>
                  </div>
                </div>

                {/* Risk Bar */}
                <div className="mt-12">
                  <div className="relative h-4 w-full bg-gray-700/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.risk_score}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-white/10 my-12" />

                {/* ================= DETAILS GRID ================= */}
                <div className="grid md:grid-cols-2 gap-8">

                  {/* DOMAIN ANALYSIS */}
                  <div className="relative group h-full">
                    {/* Animated border sweep */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/30 via-transparent to-cyan-500/30 opacity-0 group-hover:opacity-100 transition duration-700 blur-sm" />

                    <div className="relative h-full bg-gradient-to-br from-[#0c1629] to-[#0b1220] p-10 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1">

                      <div>
                        <div className="flex items-center gap-3 text-blue-300 mb-6">
                          <Globe className="w-6 h-6" />
                          <span className="uppercase text-sm tracking-[0.3em] font-semibold">
                            Domain Analysis
                          </span>
                        </div>

                        <p className="text-gray-400 text-base">Domain Age</p>
                        <p className="text-3xl font-semibold text-white mt-2 tracking-tight">
                          {typeof result.domain_age_days === "number"
                            ? `${result.domain_age_days.toLocaleString()} days`
                            : "N/A"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* COMPANY BACKGROUND */}
                  <div className="relative group h-full">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-transparent to-indigo-500/30 opacity-0 group-hover:opacity-100 transition duration-700 blur-sm" />

                    <div className="relative h-full bg-gradient-to-br from-[#140f22] to-[#0b1220] p-10 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1">

                      <div>
                        <div className="flex items-center gap-3 text-purple-300 mb-6">
                          <Briefcase className="w-6 h-6" />
                          <span className="uppercase text-sm tracking-[0.3em] font-semibold">
                            Company Background
                          </span>
                        </div>

                        {result.company_analysis?.status !== "Not Analyzed" ? (
                          <>
                            <p className="text-gray-400 text-base">Status</p>
                            <p className={clsx(
                              "text-3xl font-semibold mt-2 tracking-tight",
                              (result.company_analysis?.score ?? 0) >= 60
                                ? "text-green-400"
                                : "text-red-400"
                            )}>
                              {result.company_analysis?.status}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500 italic text-base mt-4">
                            No company name provided.
                          </p>
                        )}
                      </div>

                      {result.company_analysis?.sources && result.company_analysis.sources.length > 0 && (
                        <button
                          onClick={() => router.push(`/report/${encodeURIComponent(companyName)}`)}
                          className="mt-8 w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm uppercase tracking-[0.2em] font-semibold transition-all"
                        >
                          View Intelligence Report
                        </button>
                      )}

                    </div>
                  </div>

                  {/* COMMUNITY SENTINEL */}
                  <div className="md:col-span-2 relative group p-[1px] rounded-2xl bg-gradient-to-r from-pink-500/30 via-purple-500/20 to-blue-500/30">
                    <div className="bg-black/50 p-10 rounded-2xl border border-white/10">

                      <div className="flex items-center gap-3 text-pink-300 mb-8">
                        <MessageSquare className="w-5 h-5" />
                        <span className="uppercase text-xs tracking-widest font-bold">
                          Community Sentinel
                        </span>
                      </div>

                      {result.sentiment_analysis ? (
                        <div className="grid md:grid-cols-2 gap-12">

                          {/* Meter */}
                          <div>
                            <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.sentiment_analysis.average_score}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                              />
                            </div>

                            <h3 className="text-3xl font-black text-white mt-6">
                              {result.sentiment_analysis.status}
                            </h3>
                          </div>

                          {/* Mentions */}
                          <div className="space-y-4">
                            {result.sentiment_analysis.mentions.length > 0 ? (
                              result.sentiment_analysis.mentions.map((m, i) => (
                                <a
                                  key={i}
                                  href={m.url}
                                  target="_blank"
                                  className="block bg-[#0f172a]/80 p-5 rounded-xl border border-white/10 hover:border-pink-500/40 hover:-translate-y-1 transition-all duration-300"
                                >
                                  <div className="flex justify-between mb-2">
                                    <span className="font-bold text-pink-400">
                                      {m.source}
                                    </span>
                                    <span className="text-xs uppercase text-gray-400">
                                      {m.sentiment}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm truncate">
                                    {m.text}
                                  </p>
                                </a>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                <ThumbsUp className="w-10 h-10 text-green-400 mb-3" />
                                <h4 className="text-white font-bold text-sm uppercase">
                                  No Red Flags Found
                                </h4>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No community data available.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SAFETY LOG */}
                  <div className="md:col-span-2 relative group">

                    {/* Animated subtle shimmer */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition duration-700 blur-sm" />

                    <div className="relative bg-gradient-to-br from-[#0a1626] to-[#0b1220] p-10 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 shadow-lg hover:-translate-y-1 overflow-hidden">

                      {/* Scan line animation */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/40">
                          <ShieldAlert className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="uppercase text-sm tracking-[0.3em] font-semibold text-blue-300">
                          Security & Safety Log
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                        <p className="text-base font-mono text-gray-200 leading-relaxed tracking-wide">
                          {result.domain_status}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}