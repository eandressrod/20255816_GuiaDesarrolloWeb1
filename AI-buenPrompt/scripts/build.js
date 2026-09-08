const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'construpre', 'www.construprefabricadas.com');
const out = path.join(root, 'dist');
const site = path.join(root, 'src');
const categoriesByList = {
  'proyectoslist0b30.html': 'Casas básicas',
  'proyectoslistdcfd.html': 'Casas con acabados',
  'proyectoslist681a.html': 'Tapiales',
  'proyectoslistd708.html': 'Ranchos',
  'proyectoslist6258.html': 'Madera',
  'proyectoslist2e5f.html': 'Trabajos en bloques'
};

function read(file) { return fs.readFileSync(file, 'latin1'); }
function decode(value = '') {
  // The mirror declares ISO-8859-1 on some pages while its body is UTF-8.
  // Repair only the characteristic mojibake sequence before decoding entities.
  if (/[ÃÂ]/.test(value)) value = Buffer.from(value, 'latin1').toString('utf8');
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (_, dec, hex, named) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return { aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', amp: '&', quot: '"', nbsp: ' ', lt: '<', gt: '>' }[named] || _;
  }).replace(/�/g, '');
}
function text(value) { return decode(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function escape(value = '') { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]); }
function slug(value) {
  return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'proyecto';
}
function mkdir(file) { fs.mkdirSync(path.dirname(file), { recursive: true }); }
function write(file, content) { mkdir(file); fs.writeFileSync(file, content); }
function asset(file) { return `/assets/${file.replace(/\\/g, '/')}`; }
function relativeAsset(file, depth = '') { return `${depth}${asset(file).slice(1)}`; }

if (!fs.existsSync(source)) throw new Error('No se encontró el mirror de CONSTRUPRE.');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(source, 'images'), path.join(out, 'assets', 'images'), { recursive: true });
fs.cpSync(path.join(site, 'styles.css'), path.join(out, 'styles.css'));
fs.cpSync(path.join(site, 'app.js'), path.join(out, 'app.js'));

