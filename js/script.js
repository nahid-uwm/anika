(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Mobile menu ---------- */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const setMobileMenu = (open) => {
        if (!mobileToggle || !mobileOverlay) return;
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        mobileOverlay.classList.toggle('active', open);
        if (open) {
            mobileOverlay.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            // Defer hiding until transition ends so exit animation plays.
            setTimeout(() => {
                if (!mobileOverlay.classList.contains('active')) {
                    mobileOverlay.setAttribute('hidden', '');
                }
            }, 450);
        }
    };

    mobileToggle?.addEventListener('click', () => {
        const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
        setMobileMenu(!isOpen);
    });

    mobileLinks.forEach((link) => {
        link.addEventListener('click', () => setMobileMenu(false));
    });

    // Close mobile menu when crossing back to desktop width
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
        if (e.matches) setMobileMenu(false);
    });

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal-up');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('active'));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Header + scroll-to-top (rAF-throttled) ---------- */
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scrollTop');
    let scrollTicking = false;

    const onScroll = () => {
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 40);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 500);
        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    }, { passive: true });
    onScroll();

    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    });

    /* ---------- Scrollspy for nav ---------- */
    const navLinks = document.querySelectorAll('[data-nav]');
    const sectionMap = new Map();
    navLinks.forEach((link) => {
        const id = link.getAttribute('href')?.slice(1);
        if (!id) return;
        const section = document.getElementById(id);
        if (section) sectionMap.set(section, link);
    });

    if (sectionMap.size && 'IntersectionObserver' in window) {
        const spyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const link = sectionMap.get(entry.target);
                    if (!link) return;
                    if (entry.isIntersecting) {
                        navLinks.forEach((l) => {
                            l.classList.remove('active');
                            l.removeAttribute('aria-current');
                        });
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'true');
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );
        sectionMap.forEach((_link, section) => spyObserver.observe(section));
    }

    /* ---------- Modals ---------- */
    const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    let activeModal = null;
    let lastFocused = null;

    const openModal = (modal) => {
        if (!modal || activeModal) return;
        lastFocused = document.activeElement;
        modal.removeAttribute('hidden');
        // Force reflow so transition runs
        void modal.offsetWidth;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        activeModal = modal;

        const focusables = modal.querySelectorAll(FOCUSABLE);
        const first = focusables[0];
        (first || modal).focus({ preventScroll: true });
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        activeModal = null;
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.setAttribute('hidden', '');
            }
        }, 450);
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus({ preventScroll: true });
            lastFocused = null;
        }
    };

    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const id = trigger.getAttribute('data-modal-open');
            if (id) openModal(document.getElementById(id));
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-backdrop');
            closeModal(modal);
        });
    });

    // Click on backdrop (outside dialog content) closes
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.addEventListener('mousedown', (e) => {
            if (e.target === backdrop) closeModal(backdrop);
        });
    });

    // Keyboard: ESC closes, Tab traps focus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (activeModal) {
                closeModal(activeModal);
                return;
            }
            if (mobileOverlay?.classList.contains('active')) {
                setMobileMenu(false);
            }
            return;
        }

        if (e.key === 'Tab' && activeModal) {
            const focusables = activeModal.querySelectorAll(FOCUSABLE);
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
})();
