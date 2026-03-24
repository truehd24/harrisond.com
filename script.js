(function () {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
    const lightboxTitle = lightbox ? lightbox.querySelector('.lightbox-title') : null;
    const lightboxMeta = lightbox ? lightbox.querySelector('.lightbox-meta') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

    const mediaItems = document.querySelectorAll('.media-item');

    let currentIndex = 0;
    let mediaArray = [];

    // ============================================
    // LIGHTBOX FUNCTIONS
    // ============================================
    function buildMediaArray() {
        mediaArray = Array.from(mediaItems)
            .filter(item => !item.dataset.youtube)
            .map(item => ({
                type: item.dataset.type,
                src: item.dataset.src,
                title: item.dataset.title,
                meta: item.dataset.meta,
                _element: item
            }));
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        const video = lightboxContent.querySelector('video');
        if (video) video.pause();
    }

    function updateLightboxContent() {
        const item = mediaArray[currentIndex];
        lightboxContent.innerHTML = '';
        lightbox.classList.add('loading');

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            const done = () => lightbox.classList.remove('loading');
            video.addEventListener('loadeddata', done);
            video.addEventListener('error', done);
            lightboxContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            const done = () => {
                img.alt = item.title;
                lightbox.classList.remove('loading');
            };
            img.addEventListener('load', done);
            img.addEventListener('error', done);
            lightboxContent.appendChild(img);
        }

        lightboxTitle.textContent = item.title;
        lightboxMeta.textContent = item.meta;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    if (lightbox) {
        buildMediaArray();

        // Media item interactions
        mediaItems.forEach((item) => {
            const youtubeUrl = item.dataset.youtube;
            if (youtubeUrl) {
                item.addEventListener('click', () => window.open(youtubeUrl, '_blank'));
            } else {
                const lightboxIndex = mediaArray.findIndex(m => m._element === item);
                item.addEventListener('click', () => openLightbox(lightboxIndex));
            }

            // Hover Preview Logic
            const previewSrc = item.dataset.preview;
            if (previewSrc) {
                const img = item.querySelector('.media-thumb');
                let previewImg = null;
                let removeTimeout = null;
                // Cached Object URL — fetched once, reused on every subsequent hover.
                // Reassigning the same blob: URL to src restarts animated AVIFs from frame 0.
                let cachedObjectURL = null;
                let fetchController = null;

                item.addEventListener('mouseenter', () => {
                    const currentPreview = item.dataset.preview;
                    if (!img || !currentPreview) return;

                    item.isHovered = true;
                    clearTimeout(removeTimeout);

                    if (!previewImg) {
                        previewImg = document.createElement('img');
                        previewImg.className = 'media-preview-img';

                        previewImg.addEventListener('error', () => {
                            console.warn('Preview image failed to load:', currentPreview);
                            item.dataset.preview = '';
                            previewImg.remove();
                            previewImg = null;
                            item.classList.remove('playing-preview');
                        });

                        img.parentElement.appendChild(previewImg);
                    }

                    const showImage = () => {
                        if (item.isHovered && previewImg) {
                            previewImg.style.opacity = '1';
                            item.classList.add('playing-preview');
                        }
                    };

                    if (cachedObjectURL) {
                        // Reassign blob: URL to restart animation
                        previewImg.onload = showImage;
                        previewImg.src = '';
                        previewImg.src = cachedObjectURL;
                        if (previewImg.complete) showImage();
                    } else {
                        // First hover — fetch once and cache as a blob
                        fetchController = new AbortController();
                        fetch(currentPreview, { signal: fetchController.signal })
                            .then(r => r.blob())
                            .then(blob => {
                                cachedObjectURL = URL.createObjectURL(blob);
                                if (previewImg) {
                                    previewImg.onload = showImage;
                                    previewImg.src = cachedObjectURL;
                                    if (previewImg.complete) showImage();
                                }
                            })
                            .catch(() => { /* aborted or network error — silently ignore */ });
                    }
                });

                item.addEventListener('mouseleave', () => {
                    item.isHovered = false;
                    if (previewImg) {
                        previewImg.style.opacity = '0';
                        item.classList.remove('playing-preview');
                        removeTimeout = setTimeout(() => {
                            if (previewImg) {
                                previewImg.remove();
                                previewImg = null;
                            }
                        }, 250);
                    }
                });
            }
        });

        lightboxClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active') && e.key === 'Escape') closeLightbox();
        });
    }

    // ============================================
    // PRIORITIZED IMAGE LOADING
    // ============================================
    /**
     * Force-load all lazy images inside `section` immediately by switching
     * them from loading="lazy" to loading="eager" and re-assigning their src.
     * Safe to call multiple times — already-eager images are skipped.
     */
    function prioritizeSection(section) {
        if (!section) return;
        section.querySelectorAll('img.media-thumb[loading="lazy"], img.section-svg').forEach(img => {
            img.loading = 'eager';
            img.fetchPriority = 'high';
            // Re-assigning src triggers an immediate fetch in browsers that
            // haven't started the lazy request yet.
            const src = img.src;
            img.src = '';
            img.src = src;
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ============================================
    document.querySelectorAll('.toc-link, .nav-main a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            // IDs starting with a digit (e.g. "#3d-cg") are valid HTML but
            // invalid CSS selectors — querySelector('#3d-cg') throws a DOMException.
            // Use getElementById for hash hrefs as a safe universal fallback.
            const id = href && href.startsWith('#') ? href.slice(1) : null;
            const target = id ? document.getElementById(id) : document.querySelector(href);
            if (!target) return;

            prioritizeSection(target);
            window.history.pushState(null, '', href);

            // Re-run masonry first so section positions are correct,
            // then instant-jump so intermediate sections never enter the viewport.
            layoutMasonryGrids();
            target.scrollIntoView({ behavior: 'instant' });
        });
    });

    // Handle direct loads to a hash URL
    window.addEventListener('load', () => {
        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            const target = document.getElementById(id);
            if (target) {
                prioritizeSection(target);
                setTimeout(() => target.scrollIntoView({ behavior: 'instant' }), 100);
            }
        }
    });

    // ============================================
    // MASONRY GRID LAYOUT
    // ============================================
    const GAP = 25;
    const ITEM_HEIGHT_PX = 550; // canonical 4K height in device/physical pixels

    // Compute the CSS-pixel height that scales with the screen's physical resolution.
    function applyItemHeight() {
        const BASE_PHYSICAL_HEIGHT = 2160;
        const currentPhysicalHeight = window.screen.height * window.devicePixelRatio;

        let scale = currentPhysicalHeight / BASE_PHYSICAL_HEIGHT;

        // On narrow screens (like phones), apply an additional shrink based on viewport width.
        if (window.innerWidth <= 768) {
            scale *= (window.innerWidth / 768);
        }

        const h = (ITEM_HEIGHT_PX * scale) / window.devicePixelRatio;
        document.documentElement.style.setProperty('--item-height', h + 'px');
        return h;
    }

    // Exposed so dev-drag.js can call it after DOM reordering.
    function layoutMasonryGrids() {
        const effectiveHeight = applyItemHeight();
        const grids = document.querySelectorAll('.media-grid');

        grids.forEach((grid) => {
            const items = Array.from(grid.querySelectorAll('.media-item'));
            if (items.length === 0) return;

            // 1. Reset to normal flow so CSS can size each item naturally.
            grid.style.height = '';
            items.forEach(item => {
                item.style.position = 'static';
                item.style.top = '';
                item.style.left = '';
                item.style.width = '';
                item.style.height = '';

                const inner = item.querySelector('.media-item-inner');
                if (inner) {
                    inner.style.width = '';
                    inner.style.height = '';
                }
            });

            // 2. Force a layout flush, then read the real CSS-pixel dimensions.
            grid.getBoundingClientRect();

            // 2.5 Clamp any item wider than 1100px, preserving its aspect ratio.
            items.forEach(item => {
                const inner = item.querySelector('.media-item-inner');
                if (inner) {
                    const rect = inner.getBoundingClientRect();
                    if (rect.width > 1100) {
                        const newHeight = rect.height * (1100 / rect.width);
                        inner.style.width = '1100px';
                        inner.style.height = `${newHeight}px`;
                        item.style.width = '1100px';
                        item.style.height = `${newHeight}px`;
                    }
                }
            });

            // Re-read widths and heights after clamping
            const gridWidth = grid.getBoundingClientRect().width;
            const itemRects = items.map(item => {
                const inner = item.querySelector('.media-item-inner');
                return inner ? inner.getBoundingClientRect() : item.getBoundingClientRect();
            });
            const itemWidths = itemRects.map(r => r.width);
            const itemHeights = itemRects.map(r => r.height);

            // 3. Pack items into rows left-to-right, recording row membership.
            let rowTop = 0;
            let rowX = 0;
            const positions = [];
            const rows = [[]];

            items.forEach((item, i) => {
                const w = itemWidths[i];

                if (rowX + w > gridWidth && rowX > 0) {
                    rowTop += effectiveHeight + GAP;
                    rowX = 0;
                    rows.push([]);
                }

                const h = itemHeights[i];
                const yOffset = h < effectiveHeight ? (effectiveHeight - h) / 2 : 0;

                positions.push({ top: rowTop + yOffset, left: rowX });
                rows[rows.length - 1].push(i);
                rowX += w + GAP;
            });

            grid.style.height = (rowTop + effectiveHeight) + 'px';

            // 4. Center each row horizontally.
            rows.forEach(rowIndices => {
                if (rowIndices.length === 0) return;
                const last = rowIndices[rowIndices.length - 1];
                const rowWidth = positions[last].left + itemWidths[last];
                const offset = Math.max(0, (gridWidth - rowWidth) / 2);
                rowIndices.forEach(i => { positions[i].left += offset; });
            });

            // 5. Apply absolute positions.
            items.forEach((item, idx) => {
                item.style.position = 'absolute';
                item.style.top = positions[idx].top + 'px';
                item.style.left = positions[idx].left + 'px';
            });
        });
    }
    window.layoutMasonryGrids = layoutMasonryGrids;

    function initMasonry() {
        document.querySelectorAll('.media-grid').forEach((grid) => {
            const ro = new ResizeObserver(() => requestAnimationFrame(layoutMasonryGrids));
            ro.observe(grid);
        });

        // Re-layout when devicePixelRatio changes (e.g. moving window between monitors).
        let dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        const onDprChange = () => {
            requestAnimationFrame(layoutMasonryGrids);
            dprQuery.removeEventListener('change', onDprChange);
            dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            dprQuery.addEventListener('change', onDprChange);
        };
        dprQuery.addEventListener('change', onDprChange);
    }

    // ============================================
    // THUMBNAIL DECODE DETECTION
    // ============================================
    // Adds .loaded to each thumb after img.decode() resolves — the exact moment
    // the CSS pulse animation should stop.
    document.querySelectorAll('img.media-thumb').forEach(img => {
        const markLoaded = () => img.classList.add('loaded');
        if (img.complete) {
            img.decode().then(markLoaded).catch(markLoaded);
        } else {
            img.addEventListener('load', () => img.decode().then(markLoaded).catch(markLoaded));
            img.addEventListener('error', markLoaded);
        }
    });

    // ============================================
    // SVG ALT TEXT — HIDE PLACEHOLDER ONCE LOADED
    // ============================================
    // Adds .svg-loaded to the parent wrapper when the SVG img fires load,
    // which hides the ::before placeholder text via CSS.
    document.querySelectorAll('img.header-svg, img.section-svg').forEach(img => {
        const wrapper = img.parentElement;
        if (!wrapper) return;
        const markLoaded = () => wrapper.classList.add('svg-loaded');
        if (img.complete && img.naturalWidth > 0) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded);
            img.addEventListener('error', markLoaded); // hide on error too
        }
    });

    // ============================================
    // STICKY HEADER NAME SHRINK
    // ============================================
    const headerName = document.querySelector('.header-name');
    if (headerName) {
        window.addEventListener('scroll', () => {
            headerName.classList.toggle('is-stuck', window.scrollY > 10);
        });
    }

    // ============================================
    // INITIALISATION (single DOMContentLoaded)
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        // Set current year in footer
        const yearElem = document.getElementById('currentYear');
        if (yearElem) yearElem.textContent = new Date().getFullYear();

        // Initial masonry layout + observers
        layoutMasonryGrids();
        initMasonry();

        // Re-layout once all thumbnails have loaded
        const allThumbs = Array.from(document.querySelectorAll('.media-thumb'));
        if (allThumbs.length > 0) {
            const pending = allThumbs.filter(img => !img.complete);
            if (pending.length === 0) {
                layoutMasonryGrids();
            } else {
                const settle = () => {
                    if (allThumbs.every(img => img.complete)) layoutMasonryGrids();
                };
                pending.forEach(img => {
                    img.addEventListener('load', settle);
                    img.addEventListener('error', settle);
                });
            }
        }

        window.addEventListener('resize', layoutMasonryGrids);
    });
})();
