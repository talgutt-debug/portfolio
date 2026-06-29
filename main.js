// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Preview facade: click to load iframe (YouTube keynote). =====
// .preview-link cards are plain anchors that open the live site (those pages block embedding).
document.querySelectorAll('.preview:not(.preview-link)').forEach(fig => {
  const btn = fig.querySelector('.preview-play');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const url = fig.dataset.embed;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = fig.querySelector('.preview-poster')?.alt || 'Embedded preview';
    fig.appendChild(iframe);
    fig.classList.add('is-playing');
  });
});

// ===== Lightbox for gallery images =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
function openLightbox(src, alt){
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}
document.querySelectorAll('.shot img, .bleed img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
});
lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

// ===== Active nav highlight on scroll =====
const sections = ['work','secrets','studio','contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const navMap = new Map();
document.querySelectorAll('.nav-links a').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  navMap.set(id, a);
});
const obs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting){
      navMap.forEach(a => a.classList.remove('active'));
      const a = navMap.get(en.target.id);
      if (a) a.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sections.forEach(s => obs.observe(s));

// ===== Studio room prompts -> in-page markdown modal =====
const mdModal = document.getElementById('md-modal');
const mdBody = mdModal.querySelector('.md-sheet-body');
const mdTitle = mdModal.querySelector('.md-sheet-title');
const mdRaw = mdModal.querySelector('.md-raw');
function closeMd(){
  mdModal.hidden = true;
  mdBody.innerHTML = '';
  document.body.style.overflow = '';
}
document.querySelectorAll('.room').forEach(room => {
  room.addEventListener('click', async e => {
    // Let people still open the raw file in a new tab via modifier/middle click.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = room.getAttribute('href');
    const title = room.querySelector('h3')?.textContent || 'Prompt';
    mdTitle.textContent = title;
    mdRaw.href = href;
    mdBody.innerHTML = '<p class="md-loading">Loading…</p>';
    mdModal.hidden = false;
    document.body.style.overflow = 'hidden';
    try {
      const res = await fetch(href);
      const raw = await res.text();
      // strip YAML frontmatter (name/description/model/tools block)
      const text = raw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      mdBody.innerHTML = (window.marked ? window.marked.parse(text) : '<pre>' + text.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])) + '</pre>');
      mdBody.scrollTop = 0;
    } catch (err) {
      mdBody.innerHTML = '<p>Couldn’t load this prompt. <a href="' + href + '" target="_blank" rel="noopener">Open the raw file ↗</a></p>';
    }
  });
});
mdModal.addEventListener('click', e => { if (e.target === mdModal || e.target.closest('.md-close')) closeMd(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mdModal.hidden) closeMd(); });

// ===== Social carousel =====
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.children];
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');

  // dots
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function step(){ return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth; }
  function maxScroll(){ return track.scrollWidth - track.clientWidth; }
  function atEnd(){ return track.scrollLeft >= maxScroll() - 2; }
  function current(){
    if (atEnd()) return slides.length - 1;
    return Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / step())));
  }
  function goTo(i){
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollLeft = Math.max(0, Math.min(i * step(), maxScroll()));
    update();
  }
  function update(){
    const i = current();
    dots.forEach((d, di) => d.setAttribute('aria-selected', di === i ? 'true' : 'false'));
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = atEnd();
  }

  prev && prev.addEventListener('click', () => goTo(current() - 1));
  next && next.addEventListener('click', () => goTo(current() + 1));

  let raf;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); });
  window.addEventListener('resize', update);

  // open slides in the lightbox
  slides.forEach(s => {
    const img = s.querySelector('img');
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  update();
});

// ===== Contact form -> mailto (no backend) =====
const form = document.getElementById('contact-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = encodeURIComponent(form.name.value.trim());
  const msg = encodeURIComponent(form.message.value.trim());
  const subject = `Portfolio enquiry${name ? ' from ' + decodeURIComponent(name) : ''}`;
  const body = `${form.message.value.trim()}\n\n— ${form.name.value.trim()}`;
  window.location.href = `mailto:talgutt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
