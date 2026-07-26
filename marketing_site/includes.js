async function loadFragment(containerId, fragmentPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // If already populated (inlined in HTML), skip fetch but still attach handlers
    if (container.children.length > 0) {
        if (containerId === 'site-header') {
            attachHeaderLogoHandler(container);
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
            attachHeaderLogoHandler(container);
            attachHeaderNavigation(container);
        } else if (containerId === 'site-footer') {
            attachFooterHandlers(container);
        }
    } catch (error) {
        console.error(error);
    }
}

function attachHeaderLogoHandler(container) {
    const link = container.querySelector('a[href]');
    if (!link) return;

    // Avoid attaching multiple times
    if (link.dataset.logoHandlerAttached === '1') return;
    link.dataset.logoHandlerAttached = '1';

    link.addEventListener('click', (e) => {
        try {
            const target = new URL(link.href, location.href);

            // Normalize trailing slash differences
            const currentPath = location.pathname.replace(/\/$/, '');
            const targetPath = target.pathname.replace(/\/$/, '');

            // If the link points to the same path on the same origin, prevent reload
            if (target.origin === location.origin && targetPath === currentPath) {
                e.preventDefault();
                // Smooth scroll to the top instead of reloading the page
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            // any parse errors -> allow default behavior
            console.error(err);
        }
    });
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
        const webUrl = new URL('https://app.simpleallergyalert.com/');
        webAppLink.href = webUrl.toString();

        if (webAppLink.dataset.referralHandlerAttached !== '1') {
            webAppLink.dataset.referralHandlerAttached = '1';
            webAppLink.addEventListener('click', () => {
                persistReferralForNavigation(ref);
            });
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadFragment('site-header', 'header.html');
    loadFragment('site-footer', 'footer.html');
});
