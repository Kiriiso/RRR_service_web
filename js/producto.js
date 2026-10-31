const id = new URLSearchParams(location.search).get('id');
const cont = document.getElementById('producto');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
const volver = '<a class="volver" href="catalogo.html"><i class="fas fa-arrow-left"></i> Volver a accesorios</a>';

fetch('data/productos.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(lista => {
    const p = lista.find(x => String(x.id) === id);
    if (!p) { cont.innerHTML = volver + '<p class="vacio">No encontramos este producto. Puede que ya no esté disponible.</p>'; return; }

    document.title = p.nombre + ' | RRR Servicio Técnico';
    const imgs = p.imagenes?.length ? p.imagenes : [''];
    const minis = imgs.length > 1 ? imgs.map((src, i) =>
      `<button class="mini" data-src="${esc(src)}" aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt=""></button>`).join('') : '';
    const carac = (p.caracteristicas ?? []).map(c => `<li><i class="fas fa-check"></i><span>${esc(c)}</span></li>`).join('');

    cont.innerHTML = volver + `
      <div class="detalle">
        <div class="galeria">
          <div class="principal"><img id="principal" src="${esc(imgs[0])}" alt="${esc(p.nombre)}"></div>
          <div class="minis">${minis}</div>
        </div>
        <div class="info">
          <span class="prod-cat">${esc(p.categoria)}</span>
          <h1>${esc(p.nombre)}</h1>
          <p class="precio">${esc(clp(p.precio))}</p>
          <p class="desc">${esc(p.descripcion)}</p>
          ${carac ? `<ul class="carac">${carac}</ul>` : ''}
          <a class="btn btn-wa" target="_blank" rel="noopener noreferrer"
             href="https://wa.me/56975530368?text=${encodeURIComponent('Hola, me interesa el producto ' + p.nombre)}">
            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
          <p class="aviso">Pregúntanos por disponibilidad antes de venir al local.</p>
        </div>
      </div>`;

    cont.querySelector('.minis').addEventListener('click', e => {
      const b = e.target.closest('.mini'); if (!b) return;
      document.getElementById('principal').src = b.dataset.src;
      cont.querySelectorAll('.mini').forEach(m => m.setAttribute('aria-current', m === b));
    });
  })
  .catch(() => { cont.innerHTML = volver + '<p class="vacio">No pudimos cargar el producto. Recarga la página o escríbenos por WhatsApp.</p>'; });
