const carga = document.getElementById('pantalla-carga');
window.addEventListener('load', () => { carga.classList.add('oculta'); setTimeout(() => carga.remove(), 500); });
setTimeout(() => carga && carga.classList.add('oculta'), 5000);

const burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
burger.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto');
  burger.setAttribute('aria-expanded', abierto);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('abierto'); });

document.querySelectorAll('.srv').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

const pasos = [...document.querySelectorAll('.pasos li')];
const leds = { 0: '.led.r', 1: '.led.r', 2: '.led.b', 3: '.led.g' };
const sinMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
function avanzar(i) {
  if (i >= pasos.length) return;
  pasos[i].classList.add('hecho');
  document.querySelector(leds[i]).classList.add('on');
  setTimeout(() => avanzar(i + 1), sinMov ? 0 : 1100);
}
if (pasos.length) setTimeout(() => avanzar(0), sinMov ? 0 : 1200);

(function () {
  const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }));
  const dia = ahora.getDay(), hora = ahora.getHours() + ahora.getMinutes() / 60;
  const cierra = dia >= 1 && dia <= 5 ? 20 : dia === 6 ? 19 : null;
  const abierto = cierra !== null && hora >= 10 && hora < cierra;
  const el = document.getElementById('estado');
  if (!el) return;
  el.classList.add(abierto ? 'abierto' : 'cerrado');
  el.querySelector('span').textContent = abierto ? 'Abierto ahora, cerramos a las ' + cierra + ':00' : 'Cerrado ahora, pero puedes dejarnos tu mensaje por WhatsApp';
})();

const anio = document.getElementById('anio');
if (anio) anio.textContent = new Date().getFullYear();

const formCot = document.getElementById('form-cotizacion');
if (formCot) formCot.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(formCot));
  const lineas = ['Hola, quisiera cotizar una reparación.', 'Equipo: ' + d.tipo, 'Marca: ' + d.marca.trim()];
  if (d.modelo.trim()) lineas.push('Modelo: ' + d.modelo.trim());
  lineas.push('Falla: ' + d.falla.trim());
  if (d.nombre.trim()) lineas.push('Mi nombre: ' + d.nombre.trim());
  window.open('https://wa.me/56975530368?text=' + encodeURIComponent(lineas.join('\n')), '_blank', 'noopener');
});
