// "use client";

// import { signIn } from "next-auth/react";
// import { Shield, Github, Mail, Activity, Search, ShieldCheck } from "lucide-react";
// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";

// export default function LoginPage() {
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [githubLoading, setGithubLoading] = useState(false);

//   const searchParams = useSearchParams();
//   const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

//   const cardRef = useRef<HTMLDivElement>(null);

//   const loginGoogle = async () => {
//     setGoogleLoading(true);
//     await signIn("google", { callbackUrl });
//   };

//   const loginGithub = async () => {
//     setGithubLoading(true);
//     await signIn("github", { callbackUrl });
//   };

//   /* ================= MOUSE SPOTLIGHT ================= */

//   useEffect(() => {
//     const handleMove = (e: MouseEvent) => {
//       document.documentElement.style.setProperty("--x", `${e.clientX}px`);
//       document.documentElement.style.setProperty("--y", `${e.clientY}px`);
//     };

//     window.addEventListener("mousemove", handleMove);
//     return () => window.removeEventListener("mousemove", handleMove);
//   }, []);

//   /* ================= 3D CARD TILT ================= */

//   const handleMouseMove = (e: any) => {
//     const card = cardRef.current;
//     if (!card) return;

//     const rect = card.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const centerX = rect.width / 2;
//     const centerY = rect.height / 2;

//     const rotateX = (y - centerY) / 25;
//     const rotateY = (centerX - x) / 25;

//     card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
//   };

//   const resetTilt = () => {
//     const card = cardRef.current;
//     if (card) card.style.transform = "rotateX(0deg) rotateY(0deg)";
//   };

//   return (
//     <div className="relative min-h-screen w-full flex bg-[#050a16] text-white overflow-hidden font-sans">

//       {/* ================= GLOBAL STYLES ================= */}

//       <style>{`

//       body::before{
//         content:"";
//         position:fixed;
//         inset:0;
//         background: radial-gradient(circle at var(--x) var(--y),
//         rgba(59,130,246,0.15),
//         transparent 40%);
//         pointer-events:none;
//         z-index:1;
//       }

//       .cyber-grid{
//         background-image:
//         linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
//         background-size:40px 40px;
//         animation:gridMove 40s linear infinite;
//       }

//       @keyframes gridMove{
//         from{background-position:0 0;}
//         to{background-position:400px 400px;}
//       }

//       .radar{
//         width:450px;
//         height:450px;
//         border-radius:50%;
//         border:1px solid rgba(59,130,246,0.2);
//         position:absolute;
//         animation:spin 12s linear infinite;
//       }

//       .radar::after{
//         content:"";
//         position:absolute;
//         inset:0;
//         background:conic-gradient(
//         rgba(59,130,246,0.6),
//         transparent 40%);
//         border-radius:50%;
//       }

//       @keyframes spin{
//         from{transform:rotate(0deg);}
//         to{transform:rotate(360deg);}
//       }

//       .glow-btn{
//         position:relative;
//         overflow:hidden;
//       }

//       .glow-btn::before{
//         content:"";
//         position:absolute;
//         inset:-2px;
//         background:linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4);
//         opacity:0;
//         transition:0.4s;
//         filter:blur(10px);
//       }

//       .glow-btn:hover::before{
//         opacity:0.7;
//       }

//       .scan{
//         position:absolute;
//         width:100%;
//         height:2px;
//         background:linear-gradient(to right,transparent,#3b82f6,transparent);
//         animation:scan 3s linear infinite;
//       }

//       @keyframes scan{
//         from{top:0}
//         to{top:100%}
//       }

//       `}</style>

//       {/* ================= BACKGROUND ================= */}

//       <div className="absolute inset-0 cyber-grid" />

//       <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-600/20 blur-[180px] rounded-full" />
//       <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-600/20 blur-[180px] rounded-full" />

//       {/* ================= LEFT LOGIN ================= */}

