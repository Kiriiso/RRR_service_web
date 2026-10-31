/* =====================================================================
   js/catalogo.js · Lógica de catalogo.html
   Flujo: carga data/productos.json -> aplica los filtros -> dibuja tarjetas.
   Filtros: buscador por nombre, categoría, precio mín/máx, Novedades, orden.
   Los filtros quedan guardados en la dirección (?q=...&cat=...&nuevo=1).
   ===================================================================== */
// Atajo para buscar un elemento por su id
const $ = id => document.getElementById(id);
const grid = $('catalogo'), cats = $('cats'), cuenta = $('cuenta'), limpiar = $('limpiar');
// Escapa caracteres especiales para insertar texto en HTML sin riesgos
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Normaliza texto (sin tildes, minúsculas) para buscar sin importar acentos
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
// Convierte el precio a número (acepta 9990 o "$9.990")
const num = v => typeof v === 'number' ? v : parseInt(String(v).replace(/\D/g, ''), 10) || 0;
// Formatea el precio en pesos chilenos
const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
// Un producto es novedad si en el JSON tiene "novedad": true
const esNovedad = p => p.novedad === true || p.novedad === 'true';

// Estado: productos cargados y filtros actuales (base = valores por defecto)
let productos = [];
const base = { q: '', cat: 'Todos', min: '', max: '', nuevo: false, orden: 'relevancia' };
const estado = { ...base };

// Leer filtros desde la URL (para poder compartir o volver desde producto.html)
const u = new URLSearchParams(location.search);
estado.q = u.get('q') ?? ''; estado.cat = u.get('cat') ?? 'Todos';
estado.min = u.get('min') ?? ''; estado.max = u.get('max') ?? '';
estado.nuevo = u.get('nuevo') === '1'; estado.orden = u.get('orden') ?? 'relevancia';

// Devuelve solo los productos que cumplen TODOS los filtros activos, ya ordenados
function filtrar() {
  const q = norm(estado.q);
  const min = estado.min === '' ? 0 : +estado.min;
  const max = estado.max === '' ? Infinity : +estado.max;
  const lista = productos.filter(p => {
    const pr = num(p.precio);
    return (!q || norm(p.nombre).includes(q) || norm(p.categoria).includes(q))
      && (estado.cat === 'Todos' || p.categoria === estado.cat)
      && pr >= min && pr <= max
      && (!estado.nuevo || esNovedad(p));
  });
  if (estado.orden === 'asc') lista.sort((a, b) => num(a.precio) - num(b.precio));
  if (estado.orden === 'desc') lista.sort((a, b) => num(b.precio) - num(a.precio));
  if (estado.orden === 'nuevo') lista.sort((a, b) => esNovedad(b) - esNovedad(a));
  return lista;
}

// Dibuja las tarjetas, actualiza contador/botones y guarda los filtros en la URL. Para cambiar el número de WhatsApp edita el enlace wa.me de la plantilla
function pintar() {
  const lista = filtrar();
  const activo = JSON.stringify(estado) !== JSON.stringify(base);
  limpiar.hidden = !activo;
  cuenta.textContent = lista.length + (lista.length === 1 ? ' accesorio' : ' accesorios');
  cats.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === estado.cat));
  $('nuevo').setAttribute('aria-pressed', estado.nuevo);

  grid.innerHTML = lista.map(p => `
    <article class="prod">
      <div class="prod-img">${esNovedad(p) ? '<span class="badge-nuevo">Novedad</span>' : ''}
        <img src="${esc(p.imagenes?.[0])}" alt="${esc(p.nombre)}" loading="lazy"></div>
      <div class="prod-body">
        <span class="prod-cat">${esc(p.categoria)}</span>
        <h3><a href="producto.html?id=${encodeURIComponent(p.id)}">${esc(p.nombre)}</a></h3>
        <p class="desc">${esc(p.descripcion)}</p>
        <p class="precio">${esc(clp(p.precio))}</p>
        <a class="btn btn-wa" target="_blank" rel="noopener noreferrer"
           href="https://wa.me/56975530368?text=${encodeURIComponent('Hola, me interesa: ' + p.nombre)}">
          <i class="fab fa-whatsapp"></i> Preguntar</a>
      </div>
    </article>`).join('') || '<p class="vacio">Ningún accesorio coincide con esos filtros. Prueba quitando alguno.</p>';

  const p = new URLSearchParams();
  if (estado.q) p.set('q', estado.q);
  if (estado.cat !== 'Todos') p.set('cat', estado.cat);
  if (estado.min !== '') p.set('min', estado.min);
  if (estado.max !== '') p.set('max', estado.max);
  if (estado.nuevo) p.set('nuevo', '1');
  if (estado.orden !== 'relevancia') p.set('orden', estado.orden);
  history.replaceState(null, '', p.toString() ? '?' + p : location.pathname);
}

// Copia el estado a los campos del formulario (al cargar o al limpiar)
function sincronizarControles() {
  $('q').value = estado.q; $('min').value = estado.min; $('max').value = estado.max; $('orden').value = estado.orden;
}

// Carga los productos y crea los chips de categoría
fetch('data/productos.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    productos = data;
    const lista = ['Todos', ...new Set(data.map(p => p.categoria))];
    cats.innerHTML = lista.map(c => `<button class="chip" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    sincronizarControles();
    pintar();
  })
  .catch(() => {
    cuenta.textContent = '';
    grid.innerHTML = '<p class="vacio">No pudimos cargar los accesorios. Recarga la página o escríbenos por WhatsApp.</p>';
  });

// EVENTOS: cada control actualiza el estado y vuelve a dibujar (el buscador espera 200ms para no saturar)
let espera;
$('q').addEventListener('input', e => { clearTimeout(espera); espera = setTimeout(() => { estado.q = e.target.value; pintar(); }, 200); });
$('min').addEventListener('input', e => { estado.min = e.target.value; pintar(); });
$('max').addEventListener('input', e => { estado.max = e.target.value; pintar(); });
$('orden').addEventListener('change', e => { estado.orden = e.target.value; pintar(); });
$('nuevo').addEventListener('click', () => { estado.nuevo = !estado.nuevo; pintar(); });
cats.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { estado.cat = b.dataset.cat; pintar(); } });
limpiar.addEventListener('click', () => { Object.assign(estado, base); sincronizarControles(); pintar(); });
