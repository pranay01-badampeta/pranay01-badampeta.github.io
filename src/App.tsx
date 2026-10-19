import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Download, Mail } from "lucide-react";
import DataCanvas from "./components/DataCanvas";
import { ABOUT, CERTIFICATIONS, EDUCATION, EXPERIENCE, FEATURED, PROFILE, PROJECTS, PUBLICATION, SKILLS, STATS } from "./content";

gsap.registerPlugin(ScrollTrigger);
// The 3D layer can make frames slow on weak devices; without this GSAP would stretch the intro
// in time and keep the name hidden. Animations keep real time instead.
gsap.ticker.lagSmoothing(0);

const research = PROJECTS.find((p) => p.badge)!;
const mlProjects = PROJECTS.filter((p) => !p.badge);

function Index({ n, title }: { n: number; title: string }) {
  return (
    <p className="label flex items-center gap-3" data-reveal>
      <span className="text-accent">{String(n).padStart(2, "0")}</span>
      <span className="h-px w-8 bg-line" />
      {title}
    </p>
  );
}

export default function App() {
  useLayoutEffect(() => {
    // The page is built after load, so the browser can't jump to a #section link by itself.
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: "instant" });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".name-line > span", { yPercent: 105, duration: 1.6, ease: "expo.out", stagger: 0.06, delay: 1.2 });
      gsap.from(".hero-fade", { opacity: 0, y: 16, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 1.8 });
      gsap.set("[data-reveal]", { opacity: 0, y: 36 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.07 }),
      });
      gsap.to(".hero-name h1", {
        yPercent: -40,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#stage-0", start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <DataCanvas />

      <header data-ui className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-bg via-bg/70 to-transparent">
        <div className="shell flex h-16 items-center justify-between">
          <a href="#stage-0" className="font-display text-lg font-extrabold tracking-tight">
            PB<span className="text-accent">/</span>
          </a>
          <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-widest text-muted md:flex">
            <a href="#stage-1" className="hover:text-ink">About</a>
            <a href="#stage-3" className="hover:text-ink">Research</a>
            <a href="#stage-4" className="hover:text-ink">Work</a>
            <a href="#stage-6" className="hover:text-ink">Contact</a>
          </nav>
          <a href={PROFILE.resume} download className="cta cta-line !px-4 !py-2 text-xs">
            Résumé <Download className="size-3.5" />
          </a>
        </div>
      </header>

      <main>
        {/* 00 — You, in particles */}
        <section id="stage-0" data-stage="0" className="pointer-events-none relative flex min-h-[100svh] flex-col justify-between pb-6 pt-24 sm:pb-24">
          <div className="shell flex items-start justify-between gap-6">
            <div className="hero-fade label hidden max-w-[14rem] leading-relaxed sm:block">
              <span className="text-ink">{PROFILE.role}</span>
              <br />
              Woxsen University · B.Tech CSE
            </div>
            <div className="hero-fade label hidden text-right leading-relaxed sm:block">
              IEEE CICT 2025 author
              <br />
              NASA Space Apps 2024
            </div>
          </div>

          <div className="hero-name shell mt-auto">
            <p className="hero-fade label mb-3 sm:hidden">{PROFILE.role}</p>
            <h1 className="blend font-display font-extrabold uppercase leading-[0.82] tracking-[-0.04em]">
              <span className="name-line block overflow-hidden text-[13vw] md:text-[11vw]">
                <span className="inline-block">Pranay</span>
              </span>
              <span className="name-line block overflow-hidden text-right text-[8.5vw] md:text-[7.4vw]">
                <span className="inline-block">Badampeta</span>
              </span>
            </h1>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <p className="hero-fade max-w-sm text-muted">{PROFILE.tagline}</p>
              <div className="hero-fade pointer-events-auto flex flex-wrap gap-3">
                <a href="#stage-4" className="cta cta-solid">
                  See the work <ArrowDown className="size-4" />
                </a>
                <a href={`mailto:${PROFILE.email}`} className="cta cta-line">
                  Say hello
                </a>
              </div>
            </div>
            <p className="hero-fade label mt-8 text-center">Scroll · watch me turn into data · move the cursor through me</p>
          </div>
        </section>

        {/* 01 — About · neural network */}
        <section id="stage-1" data-stage="1" className="pointer-events-none flex min-h-[120svh] items-center py-24 max-md:items-end max-md:pt-[52svh]">
          <div className="shell grid w-full md:grid-cols-2">
            <div className="glass pointer-events-auto p-6 sm:p-10 md:bg-transparent md:p-0 md:backdrop-blur-none md:[border:none]">
              <Index n={1} title="About" />
              <h2 className="mt-6 font-display text-3xl font-bold leading-[1.1] sm:text-5xl" data-reveal>
                I teach machines to <span className="gradient-text">see, predict and read</span>, then ship them as products people use.
              </h2>
              <p className="mt-6 text-muted" data-reveal>{ABOUT[0]}</p>
              <p className="mt-4 text-muted" data-reveal>{ABOUT[1]}</p>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4" data-reveal>
                {STATS.map((s) => (
                  <div key={s.label} className="bg-bg/90 p-4">
                    <dd className="font-display text-3xl font-bold">{s.value}</dd>
                    <dt className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 02 — Journey · helix */}
        <section id="stage-2" data-stage="2" className="pointer-events-none flex min-h-[120svh] items-center py-24 max-md:items-end max-md:pt-[52svh]">
          <div className="shell grid w-full md:grid-cols-2">
            <div className="glass pointer-events-auto p-6 sm:p-10 md:col-start-2 md:bg-transparent md:p-0 md:backdrop-blur-none md:[border:none]">
              <Index n={2} title="Journey" />
              <h2 className="mt-6 font-display text-3xl font-bold sm:text-5xl" data-reveal>
                Experience
              </h2>
              <ol className="mt-10 space-y-10">
                {EXPERIENCE.map((j) => (
                  <li key={j.role + j.org} className="grid grid-cols-[auto_1fr] gap-5" data-reveal>
                    <span className="mt-2 size-2 rounded-full bg-accent shadow-[0_0_16px_4px_rgb(255_107_53/0.5)]" />
                    <div>
                      <p className="label">{j.when}</p>
                      <h3 className="mt-1 font-display text-2xl font-bold">{j.role}</h3>
                      <p className="text-accent">
                        {j.org} <span className="text-muted">· {j.place}</span>
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm text-muted">
                        {j.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 03 — Research · solar array */}
        <section id="stage-3" data-stage="3" className="pointer-events-none flex min-h-[120svh] items-center py-24 max-md:items-end max-md:pt-[52svh]">
          <div className="shell grid w-full md:grid-cols-2">
            <div className="glass pointer-events-auto p-6 sm:p-10 md:bg-transparent md:p-0 md:backdrop-blur-none md:[border:none]">
              <Index n={3} title="Research" />
              <p className="pill mt-6 !border-accent/50 !text-accent" data-reveal>Published · IEEE</p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] sm:text-4xl" data-reveal>
                {PUBLICATION.title}
              </h2>
              <p className="mt-4 text-sm text-violet" data-reveal>{PUBLICATION.venue}</p>
              <ul className="mt-6 space-y-3 text-muted" data-reveal>
                {[PUBLICATION.points[0], ...research.points].map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2" data-reveal>
                {research.tags.map((t) => (
                  <span key={t} className="pill">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 04 — Work · price chart */}
        <section id="stage-4" data-stage="4" className="pointer-events-none min-h-[140svh] pb-28 pt-36">
          <div className="shell">
            <div className="pointer-events-auto">
              <Index n={4} title="Work" />
              <h2 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl" data-reveal>
                Things I&apos;ve <span className="gradient-text">built</span>.
              </h2>
            </div>

            {/* Open space: the 3D price chart is the picture here, before the cards slide over it. */}
            <p className="label mt-[52svh] text-right" data-reveal>↑ model: LSTM price forecast · 64 steps</p>
            <article className="glass pointer-events-auto mt-6 grid overflow-hidden lg:grid-cols-[1.1fr_1fr]" data-reveal>
              <div className="p-6 sm:p-10">
                <p className="label">{FEATURED.kind}</p>
                <h3 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">{FEATURED.title}</h3>
                <p className="mt-4 text-muted">{FEATURED.summary}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {FEATURED.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {FEATURED.tags.map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {FEATURED.links?.map((l, i) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`cta ${i === 0 ? "cta-solid" : "cta-line"}`}>
                      {l.label} <ArrowUpRight className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[280px] overflow-hidden border-line max-lg:border-t lg:border-l">
                <img src="media/dashboard.jpg" alt="The Cuisine.AI dashboard" loading="lazy" width={800} height={500} className="absolute inset-0 h-full w-full object-cover object-left-top opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
              </div>
            </article>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {mlProjects.map((p) => (
                <article key={p.title} className="glass pointer-events-auto flex flex-col p-6" data-reveal>
                  <p className="label">{p.kind}</p>
                  <h3 className="mt-3 font-display text-2xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted">{p.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-3">
                        <span className="mt-2.5 h-px w-3 shrink-0 bg-accent" /> {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {p.tags.map((t) => (
                      <span key={t} className="pill">{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 05 — Skills · galaxy */}
        <section id="stage-5" data-stage="5" className="pointer-events-none min-h-[130svh] py-28">
          <div className="shell">
            <div className="pointer-events-auto text-center">
              <div className="flex justify-center"><Index n={5} title="Skills" /></div>
              <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl" data-reveal>
                A small universe of <span className="gradient-text">tools</span>.
              </h2>
            </div>
            <div className="mt-[38svh] grid gap-4 md:grid-cols-5">
              {SKILLS.map((g) => (
                <div key={g.group} className="glass pointer-events-auto p-5" data-reveal>
                  <p className="label">{g.group}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.items.map((s) => (
                      <li key={s} className="pill">{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="glass pointer-events-auto p-6" data-reveal>
                <p className="label">Education</p>
                <ul className="mt-4 divide-y divide-line">
                  {EDUCATION.map((e) => (
                    <li key={e.school} className="flex items-baseline justify-between gap-4 py-3">
                      <div>
                        <p className="font-semibold">{e.school}</p>
                        <p className="text-sm text-muted">{e.degree}</p>
                      </div>
                      <div className="shrink-0 text-right font-mono text-xs text-muted">
                        <p>{e.when}</p>
                        <p className="text-ink">{e.score}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass pointer-events-auto p-6" data-reveal>
                <p className="label">Certifications & achievements</p>
                <ul className="mt-4 divide-y divide-line">
                  {CERTIFICATIONS.map((c) => (
                    <li key={c.name} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                      <span>{c.name}</span>
                      <span className="shrink-0 font-mono text-xs text-muted">{c.when}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 06 — Contact · you again */}
        <section id="stage-6" data-stage="6" className="pointer-events-none relative flex min-h-[100svh] flex-col justify-end pb-8 pt-24">
          <div className="shell">
            <div className="pointer-events-auto text-center">
              <div className="flex justify-center"><Index n={6} title="Contact" /></div>
              <h2 className="blend mt-6 font-display text-[12.5vw] font-extrabold uppercase leading-[0.85] tracking-[-0.04em] md:text-[8vw]" data-reveal>
                Let&apos;s build
                <br />
                something
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
                <a href={`mailto:${PROFILE.email}`} className="cta cta-solid">
                  <Mail className="size-4" /> {PROFILE.email}
                </a>
                <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="cta cta-line">
                  LinkedIn <ArrowUpRight className="size-4" />
                </a>
                <a href={PROFILE.github} target="_blank" rel="noreferrer" className="cta cta-line">
                  GitHub <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
            <footer className="pointer-events-auto mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-mono text-xs text-muted sm:pl-44">
              <span>© {new Date().getFullYear()} {PROFILE.fullName}</span>
              <span>Built with React · Three.js · GSAP — every dot is a pixel of me.</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
