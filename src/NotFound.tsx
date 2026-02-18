import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TypingText from "@/TypingText";

const NotFound = () => {
  const location = useLocation();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x: y * -1, y: x * 1.5 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [location.pathname]);

  return (
    <main className="bg-background text-foreground min-h-screen cursor-crosshair relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute -top-[25%] -left-[0%] w-[130%] h-[180%] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(100,100,255,0.04)_40%,transparent_80%)] blur-[80px]"
          style={{
            rotate: -35,
            x: tilt.y * 30,
            y: tilt.x * 30,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.05),transparent_60%)]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <motion.div
          className="font-mono text-xs text-muted-foreground/40 tracking-widest uppercase mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          err_code: 404_not_found
        </motion.div>

        <motion.h1
          className="font-display font-bold text-[clamp(4rem,15vw,10rem)] leading-none tracking-tighter mb-8 select-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x * 2}deg) rotateY(${tilt.y * 2}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          LOST_
        </motion.h1>

        <div className="font-mono text-sm text-muted-foreground mb-12 h-6">
          <TypingText
            text="requested path does not exist in this iteration."
            delay={40}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Link
            to="/"
            className="group relative inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] border border-foreground/20 px-8 py-4 transition-all duration-300 hover:bg-foreground hover:text-background"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              re-calibrate
            </span>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-8 font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.3em] select-none">
        xylen.void // 0.0.0
      </div>
    </main>
  );
};

export default NotFound;