const categoryMap = new Map();
for (const [list, category] of Object.entries(categoriesByList)) {
  const content = read(path.join(source, list));
  for (const hit of content.matchAll(/href=["'](proyecto[\w]+\.html)(?:\?[^"']*)?["']/gi)) categoryMap.set(hit[1], category);
}
const projectFiles = fs.readdirSync(source).filter(file => /^proyecto[0-9a-f]+\.html$/i.test(file));
const usedSlugs = new Map();
const projects = projectFiles.map(file => {
  const content = read(path.join(source, file));
  const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = text(titleMatch?.[1] || '');
  if (!title) return null;
  let projectSlug = slug(title);
  const duplicate = usedSlugs.get(projectSlug) || 0;
  usedSlugs.set(projectSlug, duplicate + 1);
  if (duplicate) projectSlug += `-${duplicate + 1}`;
  const heroMatch = content.match(/<div id="Zoom">[\s\S]*?<img[^>]+src=["']([^"']+)/i);
  const hero = (heroMatch?.[1] || '').replace(/^\/+/, '');
  const gallery = [...content.matchAll(/<div class="item">[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)/gi)]
    .map(match => ({ src: match[1].replace(/^\/+/, ''), alt: text(match[2]) }))
    .filter(image => image.src.startsWith('images/'));
  if (hero && !gallery.some(image => image.src === hero)) gallery.unshift({ src: hero, alt: title });
  const descriptionMatch = content.match(/<div id="Descripcion"[^>]*>([\s\S]*?)<\/div>/i);
  const paragraphs = [...(descriptionMatch?.[1] || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(match => text(match[1])).filter(Boolean);
  const area = paragraphs.find(item => /[áa]rea.*\bm2\b/i.test(item)) || '';
  const legacy = (content.match(/Mirrored from https:\/\/www\.construprefabricadas\.com\/([^ ]+)/i)?.[1] || file).replace(/&amp;/g, '&');
  return { file, legacy, slug: projectSlug, title, category: categoryMap.get(file) || '', hero, gallery, paragraphs, area };
}).filter(Boolean).sort((a, b) => a.title.localeCompare(b.title, 'es'));

const featuredNames = ['Berlín', 'Punta Roca Surf Resort', 'Rancho - restaurante', 'Tapial Santa Elena', 'Cabaña El Sunzal', 'Oficinas plantel Aguilares'];
const featured = featuredNames.map(name => projects.find(project => project.title === name)).filter(Boolean);
function nav(depth = '') {
  return `<a class="skip-link" href="#contenido">Saltar al contenido</a><header class="site-header" data-header><a class="brand" href="${depth}"><img src="${depth}assets/images/logo_construcciones_prefabricadas.png" alt="CONSTRUPRE · Construcciones Prefabricadas"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navegacion" data-menu-toggle><span></span><span></span><span></span><span class="sr-only">Abrir navegación</span></button><nav id="navegacion" aria-label="Navegación principal" data-menu><a href="${depth}">Inicio</a><a href="${depth}empresa/">Empresa</a><a href="${depth}servicios/">Servicios</a><a href="${depth}proyectos/">Proyectos</a><a href="${depth}contacto/">Contacto</a><a class="nav-cta" href="${depth}contacto/#cotizar">Solicitar cotización <span aria-hidden="true">↗</span></a></nav></header>`;
}
function footer(depth = '') {
  return `<footer class="site-footer"><div class="footer-brand"><img src="${depth}assets/images/logo_construcciones_prefabricadas.png" alt="CONSTRUPRE"><p>Fabricación, diseño y construcción de proyectos prefabricados en El Salvador.</p></div><div><p class="eyebrow">Contacto</p><a href="tel:+50322280022">(503) 2228-0022</a><a href="https://wa.me/50322886011" target="_blank" rel="noreferrer">WhatsApp</a></div><div><p class="eyebrow">Oficina</p><p>15 Av. Sur, Blok “D” No. 14<br>Residencial Bethania, Santa Tecla<br>La Libertad, El Salvador</p></div><div><p class="eyebrow">Planta</p><p>Km. 29 Carretera a Sonsonate<br>Lotificación El Edén, Lourdes Colón<br>La Libertad, El Salvador</p></div><small>© ${new Date().getFullYear()} Construcciones Prefabricadas.</small></footer>`;
}
function page({ title, description, body, depth = '', schema = '', canonicalPath = '/' }) {
  const canonical = `https://www.construprefabricadas.com${canonicalPath}`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#123e32"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:locale" content="es_SV"><link rel="canonical" href="${canonical}"><link rel="icon" href="${depth}assets/images/home/construp.ico"><link rel="stylesheet" href="${depth}styles.css"></head><body>${nav(depth)}<main id="contenido">${body}</main>${footer(depth)}<script src="${depth}app.js" defer></script>${schema ? `<script type="application/ld+json">${schema}</script>` : ''}</body></html>`;
}
function projectCard(project, depth = '') {
  const image = project.hero || project.gallery[0]?.src;
  return `<article class="project-card" data-project data-category="${escape(project.category)}"><a href="${depth}proyectos/${project.slug}/" aria-label="Ver proyecto ${escape(project.title)}">${image ? `<img src="${depth}assets/${escape(image)}" alt="${escape(project.gallery[0]?.alt || project.title)}" loading="lazy" width="700" height="525">` : '<div class="image-placeholder"></div>'}<div class="project-card__veil"></div><div class="project-card__content">${project.category ? `<span>${escape(project.category)}</span>` : ''}<h3>${escape(project.title)}</h3><b>Explorar <i aria-hidden="true">↗</i></b></div></a></article>`;
}

const organizationSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Construcciones Prefabricadas', alternateName: 'CONSTRUPRE', telephone: '+50322280022', address: { '@type': 'PostalAddress', streetAddress: '15 Av. Sur, Blok D No. 14, Residencial Bethania', addressLocality: 'Santa Tecla', addressRegion: 'La Libertad', addressCountry: 'SV' }, areaServed: 'El Salvador' });
const homeBody = `<section class="hero"><div class="hero__image"><img src="assets/${escape(featured[0]?.hero || 'images/show/277888923.jpg')}" alt="${escape(featured[0]?.title || 'Proyecto CONSTRUPRE')}" fetchpriority="high" width="700" height="525"></div><div class="hero__panel"><p class="eyebrow">Construcciones prefabricadas · El Salvador</p><h1>De una idea a un espacio hecho para vivirlo.</h1><p>Diseñamos y construimos proyectos prefabricados con la experiencia, solidez y atención personalizada de CONSTRUPRE.</p><div class="actions"><a class="button button--light" href="proyectos/">Explorar proyectos <span>↗</span></a><a class="text-link" href="contacto/#cotizar">Hablar de mi proyecto <span>→</span></a></div></div><div class="hero__label"><span>Más de</span><strong>24</strong><span>años de experiencia</span></div></section><section class="intro section" data-reveal><p class="eyebrow">Construcción que responde a cada proyecto</p><div class="intro__grid"><h2>Una forma práctica de construir, sin renunciar al carácter.</h2><div><p>Somos una empresa 100% salvadoreña dedicada a la fabricación, diseño y construcción de tapiales, casas prefabricadas y otros proyectos de construcción.</p><a class="text-link" href="empresa/">Conocer CONSTRUPRE <span>→</span></a></div></div></section><section class="feature-project section" data-reveal><div class="section-heading"><div><p class="eyebrow">Obra real, experiencia visible</p><h2>Proyectos que hablan por nuestro trabajo.</h2></div><a class="text-link" href="proyectos/">Ver todo el portafolio <span>→</span></a></div><div class="feature-grid">${featured.slice(0, 4).map(project => projectCard(project)).join('')}</div></section><section class="system section"><div class="system__graphic" aria-hidden="true"><span></span><span></span><span></span></div><div><p class="eyebrow">Sistema constructivo</p><h2>Materiales pensados para la solidez.</h2><p>Los elementos prefabricados de CONSTRUPRE se elaboran con concreto de alta resistencia de 210 kg/cm² y estructura con varillas de hierro grado 70.</p><a class="text-link" href="servicios/">Conocer nuestros servicios <span>→</span></a></div></section><section class="services section" data-reveal><p class="eyebrow">Lo que construimos</p><div class="services__grid"><h2>Soluciones para casas, espacios recreativos y proyectos de terreno.</h2><ul><li><a href="proyectos/?categoria=Casas+básicas">Casas básicas <span>↗</span></a></li><li><a href="proyectos/?categoria=Casas+con+acabados">Casas con acabados <span>↗</span></a></li><li><a href="proyectos/?categoria=Tapiales">Tapiales <span>↗</span></a></li><li><a href="proyectos/?categoria=Ranchos">Ranchos <span>↗</span></a></li></ul></div></section><section class="cta section"><p class="eyebrow">Su proyecto comienza aquí</p><h2>Cuéntenos qué necesita construir.</h2><a class="button" href="contacto/#cotizar">Solicitar cotización <span>↗</span></a></section>`;
write(path.join(out, 'index.html'), page({ title: 'CONSTRUPRE | Construcciones prefabricadas en El Salvador', description: 'Fabricación, diseño y construcción de casas prefabricadas, tapiales, ranchos y proyectos personalizados en El Salvador.', body: homeBody, schema: organizationSchema }));

const aboutBody = `<section class="page-hero"><p class="eyebrow">Empresa</p><h1>Construimos desde la experiencia y las necesidades de cada cliente.</h1></section><section class="story section"><div><p>Somos una empresa 100% salvadoreña con más de <strong>24 años</strong> de experiencia en el mercado del prefabricado, con valores cristianos como base de nuestro trabajo.</p><p>Nos dedicamos a la fabricación, diseño y construcción de tapiales, casas prefabricadas y cualquier otro proyecto de construcción que nuestros clientes nos confían.</p></div><img src="../assets/images/bgcompania.gif" alt="Construcciones Prefabricadas" width="400" height="300"></section><section class="section values"><p class="eyebrow">Cómo trabajamos</p><div><article><b>01</b><h2>Escuchamos su idea</h2><p>Cada proyecto parte de sus necesidades, ideas y objetivos.</p></article><article><b>02</b><h2>Diseñamos a medida</h2><p>Transformamos la visión del cliente en una solución constructiva práctica.</p></article><article><b>03</b><h2>Construimos con solidez</h2><p>Combinamos prefabricados, acabados y experiencia de obra para hacerla realidad.</p></article></div></section><section class="cta section"><h2>Conozca el trabajo que hemos realizado.</h2><a class="button" href="../proyectos/">Ver proyectos <span>↗</span></a></section>`;
write(path.join(out, 'empresa', 'index.html'), page({ title: 'Empresa | CONSTRUPRE', description: 'Conozca la experiencia y el enfoque de Construcciones Prefabricadas en El Salvador.', body: aboutBody, depth: '../', canonicalPath: '/empresa/' }));

const servicesBody = `<section class="page-hero page-hero--services"><p class="eyebrow">Servicios</p><h1>Proyectos que se adaptan al lugar, al uso y a su forma de vivir.</h1><p>Fabricación, diseño y construcción para necesidades residenciales, recreativas y de terreno.</p></section><section class="service-list section">${[['Tapiales','Soluciones perimetrales prefabricadas para delimitar y proteger espacios.'],['Casas básicas','Una alternativa práctica para comenzar a construir su espacio.'],['Casas con acabados','Proyectos personalizados con acabados que dan carácter al resultado.'],['Ranchos y piscinas','Espacios recreativos y de convivencia para disfrutar el entorno.']].map((item, i) => `<article><b>0${i+1}</b><div><h2>${item[0]}</h2><p>${item[1]}</p></div><a href="../proyectos/?categoria=${encodeURIComponent(item[0].replace(' y piscinas',''))}">Ver proyectos <span>↗</span></a></article>`).join('')}</section><section class="technical section"><img src="../assets/images/loseta_prefabricada.png" alt="Detalle de loseta prefabricada" loading="lazy"><div><p class="eyebrow">Detalle constructivo</p><h2>Prefabricados sólidos, elaborados para construir.</h2><p>Los elementos se fabrican con concreto de alta resistencia de 210 kg/cm² y estructura con varillas de hierro grado 70.</p><p class="technical__note">El sitio original documenta módulos de loseta de 2.00 m, 1.50 m y 1.00 m; consulte con el equipo para evaluar su proyecto.</p></div></section><section class="cta section"><h2>¿Tiene una idea en mente?</h2><a class="button" href="../contacto/#cotizar">Hablemos de su proyecto <span>↗</span></a></section>`;
write(path.join(out, 'servicios', 'index.html'), page({ title: 'Servicios | CONSTRUPRE', description: 'Tapiales, casas prefabricadas, ranchos y proyectos personalizados de Construcciones Prefabricadas.', body: servicesBody, depth: '../', canonicalPath: '/servicios/' }));

const categories = [...new Set(projects.map(project => project.category).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'es'));
const projectsBody = `<section class="page-hero project-list-hero"><p class="eyebrow">Portafolio</p><h1>Proyectos reales, construidos para necesidades distintas.</h1><p>Explore una selección de casas, tapiales, ranchos y otras obras desarrolladas por CONSTRUPRE.</p></section><section class="section portfolio"><div class="filter-bar" aria-label="Filtrar proyectos"><button class="is-active" type="button" data-filter="">Todos <span>${projects.length}</span></button>${categories.map(category => `<button type="button" data-filter="${escape(category)}">${escape(category)} <span>${projects.filter(project=>project.category===category).length}</span></button>`).join('')}</div><p class="filter-status" aria-live="polite" data-filter-status>Mostrando ${projects.length} proyectos</p><div class="portfolio-grid">${projects.map(project => projectCard(project, '../')).join('')}</div></section>`;
write(path.join(out, 'proyectos', 'index.html'), page({ title: 'Proyectos | CONSTRUPRE', description: 'Portafolio de casas prefabricadas, tapiales, ranchos y obras desarrolladas por CONSTRUPRE.', body: projectsBody, depth: '../', canonicalPath: '/proyectos/' }));

for (const project of projects) {
  const related = projects.filter(item => item.category && item.category === project.category && item.slug !== project.slug).slice(0, 3);
  const specs = project.paragraphs.filter(item => item !== project.area);
  const gallery = project.gallery.slice(0, 16);
  const body = `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../../">Inicio</a><span>/</span><a href="../">Proyectos</a><span>/</span><span>${escape(project.title)}</span></nav><section class="project-hero"><div>${project.hero ? `<img src="../../assets/${escape(project.hero)}" alt="${escape(project.gallery[0]?.alt || project.title)}" width="700" height="525">` : ''}</div><article><p class="eyebrow">${escape(project.category || 'Proyecto desarrollado')}</p><h1>${escape(project.title)}</h1>${project.area ? `<p class="project-area">${escape(project.area)}</p>` : ''}<a class="button" href="../../contacto/#cotizar">Consultar proyecto similar <span>↗</span></a></article></section>${gallery.length > 1 ? `<section class="section project-gallery"><div class="section-heading"><div><p class="eyebrow">Galería</p><h2>Imágenes del proyecto</h2></div><p>Seleccione una imagen para ampliarla.</p></div><div class="gallery-grid">${gallery.map((image, index) => `<button type="button" class="gallery-item ${index === 0 ? 'gallery-item--wide' : ''}" data-lightbox-src="../../assets/${escape(image.src)}" data-lightbox-alt="${escape(image.alt || project.title)}"><img src="../../assets/${escape(image.src)}" alt="${escape(image.alt || project.title)}" loading="lazy"></button>`).join('')}</div></section>` : ''}${specs.length ? `<section class="section project-details"><div><p class="eyebrow">Características documentadas</p><h2>Información del proyecto</h2></div><ul>${specs.map(spec => `<li>${escape(spec)}</li>`).join('')}</ul></section>` : ''}${related.length ? `<section class="section related"><div class="section-heading"><div><p class="eyebrow">Más proyectos</p><h2>${project.category ? `Otros proyectos de ${escape(project.category)}` : 'Continúe explorando'}</h2></div><a class="text-link" href="../">Ver portafolio <span>→</span></a></div><div class="feature-grid">${related.map(item => projectCard(item, '../../')).join('')}</div></section>` : ''}<section class="cta section"><h2>¿Le interesa un proyecto como este?</h2><a class="button" href="../../contacto/#cotizar">Solicitar cotización <span>↗</span></a></section>`;
  write(path.join(out, 'proyectos', project.slug, 'index.html'), page({ title: `${project.title} | Proyectos CONSTRUPRE`, description: `${project.title}${project.category ? ` · ${project.category}` : ''}. Proyecto desarrollado por Construcciones Prefabricadas.`, body, depth: '../../', canonicalPath: `/proyectos/${project.slug}/` }));
}

const contactBody = `<section class="page-hero contact-hero"><p class="eyebrow">Contacto</p><h1>Conversemos sobre lo que quiere construir.</h1><p>Cuéntenos su idea o comuníquese con nuestro equipo por los canales publicados por CONSTRUPRE.</p></section><section class="contact section"><form id="cotizar" data-contact-form><p class="eyebrow">Solicitud de cotización</p><h2>Hablemos de su proyecto</h2><p class="form-intro">Este formulario está preparado para la futura integración de un servicio de envío. Mientras tanto, contáctenos por teléfono o WhatsApp.</p><label>Nombre<input name="nombre" autocomplete="name" required></label><label>Teléfono<input name="telefono" type="tel" autocomplete="tel" required></label><label>Correo<input name="correo" type="email" autocomplete="email"></label><label>Tipo de proyecto<select name="tipo"><option value="">Seleccione una opción</option>${categories.map(category => `<option>${escape(category)}</option>`).join('')}<option>Otro proyecto</option></select></label><label class="full">Mensaje<textarea name="mensaje" rows="5" placeholder="Describa brevemente su proyecto" required></textarea></label><button class="button" type="submit">Preparar consulta <span>↗</span></button><p class="form-message" aria-live="polite" data-form-message></p></form><aside><p class="eyebrow">Datos de contacto</p><h2>Estamos para atenderle.</h2><a class="contact-link" href="tel:+50322280022"><span>Teléfono de oficina</span><strong>(503) 2228-0022</strong></a><a class="contact-link" href="https://wa.me/50322886011" target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Escribir por WhatsApp ↗</strong></a><div class="contact-address"><span>Oficina</span><p>15 Av. Sur Blok “D” No. 14<br>Residencial Bethania, Santa Tecla<br>La Libertad, El Salvador</p></div><div class="contact-address"><span>Planta</span><p>Km. 29 Carretera a Sonsonate<br>Lotificación El Edén, Lourdes Colón<br>La Libertad, El Salvador</p></div></aside></section>`;
write(path.join(out, 'contacto', 'index.html'), page({ title: 'Contacto | CONSTRUPRE', description: 'Solicite información sobre casas prefabricadas, tapiales y otros proyectos de construcción en El Salvador.', body: contactBody, depth: '../', canonicalPath: '/contacto/' }));

write(path.join(out, '404.html'), page({ title: 'Página no encontrada | CONSTRUPRE', description: 'La página solicitada no está disponible.', body: `<section class="not-found"><p class="eyebrow">Error 404</p><h1>Esta página no está disponible.</h1><a class="button" href="./">Volver al inicio <span>→</span></a></section>` }));
write(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://www.construprefabricadas.com/sitemap.xml\n`);
const urls = ['/', '/empresa/', '/servicios/', '/proyectos/', '/contacto/', ...projects.map(project => `/proyectos/${project.slug}/`)];
write(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>https://www.construprefabricadas.com${url}</loc></url>`).join('')}</urlset>`);
write(path.join(out, 'redirects.csv'), `legacy_url,new_url\n${projects.map(project => `/${project.legacy},/proyectos/${project.slug}/`).join('\n')}\n/proyectos.php,/proyectos/\n/servicios.php,/servicios/\n/compania.php,/empresa/\n/contactenos.php,/contacto/\n`);
write(path.join(out, '_redirects'), `${projects.map(project => `/${project.legacy} /proyectos/${project.slug}/ 301`).join('\n')}\n/proyectos.php /proyectos/ 301\n/servicios.php /servicios/ 301\n/compania.php /empresa/ 301\n/contactenos.php /contacto/ 301\n`);
console.log(`Build complete: ${projects.length} project pages, ${categories.length} categories, and original images copied to dist/assets.`);
