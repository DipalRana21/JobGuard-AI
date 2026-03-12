"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Search, AlertTriangle, Lock } from "lucide-react";

export default function AboutPage() {
  const steps = [
    {
      icon: <Search size={28} />,
      title: "Submit Job Link",
      desc: "Paste any suspicious job posting and let our AI begin deep analysis.",
    },
    {
      icon: <AlertTriangle size={28} />,
      title: "AI Risk Analysis",
      desc: "We analyze red flags, scam patterns, domain trust & fraud indicators.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Instant Risk Score",
      desc: "Receive a clear safety rating with detailed explanation report.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/30 rounded-full blur-[120px]" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          How <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">JobGuard AI</span> Protects You
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg"
        >
          We combine AI intelligence with real-world scam detection patterns
          to protect job seekers from fraudulent postings.
        </motion.p>
      </section>

      {/* Steps Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">

          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-blue-500/40 transition-all duration-300"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* Why Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/20 rounded-3xl p-12"
        >
          <Lock size={40} className="mx-auto mb-6 text-blue-400" />
          <h2 className="text-3xl font-bold mb-4">
            Built for Job Seekers, Not Scammers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every year thousands lose money to fake recruiters.
            JobGuard AI gives you clarity before you share your data.
            No guesswork. No risk. Just verified insight.
          </p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="text-center pb-32 relative z-10">
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
        >
          Try JobGuard AI Now
        </motion.a>
      </section>
    </div>
  );
}