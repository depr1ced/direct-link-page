// White canvas particle network on a pure black background.
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, points = [], raf = 0, time = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  function createPoint() {
    const depth = Math.pow(Math.random(), .72);
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(.018, .105) * (.35 + depth * 1.35);

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      depth,
      r: rand(.35, .8) + depth * rand(1.0, 2.7),
      a: rand(.08, .22) + depth * rand(.18, .48),
      phase: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      wobble: rand(.0007, .0028),
      drift: rand(.012, .06) * (.45 + depth),
      linkBias: rand(.82, 1.18)
    };
  }

  function resize() {
    const oldW = w || innerWidth;
    const oldH = h || innerHeight;
    w = innerWidth;
    h = innerHeight;

    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = coarse
      ? Math.min(72, Math.floor(w * h / 20500))
      : Math.min(155, Math.floor(w * h / 14200));

    const wanted = Math.max(38, count);

    if (!points.length) {
      points = Array.from({ length: wanted }, createPoint);
    } else {
      const sx = w / Math.max(oldW, 1);
      const sy = h / Math.max(oldH, 1);

      points.forEach(p => {
        p.x *= sx;
        p.y *= sy;
      });

      while (points.length < wanted) {
        points.push(createPoint());
      }

      points.length = wanted;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 1;

    const rendered = new Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      if (!reduced) {
        const chaosX =
          Math.sin(time * p.wobble + p.phase) * p.drift;

        const chaosY =
          Math.cos(time * p.wobble * .83 + p.phase2) * p.drift;

        const crossX =
          Math.sin(time * p.wobble * .37 + p.phase2) *
          p.drift *
          .42;

        const crossY =
          Math.cos(time * p.wobble * .51 + p.phase) *
          p.drift *
          .42;

        p.x += p.vx + chaosX + crossX;
        p.y += p.vy + chaosY + crossY;

        const pad = 45;

        if (p.x < -pad) p.x = w + pad;
        if (p.x > w + pad) p.x = -pad;
        if (p.y < -pad) p.y = h + pad;
        if (p.y > h + pad) p.y = -pad;
      }

      rendered[i] = {
        x: p.x,
        y: p.y,
        p
      };
    }

    for (let i = 0; i < rendered.length; i++) {
      const a = rendered[i];
      const baseDistance = coarse ? 100 : 128;
      const linkDistance = baseDistance * a.p.linkBias;

      for (let j = i + 1; j < rendered.length; j++) {
        const b = rendered[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        if (
          Math.abs(dx) > linkDistance ||
          Math.abs(dy) > linkDistance
        ) {
          continue;
        }

        const dist = Math.hypot(dx, dy);

        if (dist >= linkDistance) continue;

        const depthMix =
          (a.p.depth + b.p.depth) * .5;

        const alpha =
          (1 - dist / linkDistance) *
          (.045 + depthMix * .085);

        ctx.strokeStyle =
          `rgba(255,255,255,${alpha.toFixed(3)})`;

        ctx.lineWidth =
          .45 + depthMix * .55;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    rendered.sort(
      (a, b) => a.p.depth - b.p.depth
    );

    for (const item of rendered) {
      const p = item.p;

      const pulse =
        .86 +
        Math.sin(
          time * p.wobble * 2.1 + p.phase
        ) * .14;

      ctx.fillStyle =
        `rgba(255,255,255,${
          Math.max(.04, p.a * pulse).toFixed(3)
        })`;

      ctx.beginPath();

      ctx.arc(
        item.x,
        item.y,
        p.r * pulse,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  let resizeTimer;

  addEventListener('resize', () => {
    clearTimeout(resizeTimer);

    resizeTimer =
      setTimeout(resize, 120);
  }, {
    passive: true
  });

  resize();
  draw();
})();


// Reveal blocks
const reveals =
  [...document.querySelectorAll('.reveal')];

const observer =
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

reveals.forEach(
  el => observer.observe(el)
);


// Setup tabs
const tabs =
  [...document.querySelectorAll('.tab')];

const panels =
  [...document.querySelectorAll('.setup-panel')];

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {

    tabs.forEach((item) => {
      item.classList.toggle(
        'active',
        item === tab
      );
    });

    panels.forEach((panel) => {
      const active =
        panel.dataset.panel ===
        tab.dataset.tab;

      panel.hidden = !active;

      panel.classList.toggle(
        'active',
        active
      );
    });
  });
});


// Basic deterrence against casual selection/copying.
[
  'copy',
  'cut',
  'contextmenu',
  'dragstart'
].forEach((name) => {
  document.addEventListener(
    name,
    (event) => event.preventDefault()
  );
});

document.addEventListener(
  'keydown',
  (event) => {

    const key =
      event.key.toLowerCase();

    const editable =
      event.target.matches?.(
        'input, textarea, [contenteditable="true"]'
      );

    if (editable) return;

    if (
      (event.ctrlKey || event.metaKey) &&
      ['c', 'x', 'a', 's', 'u'].includes(key)
    ) {
      event.preventDefault();
    }
  }
);


// =============================
// RU / EN
// =============================

const SITE_I18N = {

  ru: {

    navNote:
      "В дороге к лучшему...",

    eyebrow:
      "СТРИМЕР · КОДЕР",

    tagline:
      "стримы | короткие видео | общение",

    heroAbout:
      "Имя: ??????? | Возраст: 20 | Пол: Мужской | Локация: Казахстан, Алматы",

    linksSection:
      "ССЫЛКИ",

    telegramSub:
      "анонсы, чат",

    tiktokSub:
      "стримы + короткие видео",

    twitchSub:
      "стримы + VOD",

    discordSub:
      "сообщество",

    donateSub:
      "поддержать канал",

    osuSub:
      "профиль",

    donateStreamTitle:
      "DonationAlerts (На стриме)",

    dalinkTitle:
      "Dalink (Вне стрима)",

    setupSection:
      "СЕТАП",

    setupAria:
      "Категории сетапа",

    tabPc:
      "ПК",

    tabPeriphery:
      "Периферия",

    tabGadgets:
      "Гаджеты",

    cpuLabel:
      "ПРОЦЕССОР",

    gpuLabel:
      "ВИДЕОКАРТА",

    mbLabel:
      "МАТЕРИНСКАЯ ПЛАТА",

    ramLabel:
      "ОПЕРАТИВНАЯ ПАМЯТЬ",

    coolerLabel:
      "ОХЛАЖДЕНИЕ",

    psuLabel:
      "БЛОК ПИТАНИЯ",

    romLabel:
      "НАКОПИТЕЛИ",

    monitor1Label:
      "МОНИТОР 1",

    monitor2Label:
      "МОНИТОР 2",

    tabletLabel:
      "ПЛАНШЕТ",

    keyboardLabel:
      "КЛАВИАТУРА",

    mouseLabel:
      "МЫШЬ",

    microphoneLabel:
      "МИКРОФОН",

    headphonesLabel:
      "НАУШНИКИ",

    mainphoneLabel:
      "ОСНОВНОЙ ТЕЛЕФОН",

    webcamLabel:
      "ВЕБ-КАМЕРА",

    watchLabel:
      "ЧАСЫ",

    notebook1Label:
      "РАБОЧИЙ НОУТБУК",

    notebook2Label:
      "НОУТБУК",

    aboutSection:
      "О САЙТЕ",

    aboutText:
      "Уголок где я могу свободно осуществлять свою мечту, и выражать свое настроение.",

    privacy:
      "Политика конфиденциальности",

    terms:
      "Условия использования",

    metaDescription:
      "DEPRICED — BIO.",

    ogDescription:
      "Depriced_Live"
  },


  en: {

    navNote:
      "On the way to something better...",

    eyebrow:
      "STREAMER · CODER",

    tagline:
      "streams | short videos | communication",

    heroAbout:
      "Name: ??????? | Age: 20 | Gender: Male | Location: Kazakhstan, Almaty",

    linksSection:
      "LINKS",

    telegramSub:
      "announcements, chat",

    tiktokSub:
      "streams + short videos",

    twitchSub:
      "streams + VOD",

    discordSub:
      "community",

    donateSub:
      "support the channel",

    osuSub:
      "profile",

    donateStreamTitle:
      "DonationAlerts (During streams)",

    dalinkTitle:
      "Dalink (Outside streams)",

    setupSection:
      "SETUP",

    setupAria:
      "Setup categories",

    tabPc:
      "PC",

    tabPeriphery:
      "Peripherals",

    tabGadgets:
      "Gadgets",

    cpuLabel:
      "CPU",

    gpuLabel:
      "GPU",

    mbLabel:
      "MOTHERBOARD",

    ramLabel:
      "MEMORY",

    coolerLabel:
      "COOLER",

    psuLabel:
      "POWER SUPPLY",

    romLabel:
      "STORAGE",

    monitor1Label:
      "MONITOR 1",

    monitor2Label:
      "MONITOR 2",

    tabletLabel:
      "TABLET",

    keyboardLabel:
      "KEYBOARD",

    mouseLabel:
      "MOUSE",

    microphoneLabel:
      "MICROPHONE",

    headphonesLabel:
      "HEADPHONES",

    mainphoneLabel:
      "MAIN PHONE",

    webcamLabel:
      "WEB CAMERA",

    watchLabel:
      "WATCH",

    notebook1Label:
      "WORK LAPTOP",

    notebook2Label:
      "LAPTOP",

    aboutSection:
      "ABOUT",

    aboutText:
      "A place where I can freely pursue my dream and express my mood.",

    privacy:
      "Privacy Policy",

    terms:
      "Terms of Service",

    metaDescription:
      "DEPRICED — BIO.",

    ogDescription:
      "Depriced_Live"
  }
};


function applySiteLanguage(lang) {

  const dict =
    SITE_I18N[lang] ||
    SITE_I18N.ru;

  document.documentElement.lang =
    lang;

  localStorage.setItem(
    "siteLang",
    lang
  );


  // data-i18n elements
  document
    .querySelectorAll("[data-i18n]")
    .forEach((node) => {

      const key =
        node.dataset.i18n;

      if (dict[key]) {
        node.textContent =
          dict[key];
      }
    });


  // TikTok description
  const tiktokSub =
    document.querySelector(
      'a[data-type="tiktok"] .link-subtitle'
    );

  if (tiktokSub) {
    tiktokSub.textContent =
      dict.tiktokSub;
  }


  // Twitch description
  const twitchSub =
    document.querySelector(
      'a[data-type="twitch"] .link-subtitle'
    );

  if (twitchSub) {
    twitchSub.textContent =
      dict.twitchSub;
  }


  // DonationAlerts title
  const donationTitle =
    document.querySelector(
      'a[href*="donationalerts.com"] .link-title'
    );

  if (donationTitle) {
    donationTitle.textContent =
      dict.donateStreamTitle;
  }


  // Dalink title
  const dalinkTitle =
    document.querySelector(
      'a[href*="dalink.to"] .link-title'
    );

  if (dalinkTitle) {
    dalinkTitle.textContent =
      dict.dalinkTitle;
  }


  // Setup aria-label
  const setupTabs =
    document.querySelector(".tabs");

  if (
    setupTabs &&
    dict.setupAria
  ) {
    setupTabs.setAttribute(
      "aria-label",
      dict.setupAria
    );
  }


  // META
  const desc =
    document.querySelector(
      'meta[name="description"]'
    );

  const ogDesc =
    document.querySelector(
      'meta[property="og:description"]'
    );

  if (
    desc &&
    dict.metaDescription
  ) {
    desc.content =
      dict.metaDescription;
  }

  if (
    ogDesc &&
    dict.ogDescription
  ) {
    ogDesc.content =
      dict.ogDescription;
  }


  // Active language button
  document
    .querySelectorAll(".lang-btn")
    .forEach((btn) => {

      const active =
        btn.dataset.lang === lang;

      btn.classList.toggle(
        "is-active",
        active
      );

      btn.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
}


// Initial language
const savedLang =
  localStorage.getItem("siteLang");

applySiteLanguage(
  savedLang === "en"
    ? "en"
    : "ru"
);


// =============================
// Entrance / reveal / card glow
// =============================

(() => {

  const revealNodes =
    [...document.querySelectorAll(".reveal")];

  const linkRows =
    [...document.querySelectorAll(".link-row")];


  revealNodes.forEach(
    (node, index) => {

      node.style.setProperty(
        "--reveal-delay",
        `${Math.min(index, 5) * 0.08}s`
      );
    }
  );


  linkRows.forEach(
    (row, index) => {

      row.style.setProperty(
        "--i",
        index
      );
    }
  );


  if (
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches
  ) {

    document
      .querySelectorAll(".card")
      .forEach((card) => {

        card.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              card.getBoundingClientRect();

            card.style.setProperty(
              "--mx",
              `${event.clientX - rect.left}px`
            );

            card.style.setProperty(
              "--my",
              `${event.clientY - rect.top}px`
            );
          },
          {
            passive: true
          }
        );
      });
  }


  const markVisible = () => {

    const viewport =
      window.innerHeight || 800;

    revealNodes.forEach((node) => {

      if (
        node.classList.contains(
          "in-view"
        )
      ) {
        return;
      }

      const rect =
        node.getBoundingClientRect();

      if (
        rect.top <
          viewport * 0.90 &&
        rect.bottom > 0
      ) {
        node.classList.add(
          "in-view"
        );
      }
    });
  };


  let rafPending = false;

  const scheduleVisibleCheck =
    () => {

      if (rafPending) return;

      rafPending = true;

      requestAnimationFrame(() => {

        rafPending = false;
        markVisible();
      });
    };


  window.addEventListener(
    "scroll",
    scheduleVisibleCheck,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    scheduleVisibleCheck,
    {
      passive: true
    }
  );


  const revealSite =
    () => {

      requestAnimationFrame(() => {

        requestAnimationFrame(() => {

          markVisible();

          document
            .documentElement
            .classList
            .add("site-ready");

          setTimeout(() => {

            document
              .documentElement
              .classList
              .add("site-settled");

          }, 2200);
        });
      });
    };


  if (
    document.readyState ===
    "complete"
  ) {

    setTimeout(
      revealSite,
      100
    );

  } else {

    window.addEventListener(
      "load",
      () => {
        setTimeout(
          revealSite,
          100
        );
      },
      {
        once: true
      }
    );
  }


  // fallback
  setTimeout(
    revealSite,
    1100
  );

})();


// =============================
// Language transition
// =============================

document
  .querySelectorAll(".lang-btn")
  .forEach((btn) => {

    btn.addEventListener(
      "click",
      (event) => {

        event.stopImmediatePropagation();

        const lang =
          btn.dataset.lang;

        const current =
          localStorage.getItem(
            "siteLang"
          ) === "en"
            ? "en"
            : "ru";

        if (
          lang === current
        ) {
          return;
        }

        const veil =
          document.getElementById(
            "lang-veil"
          );

        veil?.classList.add(
          "is-active"
        );

        setTimeout(() => {

          applySiteLanguage(lang);

          requestAnimationFrame(() => {

            setTimeout(() => {

              veil?.classList.remove(
                "is-active"
              );

            }, 40);
          });

        }, 145);
      },
      true
    );
  });