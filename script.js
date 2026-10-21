// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ССЫЛОК
// ==========================================
// Вставьте адрес вашего сервера на Railway (без слэша в конце):
const API_URL = "https://icedbarr-api-production.up.railway.app";

const LINKS = {
  bot: "https://t.me/your_bot",
  projects: "https://t.me/cryptojoon",
  project1: "https://t.me/cryptojoon",
  project2: "https://t.me/icedbarrbot",
  project3: "https://t.me/ICEDCTIVE"
};

// Обработка ссылок
document.querySelectorAll("[data-link]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    const url = LINKS[el.dataset.link];
    if (url && url !== "#") window.open(url, "_blank", "noopener,noreferrer");
    else alert("ССЫЛКА ПОКА НЕ ДОБАВЛЕНА. ОТКРОЙТЕ script.js.");
  });
});

// Мобильное меню
const mobileMenu = document.getElementById("mobileMenu");
const nav = document.getElementById("nav");
if (mobileMenu && nav) {
  mobileMenu.addEventListener("click", () => nav.classList.toggle("open"));
}

// ==========================================
// РЕЙТИНГ (ЗВЁЗДЫ)
// ==========================================
let rating = 5;
const stars = [...document.querySelectorAll("#stars button")];
const ratingValue = document.getElementById("ratingValue");

function drawStars() {
  stars.forEach(s => s.classList.toggle("active", Number(s.dataset.star) <= rating));
  if (ratingValue) ratingValue.textContent = rating;
}

stars.forEach(s => s.addEventListener("click", () => {
  rating = Number(s.dataset.star);
  drawStars();
}));
drawStars();

// ==========================================
// РАБОТА С СЕРВЕРОМ И БАЗОЙ ДАННЫХ RAILWAY
// ==========================================
const list = document.getElementById("reviewList");
const status = document.getElementById("status");

// Функция экранирования HTML (защита от XSS-атак)
function safe(text) {
  return String(text).replace(/[&<>"']/g, x => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[x]));
}

// Загрузка отзывов с сервера
async function renderReviews() {
  if (!list) return;

  try {
    const res = await fetch(`${API_URL}/api/reviews`);
    if (!res.ok) throw new Error("Сбой ответа сервера");
    const reviews = await res.json();

    if (!reviews || !reviews.length) {
      list.innerHTML = '<div class="empty">NO REVIEWS YET_ БУДЬ ПЕРВЫМ.</div>';
      return;
    }

    list.innerHTML = reviews.map(r => `
      <article class="review">
        <div class="review-head">
          <strong>${safe(r.name)}</strong>
          <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
        </div>
        <p>${safe(r.text)}</p>
      </article>
    `).join("");
  } catch (err) {
    console.error("Ошибка получения отзывов:", err);
    list.innerHTML = '<div class="empty">ОШИБКА ПОДКЛЮЧЕНИЯ К СЕРВЕРУ БАЗЫ ДАННЫХ.</div>';
  }
}

// Отправка формы отзыва на сервер
const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
  reviewForm.addEventListener("submit", async e => {
    e.preventDefault();

    const textInput = document.getElementById("text");
    const nameInput = document.getElementById("name");
    const anonCheckbox = document.getElementById("anonymous");

    const text = textInput ? textInput.value.trim() : "";
    const anonymous = anonCheckbox ? anonCheckbox.checked : false;
    const typedName = nameInput ? nameInput.value.trim() : "";

    if (!text) {
      if (status) status.textContent = "> ОШИБКА: НАПИШИТЕ ТЕКСТ ОТЗЫВА.";
      return;
    }

    if (status) status.textContent = "> ОТПРАВКА НА СЕРВЕР...";

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: anonymous ? "АНОНИМ" : (typedName || "ГОСТЬ"),
          text,
          rating
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (status) status.textContent = `> ОШИБКА: ${data.error || "Сбой при сохранении"}`;
        return;
      }

      if (textInput) textInput.value = "";
      if (nameInput) nameInput.value = "";
      if (anonCheckbox) anonCheckbox.checked = false;
      rating = 5;
      drawStars();

      if (status) status.textContent = "> ОТЗЫВ СОХРАНЁН В БАЗУ ДАННЫХ_";
      renderReviews();
    } catch (err) {
      console.error("Ошибка сети:", err);
      if (status) status.textContent = "> ОШИБКА СЕТИ ИЛИ СЕРВЕР НЕДОСТУПЕН_";
    }
  });
}

