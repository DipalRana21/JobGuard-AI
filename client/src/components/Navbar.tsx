// "use client";

// import { ShieldCheck, Menu, X, LayoutDashboard } from "lucide-react";
// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { usePathname } from "next/navigation";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const pathname = usePathname();

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 30);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const navLinks = [
//     { name: "Scan Job", href: "/" },
//     { name: "How It Works", href: "/about" },
//   ];

//   return (
//     <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
//       <motion.nav
//         initial={{ y: -80, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.6 }}
//         className={`relative w-full max-w-6xl transition-all duration-300 ${
//           scrolled
//             ? "bg-[#0f172a]/95 shadow-2xl border border-white/10"
//             : "bg-[#0f172a]/70 border border-white/5"
//         } backdrop-blur-xl rounded-2xl`}
//       >
//         <div className="flex items-center justify-between px-6 h-16">

//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-3 group">
//             <motion.div
//               whileHover={{ rotate: 15 }}
//               transition={{ type: "spring", stiffness: 200 }}
//             >
//               <ShieldCheck className="h-8 w-8 text-blue-500 group-hover:text-cyan-400 transition-colors duration-300" />
//             </motion.div>
//             <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
//               JobGuard AI
//             </span>
//           </Link>

//           {/* Desktop Links */}
//           <div className="hidden md:flex items-center gap-4">

//             {navLinks.map((link) => {
//               const isActive = pathname === link.href;
//               return (
//                 <Link key={link.name} href={link.href} className="relative px-4 py-2 text-sm font-medium">
//                   {isActive && (
//                     <motion.div
//                       layoutId="active-pill"
//                       className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-full"
//                       transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                     />
//                   )}

//                   <span
//                     className={`relative z-10 transition-colors duration-300 ${
//                       isActive
//                         ? "text-white"
//                         : "text-gray-400 group-hover:text-white"
//                     }`}
//                   >
//                     {link.name}
//                   </span>
//                 </Link>
//               );
//             })}

//             {/* Dashboard */}
//             <Link
//               href="/dashboard"
//               className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
//             >
//               <LayoutDashboard size={16} className="inline mr-2" />
//               Dashboard
//             </Link>

//           </div>

//           {/* Mobile Toggle */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-gray-300 hover:text-white transition-colors"
//             >
//               {isOpen ? <X size={26} /> : <Menu size={26} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Dropdown */}
//         <AnimatePresence>
//           {isOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="md:hidden px-6 pb-6"
//             >
//               <div className="flex flex-col gap-3 pt-3">

//                 {navLinks.map((link) => (
//                   <Link
//                     key={link.name}
//                     href={link.href}
//                     onClick={() => setIsOpen(false)}
//                     className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
//                   >
//                     {link.name}
//                   </Link>
//                 ))}

//                 <Link
//                   href="/dashboard"
//                   onClick={() => setIsOpen(false)}
//                   className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
//                 >
//                   Dashboard
//                 </Link>

//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.nav>
//     </div>
//   );
// }


"use client";

import { ShieldCheck, Menu, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Scan Job", href: "/" },
    { name: "How It Works", href: "/about" },
  ];

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "bg-[#0f172a]/95 shadow-2xl border-b border-white/10"
          : "bg-[#0f172a]/70 border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ShieldCheck className="h-8 w-8 text-blue-500 group-hover:text-cyan-400 transition-colors duration-300" />
            </motion.div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              JobGuard AI
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">

            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}

                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f172a] border-t border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-3">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}