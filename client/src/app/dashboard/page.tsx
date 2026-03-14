"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Shield, LayoutDashboard, History, Settings, LogOut,
  Search, Activity, AlertTriangle, FileText, Plus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State to hold the database reports
  const [scans, setScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  const handleLogout = async () => {
    // 1. Wipe the drafts from the browser for privacy
    localStorage.removeItem("draft_text");
    localStorage.removeItem("draft_company");
    localStorage.removeItem("draft_url");

    // 2. Terminate the session and send them back to the homepage
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchHistory = async () => {
        try {
          const res = await axios.get("/api/scans");
          setScans(res.data);
        } catch (error) {
          console.error("Error loading history", error);
        }
        finally {
          setLoadingScans(false);
        }
      };
      fetchHistory();
    }
  }, [status]);

  // Route Protection: Kick unauthenticated users back to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show a sleek loading spinner while checking the session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-400 animate-pulse font-mono text-sm uppercase tracking-widest">
            Verifying Identity...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flashing content before redirect
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex font-sans relative overflow-hidden">

      {/* Background Lighting System */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />

      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-white/10 bg-gradient-to-b from-[#111827]/90 to-[#0f172a]/90 backdrop-blur-2xl p-8 flex flex-col justify-between hidden md:flex shadow-xl">

        <div>
          <Link href="/" className="flex items-center gap-4 mb-14 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-xl group-hover:opacity-100 opacity-60 transition" />
              <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight">JobGuard</span>
          </Link>

          <nav className="space-y-3">
            <button className="w-full flex items-center gap-3 px-5 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-semibold border border-blue-500/20">
              <LayoutDashboard className="w-5 h-5" /> Overview
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <History className="w-5 h-5" /> Scan History
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Settings className="w-5 h-5" /> Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </nav>
        </div>


      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">

        {/* TOP NAV / USER PROFILE */}
        <header className="flex justify-between items-center mb-12">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search past intelligence reports..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{session.user?.name}</p>
              <p className="text-xs text-gray-400">{session.user?.email}</p>
            </div>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full border-2 border-white/10 shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold border-2 border-white/10">
                {session.user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </header>

        {/* WELCOME SECTION */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-3 tracking-tight">
            Welcome back, {session.user?.name?.split(" ")[0]}
          </h1>

          <p className="text-gray-400 text-base">
            Your AI-driven digital forensics overview.
          </p>

        </div>

        {/* QUICK STATS CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">

          {/* ===== TOTAL SCANS ===== */}
          <div className="relative group h-full">

            {/* Glow Layer */}
            <div className="absolute inset-0 bg-blue-600/10 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-3xl" />

            <div className="relative bg-gradient-to-br from-[#0f172a] to-[#111827] p-10 rounded-3xl border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.08)] hover:-translate-y-1 h-full flex flex-col justify-between">

              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-blue-500/15 rounded-2xl border border-blue-500/20">
                  <Activity className="w-7 h-7 text-blue-400" />
                </div>
              </div>

              <div>
                <h3 className="text-5xl font-extrabold tracking-tight text-white mb-3">
                  {scans.length}
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Total Companies Scanned
                </p>
              </div>

            </div>
          </div>


          {/* ===== CRITICAL THREATS ===== */}
          <div className="relative group h-full">

            <div className="absolute inset-0 bg-red-600/10 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-3xl" />

            <div className="relative bg-gradient-to-br from-[#0f172a] to-[#111827] p-10 rounded-3xl border border-red-500/20 hover:border-red-400/50 transition-all duration-300 shadow-[0_0_40px_rgba(239,68,68,0.08)] hover:-translate-y-1 h-full flex flex-col justify-between">

              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-red-500/15 rounded-2xl border border-red-500/20">
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>
              </div>

              <div>
                <h3 className="text-5xl font-extrabold tracking-tight text-white mb-3">
                  0
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Critical Threats Found
                </p>
              </div>

            </div>
          </div>


          {/* ===== NEW SCAN ===== */}
          <Link
            href="/"
            className="relative group h-full"
          >

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-2xl opacity-70 group-hover:opacity-100 transition duration-500 rounded-3xl" />

            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-10 rounded-3xl border border-white/10 transition-all duration-300 shadow-[0_0_50px_rgba(99,102,241,0.25)] hover:-translate-y-1 h-full flex flex-col items-center justify-center text-center">

              <Plus className="w-12 h-12 text-white mb-5 opacity-90 group-hover:scale-110 transition-transform duration-300" />

              <h3 className="text-2xl font-bold text-white mb-2">
                New Scan
              </h3>

              <p className="text-base text-blue-200">
                Initialize Investigation
              </p>

            </div>
          </Link>

        </div>
        {/* RECENT ACTIVITY */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" /> Recent Intelligence Reports
          </h2>

          {loadingScans ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scans.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No scans recorded yet</h3>
              <p className="text-gray-400 max-w-sm mb-6 text-sm">Start a new scan to analyze a company's digital footprint.</p>
              <Link href="/" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Go to Scanner
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {scans.map((scan) => (
                <Link
                  href={`/report/${encodeURIComponent(scan.companyName)}`}
                  key={scan.id}
                  className="relative group p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent"
                >
                  <div className="bg-[#111827]/95 p-8 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all shadow-lg hover:-translate-y-1 overflow-hidden">

                    {/* Risk glow */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 blur-3xl opacity-20 ${scan.riskScore < 30 ? "bg-green-500" :
                      scan.riskScore < 70 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} />

                    <div className="flex justify-between mb-6 text-sm">
                      <span className="text-gray-500">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${scan.riskScore < 30 ? "bg-green-500/10 text-green-400" :
                        scan.riskScore < 70 ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                        {scan.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                      {scan.companyName}
                    </h3>

                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-black text-white">
                        {scan.riskScore}
                      </span>
                      <span className="text-base text-gray-400 mb-2">
                        Risk Score
                      </span>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}