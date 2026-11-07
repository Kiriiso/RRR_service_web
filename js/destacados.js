(() => {
  const sec = document.getElementById('destacados'), pista = document.getElementById('destacados-pista');
  if (!sec || !pista) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clp = n => typeof n === 'string' ? n : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const si = v => v === true || v === 'true';
  const num = v => typeof v === 'number' ? v : parseInt(String(v).replace(/\D/g, ''), 10) || 0;
  const precioHTML = p => {
    const ant = num(p.precioOriginal);
    return si(p.promocion) && ant > num(p.precio)
      ? `<s class="precio-ant" style="opacity:.6;font-size:.8em;margin-right:.4em">${esc(clp(ant))}</s>${esc(clp(p.precio))}`
      : esc(clp(p.precio));
  };

  fetch('data/productos.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(lista => {
      const items = lista.filter(p => si(p.novedad) || si(p.promocion)).sort((a, b) => si(b.novedad) - si(a.novedad));
      if (!items.length) return;
      const tarjeta = p => `
        <a class="dest-card" href="producto.html?id=${encodeURIComponent(p.id)}">
          <div class="prod-img">${si(p.novedad) ? '<span class="badge-nuevo">Novedad</span>' : ''}${si(p.promocion) ? `<span class="badge-promo">${esc(p.promoTexto || 'Promoción')}</span>` : ''}
            <img src="${esc(p.imagenes?.[0])}" alt="${esc(p.nombre)}" loading="lazy"></div>
          <div class="dest-body"><strong>${esc(p.nombre)}</strong><span class="precio">${precioHTML(p)}</span></div>
        </a>`;
      let tanda = items; while (tanda.length < 8) tanda = [...tanda, ...items];
      const html = tanda.map(tarjeta).join('');
      pista.innerHTML = `<div class="dest-grupo">${html}</div><div class="dest-grupo" aria-hidden="true">${html.replace(/<a /g, '<a tabindex="-1" ')}</div>`;
      sec.hidden = false;
      activarArrastre();
    })
    .catch(() => {});

  function activarArrastre() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cinta = pista.parentElement, VEL = 45;
    let x = 0, mitad = 0, arrastrando = false, movido = false, pausa = false;
    let inicioX = 0, inicioPos = 0, id = null, antes = 0;

    const medir = () => { mitad = pista.scrollWidth / 2; };
    const ajustar = () => { if (mitad) { x = ((x % mitad) - mitad) % mitad; } };
    const dibujar = () => { pista.style.transform = `translate3d(${x}px,0,0)`; };

    function cuadro(t) {
      const dt = Math.min(0.05, (t - antes) / 1000); antes = t;
      if (!arrastrando && !pausa) { x -= VEL * dt; ajustar(); dibujar(); }
      requestAnimationFrame(cuadro);
    }

    cinta.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      id = e.pointerId; inicioX = e.clientX; inicioPos = x; movido = false;
    });
    cinta.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const d = e.clientX - inicioX;
      if (!arrastrando && Math.abs(d) > 6) {
        arrastrando = movido = true;
        cinta.classList.add('arrastrando');
        cinta.setPointerCapture(id);
      }
      if (arrastrando) { x = inicioPos + d; ajustar(); dibujar(); }
    });
    const soltar = e => {
      if (e.pointerId !== id) return;
      id = null; arrastrando = false; cinta.classList.remove('arrastrando');
    };
    cinta.addEventListener('pointerup', soltar);
    cinta.addEventListener('pointercancel', soltar);
    cinta.addEventListener('click', e => { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } }, true);
    cinta.addEventListener('dragstart', e => e.preventDefault());
    cinta.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pausa = true; });
    cinta.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pausa = false; });
    cinta.addEventListener('focusin', () => { pausa = true; });
    cinta.addEventListener('focusout', () => { pausa = false; });
    window.addEventListener('resize', () => { medir(); ajustar(); dibujar(); });

    medir(); ajustar(); dibujar();
    requestAnimationFrame(t => { antes = t; cuadro(t); });
  }
})();
