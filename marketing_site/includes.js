async function loadFragment(containerId, fragmentPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // If already populated (inlined in HTML), skip fetch but still attach handlers
    if (container.children.length > 0) {
        if (containerId === 'site-header') {
            attachHeaderNavigation(container);
        } else if (containerId === 'site-footer') {
            attachFooterHandlers(container);
        }
        return;
    }

    try {
        const response = await fetch(fragmentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${fragmentPath}: ${response.status}`);
        }
        container.innerHTML = await response.text();

        // If we just loaded the header/footer, attach UX-improving handlers
        if (containerId === 'site-header') {
            attachHeaderNavigation(container);
        } else if (containerId === 'site-footer') {
            attachFooterHandlers(container);
        }
    } catch (error) {
        console.error(error);
    }
}

function attachHeaderNavigation(container) {
    const toggle = container.querySelector('.mobile-nav-toggle');
    const menu = container.querySelector('.mobile-nav-menu');

    if (!toggle || !menu) return;
    if (container.dataset.headerNavHandlersAttached === '1') return;
    container.dataset.headerNavHandlersAttached = '1';

    function setMenuOpen(isOpen) {
        menu.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setMenuOpen(!menu.classList.contains('is-open'));
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) {
            setMenuOpen(false);
        }
    });
}

function attachFooterHandlers(container) {
    // Avoid attaching multiple times
    if (container.dataset.footerHandlersAttached === '1') return;
    container.dataset.footerHandlersAttached = '1';

    initVideoModal(container);
    forwardAffiliateRef(container);
}

function initVideoModal(container) {
    const openBtn = container.querySelector('#watchDemoBtn');
    const modal = container.querySelector('#videoModal');
    const closeBtn = container.querySelector('#videoModalClose');
    const frameWrap = container.querySelector('#videoModalFrameWrap');
    if (!openBtn || !modal || !frameWrap) return;

    const videoId = '6QrO1qJW9Ak';

    function openModal() {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
        iframe.title = 'Simple Allergy Alert demo video';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.className = 'w-full h-full rounded-2xl';
        frameWrap.appendChild(iframe);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        const iframe = frameWrap.querySelector('iframe');
        if (iframe) iframe.remove();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
}

function stripRefFromAddressBar() {
    // Purely cosmetic - removes ?ref= from the visible address bar once it's
    // safely persisted to localStorage. Isolated in its own try/catch so a
    // history API failure can never affect referral capture itself.
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('ref');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    } catch (error) {
        // ignore
    }
}

function getReferralCode() {
    const refFromUrl = new URLSearchParams(window.location.search).get('ref');
    const referralStorageKey = 'simpleallergyalert_ref';
    const referralExpiryKey = 'simpleallergyalert_ref_expiry';
    const expiryDays = 60;

    if (refFromUrl && /^[a-zA-Z0-9_-]{1,64}$/.test(refFromUrl)) {
        try {
            window.localStorage.setItem(referralStorageKey, refFromUrl);
            window.localStorage.setItem(referralExpiryKey, String(Date.now() + expiryDays * 24 * 60 * 60 * 1000));
        } catch (error) {
            console.warn('Could not persist referral code:', error);
        }
        stripRefFromAddressBar();
        return refFromUrl;
    }

    try {
        const storedRef = window.localStorage.getItem(referralStorageKey);
        const storedExpiry = Number(window.localStorage.getItem(referralExpiryKey));
        if (storedRef && /^[a-zA-Z0-9_-]{1,64}$/.test(storedRef) && storedExpiry && storedExpiry > Date.now()) {
            return storedRef;
        }

        if (storedRef) {
            window.localStorage.removeItem(referralStorageKey);
            window.localStorage.removeItem(referralExpiryKey);
        }
    } catch (error) {
        console.warn('Could not read referral code from local storage:', error);
    }

    return null;
}

function persistReferralForNavigation(ref) {
    const referralStorageKey = 'simpleallergyalert_ref';
    const referralExpiryKey = 'simpleallergyalert_ref_expiry';
    const expiryDays = 60;
    const expiryMs = expiryDays * 24 * 60 * 60 * 1000;

    try {
        window.localStorage.setItem(referralStorageKey, ref);
        window.localStorage.setItem(referralExpiryKey, String(Date.now() + expiryMs));
        document.cookie = `simpleallergyalert_ref=${encodeURIComponent(ref)}; path=/; max-age=${expiryDays * 24 * 60 * 60}; SameSite=Lax; domain=.simpleallergyalert.com`;
        window.name = JSON.stringify({ ref, savedAt: Date.now() });
    } catch (error) {
        console.warn('Could not persist referral for app navigation:', error);
    }
}

function forwardAffiliateRef(container) {
    // Forwards an affiliate ref code (e.g. ?ref=shannon) from the current
    // page into both destinations: as a Play Store install referrer (so
    // Firebase/GA4 auto-attributes the install + later purchase to the
    // campaign) and as a query param on the webapp link (so it can log
    // the pageload and tag the Lemon Squeezy checkout).
    const ref = getReferralCode();
    if (!ref) return;

    const playStoreLink = container.querySelector('#playStoreLink');
    if (playStoreLink) {
        const referrer = 'utm_source=affiliate&utm_medium=referral&utm_campaign=' + encodeURIComponent(ref);
        const playUrl = new URL(playStoreLink.href);
        playUrl.searchParams.set('referrer', referrer);
        playStoreLink.href = playUrl.toString();
    }

    const webAppLink = container.querySelector('#webAppLink');
    if (webAppLink) {
        const webUrl = new URL(webAppLink.href);
        webUrl.searchParams.set('ref', ref);
        webUrl.searchParams.set('utm_source', 'affiliate');
        webUrl.searchParams.set('utm_medium', 'referral');
        webUrl.searchParams.set('utm_campaign', ref);
        webAppLink.href = webUrl.toString();

        if (webAppLink.dataset.referralHandlerAttached !== '1') {
            webAppLink.dataset.referralHandlerAttached = '1';
            webAppLink.addEventListener('click', () => {
                persistReferralForNavigation(ref);
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Screenshot carousel (hero section on index.html)
//
// Moved here from an inline <script> in index.html so it can be re-run after
// a client-side navigation (see "Same-document navigation" below) lands back
// on the home page, since innerHTML swaps never execute embedded <script>
// tags.
// ---------------------------------------------------------------------------

let activeCarousel = null;

function teardownCarousel() {
    if (activeCarousel) {
        activeCarousel.teardown();
        activeCarousel = null;
    }
}

function initCarouselIfPresent(scope) {
    teardownCarousel();
    if (!scope.querySelector('#screenshotCarousel')) return;
    activeCarousel = initCarousel(scope);
}

function initCarousel(scope) {
    const slideButtons = Array.from(scope.querySelectorAll('.carousel-slide'));
    const slideItems = Array.from(scope.querySelectorAll('.carousel-item'));
    const dots = Array.from(scope.querySelectorAll('.carousel-dot'));
    const overlay = scope.querySelector('#carouselOverlay');
    const overlayImage = scope.querySelector('#carouselOverlayImage');
    const overlayClose = scope.querySelector('#carouselOverlayClose');
    const overlayPrevBtn = scope.querySelector('#carouselOverlayPrev');
    const overlayNextBtn = scope.querySelector('#carouselOverlayNext');
    const track = scope.querySelector('#carouselTrack');
    const frame = scope.querySelector('#carouselFrame');
    if (!track || !overlay) return null;

    const totalSlides = slideItems.length;
    let visibleSlides = 3;
    let maxIndex = Math.max(0, totalSlides - visibleSlides);
    let currentIndex = 0;
    let overlayIndex = 0;
    let autoRotate;

    function getVisibleSlides() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function syncFrameWidth() {
        // Each card's width is intrinsic (driven by its own height + aspect
        // ratio, not by the frame), so the frame is what needs to shrink or
        // grow to exactly fit N cards - otherwise leftover slack space shows
        // up as gray gutter around/between them. Clear any previous inline
        // width first so a stale, too-narrow value from a prior breakpoint
        // can't clamp the card (via its max-width: 100%) and throw off the
        // measurement.
        if (!frame || !slideItems[0]) return;
        frame.style.width = '';
        const itemWidth = slideItems[0].getBoundingClientRect().width;
        if (itemWidth > 0) {
            frame.style.width = (itemWidth * visibleSlides) + 'px';
        }
    }

    function updateCarouselSettings() {
        visibleSlides = getVisibleSlides();
        maxIndex = Math.max(0, totalSlides - visibleSlides);
        currentIndex = Math.min(maxIndex, currentIndex);
        syncFrameWidth();
    }

    function updateTrack(index, smooth = true) {
        const slide = slideItems[index];
        if (!slide) return;
        // Scroll only the horizontal track itself - scrollIntoView() would also
        // scroll ancestor containers (e.g. the page's #scrollArea) back into view
        // whenever the carousel is off-screen, yanking the whole page to the top.
        track.scrollTo({
            left: slide.offsetLeft,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    function handleResize() {
        updateCarouselSettings();
        showSlide(currentIndex, false);
    }

    function showSlide(index, smooth = true) {
        currentIndex = Math.min(maxIndex, Math.max(0, index));
        updateTrack(currentIndex, smooth);
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('bg-white/90', dotIndex === currentIndex);
            dot.classList.toggle('bg-white/50', dotIndex !== currentIndex);
        });
    }

    function nextSlide() {
        showSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }

    function startAutoRotate() {
        if (autoRotate) clearInterval(autoRotate);
        autoRotate = setInterval(nextSlide, 4500);
    }

    function showOverlaySlide(index) {
        overlayIndex = (index + slideButtons.length) % slideButtons.length;
        const img = slideButtons[overlayIndex];
        overlayImage.src = img.src;
        overlayImage.alt = img.alt;
    }

    function openOverlay(index) {
        showOverlaySlide(index);
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    }

    function closeOverlay() {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        overlayImage.src = '';
    }

    function overlayNext() {
        showOverlaySlide(overlayIndex + 1);
    }

    function overlayPrev() {
        showOverlaySlide(overlayIndex - 1);
    }

    slideButtons.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            openOverlay(index);
        });
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.index));
            startAutoRotate();
        });
    });

    overlayClose.addEventListener('click', closeOverlay);
    overlayPrevBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        overlayPrev();
    });
    overlayNextBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        overlayNext();
    });
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeOverlay();
        }
    });

    const keydownHandler = (event) => {
        if (overlay.classList.contains('hidden')) return;
        if (event.key === 'ArrowRight') {
            overlayNext();
        } else if (event.key === 'ArrowLeft') {
            overlayPrev();
        } else if (event.key === 'Escape') {
            closeOverlay();
        }
    };
    document.addEventListener('keydown', keydownHandler);

    const resizeHandler = handleResize;
    window.addEventListener('resize', resizeHandler);

    updateCarouselSettings();
    showSlide(currentIndex, false);
    startAutoRotate();

    return {
        teardown() {
            if (autoRotate) clearInterval(autoRotate);
            window.removeEventListener('resize', resizeHandler);
            document.removeEventListener('keydown', keydownHandler);
        }
    };
}

// ---------------------------------------------------------------------------
// Same-document navigation
//
// The marketing site is a set of standalone HTML pages (index, privacy,
// terms, cookie policy) so that each is fully valid on its own (SEO,
// crawlers, JS-disabled visitors). But for real browser visits we upgrade
// clicks between those pages to client-side navigation so the shared
// header/footer never unmount and re-fetch, and same-page links (Home while
// already on "/", FAQ while already on "/") just scroll instead of reloading.
//
// This never touches the header/footer fragment once loaded, so the
// affiliate/referral wiring in attachFooterHandlers() above only ever runs
// once per real page load, exactly as before.
// ---------------------------------------------------------------------------

const INTERNAL_PAGES = ['/', '/index.html', '/privacy-policy.html', '/terms.html', '/cookie-policy.html'];

function normalizePagePath(pathname) {
    let path = pathname.replace(/\/index\.html$/, '/');
    if (path.length > 1) path = path.replace(/\/$/, '');
    return path || '/';
}

function scrollAreaEl() {
    return document.getElementById('scrollArea');
}

function findInternalNavLink(target) {
    const link = target.closest ? target.closest('a[href]') : null;
    if (!link) return null;
    if (link.target && link.target !== '_self') return null;
    if (link.hasAttribute('download')) return null;

    let url;
    try {
        url = new URL(link.href);
    } catch (error) {
        return null;
    }

    if (url.origin !== location.origin) return null;
    if (!INTERNAL_PAGES.includes(normalizePagePath(url.pathname))) return null;

    return { link, url };
}

function scrollToWithinPage(hash) {
    const scrollArea = scrollAreaEl();
    const target = hash && hash.length > 1 ? document.querySelector(hash) : null;

    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollArea) {
        scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const newUrl = location.pathname + (hash || '');
    history.replaceState(history.state, '', newUrl);
}

function syncDocumentHead(newDocument) {
    if (newDocument.title) document.title = newDocument.title;

    const nextCanonical = newDocument.querySelector('link[rel="canonical"]');
    const currentCanonical = document.querySelector('link[rel="canonical"]');
    if (nextCanonical && currentCanonical) currentCanonical.href = nextCanonical.href;

    const nextDescription = newDocument.querySelector('meta[name="description"]');
    const currentDescription = document.querySelector('meta[name="description"]');
    if (nextDescription && currentDescription) {
        currentDescription.setAttribute('content', nextDescription.getAttribute('content') || '');
    }
}

function applyNavigatedContent(html, url, { pushState }) {
    const newDocument = new DOMParser().parseFromString(html, 'text/html');
    const newScrollArea = newDocument.getElementById('scrollArea');
    const scrollArea = scrollAreaEl();

    if (!newScrollArea || !scrollArea) {
        window.location.href = url.href;
        return;
    }

    scrollArea.innerHTML = newScrollArea.innerHTML;
    syncDocumentHead(newDocument);

    if (pushState) {
        history.pushState({ pjax: true }, '', url.pathname + url.hash);
    }

    initCarouselIfPresent(scrollArea);

    const target = url.hash ? scrollArea.querySelector(url.hash) : null;
    if (target) {
        target.scrollIntoView({ block: 'start' });
    } else {
        scrollArea.scrollTop = 0;
    }
}

let navigationToken = 0;

async function navigateToPage(url, options = { pushState: true }) {
    const myToken = ++navigationToken;

    try {
        const response = await fetch(url.pathname, { credentials: 'same-origin' });
        if (!response.ok) throw new Error(`Failed to load ${url.pathname}: ${response.status}`);
        const html = await response.text();

        // A newer navigation started while this fetch was in flight - drop this one.
        if (myToken !== navigationToken) return;

        applyNavigatedContent(html, url, options);
    } catch (error) {
        console.error(error);
        window.location.href = url.href;
    }
}

document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const match = findInternalNavLink(event.target);
    if (!match) return;

    const currentPath = normalizePagePath(location.pathname);
    const destPath = normalizePagePath(match.url.pathname);

    event.preventDefault();

    if (destPath === currentPath) {
        scrollToWithinPage(match.url.hash);
    } else {
        navigateToPage(match.url, { pushState: true });
    }
});

window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    if (!INTERNAL_PAGES.includes(normalizePagePath(url.pathname))) {
        window.location.reload();
        return;
    }
    navigateToPage(url, { pushState: false });
});

window.addEventListener('DOMContentLoaded', () => {
    loadFragment('site-header', 'header.html');
    loadFragment('site-footer', 'footer.html');
    initCarouselIfPresent(document);
});
