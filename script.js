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

        // Stop video if playing
        const video = lightboxContent.querySelector('video');
        if (video) {
            video.pause();
        }
    }

    function updateLightboxContent() {
        const item = mediaArray[currentIndex];
        lightboxContent.innerHTML = '';

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.autoplay = false;
            lightboxContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.title;
            lightboxContent.appendChild(img);
        }

        lightboxTitle.textContent = item.title;
        lightboxMeta.textContent = item.meta;
    }



    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Build media array on load (only if lightbox exists)
    if (lightbox) {
        buildMediaArray();

        // Media item interactions
        mediaItems.forEach((item, index) => {
            const youtubeUrl = item.dataset.youtube;
            if (youtubeUrl) {
                // YouTube items open in new tab
                item.addEventListener('click', () => {
                    window.open(youtubeUrl, '_blank');
                });
            } else {
                // Lightbox items — find this item's index in the lightbox-only array
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
                // Assigning the same blob: URL to src restarts animated AVIFs from frame 0.
                let cachedObjectURL = null;
                let fetchController = null;

                item.addEventListener('mouseenter', () => {
                    const currentPreview = item.dataset.preview;
                    if (img && currentPreview) {
                        item.isHovered = true;
                        clearTimeout(removeTimeout);

                        if (!previewImg) {
                            previewImg = document.createElement('img');
                            previewImg.className = 'media-preview-img';
                            previewImg.style.position = 'absolute';
                            previewImg.style.top = '0';
                            previewImg.style.left = '0';
                            previewImg.style.width = '100%';
                            previewImg.style.height = '100%';
                            previewImg.style.objectFit = 'cover';
                            previewImg.style.opacity = '0';
                            previewImg.style.transition = 'opacity 0.25s ease';

                            img.parentElement.appendChild(previewImg);

                            previewImg.addEventListener('error', () => {
                                console.warn('Preview image failed to load. Disabling preview for this item:', currentPreview);
                                item.dataset.preview = '';
                                if (previewImg) {
                                    previewImg.remove();
                                    previewImg = null;
                                }
                                item.classList.remove('playing-preview');
                            });
                        }

                        const showImage = () => {
                            if (item.isHovered && previewImg) {
                                previewImg.style.opacity = '1';
                                item.classList.add('playing-preview');
                            }
                        };

                        if (cachedObjectURL) {
                            // Already fetched — reassign the same blob: URL to restart animation
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
                    }
                });

                item.addEventListener('mouseleave', () => {
                    item.isHovered = false;
                    if (previewImg) {
                        previewImg.style.opacity = '0';
                        item.classList.remove('playing-preview');

                        removeTimeout = setTimeout(() => {
                            if (!item.isHovered && previewImg) {
                                previewImg.remove();
                                previewImg = null;
                            }
                        }, 250); // Wait for transition
                    }
                });
            }
        });

        // Lightbox controls
        lightboxClose.addEventListener('click', closeLightbox);

        // Click outside to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;

            }
        });
    } // end if (lightbox)




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

            // Eagerly load the target section's images before we scroll.
            prioritizeSection(target);

            window.history.pushState(null, '', href);

            // Re-run masonry first so section positions are correct,
            // then wait two rAF ticks for the browser to commit the layout
            // before scrolling (otherwise scroll lands at pre-masonry position).
            layoutMasonryGrids();
            // Instant jump so intermediate sections never enter the viewport
            // and their lazy images don't compete for bandwidth.
            target.scrollIntoView({ behavior: 'instant' });
        });
    });

    // Also handle direct loads to a hash URL
    window.addEventListener('load', () => {
        if (window.location.hash) {
            const hash = window.location.hash;
            const id = hash.startsWith('#') ? hash.slice(1) : null;
            const target = id ? document.getElementById(id) : null;
            if (target) {
                // Eagerly load the target section before scrolling to it.
                prioritizeSection(target);
                // Instant jump — avoids loading intermediate sections on throttled connections.
                setTimeout(() => target.scrollIntoView({ behavior: 'instant' }), 100);
            }
        }
    });

    // ============================================
    // MASONRY GRID LAYOUT
    // ============================================
    const GAP = 25;
    const ITEM_HEIGHT_PX = 550; // canonical 4K height in device/physical pixels

    // Compute the CSS-pixel height that scales with the screen's physical resolution
    // so items take up roughly the same proportion of the screen on lower resolution
    // displays (like 1080p) as they do on 4K, then expose it as a CSS variable.
    function applyItemHeight() {
        // Base canonical resolution is 4K (2160 physical pixels tall)
        const BASE_PHYSICAL_HEIGHT = 2160;
        const currentPhysicalHeight = window.screen.height * window.devicePixelRatio;

        const scale = currentPhysicalHeight / BASE_PHYSICAL_HEIGHT;
        const scaledPhysicalHeight = ITEM_HEIGHT_PX * scale;

        const h = scaledPhysicalHeight / window.devicePixelRatio;
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
            //    CSS uses height:var(--item-height) + aspect-ratio, which the
            //    browser resolves to the correct DPI-adjusted CSS-pixel width.
            grid.style.height = '';
            items.forEach(item => {
                item.style.position = 'static';
                item.style.top = '';
                item.style.left = '';
            });

            // 2. Force a layout flush, then read the real CSS-pixel widths.
            grid.getBoundingClientRect();
            const gridWidth = grid.getBoundingClientRect().width;
            const itemWidths = items.map(item =>
                item.getBoundingClientRect().width
            );

            // 3. Pack items into rows left-to-right, recording row membership.
            let rowTop = 0;
            let rowX = 0;
            const positions = [];
            // rows[r] = array of item indices in that row
            const rows = [[]];

            items.forEach((item, i) => {
                const w = itemWidths[i];

                if (rowX + w > gridWidth && rowX > 0) {
                    rowTop += effectiveHeight + GAP;
                    rowX = 0;
                    rows.push([]);
                }

                positions.push({ top: rowTop, left: rowX });
                rows[rows.length - 1].push(i);
                rowX += w + GAP;
            });

            const totalHeight = rowTop + effectiveHeight;
            grid.style.height = totalHeight + 'px';

            // 4. Center each row: shift every item in the row by the
            //    half-remainder so the row sits in the middle of the grid.
            rows.forEach(rowIndices => {
                if (rowIndices.length === 0) return;
                const last = rowIndices[rowIndices.length - 1];
                // Row width = right edge of last item minus its trailing gap
                const rowWidth = positions[last].left + itemWidths[last];
                const offset = Math.max(0, (gridWidth - rowWidth) / 2);
                rowIndices.forEach(i => {
                    positions[i].left += offset;
                });
            });

            // 5. Apply absolute positions — CSS still owns width/height.
            items.forEach((item, idx) => {
                item.style.position = 'absolute';
                item.style.top = positions[idx].top + 'px';
                item.style.left = positions[idx].left + 'px';
            });
        });
    }
    window.layoutMasonryGrids = layoutMasonryGrids;

    function initMasonry() {
        const grids = document.querySelectorAll('.media-grid');
        grids.forEach((grid) => {
            const ro = new ResizeObserver(() => requestAnimationFrame(layoutMasonryGrids));
            ro.observe(grid);
        });

        // Re-layout when the user moves the browser window to a display with
        // a different devicePixelRatio (e.g. from a 4K monitor to a 1080p one).
        let dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        const onDprChange = () => {
            requestAnimationFrame(layoutMasonryGrids);
            // Re-arm the listener for the new DPR.
            dprQuery.removeEventListener('change', onDprChange);
            dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            dprQuery.addEventListener('change', onDprChange);
        };
        dprQuery.addEventListener('change', onDprChange);
    }

    // ============================================
    // THUMBNAIL DECODE DETECTION
    // ============================================
    // Adds .loaded to each thumb *after* the browser has decoded the pixels
    // (img.decode() resolves later than the load event), which is the exact
    // moment the CSS pulse should stop.
    document.querySelectorAll('img.media-thumb').forEach(img => {
        const markLoaded = () => img.classList.add('loaded');
        if (img.complete) {
            img.decode().then(markLoaded).catch(markLoaded);
        } else {
            img.addEventListener('load', () =>
                img.decode().then(markLoaded).catch(markLoaded)
            );
            img.addEventListener('error', markLoaded);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        layoutMasonryGrids();
        initMasonry();
    });
    // ============================================
    // STICKY HEADER NAME SHRINK
    // ============================================
    const headerName = document.querySelector('.header-name');
    if (headerName) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                headerName.classList.add('is-stuck');
            } else {
                headerName.classList.remove('is-stuck');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const currentYear = new Date().getFullYear();
        const yearElem = document.getElementById('currentYear');
        if (yearElem) yearElem.textContent = currentYear;

        const allImages = document.querySelectorAll('.media-thumb');
        if (allImages.length > 0) {
            let imagesLoaded = 0;
            allImages.forEach(img => {
                if (img.complete) {
                    imagesLoaded++;
                } else {
                    img.addEventListener('load', () => {
                        imagesLoaded++;
                        if (imagesLoaded === allImages.length) {
                            layoutMasonryGrids();
                        }
                    });
                    img.addEventListener('error', () => {
                        imagesLoaded++;
                        if (imagesLoaded === allImages.length) {
                            layoutMasonryGrids();
                        }
                    });
                }
            });
            if (imagesLoaded === allImages.length) {
                layoutMasonryGrids();
            }
        } else {
            layoutMasonryGrids();
        }

        window.addEventListener('resize', layoutMasonryGrids);
    });
})();