document.querySelectorAll("[data-video]").forEach(btn => {
  btn.addEventListener("click", () => window.open(btn.dataset.video, "_blank", "noopener,noreferrer"));
});

// Запускаем первичное чтение отзывов
renderReviews();

// ==========================================
// ДИЗАЙН, ЧАСТИЦЫ И АНИМАЦИИ
// ==========================================
(function(){
  const colors = ["", "purple", "orange"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("span");
    p.className = "float-pixel " + colors[i % colors.length];
    p.style.left = Math.random() * 100 + "vw";
    p.style.setProperty("--drift", ((Math.random() * 180) - 90) + "px");
    p.style.animationDuration = (8 + Math.random() * 12) + "s";
    p.style.animationDelay = (-Math.random() * 18) + "s";
    document.body.appendChild(p);
  }
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.className = "pixel-spark";
    s.textContent = i % 2 ? "×" : "✦";
    s.style.left = (5 + Math.random() * 90) + "vw";
    s.style.top = (8 + Math.random() * 82) + "vh";
    s.style.animationDelay = (-Math.random() * 4) + "s";
    document.body.appendChild(s);
  }
})();

const extraObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      extraObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".section, .pixel-panel, .section-label, .defi-grid .pixel-card, .works-grid .work")
  .forEach(el => el.classList.add("reveal"));
document.querySelectorAll(".reveal").forEach(el => extraObserver.observe(el));

const heroPixel = document.querySelector(".hero-pixel");
if (heroPixel && window.matchMedia("(pointer:fine)").matches) {
  heroPixel.addEventListener("mousemove", e => {
    const r = heroPixel.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const ch = heroPixel.querySelector(".grid-character");
    if (ch) {
      ch.style.marginLeft = `${x * 12}px`;
      ch.style.marginTop = `${y * 12}px`;
    }
    heroPixel.querySelectorAll(".cuff").forEach((c, i) => {
      c.style.marginLeft = `${x * (i ? 16 : -16)}px`;
      c.style.marginTop = `${y * (i ? -16 : 16)}px`;
    });
  });
  heroPixel.addEventListener("mouseleave", () => {
    const ch = heroPixel.querySelector(".grid-character");
    if (ch) {
      ch.style.marginLeft = "";
      ch.style.marginTop = "";
    }
    heroPixel.querySelectorAll(".cuff").forEach(c => {
      c.style.marginLeft = "";
      c.style.marginTop = "";
    });
  });
}

