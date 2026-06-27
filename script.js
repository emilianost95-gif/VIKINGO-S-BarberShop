/* =====================================================================
   VIKINGO'S — script.js
   JavaScript puro · sin dependencias
   Módulos:
   1. Loader
   2. Navbar (scroll + hamburguesa)
   3. Scroll progress
   4. Cursor personalizado
   5. Partículas de brasas (canvas)
   6. Scroll reveal (IntersectionObserver)
   7. Contadores animados
   8. Slider de testimonios
   9. Galería (carga de imágenes + lightbox)
   10. Formulario de turnos (validación)
   11. Back to top + número WhatsApp + año
   ===================================================================== */

(function () {
  'use strict';

  /* ============ CONFIGURACIÓN RÁPIDA ============ */
  // Cambiá el número una sola vez acá (formato internacional, sin +, espacios ni guiones).
  const WHATSAPP_NUMBER = '56912345678';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================================
     1. LOADER
     ===================================================================== */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }, 600);
    });
    // Bloquea scroll mientras carga
    document.body.style.overflow = 'hidden';
    // Fallback por si 'load' nunca dispara
    setTimeout(function () {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, 3500);
  }

  /* =====================================================================
     2. NAVBAR
     ===================================================================== */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('burger');
    const menu = document.getElementById('navMenu');

    // Cambio de fondo al hacer scroll
    function onScroll() {
      if (window.scrollY > 60) navbar.classList.add('is-scrolled');
      else navbar.classList.remove('is-scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menú hamburguesa
    function closeMenu() {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    // Cerrar al clickear un link
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* =====================================================================
     3. SCROLL PROGRESS
     ===================================================================== */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* =====================================================================
     4. CURSOR PERSONALIZADO (solo dispositivos con puntero fino)
     ===================================================================== */
  function initCursor() {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    if (!fine || !cursor || !dot) {
      if (cursor) cursor.style.display = 'none';
      if (dot) dot.style.display = 'none';
      return;
    }

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function loop() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursor.style.left = ringX + 'px';
      cursor.style.top = ringY + 'px';
      requestAnimationFrame(loop);
    }
    loop();

    // Estado hover sobre elementos interactivos
    document.querySelectorAll('a, button, [data-cursor="hover"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* =====================================================================
     5. PARTÍCULAS DE BRASAS (CANVAS)
     ===================================================================== */
  function initEmbers() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, embers = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const COUNT = Math.min(70, Math.floor(w / 14));
    const colors = ['#c9a55c', '#e9c97e', '#b06b3a', '#cf8654'];

    function spawn() {
      return {
        x: Math.random() * w,
        y: h + Math.random() * h,
        r: Math.random() * 2.4 + 0.6,
        speed: Math.random() * 0.8 + 0.3,
        drift: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        flicker: Math.random() * 0.05
      };
    }
    for (let i = 0; i < COUNT; i++) embers.push(spawn());

    function draw() {
      ctx.clearRect(0, 0, w, h);
      embers.forEach(function (e) {
        e.y -= e.speed;
        e.x += e.drift;
        e.alpha -= e.flicker * 0.4;
        if (e.y < -10 || e.alpha <= 0) Object.assign(e, spawn());
        ctx.beginPath();
        ctx.globalAlpha = Math.max(e.alpha, 0);
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = e.color;
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* =====================================================================
     6. SCROLL REVEAL
     ===================================================================== */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // pequeño retardo escalonado entre hermanos
          const delay = entry.target.dataset.delay || 0;
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // retardo escalonado automático dentro de grids
    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =====================================================================
     7. CONTADORES ANIMADOS
     ===================================================================== */
  function initCounters() {
    const nums = document.querySelectorAll('.stats__num');
    if (!nums.length) return;

    function animate(el) {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const value = target * eased;
        el.textContent = formatNum(value, decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNum(target, decimals) + suffix;
      }
      requestAnimationFrame(step);
    }

    function formatNum(v, decimals) {
      if (decimals > 0) return v.toFixed(decimals);
      return Math.floor(v).toLocaleString('es-CL');
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate);
      return;
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  /* =====================================================================
     8. SLIDER DE TESTIMONIOS
     ===================================================================== */
  function initTestimonials() {
    const track = document.getElementById('testiTrack');
    const dotsWrap = document.getElementById('testiDots');
    if (!track || !dotsWrap) return;

    const cards = track.children;
    const total = cards.length;
    let index = 0;
    let timer;

    // Crear dots
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.children;

    function goTo(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      for (let d = 0; d < dots.length; d++) dots[d].classList.toggle('is-active', d === index);
    }
    function next() { goTo(index + 1); }
    function start() { if (!prefersReducedMotion) timer = setInterval(next, 5000); }
    function restart() { clearInterval(timer); start(); }

    start();

    // Pausa al pasar el mouse
    const testi = document.getElementById('testi');
    testi.addEventListener('mouseenter', function () { clearInterval(timer); });
    testi.addEventListener('mouseleave', start);
  }

  /* =====================================================================
     9. GALERÍA + LIGHTBOX
     ===================================================================== */
  function initGallery() {
    const items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');
    if (!items.length || !lightbox) return;

    // Aplica como fondo la imagen indicada en data-img (si existe el archivo)
    items.forEach(function (item) {
      const src = item.dataset.img;
      if (src) {
        const probe = new Image();
        probe.onload = function () {
          item.style.backgroundImage = 'url("' + src + '")';
          const ph = item.querySelector('.gallery__ph');
          if (ph) ph.style.display = 'none';
        };
        probe.src = src; // si no existe, queda el placeholder con gradiente
      }
    });

    let current = 0;
    function open(i) {
      current = i;
      const src = items[i].dataset.img;
      lbImg.src = src || '';
      lbImg.alt = items[i].getAttribute('aria-label') || 'Imagen de galería';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    function show(dir) {
      current = (current + dir + items.length) % items.length;
      lbImg.src = items[current].dataset.img || '';
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { open(i); });
    });
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () { show(-1); });
    lbNext.addEventListener('click', function () { show(1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(-1);
      if (e.key === 'ArrowRight') show(1);
    });
  }

  /* =====================================================================
     10. FORMULARIO DE TURNOS (VALIDACIÓN)
     ===================================================================== */
  function initForm() {
    const form = document.getElementById('bookingForm');
    const feedback = document.getElementById('formFeedback');
    if (!form) return;

    // Fecha mínima = hoy
    const fecha = document.getElementById('fecha');
    if (fecha) {
      const today = new Date().toISOString().split('T')[0];
      fecha.min = today;
    }

    const rules = {
      nombre: function (v) { return v.trim().length >= 2 || 'Ingresá tu nombre.'; },
      apellido: function (v) { return v.trim().length >= 2 || 'Ingresá tu apellido.'; },
      telefono: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) || 'Teléfono inválido.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Email inválido.'; },
      servicio: function (v) { return v !== '' || 'Elegí un servicio.'; },
      barbero: function (v) { return true; }, // opcional
      fecha: function (v) { return v !== '' || 'Elegí una fecha.'; },
      hora: function (v) { return v !== '' || 'Elegí una hora.'; }
    };

    function validateField(field) {
      const rule = rules[field.name];
      if (!rule) return true;
      const result = rule(field.value);
      const errEl = form.querySelector('.form__error[data-for="' + field.name + '"]');
      if (result === true) {
        field.classList.remove('is-invalid');
        if (errEl) errEl.textContent = '';
        return true;
      } else {
        field.classList.add('is-invalid');
        if (errEl) errEl.textContent = result;
        return false;
      }
    }

    // Validación en vivo al salir del campo
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        if (rules[field.name] && !validateField(field)) valid = false;
      });

      if (!valid) {
        feedback.textContent = 'Revisá los campos marcados antes de continuar.';
        feedback.className = 'form__feedback is-error';
        return;
      }

      // Éxito: armamos un mensaje y ofrecemos enviarlo por WhatsApp
      const data = Object.fromEntries(new FormData(form).entries());
      feedback.textContent = '¡Listo, ' + data.nombre + '! Te confirmamos tu turno por WhatsApp.';
      feedback.className = 'form__feedback is-success';

      const msg =
        '*Nuevo turno - VIKINGO\'S*%0A' +
        'Nombre: ' + data.nombre + ' ' + data.apellido + '%0A' +
        'Teléfono: ' + data.telefono + '%0A' +
        'Email: ' + data.email + '%0A' +
        'Servicio: ' + data.servicio + '%0A' +
        'Barbero: ' + (data.barbero || 'Sin preferencia') + '%0A' +
        'Fecha: ' + data.fecha + ' ' + data.hora + '%0A' +
        'Comentarios: ' + (data.comentarios || '-');

      setTimeout(function () {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg, '_blank');
      }, 800);

      form.reset();
    });
  }

  /* =====================================================================
     11. BACK TO TOP · WHATSAPP · AÑO
     ===================================================================== */
  function initMisc() {
    // Botón volver arriba
    const toTop = document.getElementById('toTop');
    if (toTop) {
      window.addEventListener('scroll', function () {
        toTop.classList.toggle('is-visible', window.scrollY > 600);
      }, { passive: true });
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    // Número de WhatsApp flotante (usa la config de arriba)
    const wa = document.getElementById('waFloat');
    if (wa) {
      wa.href = 'https://wa.me/' + WHATSAPP_NUMBER +
        '?text=' + encodeURIComponent("Hola VIKINGO'S, quiero reservar un turno");
    }

    // Año del footer
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* =====================================================================
     INICIALIZACIÓN
     ===================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initNavbar();
    initScrollProgress();
    initCursor();
    initEmbers();
    initReveal();
    initCounters();
    initTestimonials();
    initGallery();
    initForm();
    initMisc();
  });

})();
