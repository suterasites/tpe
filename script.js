(() => {

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
