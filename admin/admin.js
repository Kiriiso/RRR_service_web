/* =====================================================================
   admin/admin.js · Panel para agregar, editar y borrar productos sin tocar código
   Cómo funciona: lee data/productos.json del repositorio de GitHub, lo modifica
   y publica JSON + fotos en UN solo commit usando la API de GitHub.
   Necesita un token personal (ver docs/GUIA.md). Tras publicar, GitHub Pages
   actualiza el sitio en 1 a 2 minutos.
   ===================================================================== */

// ===== CONFIGURACIÓN: cambia aquí si el repositorio cambia de dueño o de nombre =====
const CFG = {
  owner: 'kiriiso',
  repo: 'RRR_service_web',
  archivo: 'data/productos.json',   // dónde viven los productos
  carpetaImg: 'img/productos',      // dónde se guardan las fotos nuevas
  anchoMax: 1200                    // las fotos se reducen a este ancho máximo (px)
};

// ===== UTILIDADES =====
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sinTildes = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const slug = s => sinTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = v => typeof v === 'number' ? v : parseInt(String(v).replace(/\D/g, ''), 10) || 0;
const clp = n => '$' + num(n).toLocaleString('es-CL');
const esNov = p => p.novedad === true || p.novedad === 'true';
const utf8b64 = txt => { let bin = ''; new TextEncoder().encode(txt).forEach(b => bin += String.fromCharCode(b)); return btoa(bin); };
const blobB64 = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(blob); });

let token = localStorage.getItem('rrr_token') || '';
let rama = '';          // rama principal del repositorio (se detecta sola)
let productos = [];     // lista actual de productos
let editando = null;    // id del producto que se edita (null = producto nuevo)
let fotos = [];         // fotos del formulario: {path} si ya existe, {blob, ext, url} si es nueva

function aviso(msg, tipo = 'ok') {
  const t = $('toast'); t.textContent = msg; t.className = 'toast ' + tipo; t.hidden = false;
  clearTimeout(aviso.t); if (tipo !== 'error') aviso.t = setTimeout(() => t.hidden = true, 7000);
}
const mostrar = cual => ['conectar', 'app', 'editor'].forEach(id => $(id).hidden = id !== cual);
const explicar = e =>
  e.status === 401 ? 'El token no es válido o venció. Crea uno nuevo (ver docs/GUIA.md).' :
  e.status === 403 || e.status === 404 ? 'El token no tiene permiso sobre este repositorio (necesita "Contents: Read and write").' :
  e.status === 409 || e.status === 422 ? 'Hubo un conflicto al publicar. Intenta de nuevo.' :
  'No se pudo completar. Revisa tu conexión a internet.';

