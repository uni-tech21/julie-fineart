(() => {
  'use strict';

  document.documentElement.classList.add('js');

  function initialise() {
    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('site-nav');
    const mobileMenu = window.matchMedia('(max-width: 760px)');

    function closeMenu(restoreFocus = false) {
      if (!menuButton || !navigation) return;
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menuButton.focus();
    }

    if (menuButton && navigation) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.addEventListener('click', () => {
        if (!mobileMenu.matches) return;
        const open = menuButton.getAttribute('aria-expanded') !== 'true';
        navigation.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
      });
      navigation.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navigation.classList.contains('is-open') &&
            !document.querySelector('dialog[open]')) {
          closeMenu(true);
        }
      });
      mobileMenu.addEventListener('change', () => closeMenu());
    }

    const dialog = document.getElementById('artwork-dialog');
    const image = document.getElementById('dialog-image');
    const title = document.getElementById('dialog-title');
    const caption = document.getElementById('dialog-caption');
    const position = document.getElementById('dialog-position');
    const enquiry = document.getElementById('dialog-enquire');
    const imageError = document.getElementById('dialog-error');
    const price = document.getElementById('dialog-price');

    if (dialog && typeof dialog.showModal === 'function' && image && title &&
        caption && position && enquiry) {
      let artworkLinks = [];
      let currentArtwork = 0;
      let lastTrigger = null;

      function displayArtwork(index) {
        currentArtwork = (index + artworkLinks.length) % artworkLinks.length;
        const link = artworkLinks[currentArtwork];
        const artworkTitle = link.dataset.title || link.querySelector('img')?.alt || 'Artwork';
        title.textContent = artworkTitle;
        caption.textContent = link.dataset.caption || '';
        if (price) {
          price.textContent = link.dataset.price || '';
          price.hidden = !link.dataset.price;
        }
        position.textContent = `${currentArtwork + 1} of ${artworkLinks.length}`;
        image.alt = artworkTitle;
        enquiry.href = `contact.html?artwork=${encodeURIComponent(artworkTitle)}`;
        if (imageError) imageError.hidden = true;
        image.hidden = false;
        image.src = link.href;
      }

      image.addEventListener('error', () => {
        image.hidden = true;
        if (imageError) {
          imageError.textContent = 'This image could not be loaded. Please try another image or get in touch.';
          imageError.hidden = false;
        }
      });
      image.addEventListener('load', () => {
        image.hidden = false;
        if (imageError) imageError.hidden = true;
      });

      document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[data-artwork]');
        if (!link) return;
        artworkLinks = Array.from(document.querySelectorAll('a[data-artwork]'));
        displayArtwork(artworkLinks.indexOf(link));
        lastTrigger = link;
        try {
          dialog.showModal();
        } catch {
          return;
        }
        event.preventDefault();
        document.body.classList.add('modal-open');
      });

      dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
      dialog.querySelector('[data-gallery-prev]')?.addEventListener('click', () => displayArtwork(currentArtwork - 1));
      dialog.querySelector('[data-gallery-next]')?.addEventListener('click', () => displayArtwork(currentArtwork + 1));
      dialog.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          displayArtwork(currentArtwork + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) {
          dialog.close();
        }
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
      });
    }

    document.querySelectorAll('[data-year]').forEach(element => {
      element.textContent = String(new Date().getFullYear());
    });

    const requestedArtwork = new URLSearchParams(window.location.search).get('artwork')?.trim().slice(0, 200);
    if (requestedArtwork) {
      document.querySelectorAll('[data-enquiry-artwork]').forEach(element => {
        element.textContent = `Your enquiry: ${requestedArtwork}`;
        element.hidden = false;
      });
      document.querySelectorAll('a[data-enquiry-email]').forEach(link => {
        const originalHref = link.getAttribute('href');
        if (!originalHref || !originalHref.toLowerCase().startsWith('mailto:')) return;
        const email = new URL(originalHref);
        email.searchParams.set('subject', `Artwork enquiry: ${requestedArtwork}`);
        email.searchParams.set('body', `Hello Julie,\n\nI would like to enquire about ${requestedArtwork}.\n\n`);
        email.search = email.searchParams.toString().replace(/\+/g, '%20');
        link.href = email.href;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
