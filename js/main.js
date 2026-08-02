/* Serenity Yachting Club — interactions */
(function () {
  'use strict';

  /* ── i18n (uk / en) ── */
  var LANG = (document.documentElement.getAttribute('lang') || 'uk').slice(0, 2);
  var STR = {
    uk: {
      sending: 'Надсилаємо…',
      bookTitle: function (n) { return 'Забронювати «' + n + '»'; },
      bookIntro: 'Напишіть нам у Telegram чи WhatsApp — відповімо одразу, підберемо каюту та підтвердимо дати.',
      tgManager: 'Менеджер у Telegram', tgFounder: 'Засновник у Telegram', waWrite: 'Написати у WhatsApp',
      thanks: 'Дякуємо', sentTitle: 'Запит надіслано',
      sentText1: 'Ми звʼяжемося з вами протягом робочого дня. Хочете швидше — напишіть у ',
      tgWord: 'Telegram', sentText2: '.',
      reviewSentTitle: 'Відгук надіслано',
      reviewSentText: 'Ми опублікуємо його після невеликої перевірки. Дякуємо, що були з нами!',
      errSend: 'Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.',
      errNet: 'Немає звʼязку із сервером. Спробуйте ще раз або напишіть нам у Telegram.'
    },
    en: {
      sending: 'Sending…',
      bookTitle: function (n) { return 'Book “' + n + '”'; },
      bookIntro: 'Message us on Telegram or WhatsApp — we reply right away, pick your cabin and confirm the dates.',
      tgManager: 'Manager on Telegram', tgFounder: 'Founder on Telegram', waWrite: 'Message on WhatsApp',
      thanks: 'Thank you', sentTitle: 'Request sent',
      sentText1: 'We will get back to you within the working day. Want it sooner — message us on ',
      tgWord: 'Telegram', sentText2: '.',
      reviewSentTitle: 'Review sent',
      reviewSentText: 'We will publish it after a short check. Thank you for sailing with us!',
      errSend: 'Could not send. Please try again or message us on Telegram.',
      errNet: 'No connection to the server. Please try again or message us on Telegram.'
    }
  };
  var t = STR[LANG] || STR.uk;

  /* ── sticky nav ── */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── mobile menu ── */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    var toggle = function (open) {
      links.classList.toggle('open', open);
      if (nav) nav.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () {
      toggle(!links.classList.contains('open'));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggle(false);
    });
  }

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
  var WA_MANAGER = 'https://wa.me/393513751546';
  function openBooking(btn) {
    var name = btn.getAttribute('data-name') || 'подорож';
    openModal(t.bookTitle(name),
      '<p>' + t.bookIntro + '</p>' +
      '<div class="modal__tg">' +
        '<a class="btn btn--dark" href="' + TG_MANAGER + '" target="_blank" rel="noopener" data-close>' + t.tgManager + '</a>' +
        '<a class="btn btn--gold" href="' + TG_FOUNDER + '" target="_blank" rel="noopener" data-close>' + t.tgFounder + '</a>' +
        '<a class="btn btn--ghost" href="' + WA_MANAGER + '" target="_blank" rel="noopener" data-close>' + t.waWrite + '</a>' +
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

  /* ── reviews carousel ── */
  var track = document.getElementById('reviewsTrack');
  if (track) {
    var step = function () {
      var card = track.querySelector('.review');
      return card ? card.getBoundingClientRect().width + 26 : track.clientWidth;
    };
    var go = function (dir) {
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      var atStart = track.scrollLeft <= 4;
      if (dir > 0 && atEnd) { track.scrollTo({ left: 0, behavior: 'smooth' }); return; }
      if (dir < 0 && atStart) { track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' }); return; }
      track.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    var pv = document.querySelector('.reviews__nav--prev');
    var nx = document.querySelector('.reviews__nav--next');
    if (pv) pv.addEventListener('click', function () { go(-1); });
    if (nx) nx.addEventListener('click', function () { go(1); });
    var rtimer = setInterval(function () {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else { go(1); }
    }, 4500);
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (ev) {
      track.addEventListener(ev, function () { clearInterval(rtimer); }, { passive: true });
    });
  }

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
      if (btn) { btn.disabled = true; btn.textContent = t.sending; }
      fetch('/mail.php', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            /* analytics: successful form submission → GTM dataLayer */
            try {
              window.dataLayer = window.dataLayer || [];
              var typeEl = form.querySelector('[name="_type"]');
              var voyageEl = form.querySelector('[name="voyage"]');
              window.dataLayer.push({
                event: 'form_success',
                form_type: typeEl ? typeEl.value : 'contact',
                voyage: voyageEl ? voyageEl.value : 'не вказано'
              });
            } catch (e) {}
            onSuccess();
          } else {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            showError(form, (res && res.error) || t.errSend);
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          showError(form, t.errNet);
        });
    });
  }

  var bookingForm = document.getElementById('bookingForm');
  ajaxForm(bookingForm, function () {
    bookingForm.innerHTML =
      '<p class="kicker kicker--light">' + t.thanks + '</p>' +
      '<h3 style="font-family:var(--serif);font-weight:500;font-size:1.8rem;color:var(--ivory);margin-bottom:1rem;">' + t.sentTitle + '</h3>' +
      '<p style="color:rgba(246,241,231,.78);">' + t.sentText1 +
      '<a href="' + TG_MANAGER + '" target="_blank" rel="noopener" style="color:var(--brass-2);text-decoration:underline;">' + t.tgWord + '</a>' + t.sentText2 + '</p>';
    bookingForm.classList.add('sent');
  });

  var reviewForm = document.getElementById('reviewForm');
  ajaxForm(reviewForm, function () {
    reviewForm.innerHTML =
      '<p class="kicker kicker--light" style="color:var(--brass-2);">' + t.thanks + '</p>' +
      '<h3 style="font-family:var(--serif);font-weight:500;font-size:1.6rem;color:var(--ivory);margin:.4rem 0 .6rem;">' + t.reviewSentTitle + '</h3>' +
      '<p style="color:rgba(246,241,231,.75);">' + t.reviewSentText + '</p>';
    reviewForm.classList.add('sent');
  });

  /* ── accordions (FAQ / itinerary) ── */
  document.querySelectorAll('.acc__head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      if (!body) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (open) { body.setAttribute('hidden', ''); } else { body.removeAttribute('hidden'); }
    });
  });

})();
