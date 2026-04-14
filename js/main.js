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
  const navItems = document.querySelectorAll('.header-nav__link');

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

  /* ---- 5b. 고객 후기 무한 캐러셀 (Figma 6:2706, 프로필 이미지 4:145) ---- */
  const REVIEW_AVATAR_SRC = 'images/review-avatar.png';

  const REVIEW_ITEMS = [
    {
      name: '김*영',
      date: '26.05.22',
      rating: '4.0',
      text: '요구사항 정리부터 문서화까지 체계적으로 지원해 주셔서 내부 보고 및 예산 승인이 수월했습니다. 일정과 품질 모두 기대에 부합했습니다.',
    },
    {
      name: '성*우',
      date: '26.05.22',
      rating: '4.0',
      text: '기획·디자인·개발을 일괄 의뢰했는데, 단계별 산출물 기준이 명확해 내부 검토가 빨랐습니다. 초안부터 방향이 잘 맞았습니다.',
    },
    {
      name: '신*지',
      date: '26.05.22',
      rating: '4.0',
      text: '해외 법인이랑 시차 협업이 필요했는데 회의 및 이슈 대응이 신속해서 글로벌 롤아웃 일정을 지킬 수 있었습니다.',
    },
    {
      name: '(주) ***시스템',
      date: '25.11.08',
      rating: '4.5',
      text: '규제와 내부통제 요건을 반영한 권한 설계와 로그 정책까지 함께 검토해 주셔서 감사합니다.',
    },
    {
      name: '이**',
      date: '25.09.19',
      rating: '4.0',
      text: '비IT 담당자도 이해할 수 있게 용어와 프로세스를 정리해 주셔서 경영진 보고 시 설득력이 높았습니다.',
    },
    {
      name: '익명',
      date: '25.08.02',
      rating: '5.0',
      text: '다부서 요구가 많은 대규모 구축이었으나, 일정·이슈 관리가 체계적이었고 오픈 이후 유지보수 대응도 신속했습니다.',
    },
    {
      name: '윤**',
      date: '25.06.14',
      rating: '4.0',
      text: '정보 구조와 콘텐츠 흐름을 사전에 제안해 주셔서 내부 검수 단계가 단축되었습니다. 품질 관리 체계가 명확했습니다.',
    },
    {
      name: 'B****',
      date: '25.04.30',
      rating: '4.0',
      text: '디자인·개발을 단일 파트너로 진행해 협업 비용을 줄였고, 산출물 품질도 일정 수준 이상으로 유지되었습니다.',
    },
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initReviewCarousel() {
    const root = document.getElementById('reviewCarousel');
    const track = document.getElementById('reviewCarouselTrack');
    if (!root || !track || !REVIEW_ITEMS.length) return;

    const M = REVIEW_ITEMS.length;
    const GAP = 24;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let offset = M;
    let isAnimating = false;

    function slideHtml(item) {
      return (
        `<article class="review-slide" role="listitem">
          <div class="review-slide__top">
            <div class="review-slide__person">
              <div class="review-slide__avatar" aria-hidden="true">
                <img src="${REVIEW_AVATAR_SRC}" width="54" height="54" alt="" decoding="async" loading="lazy" />
              </div>
              <div class="review-slide__meta">
                <span class="review-slide__name">${escapeHtml(item.name)}</span>
                <span class="review-slide__date">${escapeHtml(item.date)}</span>
              </div>
            </div>
            <div class="review-slide__rating">
              <i class="fa-solid fa-star review-slide__star-icon" aria-hidden="true"></i>
              <span class="review-slide__score">${escapeHtml(item.rating)}</span>
            </div>
          </div>
          <p class="review-slide__text">${escapeHtml(item.text)}</p>
        </article>`
      );
    }

    track.innerHTML = '';
    for (let c = 0; c < 3; c += 1) {
      REVIEW_ITEMS.forEach((item) => {
        track.insertAdjacentHTML('beforeend', slideHtml(item));
      });
    }

    function getCardsPerView() {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 640) return 2;
      return 1;
    }

    function getMetrics() {
      const vp = root.querySelector('.review-carousel__viewport');
      const v = getCardsPerView();
      const inner = vp ? vp.clientWidth : root.clientWidth;
      const slideW = (inner - (v - 1) * GAP) / v;
      return { v, slideW, step: slideW + GAP };
    }

    function applyTransform(animate) {
      const { step } = getMetrics();
      const useAnim = animate && !prefersReduced;
      if (!useAnim) track.classList.add('is-no-transition');
      else track.classList.remove('is-no-transition');
      track.style.transform = `translate3d(${-offset * step}px, 0, 0)`;
      if (!useAnim) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => track.classList.remove('is-no-transition'));
        });
      }
    }

    function layout() {
      const { slideW } = getMetrics();
      track.style.setProperty('--review-slide-w', `${slideW}px`);
      offset = M;
      applyTransform(false);
    }

    function finishTransition(onSnap) {
      let done = false;
      const run = (e) => {
        if (done) return;
        if (e && e.propertyName && e.propertyName !== 'transform') return;
        done = true;
        clearTimeout(fallback);
        track.removeEventListener('transitionend', run);
        onSnap();
        isAnimating = false;
      };
      const fallback = setTimeout(() => run(), 480);
      track.addEventListener('transitionend', run);
    }

    function goNext() {
      if (isAnimating) return;
      isAnimating = true;
      offset += 1;
      if (prefersReduced) {
        if (offset >= 2 * M) offset -= M;
        applyTransform(false);
        isAnimating = false;
        return;
      }
      applyTransform(true);
      finishTransition(() => {
        if (offset >= 2 * M) {
          offset -= M;
          applyTransform(false);
        }
      });
    }

    function goPrev() {
      if (isAnimating) return;
      isAnimating = true;
      offset -= 1;
      if (prefersReduced) {
        if (offset < M) offset += M;
        applyTransform(false);
        isAnimating = false;
        return;
      }
      applyTransform(true);
      finishTransition(() => {
        if (offset < M) {
          offset += M;
          applyTransform(false);
        }
      });
    }

    layout();

    let resizeTimer;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => layout(), 120);
      },
      { passive: true },
    );

    root.querySelector('.review-carousel__btn--next')?.addEventListener('click', goNext);
    root.querySelector('.review-carousel__btn--prev')?.addEventListener('click', goPrev);

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    });

    root.setAttribute('tabindex', '0');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', '고객 후기 슬라이드');
  }

  initReviewCarousel();

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

  if (statNums.length) {
    const counterRoot = statNums[0].closest('section') || document.body;
    counterObserver.observe(counterRoot);
  }

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

  /* ---- 10. Parallax-lite on hero chart ---- */
  const heroChartShell = document.querySelector('.hero-chart-shell');
  if (heroChartShell && window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const cx = e.clientX / w - 0.5;
      const cy = e.clientY / h - 0.5;
      heroChartShell.style.transform = `perspective(1000px) rotateY(${cx * 6}deg) rotateX(${-cy * 4}deg)`;
    }, { passive: true });

    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      heroChartShell.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
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

    document.querySelectorAll('a, button, .project-card, .service-card, .review-carousel__btn').forEach(el => {
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
    .hero-chart-shell {
      transition: transform 0.15s ease;
    }
  `;
  document.head.appendChild(style);

  /* ---- 15. Strength items stagger reveal ---- */
  const strengthItems = document.querySelectorAll('.strength-card');
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

  /* ---- 16. 회사 강점 카드 — 활성 스타일 자동 순환 ---- */
  const strengthSection = document.getElementById('our-strength');
  let strengthRotateTimer = null;
  const STRENGTH_ROTATE_MS = 2000;

  function applyStrengthActive(index) {
    strengthItems.forEach((card, i) => {
      const on = i === index;
      card.classList.toggle('strength-card--active', on);
      card.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function startStrengthRotation() {
    if (!strengthItems.length || strengthRotateTimer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let idx = 0;
    strengthItems.forEach((card, i) => {
      if (card.classList.contains('strength-card--active')) idx = i;
    });
    strengthRotateTimer = window.setInterval(() => {
      idx = (idx + 1) % strengthItems.length;
      applyStrengthActive(idx);
    }, STRENGTH_ROTATE_MS);
  }

  function stopStrengthRotation() {
    if (strengthRotateTimer) {
      clearInterval(strengthRotateTimer);
      strengthRotateTimer = null;
    }
  }

  if (strengthSection && strengthItems.length) {
    const strengthIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startStrengthRotation();
        else stopStrengthRotation();
      });
    }, { threshold: 0.2 });
    strengthIo.observe(strengthSection);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopStrengthRotation();
        return;
      }
      const r = strengthSection.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      if (inView) startStrengthRotation();
    });
  }

});
