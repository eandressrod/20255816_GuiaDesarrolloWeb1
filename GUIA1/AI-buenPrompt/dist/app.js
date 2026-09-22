(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeader(); window.addEventListener('scroll', setHeader, { passive: true });
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); menu.classList.toggle('is-open', !open); document.body.classList.toggle('menu-open', !open); });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { toggle?.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); document.body.classList.remove('menu-open'); }));
  const params = new URLSearchParams(location.search); const initial = params.get('categoria') || '';
  const buttons = [...document.querySelectorAll('[data-filter]')]; const cards = [...document.querySelectorAll('[data-project]')]; const status = document.querySelector('[data-filter-status]');
  const filter = value => { buttons.forEach(button => button.classList.toggle('is-active', button.dataset.filter === value)); let count = 0; cards.forEach(card => { const show = !value || card.dataset.category === value; card.hidden = !show; if (show) count++; }); if (status) status.textContent = `Mostrando ${count} proyecto${count === 1 ? '' : 's'}${value ? ` de ${value}` : ''}`; if (value) history.replaceState({}, '', `?categoria=${encodeURIComponent(value)}`); else history.replaceState({}, '', location.pathname); };
  buttons.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter))); if (initial && buttons.some(button => button.dataset.filter === initial)) filter(initial);
  const lightbox = document.createElement('dialog'); lightbox.className = 'lightbox'; lightbox.innerHTML = '<button type="button" aria-label="Cerrar imagen" class="lightbox__close">×</button><img alt="">'; document.body.append(lightbox);
  const lightboxImage = lightbox.querySelector('img'); document.querySelectorAll('[data-lightbox-src]').forEach(button => button.addEventListener('click', () => { lightboxImage.src = button.dataset.lightboxSrc; lightboxImage.alt = button.dataset.lightboxAlt; lightbox.showModal(); })); lightbox.querySelector('button').addEventListener('click', () => lightbox.close()); lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 }) : null; document.querySelectorAll('[data-reveal]').forEach(node => observer ? observer.observe(node) : node.classList.add('is-visible'));
  document.querySelector('[data-contact-form]')?.addEventListener('submit', event => { event.preventDefault(); document.querySelector('[data-form-message]').textContent = 'Aún no hay un servicio de envío configurado. Puede llamar al (503) 2228-0022 o escribir por WhatsApp para continuar.'; });
})();
