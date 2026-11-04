/* =====================================================================
   js/destacados.js · Carrusel de novedades y promociones (index.html)
   Lee data/productos.json, toma los productos con "novedad" o "promocion"
   y los muestra en una cinta que se mueve de derecha a izquierda.
   Al hacer clic en uno se abre su ficha (producto.html?id=...).
   ===================================================================== */
(() => {
  const sec = document.getElementById('destacados'), pista = document.getElementById('destacados-pista');
  if (!sec || !pista) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const si = v => v === true || v === 'true';

  fetch('data/productos.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(lista => {
      // Promociones y novedades; las novedades primero
      const items = lista.filter(p => si(p.novedad) || si(p.promocion)).sort((a, b) => si(b.novedad) - si(a.novedad));
      if (!items.length) return;
      const tarjeta = p => `
        <a class="dest-card" href="producto.html?id=${encodeURIComponent(p.id)}">
          <div class="prod-img">${si(p.novedad) ? '<span class="badge-nuevo">Novedad</span>' : ''}${si(p.promocion) ? `<span class="badge-promo">${esc(p.promoTexto || 'Promoción')}</span>` : ''}
            <img src="${esc(p.imagenes?.[0])}" alt="${esc(p.nombre)}" loading="lazy"></div>
          <div class="dest-body"><strong>${esc(p.nombre)}</strong><span class="precio">${esc(clp(p.precio))}</span></div>
        </a>`;
      // Se repite la lista hasta llenar el ancho y luego se duplica para que el bucle no tenga saltos
      let tanda = items; while (tanda.length < 8) tanda = [...tanda, ...items];
      const html = tanda.map(tarjeta).join('');
      pista.innerHTML = `<div class="dest-grupo">${html}</div><div class="dest-grupo" aria-hidden="true">${html.replace(/<a /g, '<a tabindex="-1" ')}</div>`;
      pista.style.setProperty('--dur', Math.max(20, tanda.length * 4) + 's');
      sec.hidden = false;
    })
    .catch(() => {}); // si falla, la sección simplemente no aparece
})();
