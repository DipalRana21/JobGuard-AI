"use client";

import { signIn } from "next-auth/react";
import { Shield, Github, Mail } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Floating Background Lights */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/20 blur-[160px] rounded-full animate-pulse pointer-events-none" />

      {/* Radial Center Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />

      {/* Gradient Border Wrapper */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40">

        <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f172a]/95 via-[#111827]/95 to-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden">

          {/* Subtle Scan Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-12 relative z-10">

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-white tracking-tight mt-6">
              Secure Access
            </h1>

            <p className="text-gray-400 text-base text-center mt-3 max-w-xs leading-relaxed">
              Authenticate to access AI-powered corporate intelligence and digital forensics.
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-5 relative z-10">

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              className="relative w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-4 px-4 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 overflow-hidden"
            >
              {isLoadingGoogle ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              onClick={handleGithubLogin}
              disabled={isLoadingGithub}
              className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white py-4 px-4 rounded-xl font-semibold hover:scale-[1.02] hover:shadow-lg border border-white/10 transition-all disabled:opacity-70"
            >
              {isLoadingGithub ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              Continue with GitHub
            </button>

          </div>

          {/* Footer */}
          <div className="mt-12 text-center relative z-10">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 tracking-wide">
              <Mail className="w-4 h-4" />
              Secured by NextAuth • OAuth 2.0
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}