//       <div className="w-full lg:w-1/2 flex items-center justify-center p-10 relative z-10">

//         <div
//           ref={cardRef}
//           onMouseMove={handleMouseMove}
//           onMouseLeave={resetTilt}
//           className="relative w-full max-w-md transition-transform duration-200"
//         >

//           <div className="scan" />

//           <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">

//             {/* LOGO */}

//             <div className="flex flex-col items-center mb-10">

//               <div className="relative">
//                 <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-xl animate-pulse"/>
//                 <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//                   <Shield className="w-10 h-10"/>
//                 </div>
//               </div>

//               <h1 className="text-3xl font-black mt-6">Secure Access</h1>

//               <p className="text-gray-400 text-sm text-center mt-2 max-w-xs">
//                 Authenticate to access JobGuard’s AI-powered corporate threat intelligence.
//               </p>

//             </div>

//             {/* GOOGLE */}

//             <button
//               onClick={loginGoogle}
//               disabled={googleLoading}
//               className="glow-btn relative w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white text-black font-semibold mb-4 hover:scale-[1.02] transition"
//             >
//               {googleLoading ? (
//                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/>
//               ) : (
//                 <>
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                 </svg>
//                 Continue with Google
//                 </>
//               )}
//             </button>

//             {/* GITHUB */}

//             <button
//               onClick={loginGithub}
//               disabled={githubLoading}
//               className="glow-btn w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#1f2937] border border-white/10 font-semibold hover:scale-[1.02] transition"
//             >
//               {githubLoading ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
//               ) : (
//                 <>
//                 <Github className="w-5 h-5"/>
//                 Continue with GitHub
//                 </>
//               )}
//             </button>

//             <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
//               <Mail className="w-3 h-3"/>
//               Secured by NextAuth • OAuth 2.0
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* ================= RIGHT SIDE ================= */}

//       <div className="hidden lg:flex w-1/2 items-center justify-center relative z-10">

//         <div className="radar"/>

//         <div className="max-w-xl p-16">

//           <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text mb-6">
//             JobGuard Intelligence Radar
//           </h2>

//           <p className="text-gray-400 text-lg mb-12">
//             Detect fraudulent companies before they reach your inbox using
//             AI-driven OSINT intelligence.
//           </p>

//           <div className="space-y-8">

//             <Feature icon={<Activity className="w-6 h-6 text-blue-400"/>}
//             title="Real-Time Threat Radar"
//             text="Continuous monitoring of suspicious company domains."/>

//             <Feature icon={<Search className="w-6 h-6 text-purple-400"/>}
//             title="Deep OSINT Scraping"
//             text="Cross-checking leadership records and online signals."/>

//             <Feature icon={<ShieldCheck className="w-6 h-6 text-emerald-400"/>}
//             title="AI Risk Scoring"
//             text="Machine learning powered trust score generation."/>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// function Feature({icon,title,text}:any){
//   return(
//     <div className="flex items-start gap-4">
//       <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
//         {icon}
//       </div>
//       <div>
//         <h3 className="font-bold text-lg">{title}</h3>
//         <p className="text-gray-500 text-sm mt-1">{text}</p>
//       </div>
//     </div>
//   )
// }

"use client";

