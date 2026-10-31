const grid = document.getElementById('catalogo');
const filtros = document.getElementById('filtros');
const cuenta = document.getElementById('cuenta');
let productos = [];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function pintar(cat) {
  const lista = cat === 'Todos' ? productos : productos.filter(p => p.categoria === cat);
  cuenta.textContent = lista.length + (lista.length === 1 ? ' accesorio' : ' accesorios');
  grid.innerHTML = lista.map(p => `
    <article class="prod">
      <div class="prod-img"><img src="${esc(p.imagenes?.[0])}" alt="${esc(p.nombre)}" loading="lazy"></div>
      <div class="prod-body">
        <span class="prod-cat">${esc(p.categoria)}</span>
        <h3><a href="producto.html?id=${encodeURIComponent(p.id)}">${esc(p.nombre)}</a></h3>
        <p class="desc">${esc(p.descripcion)}</p>
        <p class="precio">${esc(p.precio)}</p>
        <a class="btn btn-wa" target="_blank" rel="noopener noreferrer"
           href="https://wa.me/56975530368?text=${encodeURIComponent('Hola, me interesa: ' + p.nombre)}">
          <i class="fab fa-whatsapp"></i> Preguntar</a>
      </div>
    </article>`).join('') || '<p class="vacio">No hay accesorios en esta categoría por ahora.</p>';
}

fetch('data/productos.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    productos = data;
    const cats = ['Todos', ...new Set(data.map(p => p.categoria))];
    filtros.innerHTML = cats.map((c, i) =>
      `<button class="chip" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    pintar('Todos');
  })
  .catch(() => {
    cuenta.textContent = '';
    grid.innerHTML = '<p class="vacio">No pudimos cargar los accesorios. Recarga la página o escríbenos por WhatsApp.</p>';
  });

filtros.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  filtros.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
  pintar(b.dataset.cat);
});
