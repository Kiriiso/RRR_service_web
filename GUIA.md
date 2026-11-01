# Guía de RRR Servicio Técnico

## 1. Panel de productos (`admin/`)

Sirve para agregar, editar, marcar novedad y eliminar productos sin tocar código ni usar Git.
Abre `admin/index.html` desde el sitio publicado (`.../admin/`) o con doble clic desde la carpeta del proyecto. Solo necesita internet.

### Crear el token (una vez, con la cuenta dueña del repositorio)
1. GitHub → foto de perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nombre: `Panel RRR`. Expiración: la más larga que permita.
3. **Repository access** → *Only select repositories* → `RRR_service_web`.
4. **Permissions** → *Repository permissions* → **Contents: Read and write**.
5. **Generate token** y copiarlo (se muestra una sola vez). Guardarlo en un gestor de contraseñas.
6. Pegarlo en el panel. Queda guardado solo en ese navegador.

Si el token se pierde o se filtra: en la misma página de GitHub, **Revoke** y crear otro.
Si el repositorio cambia de dueño o de nombre: editar `CFG` al inicio de `admin/admin.js`.

### Uso
- **+ Nuevo producto**: nombre, descripción, características (una por línea), tipo, precio sin puntos, novedad y fotos (arrastrar). La primera foto es la portada (★ para cambiarla).
- Las fotos se convierten a WebP y se reducen a 1200 px. Usar Chrome o Edge.
- **Publicar** sube todo en un solo cambio. El sitio se actualiza en 1 a 2 minutos (Ctrl+F5).
- Marcar o quitar novedad, editar y eliminar están en cada fila.

### Límites
- Eliminar un producto no borra sus fotos del repositorio (no estorban).
- La primera vez que se publica, `productos.json` se reordena y reformatea.
- Sin internet no funciona. Si dos personas publican a la vez, el panel siempre parte de lo último publicado.

## 2. Cuando llegue el dominio
1. Comprar el dominio `.cl` (NIC Chile u otro). En GitHub: repositorio → **Settings → Pages → Custom domain**, y activar **Enforce HTTPS**. Los registros DNS exactos están en la documentación de GitHub Pages ("Managing a custom domain").
2. Reemplazar `kiriiso.github.io/RRR_service_web` por el dominio en: `index.html`, `catalogo.html` y `sitemap.xml` (incluye el bloque JSON-LD del index).
3. En `404.html` cambiar `<base href="/RRR_service_web/">` por `<base href="/">`.
4. Search Console: agregar la propiedad del dominio, enviar `sitemap.xml` y pedir indexación del inicio.
5. Google Business Profile: poner la dirección del sitio en la ficha de cada local.
6. Favicon: un PNG cuadrado de 96 px o más en `img/favicon.png`, con `<link rel="icon" type="image/png" href="img/favicon.png">` en cada HTML. Google lo muestra junto al resultado.
7. Imagen para compartir de 1200×630 y cambiarla en `og:image`.
8. Nombre del sitio en Google: agregar al JSON-LD del index
   `{"@type":"WebSite","name":"RRR Servicio Técnico","url":"https://TU-DOMINIO/"}`.

## 3. Rutina de posicionamiento (mensual)
- Pedir reseña de Google a cada cliente satisfecho (enlace directo por WhatsApp o QR en el local) y responder todas.
- Subir fotos nuevas y publicar novedades en la ficha de Google Business de cada local.
- Mantener igual el nombre, dirección y teléfono en Google, Instagram y el sitio.
- Revisar en Search Console qué búsquedas traen visitas y qué páginas no están indexadas.
