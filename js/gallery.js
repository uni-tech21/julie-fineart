(() => {
  'use strict';

  const grids = Array.from(document.querySelectorAll('[data-artwork-grid]'));
  if (!grids.length) return;

  const registryURL = new URL('../gallery/artworks.json', document.currentScript.src);
  const previewCaption = 'This is a temporary example photograph, not Julie’s artwork.';
  const fallbackCards = new Set(grids.flatMap(grid => Array.from(grid.querySelectorAll('[id]'))));
  const usedIds = new Set(Array.from(document.querySelectorAll('[id]'))
    .filter(element => !fallbackCards.has(element)).map(element => element.id));
  const reservedIds = new Set(['top', 'main', 'site-nav', 'hero-title', 'selected-title',
    'artwork-dialog', 'dialog-image', 'dialog-error', 'dialog-title', 'dialog-price',
    'dialog-caption', 'dialog-enquire', 'dialog-position']);

  function cleanText(value, limit = 240) {
    return typeof value === 'string' ? value.trim().slice(0, limit) : '';
  }

  function imageURL(value) {
    const path = cleanText(value, 1200);
    if (!path || /^[a-z][a-z\d+.-]*:|^\/\//i.test(path)) return null;
    try {
      const url = new URL(path, registryURL);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) ||
        url.username || url.password || !/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname)) {
        return null;
      }
      return url.href;
    } catch {
      return null;
    }
  }

  function normalize(entry, index) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const title = cleanText(entry.title, 160);
    const image = imageURL(entry.image);
    if (!title || !image || typeof entry.preview !== 'boolean') return null;
    const providedId = cleanText(entry.id, 80);
    const id = /^[a-z][a-z\d_-]{0,79}$/i.test(providedId) && !reservedIds.has(providedId)
      ? providedId : `artwork-${index + 1}`;
    const dimension = value => Number.isInteger(value) && value > 0 && value <= 12000 ? value : 450;
    return {
      id, title, image,
      alt: cleanText(entry.alt, 300) || `${entry.preview ? 'Temporary example image for ' : ''}${title}`,
      category: cleanText(entry.category, 100) || 'Artwork',
      price: cleanText(entry.price, 100) || 'Price on enquiry',
      description: cleanText(entry.description, 1200),
      preview: entry.preview,
      width: dimension(entry.width), height: dimension(entry.height)
    };
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function uniqueId(id) {
    let candidate = id;
    let suffix = 2;
    while (usedIds.has(candidate) || reservedIds.has(candidate)) candidate = `${id}-${suffix++}`;
    usedIds.add(candidate);
    return candidate;
  }

  function card(artwork) {
    const article = element('article', 'artwork-card');
    article.id = uniqueId(artwork.id);
    const link = element('a', 'artwork-image');
    link.href = artwork.image;
    link.dataset.artwork = '';
    link.dataset.title = artwork.title;
    link.dataset.caption = [artwork.description, artwork.preview ? previewCaption : ''].filter(Boolean).join(' ');
    link.dataset.price = artwork.price;
    link.setAttribute('aria-label', `View ${artwork.title}${artwork.preview ? ' preview' : ''}`);

    const image = document.createElement('img');
    image.src = artwork.image;
    image.alt = artwork.alt;
    image.width = artwork.width;
    image.height = artwork.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    link.append(image);
    if (artwork.preview) link.append(element('span', 'preview-badge', 'Preview image'));

    const meta = element('div', 'artwork-meta');
    meta.append(element('p', 'eyebrow', artwork.category), element('h3', '', artwork.title));
    const bottom = element('div', 'artwork-bottom');
    bottom.append(element('span', 'artwork-price', artwork.price));
    const enquiry = element('a', 'artwork-enquire');
    enquiry.href = `contact.html?artwork=${encodeURIComponent(artwork.title)}`;
    enquiry.textContent = 'Enquire';
    bottom.append(enquiry);
    meta.append(bottom);
    article.append(link, meta);
    return article;
  }

  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(registryURL, {
        cache: 'no-cache', credentials: 'same-origin', signal: controller.signal
      });
      if (!response.ok) return;
      const entries = await response.json();
      if (!Array.isArray(entries)) return;
      const artworks = entries.slice(0, 300).map(normalize).filter(Boolean);
      if (!artworks.length) return;

      const replacements = grids.map(grid => {
        const requestedLimit = Number(grid.dataset.limit);
        const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : artworks.length;
        const fragment = document.createDocumentFragment();
        artworks.slice(0, limit).forEach(artwork => fragment.append(card(artwork)));
        return { grid, fragment };
      });
      replacements.forEach(({ grid, fragment }) => {
        grid.replaceChildren(fragment);
        grid.dataset.galleryReady = 'true';
      });
      document.querySelectorAll('[data-gallery-notice]').forEach(notice => {
        notice.hidden = artworks.every(artwork => !artwork.preview);
      });
      document.dispatchEvent(new CustomEvent('gallery:updated'));

      if (location.hash) {
        let targetId;
        try { targetId = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = document.getElementById(targetId);
        if (target && target.matches('.artwork-card') && grids.some(grid => grid.contains(target))) {
          target.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      }
    } catch {
      // The original cards stay usable if the catalogue cannot be loaded.
    } finally {
      clearTimeout(timeout);
    }
  }

  load();
})();
