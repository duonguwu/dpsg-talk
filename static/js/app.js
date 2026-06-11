/* =====================================================
   DPSG Talkshow — GSAP motion
   ===================================================== */

// Guard: if the GSAP CDN failed to load, make sure nothing stays hidden.
if (typeof gsap === "undefined") {
    document.documentElement.classList.remove("gsap-ready");
    console.warn("GSAP failed to load — animations skipped, content shown.");
} else {
    run();
}

function run() {
    gsap.registerPlugin(ScrollTrigger);

    /* ---- Nav: transparent over hero, solid when scrolled ---- */
    const nav = document.querySelector(".nav");
    if (nav) {
        // Start transparent
        nav.classList.add("nav--top");

        ScrollTrigger.create({
            start: "top top",
            onUpdate: (self) => {
                if (self.scroll() > 30) {
                    nav.classList.remove("nav--top");
                } else {
                    nav.classList.add("nav--top");
                }
            }
        });
    }

    const mm = gsap.matchMedia();

    mm.add(
        {
            motion: "(prefers-reduced-motion: no-preference)",
            reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
            const { reduce } = ctx.conditions;

            // If reduced motion, just show everything and bail.
            if (reduce) {
                gsap.set(".reveal", { opacity: 1, y: 0 });
                gsap.set("[data-hero='line'], [data-hero='kicker'], [data-hero='block']", { opacity: 1, y: 0 });
                gsap.set(".timeline-track .progress", { scaleY: 1 });
                gsap.set(".tl-dot", { scale: 1 });
                document.querySelectorAll(".count").forEach((el) => {
                    el.textContent = el.dataset.to;
                });
                return;
            }

            gsap.defaults({ ease: "power3.out", duration: 0.9 });

            /* ---- HERO load timeline ---- */
            const heroTl = gsap.timeline({ delay: 0.15 });

            heroTl
                .from("[data-hero='photo']", { autoAlpha: 0, scale: 1.08, xPercent: 6, duration: 1.4, ease: "power3.out" })
                .from("[data-hero='kicker']", { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.25)
                .from(
                    "[data-hero='line']",
                    { yPercent: 115, duration: 1, stagger: 0.12, ease: "power4.out" },
                    "-=0.35"
                )
                .add(() => {
                    // Draw the light-blue underline behind "giảng đường" (CSS transition)
                    document.querySelector(".hero-headline .mark-word")?.classList.add("is-drawn");
                }, "-=0.35")
                .from(
                    "[data-hero='block']",
                    { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 },
                    "-=0.5"
                );

            /* ---- Generic reveals (exclude speaker cards; they batch separately) ---- */
            gsap.utils.toArray(".reveal:not(.sp-card)").forEach((el) => {
                gsap.fromTo(
                    el,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        scrollTrigger: {
                            trigger: el,
                            start: "top 88%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            });

            /* ---- Speaker cards: staggered batch reveal ---- */
            gsap.set(".sp-card", { opacity: 0, y: 40 });
            ScrollTrigger.batch(".sp-card", {
                start: "top 90%",
                onEnter: (batch) =>
                    gsap.to(batch, {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        stagger: 0.08,
                        overwrite: true,
                    }),
            });

            /* ---- Stat count-up ---- */
            gsap.utils.toArray(".count").forEach((el) => {
                const target = parseFloat(el.dataset.to);
                const obj = { val: 0 };
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 85%",
                    once: true,
                    onEnter: () => {
                        gsap.to(obj, {
                            val: target,
                            duration: 1.4,
                            ease: "power2.out",
                            onUpdate: () => {
                                el.textContent = Math.round(obj.val);
                            },
                        });
                    },
                });
            });

            /* ---- Timeline: draw progress line + pop dots on scroll ---- */
            gsap.to(".timeline-track .progress", {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".timeline-wrap",
                    start: "top 70%",
                    end: "bottom 80%",
                    scrub: 0.6,
                },
            });

            gsap.utils.toArray(".tl-dot").forEach((dot) => {
                gsap.to(dot, {
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(2)",
                    scrollTrigger: {
                        trigger: dot,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                });
            });

            /* ---- Subtle parallax on the hero photo as you scroll ---- */
            gsap.to("[data-hero='photo'] img", {
                yPercent: 10,
                ease: "none",
                scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
            });

            /* ---- Failsafe: never leave above-the-fold content hidden ---- */
            gsap.delayedCall(3.5, () => {
                gsap.set("[data-hero='photo'], [data-hero='line'], [data-hero='kicker'], [data-hero='block']", {
                    clearProps: "transform,opacity,visibility",
                });
            });

            return () => { };
        }
    );
}
