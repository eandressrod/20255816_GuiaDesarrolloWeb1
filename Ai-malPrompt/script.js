const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelector('#quote-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    'Hola ConstruPre, quiero solicitar una cotización.',
    `Nombre: ${data.get('nombre')}`,
    `Teléfono: ${data.get('telefono')}`,
    `Proyecto: ${data.get('proyecto')}`,
    data.get('mensaje') ? `Detalles: ${data.get('mensaje')}` : ''
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/50322886011?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});
