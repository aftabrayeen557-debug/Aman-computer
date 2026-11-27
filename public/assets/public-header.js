(function () {
  var homeBase = (document.body && document.body.getAttribute('data-home-base')) || '../';

  function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var mins = String(now.getMinutes()).padStart(2, '0');
    var ampm = hours >= 12 ? 'pm' : 'am';
    var h12 = hours % 12 || 12;
    var timeStr = h12 + ':' + mins + ampm;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dateStr = now.getDate() + ' ' + months[now.getMonth()];

    document.querySelectorAll('[data-time]').forEach(function (el) {
      el.textContent = timeStr;
    });
    document.querySelectorAll('[data-date],[data-dshort]').forEach(function (el) {
      el.textContent = dateStr;
    });
    document.querySelectorAll('[data-navtime]').forEach(function (el) {
      el.textContent = 'Local time · ' + timeStr;
    });
    document.querySelectorAll('[data-ftime]').forEach(function (el) {
      el.textContent = timeStr;
    });
    document.querySelectorAll('[data-fyear]').forEach(function (el) {
      el.textContent = String(now.getFullYear());
    });
  }

  updateClock();
  setInterval(updateClock, 30000);

  var doorRoutes = {
    'door:0': 'web-developer/',
    'door:1': 'app-developer/',
    'door:2': 'ui-ux-designer/',
    'door:3': 'graphic-designer/'
  };

  function navigate(target) {
    if (!target) return;
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (window.parent && window.parent !== window && window.parent.__amanNav) {
      try {
        window.parent.__amanNav(target);
        return;
      } catch (e) {}
    }
    if (target === 'home') {
      window.location.href = homeBase;
      return;
    }
    if (doorRoutes[target]) {
      window.location.href = homeBase + doorRoutes[target];
      return;
    }
    if (target === 'schemes' || target === 'about' || target === 'contact-footer') {
      var hash = target === 'schemes' ? '#schemes' : target === 'about' ? '#about' : '#contact-footer';
      if (target === 'contact-footer' && document.getElementById('contact-footer')) {
        document.getElementById('contact-footer').scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = homeBase + hash;
      }
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-nav]') : null;
    if (!el) return;
    if (el.tagName === 'A' && el.getAttribute('href') && !el.getAttribute('data-nav')) return;
    var navTarget = el.getAttribute('data-nav');
    if (!navTarget) return;
    e.preventDefault();
    closeDrawer();
    navigate(navTarget);
  });

  var drawer = document.getElementById('pubDrawer');
  var backdrop = document.getElementById('pubDrawerBackdrop');
  var openBtn = document.getElementById('pubMenuBtn');
  var closeBtn = document.getElementById('pubDrawerClose');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) {
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
    }
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
