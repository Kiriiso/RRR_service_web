/* =====================================================================
   js/producto.js · Lógica de producto.html
   Flujo: lee ?id=... de la dirección -> busca el producto en
   data/productos.json -> dibuja la ficha (fotos, datos, WhatsApp) y
   hasta 4 productos relacionados de la misma categoría.
   ===================================================================== */
// id del producto, tomado de la dirección (producto.html?id=...)
const id = new URLSearchParams(location.search).get('id');
const cont = document.getElementById('producto');
// Escapa texto para insertarlo en HTML sin riesgos
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Formatea el precio en pesos chilenos (si ya es texto lo deja igual)
const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
// Un producto es novedad si en el JSON tiene "novedad": true
const esNovedad = p => p.novedad === true || p.novedad === 'true';
// Enlace "Volver a accesorios"
const volver = '<a class="volver" href="catalogo.html"><i class="fas fa-arrow-left"></i> Volver a accesorios</a>';

// Carga los productos y busca el que coincide con el id
fetch('data/productos.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(lista => {
    const p = lista.find(x => String(x.id) === id);
// Dibuja la ficha completa (galería, datos, botón de WhatsApp y relacionados)
    if (!p) { cont.innerHTML = volver + '<p class="vacio">No encontramos este producto. Puede que ya no esté disponible.</p>'; return; }

    document.title = p.nombre + ' | RRR Servicio Técnico';
    const imgs = p.imagenes?.length ? p.imagenes : [''];
    const minis = imgs.length > 1 ? imgs.map((src, i) =>
      `<button class="mini" data-src="${esc(src)}" aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt=""></button>`).join('') : '';
    const carac = (p.caracteristicas ?? []).map(c => `<li><i class="fas fa-check"></i><span>${esc(c)}</span></li>`).join('');

    // Productos relacionados: misma categoría, distinto id, máximo 4
    const rel = lista.filter(x => x.categoria === p.categoria && String(x.id) !== id).slice(0, 4);
    const relHTML = rel.length ? `<h2 class="rel-t">Más en ${esc(p.categoria)}</h2><div class="grid-prod">${rel.map(x => `
      <article class="prod"><div class="prod-img">${esNovedad(x) ? '<span class="badge-nuevo">Novedad</span>' : ''}<img src="${esc(x.imagenes?.[0])}" alt="${esc(x.nombre)}" loading="lazy"></div>
      <div class="prod-body"><h3><a href="producto.html?id=${encodeURIComponent(x.id)}">${esc(x.nombre)}</a></h3><p class="precio">${esc(clp(x.precio))}</p></div></article>`).join('')}</div>` : '';

    cont.innerHTML = volver + `
      <div class="detalle">
        <div class="galeria">
          <div class="principal"><img id="principal" src="${esc(imgs[0])}" alt="${esc(p.nombre)}"></div>
          <div class="minis">${minis}</div>
        </div>
        <div class="info">
          <span class="prod-cat">${esc(p.categoria)}</span>${esNovedad(p) ? '<span class="badge-nuevo">Novedad</span>' : ''}
          <h1>${esc(p.nombre)}</h1>
          <p class="precio">${esc(clp(p.precio))}</p>
          <p class="desc">${esc(p.descripcion)}</p>
          ${carac ? `<ul class="carac">${carac}</ul>` : ''}
          <a class="btn btn-wa" target="_blank" rel="noopener noreferrer"
             href="https://wa.me/56975530368?text=${encodeURIComponent('Hola, me interesa el producto ' + p.nombre)}">
            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
          <p class="aviso">Pregúntanos por disponibilidad antes de venir al local.</p>
        </div>
      </div>${relHTML}`;

    // Al hacer clic en una miniatura, cambia la foto principal
    cont.querySelector('.minis').addEventListener('click', e => {
      const b = e.target.closest('.mini'); if (!b) return;
      document.getElementById('principal').src = b.dataset.src;
      cont.querySelectorAll('.mini').forEach(m => m.setAttribute('aria-current', m === b));
    });
  })
  .catch(() => { cont.innerHTML = volver + '<p class="vacio">No pudimos cargar el producto. Recarga la página o escríbenos por WhatsApp.</p>'; });
