/* ============================================================
   Kret Check — main.js
   1. สลับโหมดกลางวัน/กลางคืน
   2. เมนูปุ่มกดเปิด (มือถือ + ไอแพดแนวตั้ง)
   3. scroll reveal
   4. ไฮไลต์เมนูตาม section ที่กำลังดูอยู่

   หมายเหตุ: มีสคริปต์สั้น ๆ อีกชิ้นอยู่ใน <head> ของทุกหน้า
   ทำหน้าที่ใส่ data-theme ก่อนหน้าจะวาด ถ้าย้ายมาไว้ในไฟล์นี้
   จะเห็นหน้าขาวแวบหนึ่งก่อนเปลี่ยนเป็นโหมดมืด
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var STORE_KEY = 'kretcheck-theme';

  /* ---------- 1. สลับโหมดกลางวัน/กลางคืน ---------- */
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* โหมดส่วนตัวเขียนไม่ได้ ไม่เป็นไร */ }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(next === 'dark'));
      btn.setAttribute('aria-label', next === 'dark' ? 'สลับเป็นโหมดกลางวัน' : 'สลับเป็นโหมดกลางคืน');
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });
  setTheme(currentTheme());

  /* ---------- 2. เมนูปุ่มกดเปิด ---------- */
  var burger = document.querySelector('[data-burger]');
  var panel = document.querySelector('[data-nav-panel]');

  if (burger && panel) {
    var closeMenu = function () {
      burger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('data-open', 'false');
    };

    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      panel.setAttribute('data-open', String(!open));
    });

    /* กดลิงก์ในเมนูแล้วปิดเอง */
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* พอจอกว้างพอจนเมนูกางเต็มแถบแล้ว ต้องล้างสถานะเปิดทิ้ง */
    var wide = window.matchMedia('(min-width: 1000px)');
    var onWide = function (mq) { if (mq.matches) closeMenu(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* ---------- 3. scroll reveal ---------- */
  var targets = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!targets.length) {
    /* ไม่มีอะไรต้องทำ */
  } else if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. ไฮไลต์เมนูตาม section ที่กำลังดูอยู่ ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