heroPixel?.addEventListener("click", () => {
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    p.className = "float-pixel orange";
    p.style.position = "absolute";
    p.style.left = "50%";
    p.style.top = "50%";
    p.style.zIndex = "20";
    p.style.animation = "none";
    p.style.opacity = "1";
    heroPixel.appendChild(p);
    const dx = (Math.random() * 260) - 130;
    const dy = (Math.random() * 260) - 130;
    p.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.4)`, opacity: 0 }
    ], { duration: 500 + Math.random() * 500, easing: "steps(5)", fill: "forwards" });
    setTimeout(() => p.remove(), 1200);
  }
});

// ==========================================
// GSAP PIXEL MOTION
// ==========================================
(function initGSAPPixelMotion() {
  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  gsap.set('.hero h1', { willChange: 'transform, filter' });
  gsap.set('.grid-character', { willChange: 'transform' });

  const intro = gsap.timeline({ defaults: { ease: 'steps(5)' } });
  intro
    .from('.brand', { y: -24, opacity: 0, duration: 0.55 })
    .from('nav a', { y: -18, opacity: 0, stagger: 0.08, duration: 0.42 }, '-=.25')
    .from('.hero h1', { scale: 0.72, opacity: 0, duration: 0.55 }, '-=.18')
    .from('.hero-sub', { x: -22, opacity: 0, duration: 0.35 }, '-=.18')
    .from('.hero-copy p', { y: 16, opacity: 0, duration: 0.35 }, '-=.12')
    .from('.hero-pixel', { scale: 0.78, opacity: 0, duration: 0.65 }, '-=.2')
    .from('.hero .pixel-button', { y: 18, opacity: 0, stagger: 0.1, duration: 0.35 }, '-=.25');

  gsap.to('.grid-character', {
    y: '-=5', x: '+=2', duration: 1.35, repeat: -1, yoyo: true,
    ease: 'steps(4)'
  });

  gsap.to('.pixel-cage', {
    x: 3, rotation: 0.7, duration: 0.65, repeat: -1, yoyo: true,
    repeatDelay: 2.2, ease: 'steps(3)'
  });
  gsap.to('.cage-right', {
    x: -3, rotation: -0.7, duration: 0.58, repeat: -1, yoyo: true,
    repeatDelay: 2.6, ease: 'steps(3)'
  });
  gsap.to('.chain-1', { rotation: 26, duration: 1.1, repeat: -1, yoyo: true, ease: 'steps(5)' });
  gsap.to('.chain-2', { rotation: -23, duration: 1.25, repeat: -1, yoyo: true, ease: 'steps(5)', delay: 0.25 });
  gsap.to('.cuff', { y: -7, rotation: -15, duration: 0.75, repeat: -1, yoyo: true, ease: 'steps(4)' });
  gsap.to('.cuff-2', { y: -5, rotation: -23, duration: 0.9, repeat: -1, yoyo: true, ease: 'steps(4)', delay: 0.3 });

  const glitch = gsap.timeline({ repeat: -1, repeatDelay: 3.2 });
  glitch
    .to('.hero h1', { x: -5, skewX: -8, duration: 0.06, ease: 'steps(1)' })
    .to('.hero h1', { x: 6, skewX: 7, duration: 0.05, ease: 'steps(1)' })
    .to('.hero h1', { x: -2, skewX: 0, duration: 0.05, ease: 'steps(1)' })
    .to('.hero h1', { x: 0, duration: 0.08 });

  if (window.ScrollTrigger) {
    gsap.utils.toArray('.section, .pixel-panel, .section-label').forEach((el) => {
      gsap.fromTo(el,
        { y: 42, opacity: 0, filter: 'brightness(.35) contrast(1.4)' },
        { y: 0, opacity: 1, filter: 'brightness(1) contrast(1)', duration: 0.65,
          ease: 'steps(6)',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    gsap.utils.toArray('.pixel-card, .work, .review').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 26, x: (i % 2 ? 8 : -8), opacity: 0 },
        { y: 0, x: 0, opacity: 1, duration: 0.48, delay: (i % 4) * 0.06,
          ease: 'steps(5)',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
      );
    });

    gsap.to('.hero-pixel', {
      scale: 1.05,
      scrollTrigger: { trigger: '.hero-pixel', start: 'top 75%', end: 'bottom 20%', scrub: 1 }
    });
  }

  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.pixel-button, nav a, .submit').forEach(btn => {
      const quickX = gsap.quickTo(btn, 'x', { duration: 0.18, ease: 'power2.out' });
      const quickY = gsap.quickTo(btn, 'y', { duration: 0.18, ease: 'power2.out' });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        quickX((e.clientX - r.left - r.width / 2) * 0.10);
        quickY((e.clientY - r.top - r.height / 2) * 0.10);
      });
      btn.addEventListener('mouseleave', () => { quickX(0); quickY(0); });
    });
  }

  document.querySelectorAll('.pixel-card, .work, .review').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.fromTo(card,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.35)', duration: 0.08, yoyo: true, repeat: 1, ease: 'steps(1)' }
      );
    });
  });

  const cage = document.querySelector('.hero-pixel');
  if (cage) {
    cage.addEventListener('mouseenter', () => {
      gsap.timeline()
        .to('.pixel-cage', { x: -5, duration: 0.06, ease: 'steps(1)' })
        .to('.pixel-cage', { x: 6, duration: 0.06, ease: 'steps(1)' })
        .to('.pixel-cage', { x: -3, duration: 0.05, ease: 'steps(1)' })
        .to('.pixel-cage', { x: 0, duration: 0.05, ease: 'steps(1)' });
    });
  }

  window.addEventListener('load', () => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();