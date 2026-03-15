"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // ── LOADER ENGINE (LITERAL SNIPPET) ──
    if (document.getElementById('loader-overlay')) return; // Avoid double injection

    document.body.classList.add('loading');
    const loader = document.createElement('div');
    loader.id = 'loader-overlay';
    loader.innerHTML = `
        <div class="scan-line"></div>
        <div class="h-grid-line" style="top:25%" id="hl1"></div>
        <div class="h-grid-line" style="top:50%" id="hl2"></div>
        <div class="h-grid-line" style="top:75%" id="hl3"></div>
        <div class="v-grid-line" style="left:25%" id="vl1"></div>
        <div class="v-grid-line" style="left:50%" id="vl2"></div>
        <div class="v-grid-line" style="left:75%" id="vl3"></div>
        <div class="corner tl" id="ctl"></div>
        <div class="corner tr" id="ctr"></div>
        <div class="corner bl" id="cbl"></div>
        <div class="corner br" id="cbr"></div>
        <div class="loader-logo-wrap">
            <div class="loader-wordmark">AforPrint</div>
            <div class="loader-sub">Campus Printing Platform</div>
            <div class="loader-progress-track">
                <div class="loader-progress-fill"></div>
            </div>
            <div class="loader-status" id="loader-status">Initializing system...</div>
        </div>
    `;
    document.body.prepend(loader);

    // Initial styles
    const wordmark = loader.querySelector('.loader-wordmark') as HTMLElement;
    const sub = loader.querySelector('.loader-sub') as HTMLElement;
    const track = loader.querySelector('.loader-progress-track') as HTMLElement;
    const fill = loader.querySelector('.loader-progress-fill') as HTMLElement;
    const statusEl = loader.querySelector('#loader-status') as HTMLElement;

    // Grid entrance
    const gridLines = loader.querySelectorAll('.h-grid-line, .v-grid-line');
    gridLines.forEach((line: any, i) => {
      setTimeout(() => {
        line.style.transition = 'transform 0.7s cubic-bezier(0.77,0,0.18,1)';
        line.style.transform = line.classList.contains('v-grid-line') ? 'scaleY(1)' : 'scaleX(1)';
      }, 300 + i * 100);
    });

    // Corner entrance
    const corners = loader.querySelectorAll('.corner');
    corners.forEach((c: any, i) => {
      setTimeout(() => {
        c.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        c.style.opacity = '1';
      }, 200 + i * 80);
    });

    // Text & Progress
    if (wordmark) {
      wordmark.style.transition = 'opacity 1.2s ease 0.6s';
      setTimeout(() => { wordmark.style.opacity = '1'; }, 10);
    }
    if (sub) {
      sub.style.transition = 'opacity 0.6s ease 1.6s';
      setTimeout(() => { sub.style.opacity = '1'; }, 10);
    }
    if (track) {
      track.style.transition = 'opacity 0.4s ease 1.0s';
      setTimeout(() => { track.style.opacity = '1'; }, 10);
    }
    if (fill) {
      fill.style.transition = 'width 1.6s cubic-bezier(0.4,0,0.2,1) 1.0s';
      setTimeout(() => { fill.style.width = '100%'; }, 20);
    }
    if (statusEl) {
      statusEl.style.transition = 'opacity 0.4s ease 1.0s';
      setTimeout(() => { statusEl.style.opacity = '1'; }, 10);
      const statuses = ['Initializing system...', 'Locating print shops...', 'Mapping campus nodes...', 'Establishing connection...', 'Ready.'];
      let si = 0;
      const siInterval = setInterval(() => {
        si++;
        if (si < statuses.length) {
          statusEl.style.opacity = '0';
          setTimeout(() => {
            statusEl.textContent = statuses[si];
            statusEl.style.opacity = '1';
          }, 200);
        } else { clearInterval(siInterval); }
      }, 500);
    }

    setTimeout(() => {
      loader.style.transition = 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)';
      loader.style.opacity = '0';
      document.body.classList.remove('loading');
      setTimeout(() => loader.remove(), 900);
    }, 3200);

    // ── CURSOR GLOW ──
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);
    const moveGlow = (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    };
    document.addEventListener('mousemove', moveGlow);

    // ── TYPEWRITER ENGINE ──
    const typewrite = (el: HTMLElement, text: string, speed: number) => {
      if (el.classList.contains('typed')) return;
      el.classList.add('typed');
      el.textContent = '';
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
        } else {
          clearInterval(iv);
        }
      }, speed);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;

        if (el.classList.contains('typewriter')) {
          const text = el.dataset.text || el.textContent?.trim() || "";
          el.dataset.text = text; // Preserve for re-runs
          typewrite(el, text, el.dataset.speed ? parseInt(el.dataset.speed) : 22);
        } else if (el.classList.contains('section-scan')) {
          el.classList.add('scanning');
          setTimeout(() => {
            el.querySelectorAll('.reveal-up, .stamp-in, .bottom-col').forEach(c => c.classList.add('active'));
          }, 400);
        } else {
          el.classList.add('active');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal-up, .stamp-in, .bottom-col, .typewriter, .section-scan').forEach(el => io.observe(el));

    // ── PARALLAX ENGINE ──
    const handleScroll = () => {
      const sy = window.pageYOffset;
      const heroGrid = document.querySelector('.hero-grid') as HTMLElement;
      if (heroGrid) heroGrid.style.transform = `translateY(${sy * 0.22}px)`;

      const parchment = document.querySelector('.parchment') as HTMLElement;
      if (parchment) {
        const tilt = Math.min(sy * 0.005, 1.5);
        parchment.style.transform = `perspective(1200px) rotateX(${tilt}deg)`;
      }

      document.querySelectorAll('.founder-card').forEach((card, i) => {
        const el = card as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
          const relY = window.innerHeight / 2 - rect.top - rect.height / 2;
          const shift = relY * 0.035 * (i % 2 === 0 ? 1 : -1);
          el.style.transform = `translateY(${shift}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousemove', moveGlow);
      window.removeEventListener('scroll', handleScroll);
      glow.remove();
      if (loader.parentNode) loader.remove();
    };
  }, []);

  return (
    <div className="parchment" id="main-container">
      <div className="inner-content">
        <div className="top-section">
          <div className="hero">
            <div className="hero-grid">
              <div className="vl" style={{ left: '33.33%' }}></div>
              <div className="vl" style={{ left: '66.66%' }}></div>
              <div className="hl" style={{ top: '50%' }}></div>
              <div className="circle"></div>
            </div>
            <span className="hero-tag" style={{ top: 'clamp(14px,1.8vw,28px)', left: 'clamp(14px,2vw,32px)' }}>Est. 2025</span>

            <div className="hero-signin">
              <Link href="/auth/login" className="btn-signin">Sign In</Link>
              <Link href="/auth/login" className="btn-signup">Sign Up</Link>
            </div>

            <h1 className="hero-wordmark fraunces text-ink typewriter" data-speed="40">AforPrint</h1>

            <div style={{ position: 'absolute', bottom: 'clamp(12px,2vw,24px)', right: 'clamp(14px,2vw,28px)', textAlign: 'right', zIndex: 10 }}>
              <span className="hero-tag" style={{ position: 'static', display: 'block' }}>Campus</span>
              <span className="hero-tag" style={{ position: 'static', display: 'block' }}>Printing Platform</span>
            </div>
          </div>

          <div className="sidebar">
            <div className="sidebar-cell reveal-up delay-100">
              <div className="flex items-center justify-between mb-2">
                <div className="wax-seal stamp-in delay-500"></div>
                <span className="label">FUNCTION</span>
              </div>
              <p className="sidebar-body typewriter" data-speed="14">Instant campus printing. Designed for urgency. Built to save time when it matters most. AforPrint connects students to nearby print shops — fast, simple, and reliable.</p>
            </div>

            <div className="sidebar-cell reveal-up delay-200">
              <div className="flex items-center justify-between mb-2">
                <span className="dagger">†</span>
                <span className="label">FORM</span>
              </div>
              <p className="sidebar-body typewriter" data-speed="18">Minimal by design. Focused on clarity and speed. From classrooms to hostels, printing that fits into student life.</p>
              <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: '1px solid currentColor', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                <div style={{ width: '0.375rem', height: '0.375rem', background: '#8b1e2b', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-columns section-scan">
          {/* Vertical boundary seals */}
          <div style={{ position: 'absolute', top: 0, left: '33.33%', transform: 'translate(-50%,-50%)', zIndex: 30 }}>
            <div className="wax-seal wax-seal-sm stamp-in delay-700"></div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: '66.66%', transform: 'translate(-50%,-50%)', zIndex: 30 }}>
            <div className="wax-seal wax-seal-sm stamp-in delay-700"></div>
          </div>

          <div className="bottom-col">
            <div className="flex flex-col gap-1 mb-2">
              <span className="col-num">01</span>
              <div style={{ height: '1px', width: '2rem', background: '#8b1e2b', opacity: 0.4 }}></div>
            </div>
            <h3 className="col-title text-ink">PROBLEM</h3>
            <p className="text-13px leading-relaxed opacity-80 typewriter" data-speed="12">College printing is broken. Queues, last-minute rush, and wasted time between classes. When deadlines are tight, printing shouldn't slow you down. AforPrint exists to remove that friction.</p>
          </div>

          <div className="bottom-col">
            <div className="flex flex-col gap-1 mb-2">
              <span className="col-num">02</span>
              <div style={{ height: '1px', width: '2rem', background: '#8b1e2b', opacity: 0.4 }}></div>
            </div>
            <h3 className="col-title text-ink">SOLUTION</h3>
            <p className="text-13px leading-relaxed opacity-80 typewriter" data-speed="12">Upload your document. Choose a nearby print shop. Pick it up — or get it delivered inside campus. No running around. No waiting in line. Just printing, simplified.</p>
          </div>

          <div className="bottom-col">
            <div className="flex flex-col gap-1 mb-2">
              <span className="col-num">03</span>
              <div style={{ height: '1px', width: '2rem', background: '#8b1e2b', opacity: 0.4 }}></div>
            </div>
            <h3 className="col-title text-ink">SYSTEM</h3>
            <p className="text-13px leading-relaxed opacity-80 typewriter" data-speed="12">Built for real campuses. Local print shops. Student delivery where outsiders aren't allowed. AforPrint is not a marketplace — it's a system designed to work where students actually are.</p>
          </div>
        </div>
      </div>

      <div className="founders-section section-scan" id="founders">
        <div className="ribbon-ornament">
          <div className="line"></div>
          <div className="diamond"></div>
          <div className="diamond" style={{ opacity: 0.5, width: '6px', height: '6px' }}></div>
          <div className="diamond"></div>
          <div className="line"></div>
        </div>

        <div className="founders-header">
          <span className="founders-eyebrow typewriter" data-speed="35">Printed in Ink & Resolve</span>
          <h2 className="founders-title">The Founders</h2>
          <span className="founders-subtitle typewriter" data-speed="28">Behind the Platform</span>
          <div className="founders-rule"></div>
        </div>

        <div className="founders-grid">
          <div className="founder-card reveal-up delay-100">
            <div className="paper-fold"></div>
            <div className="card-lines"></div>
            <div className="founder-monogram stamp-in delay-200">N</div>
            <h3 className="founder-name">Nikhil Sridhara</h3>
            <div className="founder-role">Founder</div>
            <div className="founder-divider"></div>
            <p className="founder-bio">
              <span className="typewriter" data-speed="10">行列は他のことのためにある。 印刷のために並ぶ必要はない。 そして、もうすぐ取りに来る必要すらなくなる。</span>
            </p>
            <span className="founder-sig">Nikhil Sridhara</span>
            <div className="sig-underline"></div>
            <div className="card-seal stamp-in delay-400">NS</div>
          </div>

          <div className="founder-card reveal-up delay-200">
            <div className="paper-fold"></div>
            <div className="card-lines"></div>
            <div className="founder-monogram stamp-in delay-300">M</div>
            <h3 className="founder-name">Manoj D</h3>
            <div className="founder-role">Founder</div>
            <div className="founder-divider"></div>
            <p className="founder-bio">
              <span className="typewriter" data-speed="10">Great design is invisible — it just works. AforPrint is about removing every possible obstacle between a student and their printed document. The system should disappear so the student can focus on what matters.</span>
            </p>
            <span className="founder-sig">Manoj D</span>
            <div className="sig-underline"></div>
            <div className="card-seal stamp-in delay-500">MD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
