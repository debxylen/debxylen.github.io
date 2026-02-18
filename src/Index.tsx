import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Instagram, MessageCircle, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import TypingText from "@/TypingText";

import {
  NAV_ITEMS,
  PROJECTS,
  STACK,
  LOG_ENTRIES,
  TRAITS,
  HERO_CONTENT,
  ABOUT_CONTENT,
  MARQUEE_TEXTS,
  FOOTER_CONTENT
} from "@/site-content";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const ScrollReveal = ({ children, delay = 0, className = "" }: ScrollRevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [aboutHover, setAboutHover] = useState<"left" | "right" | null>(null);

  const [selection, setSelection] = useState<{ start: { x: number; y: number }; current: { x: number; y: number } } | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  const spawnRipple = useCallback((x: number, y: number) => {
    const id = rippleId.current++;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setTilt({ x: y * -1, y: x * 1.5 });
      }

      setSelection(prev => {
        if (!prev) return null;
        return { ...prev, current: { x: e.clientX, y: e.clientY } };
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
      spawnRipple(e.clientX, e.clientY);
      setSelection({
        start: { x: e.clientX, y: e.clientY },
        current: { x: e.clientX, y: e.clientY }
      });
    };

    const handleMouseUp = () => {
      setSelection(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [spawnRipple]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-background text-foreground min-h-screen cursor-crosshair">
      <style>{`
        @keyframes ripple-expand {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          15%  { opacity: 0.67; }
          100% { transform: translate(-50%, -50%) scale(var(--scale)); opacity: 0; }
        }
        .ripple-ring {
          position: fixed;
          z-index: 99;
          pointer-events: none;
          border-radius: 50%;
          mix-blend-mode: difference;
          border: 1px solid white;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple-expand var(--duration) cubic-bezier(0.2, 0, 0, 1) forwards;
        }
      `}</style>

      {ripples.map(r => (
        <div key={r.id}>
          {[
            { d: '0.9s', s: 0.6 },
            { d: '1.2s', s: 1.2 }
          ].map((conf, i) => (
            <div
              key={`${r.id}-${i}`}
              className="ripple-ring"
              style={{
                left: r.x,
                top: r.y,
                width: 200,
                height: 200,
                '--duration': conf.d,
                '--scale': conf.s
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}

      {selection && (() => {
        const w = Math.abs(selection.start.x - selection.current.x);
        const h = Math.abs(selection.start.y - selection.current.y);
        const goingRight = selection.current.x >= selection.start.x;
        const goingDown = selection.current.y >= selection.start.y;
        const labelX = goingRight ? selection.current.x + 8 : selection.current.x - 8;
        const labelY = goingDown ? selection.current.y + 6 : selection.current.y - 26;
        return (
          <>
            <div
              className="fixed z-[100] pointer-events-none bg-white mix-blend-difference border border-white/20"
              style={{
                left: Math.min(selection.start.x, selection.current.x),
                top: Math.min(selection.start.y, selection.current.y),
                width: w,
                height: h,
              }}
            />
            {Math.round(w) > 0 && Math.round(h) > 0 && <div
              className="fixed z-[101] pointer-events-none font-mono text-[9px] uppercase tracking-wider whitespace-nowrap bg-background text-foreground/70 px-1.5 py-0.5 border border-foreground/20"
              style={{
                left: labelX,
                top: labelY,
                transform: goingRight ? "none" : "translateX(-100%)",
              }}
            >
              delta: {Math.round(w)} x {Math.round(h)}
            </div>}
          </>
        );
      })()}

      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 mix-blend-difference">
        <span className="font-mono text-xs text-foreground/60 tracking-widest">xylen.dev</span>
        <div className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="font-mono text-xs text-foreground/50 hover:text-foreground transition-colors duration-300 tracking-wider uppercase"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <section
        ref={heroRef}
        className="h-screen flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-24 relative overflow-hidden snap-center snap-always"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            className="absolute -top-[25%] -left-[0%] w-[130%] h-[180%] bg-[linear-gradient(180deg,rgba(255,255,255,0.15)_0%,rgba(100,100,255,0.06)_40%,transparent_80%)] blur-[80px]"
            style={{
              rotate: -35,
              x: tilt.y * 25,
              y: tilt.x * 25,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <motion.div
            className="font-mono text-xs text-muted-foreground/50 tracking-widest uppercase mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            ● online
          </motion.div>
          <motion.h1
            className="font-display font-bold text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight select-none"
            style={{
              transform: `perspective(2500px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            xylen
          </motion.h1>
          <div className="mt-6 font-mono text-sm text-muted-foreground max-w-md">
            <TypingText
              text={HERO_CONTENT.tagline}
              delay={55}
            />
          </div>
        </div>
        <div className="absolute bottom-8 right-8 font-mono text-[10px] text-muted-foreground/50 tracking-widest">
          scroll ↓
        </div>
      </section>

      <section
        id="about"
        className="relative min-h-[70vh] overflow-hidden group/about snap-center snap-always"
      >
        <div className="absolute inset-0 bg-background" />

        <div
          className="absolute inset-0 bg-foreground transition-all duration-700 ease-out"
          style={{
            clipPath: aboutHover === "left"
              ? "polygon(40.5% 0%, 100% 0%, 100% 100%, 60.5% 100%)"
              : aboutHover === "right"
                ? "polygon(39.5% 0%, 100% 0%, 100% 100%, 59.5% 100%)"
                : "polygon(40% 0%, 100% 0%, 100% 100%, 60% 100%)"
          }}
        />

        <div
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-[70vh] transition-all duration-700 ease-out"
          style={{
            gridTemplateColumns: aboutHover === "left"
              ? "1.005fr 0.995fr"
              : aboutHover === "right"
                ? "0.995fr 1.005fr"
                : "1fr 1fr"
          }}
        >
          <div
            onMouseEnter={() => setAboutHover("left")}
            onMouseLeave={() => setAboutHover(null)}
            className="px-6 md:px-12 lg:px-24 py-32 flex flex-col justify-center text-foreground transition-colors duration-500"
          >
            <ScrollReveal>
              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-8 uppercase">
                About
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="font-mono text-sm leading-relaxed max-w-sm text-muted-foreground">
                {ABOUT_CONTENT.paragraph}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-2 mt-8 max-w-sm">
                {TRAITS.map((trait) => (
                  <span
                    key={trait}
                    className="font-mono text-[10px] tracking-wider uppercase border border-foreground/50 px-3 py-1 text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div
            onMouseEnter={() => setAboutHover("right")}
            onMouseLeave={() => setAboutHover(null)}
            className="hidden md:flex items-center justify-end px-12 lg:px-24 py-32 text-background transition-colors duration-500"
          >
            <ScrollReveal delay={0.15}>
              <div className="font-mono text-xs leading-loose opacity-60 select-none text-right">
                {ABOUT_CONTENT.sideNotes.map((note, idx) => (
                  <div key={idx}>{note}</div>
                ))}
                <div className="mt-4">location: <span className="opacity-80">{ABOUT_CONTENT.location}</span></div>
                <div>status: <span className="opacity-80">{ABOUT_CONTENT.status}</span></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="projects" className="relative overflow-hidden snap-center snap-always">
        <div
          className="absolute inset-0 bg-foreground/[0.03]"
          style={{ clipPath: "polygon(0 0, 100% 8%, 100% 100%, 0 92%)" }}
        />
        <div className="relative z-10 px-6 md:px-12 lg:px-24 py-32">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight uppercase">
                Some<br />Projects
              </h2>
              <span className="font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase">
                {PROJECTS.length} projects — {PROJECTS.filter(p => p.status === "active").length} active
              </span>
            </div>
          </ScrollReveal>

          <div className="flex flex-col">
            {PROJECTS.map((project, i) => {
              const isExpanded = expandedProject === i;
              const isInverted = i % 2 === 0;
              return (
                <ScrollReveal key={project.name} delay={i * 0.08}>
                  <div
                    onClick={() => setExpandedProject(isExpanded ? null : i)}
                    className={`transition-all duration-500 group cursor-pointer border-t first:border-t-0 last:border-b border-foreground/10 ${isInverted
                      ? "bg-foreground text-background border-foreground"
                      : "hover:bg-foreground/[0.02]"
                      }`}
                  >
                    <div className="py-5 md:py-9 px-4 md:px-8">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 md:gap-16 min-w-0">
                          <span className={`font-mono text-xs shrink-0 ${isInverted ? "opacity-60" : "text-muted-foreground/50"}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                            <h3 className="font-display font-bold text-2xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-none">
                              {project.name}
                            </h3>
                            <span className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 w-fit ${isInverted ? "bg-background text-foreground" : "bg-foreground text-background"
                              }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-16 shrink-0">
                          <p className={`font-mono text-xs hidden lg:block max-w-[300px] leading-relaxed ${isInverted ? "opacity-60" : "text-muted-foreground"}`}>
                            {project.desc}
                          </p>
                          <ChevronDown className={`w-6 h-6 md:w-8 md:h-8 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""
                            } ${isInverted ? "opacity-60" : "text-muted-foreground/60"}`} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                            className="overflow-hidden"
                          >
                            <div className={`mt-10 pt-10 border-t ${isInverted ? "border-background/20" : "border-foreground/10"}`}>
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12">
                                <p className={`font-mono text-sm md:text-lg leading-relaxed max-w-3xl ${isInverted ? "opacity-80" : "text-foreground/70"}`}>
                                  {project.details}
                                </p>
                                <div className="flex flex-wrap gap-3 self-start">
                                  {project.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={`font-mono text-[10px] md:text-xs tracking-wider uppercase px-4 py-1.5 ${isInverted
                                        ? "border border-background/30 text-background/80"
                                        : "border border-foreground/20 text-muted-foreground"
                                        }`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="stack" className="px-6 md:px-12 lg:px-24 py-40 snap-center snap-always">
        <ScrollReveal>
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-16 uppercase">
            Stack
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
          <ScrollReveal delay={0.1}>
            <div className="border border-foreground/20 p-6 md:p-8 font-mono text-sm h-full rounded-sm selection:bg-white/10">
              <div className="flex items-center gap-2 mb-6 opacity-40 select-none">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] ml-2">TECH_STACK.json</span>
              </div>
              <pre className="text-[#8b949e] leading-relaxed whitespace-pre-wrap selection:text-white">
                <span className="text-[#8b949e]">{`{`}</span>
                {Object.entries(STACK)
                  .filter(([key]) => key !== "approach" && key !== "interests")
                  .map(([key, values], idx, arr) => (
                    <div key={key} className="pl-4">
                      <span className="text-[#7ee787]">"{key}"</span><span className="text-[#8b949e]">: [</span>
                      <span className="flex flex-wrap gap-x-2 pl-4">
                        {(values as string[]).map((v, i) => (
                          <span key={v} className="whitespace-nowrap">
                            <span className="text-[#a5d6ff]">"{v}"</span>
                            {i < (values as string[]).length - 1 && <span className="text-[#8b949e]">,</span>}
                          </span>
                        ))}
                      </span>
                      <span className="text-[#8b949e]">]</span>{idx < arr.length - 1 && <span className="text-[#8b949e]">{`,`}</span>}
                    </div>
                  ))}
                <span className="text-[#8b949e]">{`}`}</span>
              </pre>
            </div>
          </ScrollReveal>

          <div className="grid grid-rows-2 gap-4">
            <ScrollReveal delay={0.2}>
              <div className="bg-foreground text-background p-6 md:p-8 h-full flex flex-col justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-40">deep interests</span>
                <div className="mt-4">
                  {STACK.interests.map((item) => (
                    <div key={item} className="font-display font-bold text-lg md:text-xl uppercase tracking-wide">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="border border-foreground/20 p-6 md:p-8 h-full flex flex-col justify-center">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-3">approach</span>
                <p className="font-mono text-sm text-foreground/60 leading-relaxed">
                  {STACK.approach}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="log" className="relative snap-center snap-always">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row">
          <div className="hidden md:block md:w-[340px] lg:w-[420px] shrink-0">
            <div className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16">
              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight uppercase">
                <span className="text-muted-foreground font-mono text-2xl md:text-4xl font-normal">// </span>
                <br />now
              </h2>
              <p className="font-mono text-xs text-muted-foreground/60 mt-4 max-w-[200px]">
                what i'm currently building and shipping
              </p>
              <div className="mt-8">
                <div className="w-px h-12 bg-foreground/20" />
                <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase mt-2 block">
                  {LOG_ENTRIES.length} entries
                </span>
              </div>
            </div>
          </div>

          <div className="md:hidden px-6 pt-24 pb-8">
            <h2 className="font-display font-bold text-4xl tracking-tight uppercase">
              <span className="text-muted-foreground font-mono text-2xl font-normal">// </span>
              <br />now
            </h2>
            <p className="font-mono text-xs text-muted-foreground/60 mt-3">
              what i'm currently building and shipping
            </p>
          </div>

          <div className="flex-1 border-l border-foreground/10 py-24 md:py-40">
            {LOG_ENTRIES.map((entry, i) => {
              const isExpanded = expandedLog === i;
              return (
                <ScrollReveal key={i} delay={i * 0.06}>
                  <div
                    onClick={() => setExpandedLog(isExpanded ? null : i)}
                    className="border-b border-foreground/10 cursor-pointer group px-6 md:px-10 lg:px-16"
                  >
                    <div className="flex items-start gap-4 py-5">
                      <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 shrink-0 ${entry.date === "now"
                        ? "bg-foreground text-background"
                        : "border border-foreground/20 text-muted-foreground"
                        }`}>
                        {entry.date}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-mono text-sm text-foreground/70 group-hover:text-foreground transition-colors duration-300">
                            {entry.msg}
                          </span>
                          <ChevronDown className={`w-5 h-5 shrink-0 mt-0.5 text-muted-foreground/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                            }`} />
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="font-mono text-xs text-foreground/50 leading-relaxed mt-3 pb-1 prose prose-xs prose-invert prose-p:leading-relaxed prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-foreground/10 max-w-none">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeRaw]}
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {entry.details}
                                </ReactMarkdown>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <ScrollReveal>
        <div className="bg-foreground text-background py-16 overflow-hidden border-y border-white/5">
          <div className="flex w-max animate-marquee">
            <div className="font-display font-bold text-3xl md:text-5xl tracking-tight whitespace-nowrap px-4 py-2 flex items-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="flex items-center">
                  {MARQUEE_TEXTS.map((text, idx) => (
                    <span key={idx} className="flex items-center">
                      {text} <span className="mx-12 opacity-30 not-italic">·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <div className="font-display font-bold text-3xl md:text-5xl tracking-tight whitespace-nowrap px-4 py-2 flex items-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="flex items-center">
                  {MARQUEE_TEXTS.map((text, idx) => (
                    <span key={idx} className="flex items-center">
                      {text} <span className="mx-12 opacity-30 not-italic">·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <footer id="links" className="border-t border-foreground/10 px-6 md:px-12 lg:px-24 py-32 snap-center snap-always">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <ScrollReveal>
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight uppercase mb-6">
                Connect
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="font-mono text-sm text-muted-foreground/60 max-w-md mb-8">
                {FOOTER_CONTENT.description}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="flex gap-10 items-center">
                <a
                  href="https://github.com/debxylen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 font-mono text-xs uppercase tracking-wider group"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                  GitHub
                </a>
                <a
                  href="https://discord.gg/csDr2zwyd9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 font-mono text-xs uppercase tracking-wider group"
                  aria-label="Discord"
                >
                  <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Discord
                </a>
                <a
                  href="https://x.com/debxylen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 font-mono text-xs uppercase tracking-wider group"
                  aria-label="X / Twitter"
                >
                  <XIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Twitter
                </a>
                <a
                  href="https://instagram.com/debxylen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 font-mono text-xs uppercase tracking-wider group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Instagram
                </a>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">
              {FOOTER_CONTENT.copyright}<br />all rights left
            </p>
          </ScrollReveal>
        </div>
      </footer>
    </main>
  );
};

export default Index;
