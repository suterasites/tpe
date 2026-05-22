(() => {

  // ---------- Hide header on scroll down, reveal on scroll up ----------
  const header = document.querySelector('.site-header');
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;
    const SHOW_THRESHOLD = 80;       // always show within first 80px of page
    const DELTA = 6;                 // ignore micro-scrolls
    const closeAllMenus = () => {
      document.querySelectorAll('.mega-item .mega-trigger[aria-expanded="true"]').forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = true;
      });
    };
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY + DELTA;
      const goingUp = y < lastY - DELTA;
      if (y < SHOW_THRESHOLD) {
        header.classList.remove('is-hidden');
      } else if (goingDown) {
        if (!header.classList.contains('is-hidden')) {
          header.classList.add('is-hidden');
          closeAllMenus();
        }
      } else if (goingUp) {
        header.classList.remove('is-hidden');
      }
      if (goingDown || goingUp) lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');

  const setMobileNav = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setMobileNav(open);
    });

    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setMobileNav(false));
    });

    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => {
      if (e.matches) setMobileNav(false);
    });
  }

  // ---------- Mobile mega-menu accordion ----------
  document.querySelectorAll('.mobile-mega-trigger').forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    });
  });

  // ---------- Desktop mega-menu ----------
  const megaItems = document.querySelectorAll('.mega-item');
  let openItem = null;
  let closeTimer = null;

  const closeMega = (item) => {
    if (!item) return;
    const trigger = item.querySelector('.mega-trigger');
    const panel = item.querySelector('.mega-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
    if (openItem === item) openItem = null;
  };

  const openMega = (item) => {
    if (!item) return;
    if (openItem && openItem !== item) closeMega(openItem);
    const trigger = item.querySelector('.mega-trigger');
    const panel = item.querySelector('.mega-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
    openItem = item;
  };

  const closeAll = () => {
    if (openItem) closeMega(openItem);
  };

  megaItems.forEach((item) => {
    const trigger = item.querySelector('.mega-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMega(item);
      } else {
        openMega(item);
      }
    });

    item.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      openMega(item);
    });

    item.addEventListener('mouseleave', () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => closeMega(item), 180);
    });

    item.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => closeAll());
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  document.addEventListener('click', (e) => {
    if (!openItem) return;
    if (!openItem.contains(e.target)) closeAll();
  });

  // ---------- Project slideshow ----------
  document.querySelectorAll('[data-slideshow]').forEach((root) => {
    const slides = Array.from(root.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    const prevBtn = root.querySelector('.slideshow-prev');
    const nextBtn = root.querySelector('.slideshow-next');
    const dotsWrap = root.querySelector('.slideshow-dots');
    const interval = parseInt(root.getAttribute('data-interval'), 10) || 4500;
    let current = slides.findIndex((s) => s.classList.contains('is-active'));
    if (current < 0) current = 0;
    let timer = null;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === current) b.classList.add('is-active');
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    const go = (i) => {
      const next = (i + slides.length) % slides.length;
      slides[current].classList.remove('is-active');
      dots[current] && dots[current].classList.remove('is-active');
      slides[next].classList.add('is-active');
      dots[next] && dots[next].classList.add('is-active');
      current = next;
    };

    const start = () => { timer = setInterval(() => go(current + 1), interval); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    prevBtn && prevBtn.addEventListener('click', () => { go(current - 1); restart(); });
    nextBtn && nextBtn.addEventListener('click', () => { go(current + 1); restart(); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    start();
  });

  // ---------- Lightbox (project gallery) ----------
  const tileLinks = Array.from(document.querySelectorAll('.project-gallery .tile-link, .project-slideshow .tile-link'));
  if (tileLinks.length) {
    const items = tileLinks.map((link) => {
      const fig = link.closest('figure');
      const caption = fig && fig.querySelector('figcaption');
      return {
        href: link.getAttribute('href'),
        caption: caption ? caption.textContent.trim() : '',
      };
    });

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Project image viewer');
    lb.hidden = true;
    lb.innerHTML = `
      <button type="button" class="lightbox-btn lightbox-close" aria-label="Close image viewer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button type="button" class="lightbox-btn lightbox-next" aria-label="Next image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="lightbox-stage">
        <img class="lightbox-image" alt="">
        <p class="lightbox-caption"></p>
        <p class="lightbox-counter"></p>
      </div>
    `;
    document.body.appendChild(lb);

    const lbImage = lb.querySelector('.lightbox-image');
    const lbCaption = lb.querySelector('.lightbox-caption');
    const lbCounter = lb.querySelector('.lightbox-counter');
    const lbClose = lb.querySelector('.lightbox-close');
    const lbPrev = lb.querySelector('.lightbox-prev');
    const lbNext = lb.querySelector('.lightbox-next');

    let currentIndex = -1;
    let lastTrigger = null;

    const renderItem = (index) => {
      const item = items[index];
      if (!item) return;
      lbImage.src = item.href;
      lbImage.alt = item.caption;
      lbCaption.textContent = item.caption;
      lbCounter.textContent = `${index + 1} / ${items.length}`;
      currentIndex = index;
    };

    const openAt = (index, trigger) => {
      lastTrigger = trigger || null;
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.classList.add('lightbox-open');
      renderItem(index);
      lbClose.focus();
    };

    const closeLb = () => {
      lb.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      setTimeout(() => { lb.hidden = true; }, 200);
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    };

    const step = (delta) => {
      const next = (currentIndex + delta + items.length) % items.length;
      renderItem(next);
    };

    tileLinks.forEach((link, i) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openAt(i, link);
      });
    });

    lbClose.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', () => step(-1));
    lbNext.addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLb();
    });

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
  }

})();