// ===== API DE GITHUB =====
async function api(ruta, op = {}) {
  const r = await fetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}${ruta}`, {
    cache: 'no-store', ...op,
    headers: { Authorization: 'Bearer ' + token, Accept: op.accept || 'application/vnd.github+json', ...(op.body ? { 'Content-Type': 'application/json' } : {}) }
  });
  if (!r.ok) { const e = new Error('GitHub ' + r.status); e.status = r.status; throw e; }
  return op.texto ? r.text() : r.json();
}
const post = (ruta, datos, metodo = 'POST') => api(ruta, { method: metodo, body: JSON.stringify(datos) });
const cargarLista = async () => JSON.parse(await api(`/contents/${CFG.archivo}?ref=${rama}`, { accept: 'application/vnd.github.raw+json', texto: true }));

// Publica varios archivos en UN solo commit (así el sitio nunca queda a medias)
async function publicar(mensaje, archivos) {
  const base = (await api(`/git/ref/heads/${rama}`)).object.sha;
  const commit = await api(`/git/commits/${base}`);
  const tree = [];
  for (const a of archivos) {
    const blob = await post('/git/blobs', { content: a.base64, encoding: 'base64' });
    tree.push({ path: a.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const arbol = await post('/git/trees', { base_tree: commit.tree.sha, tree });
  const nuevo = await post('/git/commits', { message: mensaje, tree: arbol.sha, parents: [base] });
  await post(`/git/refs/heads/${rama}`, { sha: nuevo.sha }, 'PATCH');
}

// Aplica un cambio sobre la lista MÁS RECIENTE del repositorio y lo publica.
// fn(lista, archivos) devuelve la lista nueva (y puede agregar fotos a "archivos").
async function modificar(fn, mensaje) {
  try {
    const lista = await cargarLista(), archivos = [];
    const nueva = await fn(lista, archivos);
    archivos.push({ path: CFG.archivo, base64: utf8b64(JSON.stringify(nueva, null, 2) + '\n') });
    await publicar(mensaje, archivos);
    productos = nueva; pintarLista();
    aviso('¡Publicado! El sitio se actualiza en 1 a 2 minutos (recarga con Ctrl+F5).');
    return true;
  } catch (e) { aviso(explicar(e), 'error'); return false; }
}

// ===== INICIO Y SESIÓN =====
async function iniciar() {
  if (!token) return mostrar('conectar');
  try {
    rama = (await api('')).default_branch;
    productos = await cargarLista();
    pintarLista(); mostrar('app');
  } catch (e) { aviso(explicar(e), 'error'); mostrar('conectar'); }
}
$('guardar-token').addEventListener('click', () => {
  token = $('token').value.trim(); if (!token) return;
  localStorage.setItem('rrr_token', token); $('token').value = ''; iniciar();
});
$('salir').addEventListener('click', () => { localStorage.removeItem('rrr_token'); token = ''; mostrar('conectar'); });

// ===== LISTA DE PRODUCTOS =====
function pintarLista() {
  const q = sinTildes($('buscar').value).toLowerCase();
  const items = productos.filter(p => !q || sinTildes(p.nombre + ' ' + p.categoria).toLowerCase().includes(q));
  $('lista').innerHTML = items.map(p => `
    <article class="fila" data-id="${esc(p.id)}">
      <img src="../${esc(p.imagenes?.[0])}" alt="">
      <div class="fila-info"><strong>${esc(p.nombre)}</strong>
        <span>${esc(p.categoria)} · ${esc(clp(p.precio))}${esNov(p) ? ' · <b class="nov">Novedad</b>' : ''}</span></div>
      <div class="fila-acc">
        <button class="mini-btn" data-acc="nov">${esNov(p) ? 'Quitar novedad' : 'Marcar novedad'}</button>
        <button class="mini-btn" data-acc="edit">Editar</button>
        <button class="mini-btn peligro" data-acc="del">Eliminar</button>
      </div>
    </article>`).join('') || '<p>No hay productos que coincidan.</p>';
}
$('buscar').addEventListener('input', pintarLista);
$('lista').addEventListener('click', async e => {
  const b = e.target.closest('[data-acc]'); if (!b) return;
  const id = b.closest('.fila').dataset.id, p = productos.find(x => x.id === id);
  if (b.dataset.acc === 'edit') abrirEditor(p);
  if (b.dataset.acc === 'nov') modificar(l => l.map(x => x.id === id ? { ...x, novedad: !esNov(x) } : x), `Panel: novedad de ${id}`);
  if (b.dataset.acc === 'del' && confirm(`¿Eliminar "${p.nombre}" del catálogo?`))
    modificar(l => l.filter(x => x.id !== id), `Panel: eliminar ${id}`);
});

// ===== FORMULARIO =====
function abrirEditor(p) {
  editando = p ? p.id : null;
  $('titulo-ed').textContent = p ? 'Editar producto' : 'Nuevo producto';
  const cats = [...new Set(productos.map(x => x.categoria))];
  $('categoria').innerHTML = cats.map(c => `<option>${esc(c)}</option>`).join('') + '<option value="__nueva">+ Otro tipo…</option>';
  $('categoria').value = p?.categoria ?? cats[0] ?? '__nueva';
  $('cat-nueva').value = ''; $('cat-nueva').disabled = $('categoria').value !== '__nueva';
  $('f-nombre').value = p?.nombre ?? ''; $('f-desc').value = p?.descripcion ?? '';
  $('f-carac').value = (p?.caracteristicas ?? []).join('\n');
  $('f-precio').value = p ? num(p.precio) : ''; $('f-novedad').checked = p ? esNov(p) : false;
  fotos = (p?.imagenes ?? []).map(path => ({ path, url: '../' + path }));
  pintarFotos(); mostrar('editor');
}
$('nuevo').addEventListener('click', () => abrirEditor(null));
$('cancelar').addEventListener('click', () => mostrar('app'));
$('categoria').addEventListener('change', e => { $('cat-nueva').disabled = e.target.value !== '__nueva'; });

// Convierte la foto a WebP y la reduce (más liviana = el sitio carga más rápido)
async function aWebp(file) {
  const bmp = await createImageBitmap(file), k = Math.min(1, CFG.anchoMax / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/webp', 0.85));
}
async function agregarFotos(archivos) {
  for (const f of archivos) {
    if (!f.type.startsWith('image/')) continue;
    try { const blob = await aWebp(f); fotos.push({ blob, ext: blob.type === 'image/webp' ? 'webp' : 'png', url: URL.createObjectURL(blob) }); }
    catch { aviso('No se pudo leer la imagen ' + f.name, 'error'); }
  }
  pintarFotos();
}
function pintarFotos() {
  $('fotos').innerHTML = fotos.map((f, i) => `
    <div class="foto ${i === 0 ? 'portada' : ''}"><img src="${esc(f.url)}" alt="Foto ${i + 1}">
      <div><button type="button" class="mini-btn" data-i="${i}" data-f="portada" title="Usar como portada">★</button>
      <button type="button" class="mini-btn peligro" data-i="${i}" data-f="quitar" title="Quitar">✕</button></div></div>`).join('');
}
$('fotos').addEventListener('click', e => {
  const b = e.target.closest('[data-f]'); if (!b) return;
  const i = +b.dataset.i;
  if (b.dataset.f === 'quitar') fotos.splice(i, 1); else fotos.unshift(...fotos.splice(i, 1));
  pintarFotos();
});
const drop = $('drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('sobre'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('sobre')));
drop.addEventListener('drop', e => { e.preventDefault(); agregarFotos([...e.dataTransfer.files]); });
$('archivos').addEventListener('change', e => { agregarFotos([...e.target.files]); e.target.value = ''; });

// Id nuevo con el mismo estilo de siempre: Categoria_01, Categoria_02…
function nuevoId(lista, cat) {
  const pre = sinTildes(cat).replace(/[^A-Za-z0-9]/g, '') || 'Producto';
  const usados = lista.map(p => String(p.id).match(new RegExp('^' + pre + '_(\\d+)$'))).filter(Boolean).map(m => +m[1]);
  return `${pre}_${String(Math.max(0, ...usados) + 1).padStart(2, '0')}`;
}

// ===== PUBLICAR (crear o editar) =====
$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = $('f-nombre').value.trim(), precio = parseInt($('f-precio').value, 10);
  const cat = $('categoria').value === '__nueva' ? $('cat-nueva').value.trim() : $('categoria').value;
  if (!nombre || !cat || !(precio > 0) || !fotos.length) return aviso('Completa nombre, tipo, precio y al menos una foto.', 'error');
  const btn = $('guardar'); btn.disabled = true; btn.textContent = 'Publicando…';

  const ok = await modificar(async (lista, archivos) => {
    const previo = lista.find(x => x.id === editando);
    const id = previo ? previo.id : nuevoId(lista, cat);
    const carpeta = `${CFG.carpetaImg}/${slug(id)}`;
    const usados = new Set(fotos.filter(f => f.path).map(f => f.path)), imagenes = [];
    for (const f of fotos) {
      if (f.path) { imagenes.push(f.path); continue; }     // foto que ya estaba en el sitio
      let n = 1; while (usados.has(`${carpeta}/${n}.${f.ext}`)) n++;
      const path = `${carpeta}/${n}.${f.ext}`; usados.add(path); imagenes.push(path);
      archivos.push({ path, base64: await blobB64(f.blob) });
    }
    const prod = { ...previo, id, nombre, imagenes, categoria: cat, precio, novedad: $('f-novedad').checked,
      descripcion: $('f-desc').value.trim(), caracteristicas: $('f-carac').value.split('\n').map(s => s.trim()).filter(Boolean) };
    // Los productos nuevos van AL PRINCIPIO de la lista (para que salgan primero). Para ponerlos al final: [...lista, prod]
    return previo ? lista.map(x => x.id === id ? prod : x) : [prod, ...lista];
  }, `Panel: ${editando ? 'editar' : 'agregar'} ${nombre}`);

  btn.disabled = false; btn.textContent = 'Publicar producto';
  if (ok) mostrar('app');
});

iniciar();
