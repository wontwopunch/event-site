/* ================================================
   SignalDecode — Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Header scroll behavior ---- */
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add('scrolled');
      scrollTopBtn.classList.add('visible');
    } else {
      header.classList.remove('scrolled');
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- 2. Active nav pill on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.pill-nav__item:not(.pill-nav__item--cta)');

  const sectionMap = {
    'what-we-do': 0,
    'company-intro': 1,
    'our-strength': 2,
    'our-projects': 3,
    'review': 4,
    'faq': 5,
  };

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navItems.forEach(item => item.classList.remove('active'));
    if (current && sectionMap[current] !== undefined) {
      const idx = sectionMap[current];
      if (navItems[idx]) navItems[idx].classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ---- 3. Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        // close mobile menu if open
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  });

  /* ---- 4. Mobile hamburger menu ---- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-label', hamburger.classList.contains('open') ? '메뉴 닫기' : '메뉴 열기');
  });

  /* ---- 5. Scroll reveal (IntersectionObserver) ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- 6. Counter animation ---- */
  function animateCounter(el, target, duration = 1800) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        statNums.forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const showcase = document.querySelector('.showcase-card__stats');
  if (showcase) counterObserver.observe(showcase);

  /* ---- 7. FAQ accordion ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question?.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // close all
      faqItems.forEach(i => {
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.classList.remove('open');
      });

      // open clicked (unless it was already open)
      if (!isOpen) {
        question.setAttribute('aria-expanded', 'true');
        answer?.classList.add('open');
      }
    });
  });

  /* ---- 8. Contact form ---- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      // simple validation shake
      if (!name) shakeField(document.getElementById('name'));
      if (!email) shakeField(document.getElementById('email'));
      if (!message) shakeField(document.getElementById('message'));
      return;
    }

    // Simulate form submission
    const btn = contactForm.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = '전송 중...';
      btn.disabled = true;
    }

    setTimeout(() => {
      contactForm.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
    }, 1200);
  });

  function shakeField(el) {
    if (!el) return;
    el.style.borderColor = '#2563EB';
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' },
    ], { duration: 400, easing: 'ease-in-out' });
    setTimeout(() => { el.style.borderColor = ''; }, 1500);
  }

  /* ---- 9. Hero title typewriter reveal ---- */
  // Ensure hero elements reveal without waiting for scroll
  const heroReveals = document.querySelectorAll('.hero .reveal');
  setTimeout(() => {
    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 150);
    });
  }, 100);

  /* ---- 10. Parallax-lite on hero showcase ---- */
  const showcaseCard = document.querySelector('.showcase-card');
  if (showcaseCard && window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const cx = e.clientX / w - 0.5;
      const cy = e.clientY / h - 0.5;
      showcaseCard.style.transform = `perspective(1000px) rotateY(${cx * 8}deg) rotateX(${-cy * 6}deg)`;
    }, { passive: true });

    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      showcaseCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---- 11. Service card hover label ---- */
  // tags bounce on card hover
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.querySelectorAll('.tag').forEach((tag, i) => {
        tag.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-4px)' },
          { transform: 'translateY(0)' },
        ], { duration: 400, delay: i * 60, easing: 'ease-in-out' });
      });
    });
  });

  /* ---- 12. Project card tilt ---- */
  if (window.innerWidth > 768) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateY(${cx * 5}deg) rotateX(${-cy * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---- 13. Cursor dot (desktop only) ---- */
  if (window.innerWidth > 1024) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-dot';
    Object.assign(cursor.style, {
      position: 'fixed',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#2563EB',
      pointerEvents: 'none',
      zIndex: '99999',
      transition: 'transform 0.1s ease',
      transform: 'translate(-50%, -50%)',
      top: '0', left: '0',
    });
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    }, { passive: true });

    document.querySelectorAll('a, button, .project-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(2.5)');
      el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
    });
  }

  /* ---- 14. Section number reveal animation ---- */
  document.querySelectorAll('.section-badge').forEach(badge => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          badge.style.animation = 'spin-in 0.6s ease forwards';
          observer.unobserve(badge);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(badge);
  });

  /* Add spin-in keyframe dynamically */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin-in {
      0% { transform: rotate(-180deg) scale(0.5); opacity: 0; }
      100% { transform: rotate(0deg) scale(1); opacity: 1; }
    }
    .showcase-card {
      transition: transform 0.15s ease;
    }
  `;
  document.head.appendChild(style);

  /* ---- 15. Strength items stagger reveal ---- */
  const strengthItems = document.querySelectorAll('.strength-item');
  const strengthObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        strengthItems.forEach((item, i) => {
          setTimeout(() => item.classList.add('revealed'), i * 120);
        });
        strengthObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  if (strengthItems.length) strengthObserver.observe(strengthItems[0]);

});
