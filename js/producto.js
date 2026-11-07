const id = new URLSearchParams(location.search).get('id');
const cont = document.getElementById('producto');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
const num = v => typeof v === 'number' ? v : parseInt(String(v).replace(/\D/g, ''), 10) || 0;
const esNovedad = p => p.novedad === true || p.novedad === 'true';
const esPromo = p => p.promocion === true || p.promocion === 'true';
const badgePromo = p => esPromo(p) ? `<span class="badge-promo">${esc(p.promoTexto || 'Promoción')}</span>` : '';
const precioHTML = p => {
  const ant = num(p.precioOriginal);
  return esPromo(p) && ant > num(p.precio)
    ? `<s class="precio-ant" style="opacity:.6;font-size:.8em;margin-right:.4em">${esc(clp(ant))}</s>${esc(clp(p.precio))}`
    : esc(clp(p.precio));
};
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

    const rel = lista.filter(x => x.categoria === p.categoria && String(x.id) !== id).slice(0, 4);
    const relHTML = rel.length ? `<h2 class="rel-t">Más en ${esc(p.categoria)}</h2><div class="grid-prod">${rel.map(x => `
      <article class="prod"><div class="prod-img">${esNovedad(x) ? '<span class="badge-nuevo">Novedad</span>' : ''}${badgePromo(x)}<img src="${esc(x.imagenes?.[0])}" alt="${esc(x.nombre)}" loading="lazy"></div>
      <div class="prod-body"><h3><a href="producto.html?id=${encodeURIComponent(x.id)}">${esc(x.nombre)}</a></h3><p class="precio">${precioHTML(x)}</p></div></article>`).join('')}</div>` : '';

    cont.innerHTML = volver + `
      <div class="detalle">
        <div class="galeria">
          <div class="principal"><img id="principal" src="${esc(imgs[0])}" alt="${esc(p.nombre)}"></div>
          <div class="minis">${minis}</div>
        </div>
        <div class="info">
          <span class="prod-cat">${esc(p.categoria)}</span>${esNovedad(p) ? '<span class="badge-nuevo">Novedad</span>' : ''}${badgePromo(p)}
          <h1>${esc(p.nombre)}</h1>
          <p class="precio">${precioHTML(p)}</p>
          <p class="desc">${esc(p.descripcion)}</p>
          ${carac ? `<ul class="carac">${carac}</ul>` : ''}
          <a class="btn btn-wa" target="_blank" rel="noopener noreferrer"
             href="https://wa.me/56975530368?text=${encodeURIComponent('Hola, me interesa el producto ' + p.nombre)}">
            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
          <div class="compartir">
            <button class="btn btn-ghost" id="copiar" type="button"><i class="fas fa-link"></i> <span>Copiar enlace</span></button>
            <a class="btn btn-ghost" target="_blank" rel="noopener noreferrer"
               href="https://wa.me/?text=${encodeURIComponent(p.nombre + ' - ' + location.href)}"><i class="fab fa-whatsapp"></i> Compartir</a>
          </div>
          <p class="aviso">Pregúntanos por disponibilidad antes de venir al local.</p>
        </div>
      </div>${relHTML}`;

    const $copiar = document.getElementById('copiar');
    $copiar.addEventListener('click', () => {
      const txt = $copiar.querySelector('span');
      navigator.clipboard?.writeText(location.href)
        .then(() => { txt.textContent = '¡Copiado!'; setTimeout(() => txt.textContent = 'Copiar enlace', 2000); })
        .catch(() => prompt('Copia este enlace:', location.href));
    });

    cont.querySelector('.minis').addEventListener('click', e => {
      const b = e.target.closest('.mini'); if (!b) return;
      document.getElementById('principal').src = b.dataset.src;
      cont.querySelectorAll('.mini').forEach(m => m.setAttribute('aria-current', m === b));
    });
  })
  .catch(() => { cont.innerHTML = volver + '<p class="vacio">No pudimos cargar el producto. Recarga la página o escríbenos por WhatsApp.</p>'; });
