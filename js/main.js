/* Serenity Yachting Club — interactions */
(function () {
  'use strict';

  /* ── sticky nav ── */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── mobile menu ── */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  var toggle = function (open) {
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', function () {
    toggle(!links.classList.contains('open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') toggle(false);
  });

  /* ── scroll reveal ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── year ── */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ── modal ── */
  var modal = document.getElementById('payModal');
  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ── booking → Telegram ── */
  var TG_FOUNDER = 'https://t.me/nikkiholiday';
  var TG_MANAGER = 'https://t.me/VictoriaSerenity';
  function openBooking(btn) {
    var name = btn.getAttribute('data-name') || 'подорож';
    openModal('Забронювати «' + name + '»',
      '<p>Напишіть нам у Telegram — відповімо одразу, підберемо каюту та підтвердимо дати.</p>' +
      '<div class="modal__tg">' +
        '<a class="btn btn--gold" href="' + TG_FOUNDER + '" target="_blank" rel="noopener" data-close>Написати засновнику</a>' +
        '<a class="btn btn--dark" href="' + TG_MANAGER + '" target="_blank" rel="noopener" data-close>Написати менеджеру</a>' +
      '</div>');
  }
  document.querySelectorAll('.voyage__pay').forEach(function (btn) {
    btn.addEventListener('click', function () { openBooking(btn); });
  });

  /* ── expandable voyage details ── */
  document.querySelectorAll('.voyage__more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      if (panel.hasAttribute('hidden')) {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Згорнути';
      } else {
        panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Детальніше';
      }
    });
  });

  /* ── forms → mail.php (contact + review) ── */
  function showError(form, msg) {
    var note = form.querySelector('.review__note') || form.querySelector('.contact__disclaimer');
    if (note) { note.textContent = msg; note.style.color = '#e0a58a'; }
  }
  function ajaxForm(form, onSuccess) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
      fetch('mail.php', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            onSuccess();
          } else {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            showError(form, (res && res.error) || 'Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.');
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          showError(form, 'Немає звʼязку із сервером. Спробуйте ще раз або напишіть нам у Telegram.');
        });
    });
  }

  var bookingForm = document.getElementById('bookingForm');
  ajaxForm(bookingForm, function () {
    bookingForm.innerHTML =
      '<p class="kicker kicker--light">Дякуємо</p>' +
      '<h3 style="font-family:var(--serif);font-weight:500;font-size:1.8rem;color:var(--ivory);margin-bottom:1rem;">Запит надіслано</h3>' +
      '<p style="color:rgba(246,241,231,.78);">Ми звʼяжемося з вами протягом робочого дня. Хочете швидше — напишіть у ' +
      '<a href="' + TG_MANAGER + '" target="_blank" rel="noopener" style="color:var(--brass-2);text-decoration:underline;">Telegram</a>.</p>';
    bookingForm.classList.add('sent');
  });

  var reviewForm = document.getElementById('reviewForm');
  ajaxForm(reviewForm, function () {
    reviewForm.innerHTML =
      '<p class="kicker kicker--light" style="color:var(--brass-2);">Дякуємо</p>' +
      '<h3 style="font-family:var(--serif);font-weight:500;font-size:1.6rem;color:var(--ivory);margin:.4rem 0 .6rem;">Відгук надіслано</h3>' +
      '<p style="color:rgba(246,241,231,.75);">Ми опублікуємо його після невеликої перевірки. Дякуємо, що були з нами!</p>';
    reviewForm.classList.add('sent');
  });

})();
