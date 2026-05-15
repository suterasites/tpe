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

})();
