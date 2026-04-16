/* ============================================================
   script.js – مؤسسة أبو عبدالرحمن | تخريم الخرسانة بالكور الماسي
   ============================================================ */

'use strict';

/* ── Navbar: scroll shadow + hamburger ── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) return;

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
})();


/* ── Active nav link on scroll (desktop + mobile combined) ── */
(function initActiveLinks() {
  const sections  = document.querySelectorAll('section[id], header[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileItems = document.querySelectorAll('.mobile-nav-item');

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });

      mobileItems.forEach(item => {
        item.classList.toggle('mobile-nav-item--active', item.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(sec => observer.observe(sec));
})();


/* ── Scroll Reveal ── */
(function initReveal() {
  const revealEls = document.querySelectorAll(
    '.problem-item, .service-card, .why-card, .carousel-card, .offer-box, .cta-btn, .stat, .quality-stat, .project-card, .review-card'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings slightly
        const siblings = Array.from(entry.target.parentElement.children);
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();


/* ── Infinite Auto-Scrolling Carousel ── */
(function initCarousel() {
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!track || !prevBtn || !nextBtn) return;

  const GAP        = 20;
  const CARD_W     = 300;
  const STEP       = CARD_W + GAP; // 320px per card

  // ── Clone cards until track is wide enough to never show a gap ──
  // Strategy: keep only original cards (remove any existing duplicates),
  // then clone enough to fill at least 3x the viewport width.
  const originals = Array.from(track.children);
  // Remove aria-hidden duplicates that might exist in HTML
  track.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());

  const freshOriginals = Array.from(track.children); // clean originals
  const needed = Math.ceil((window.innerWidth * 3) / STEP) + freshOriginals.length;
  let cloneCount = 0;
  while (track.children.length < needed) {
    const clone = freshOriginals[cloneCount % freshOriginals.length].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    cloneCount++;
  }

  // The scroll boundary = total width of ONE full set of originals
  const setWidth  = freshOriginals.length * STEP;

  let position    = 0;
  let isAnimating = false;
  let isPaused    = false;
  let autoTimer   = null;

  function setPos(pos, animate = true) {
    track.style.transition = animate
      ? 'transform 0.45s cubic-bezier(.25,.46,.45,.94)'
      : 'none';
    track.style.transform = `translateX(${pos}px)`;
    position = pos;
  }

  function normalize() {
    // Silently jump: if scrolled too far right (pos > 0) or too far left
    if (position <= -setWidth) {
      setPos(position + setWidth, false);
    } else if (position > 0) {
      setPos(position - setWidth, false);
    }
  }

  function next() {
    if (isAnimating) return;
    isAnimating = true;
    setPos(position - STEP);
    setTimeout(() => {
      normalize();
      isAnimating = false;
    }, 460);
  }

  function prev() {
    if (isAnimating) return;
    isAnimating = true;
    setPos(position + STEP);
    setTimeout(() => {
      normalize();
      isAnimating = false;
    }, 460);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => { if (!isPaused) next(); }, 3000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

  const wrapper = track.parentElement;
  wrapper.addEventListener('mouseenter', () => { isPaused = true; });
  wrapper.addEventListener('mouseleave', () => { isPaused = false; });

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    isPaused = true;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    isPaused = false;
  }, { passive: true });

  startAuto();
})();


/* ── Smooth phone / whatsapp click feedback ── */
(function initCTAEffects() {
  document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me"]').forEach(btn => {
    btn.addEventListener('click', function () {
      this.style.transition = 'transform .1s';
      this.style.transform  = 'scale(.96)';
      setTimeout(() => { this.style.transform = ''; }, 150);
    });
  });
})();


/* ── Animated counter for stats ── */
(function initCounters() {
  const targets = document.querySelectorAll('.stat-num, .quality-num, .why-num');

  function animateCount(el) {
    const text   = el.textContent.trim();
    const match  = text.match(/(\d+)/);
    if (!match) return;

    const end    = parseInt(match[1], 10);
    const prefix = text.slice(0, match.index);
    const suffix = text.slice(match.index + match[1].length);
    const dur    = 1200;
    const start  = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val   = Math.round(eased * end);
      el.textContent = prefix + val + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  targets.forEach(el => observer.observe(el));
})();


/* ── Lazy-load images with fade-in ── */
(function initLazyImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity .5s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; }); // fail gracefully
    }
  });
})();


/* ── Offer section urgency text (static) ── */
(function initOfferUrgency() {
  const offerBox = document.querySelector('.offer-box');
  if (!offerBox) return;

  const urgency = document.createElement('p');
  urgency.style.cssText = `
    color: rgba(255,215,0,.85);
    font-size: .85rem;
    font-weight: 700;
    letter-spacing: .06em;
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  urgency.innerHTML = `
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
    <span>العرض لفترة محدودة — احجز الآن واحصل على معاينة مجانية!</span>
  `;

  const ctas = offerBox.querySelector('.offer-ctas');
  if (ctas) ctas.after(urgency);
})();
