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

  useEffect(() => {
    if(status === "authenticated") {
      const fetchHistory = async () => {
        try {
          const res = await axios.get("/api/scans");
          setScans(res.data);
        } catch (error) {
          console.error("Error loading history", error);
        }
        finally{
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
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/10 bg-white/5 p-6 flex flex-col justify-between hidden md:flex backdrop-blur-xl">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">JobGuard</span>
          </Link>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold transition-all border border-blue-500/20">
              <LayoutDashboard className="w-5 h-5" /> Overview
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <History className="w-5 h-5" /> Scan History
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Settings className="w-5 h-5" /> Settings
            </button>
          </nav>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-medium transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
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
          <h1 className="text-3xl font-black mb-2">Welcome back, {session.user?.name?.split(" ")[0]}</h1>
          <p className="text-gray-400">Here is your digital forensics overview for today.</p>
        </div>

        {/* QUICK STATS CARDS */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Activity className="w-6 h-6" /></div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1">{scans.length}</h3>
            <p className="text-sm text-gray-400 font-medium">Total Companies Scanned</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><AlertTriangle className="w-6 h-6" /></div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1">0</h3>
            <p className="text-sm text-gray-400 font-medium">Critical Threats Found</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 border border-white/10 p-6 rounded-2xl flex flex-col justify-center items-center text-center hover:opacity-90 transition-opacity cursor-pointer shadow-xl shadow-blue-500/20">
            <Plus className="w-10 h-10 text-white mb-2" />
            <h3 className="text-lg font-bold text-white">New Scan</h3>
            <p className="text-xs text-blue-200 mt-1">Initialize a new investigation</p>
          </div>
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
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${
                    scan.status === "Safe" ? "bg-green-500/20" : 
                    scan.status === "Warning" ? "bg-orange-500/20" : "bg-red-500/20"
                  }`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-gray-500">{new Date(scan.createdAt).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                      scan.status === "Safe" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      scan.status === "Warning" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {scan.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {scan.companyName}
                  </h3>
                  <div className="flex items-end gap-2 mt-4">
                    <span className="text-3xl font-black text-white">{scan.riskScore}</span>
                    <span className="text-sm text-gray-500 mb-1">Risk Score</span>
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