import { signIn } from "next-auth/react";
import { Shield, Github, Mail, Activity, Search, ShieldCheck } from "lucide-react";
import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Refs for scoped animations (No global document mutations!)
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const loginGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  const loginGithub = async () => {
    setGithubLoading(true);
    await signIn("github", { callbackUrl });
  };

  /* ================= HIGH-PERFORMANCE MOUSE TRACKING ================= */
  const handleGlobalMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Scoped spotlight (doesn't bleed to other pages)
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);

    // 3D Card Tilt Physics
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const cardX = e.clientX - cardRect.left;
      const cardY = e.clientY - cardRect.top;

      const centerX = cardRect.width / 2;
      const centerY = cardRect.height / 2;

      // Dampened rotation for a premium, heavy feel
      const rotateX = ((cardY - centerY) / 30) * -1; 
      const rotateY = (cardX - centerX) / 30;

      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  };

  const handleGlobalMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleGlobalMouseMove}
      onMouseLeave={handleGlobalMouseLeave}
      className={`relative min-h-screen w-full flex bg-[#030712] text-white overflow-hidden ${inter.className} antialiased selection:bg-blue-500/30`}
    >
      {/* ================= SCOPED CSS (Tailwind Arbitrary Values) ================= */}
      <style>{`
        .spotlight-overlay {
          background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.12), transparent 40%);
        }
        .cyber-grid {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }
      `}</style>

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 cyber-grid pointer-events-none" />
      <div className="absolute inset-0 spotlight-overlay pointer-events-none z-0 transition-opacity duration-300" />
      
      <div className="absolute -top-[30%] -left-[10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[30%] -right-[10%] w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* ================= LEFT GRID (AUTH LOGIC) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 perspective-[2000px]">

        {/* The 3D Card */}
        <div
          ref={cardRef}
          className="relative w-full max-w-[420px] transition-transform duration-300 ease-out will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Animated Scanline Overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl z-20 pointer-events-none">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[scan_3s_linear_infinite]" />
          </div>

          <div className="relative backdrop-blur-2xl bg-[#0a0f1c]/80 border border-white/10 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            
            {/* LOGO */}
            <div className="flex flex-col items-center mb-10 transform-gpu" style={{ transform: "translateZ(30px)" }}>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-2xl animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mt-6 tracking-tight">Secure Access</h1>
              <p className="text-slate-400 text-sm text-center mt-2 max-w-[260px] leading-relaxed">
                Authenticate to access JobGuard’s AI-powered corporate threat intelligence.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="space-y-4" style={{ transform: "translateZ(40px)" }}>
              {/* GOOGLE */}
              <button
                onClick={loginGoogle}
                disabled={googleLoading}
                className="group relative w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-slate-900 font-semibold transition-all hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 overflow-hidden"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* GITHUB */}
              <button
                onClick={loginGithub}
                disabled={githubLoading}
                className="group relative w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#1e293b] border border-white/5 font-semibold transition-all hover:bg-[#334155] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-70"
              >
                {githubLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                    Continue with GitHub
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center justify-center gap-2">
              <Mail className="w-3 h-3" />
              Secured by NextAuth • OAuth 2.0
            </div>

          </div>
        </div>
      </div>

      {/* ================= RIGHT GRID (SHOWCASE) ================= */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative z-10 border-l border-white/5">
        
        {/* CSS Radar Integrated into Background */}
        <div className="absolute right-[-10%] top-[10%] opacity-40 mix-blend-screen pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-blue-500/20 relative">
             <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(59,130,246,0.5)_100%)] animate-[spin_4s_linear_infinite]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/20 rounded-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-blue-500/20 rounded-full" />
          </div>
        </div>

        <div className="max-w-xl p-16 relative z-10">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
            Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Radar</span>
          </h2>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Detect fraudulent corporate entities before they reach your inbox using decentralized OSINT scraping and real-time neural networks.
          </p>

          <div className="space-y-6">
            <Feature 
              icon={<Activity className="w-5 h-5 text-blue-400" />}
              title="Real-Time Threat Radar"
              text="Live WebSocket pipeline monitoring suspicious domains globally."
            />
            <Feature 
              icon={<Search className="w-5 h-5 text-purple-400" />}
              title="Deep OSINT Scraping"
              text="Cross-referencing leadership records, registration data, and social signals."
            />
            <Feature 
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              title="AI Risk Scoring"
              text="Machine learning models generating instant, actionable trust scores."
            />
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Typing the Feature component properly
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function Feature({ icon, title, text }: FeatureProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/10">
      <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-200 text-base">{title}</h3>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}