import { useEffect, useRef, useState } from "react";
import { STAGES } from "../scene/stages";

/**
 * The fixed 3D layer behind the page. The scroll position decides which shape the particles form:
 * every <section data-stage="n"> owns shape n, and between two sections the particles flow across.
 */
export default function DataCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let centers: { c: number; s: number }[] = [];
    const measure = () => {
      centers = [...document.querySelectorAll<HTMLElement>("[data-stage]")].map((el) => ({
        c: el.offsetTop + el.offsetHeight / 2,
        s: Number(el.dataset.stage),
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    let shown = -1;
    const getStage = () => {
      const vc = scrollY + innerHeight / 2;
      // Written straight to the DOM: this runs every frame and must not re-render React.
      if (bar.current) bar.current.style.width = `${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`;
      let stage = centers[0]?.s ?? 0;
      for (let i = 0; i < centers.length - 1; i++) {
        const a = centers[i];
        const b = centers[i + 1];
        if (vc >= a.c && vc < b.c) {
          const t = (vc - a.c) / (b.c - a.c);
          // Hold each shape while its section is being read, then flow to the next.
          const k = Math.min(1, Math.max(0, (t - 0.28) / 0.44));
          stage = a.s + (b.s - a.s) * k * k * (3 - 2 * k);
          break;
        }
        if (vc >= b.c) stage = b.s;
      }
      const near = Math.round(stage);
      if (near !== shown) {
        shown = near;
        setIndex(near);
      }
      return stage;
    };

    // Three.js loads after the text, so the page reads instantly.
    let dispose = () => {};
    let gone = false;
    import("../scene/createScene").then(({ createScene }) => {
      if (gone) return;
      dispose = createScene(host.current!, {
        getStage,
        onReady: ({ count }) => setCount(count),
        // Every frame: lay the real photo exactly over the particle portrait (DOM only, no React render).
        onFrame: ({ left, top, width, height, photo: amount }) => {
          const img = photo.current;
          if (!img) return;
          img.style.opacity = amount.toFixed(3);
          img.style.visibility = amount > 0.002 ? "visible" : "hidden";
          img.style.transform = `translate(${left}px, ${top}px)`;
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
        },
        photo: "media/portrait-sample.png",
      });
    });
    return () => {
      gone = true;
      ro.disconnect();
      dispose();
    };
  }, []);

  const s = STAGES[index];
  return (
    <>
      <div ref={host} className="fixed inset-0 -z-10" aria-hidden="true" />
      {/* The real photo, shown when the particles have formed the portrait (first and last page). */}
      <img
        ref={photo}
        src="media/portrait-hd.webp"
        alt="Pranay Badampeta"
        width={1000}
        height={926}
        className="pointer-events-none fixed left-0 top-0 -z-[5] invisible opacity-0 will-change-transform [mask-image:linear-gradient(to_bottom,black_78%,transparent)]"
      />

      {/* Model readout, bottom left */}
      <div data-ui className="pointer-events-none fixed bottom-4 left-4 z-30 hidden font-mono text-[11px] leading-relaxed text-muted sm:block md:bottom-6 md:left-6">
        <p className="flex items-center gap-2 text-ink">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" /> LIVE · {String(index).padStart(2, "0")}/{String(STAGES.length - 1).padStart(2, "0")}
        </p>
        <p>
          model <span className="text-ink">{s.file}</span>
        </p>
        <p>{count ? `${count.toLocaleString("en")} points` : "loading points…"}</p>
        <div className="mt-2 h-px w-40 bg-white/10">
          <div ref={bar} className="h-px w-0 bg-accent" />
        </div>
      </div>

      {/* Story rail, right edge */}
      <nav data-ui aria-label="Sections" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {STAGES.map((st, i) => (
          <a
            key={i}
            href={`#stage-${i}`}
            className="group flex items-center justify-end gap-3"
            aria-label={st.title}
            aria-current={i === index ? "step" : undefined}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted opacity-0 transition-opacity group-hover:opacity-100">{st.title}</span>
            <span className={`block h-px transition-all duration-500 ${i === index ? "w-8 bg-accent" : "w-4 bg-white/25 group-hover:bg-white/60"}`} />
          </a>
        ))}
      </nav>
    </>
  );
}
