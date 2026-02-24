/**
 * =====================================================
 * 💀 SKELETON LOADER MANAGER v2.1
 * Hybrid Edition: Modern UI + Robust Logic
 * =====================================================
 */

(function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        MIN_DISPLAY_TIME: 800,        // الحد الأدنى للعرض
        FADE_OUT_DURATION: 600,       // مدة الاختفاء
        CHECK_INTERVAL: 100,          // فترة التحقق
        MAX_WAIT_TIME: 10000,         // الحد الأقصى للانتظار
        MOBILE_BREAKPOINT: 768        // نقطة التحول للموبايل
    };

    // ==================== STATE MANAGEMENT ====================
    const state = {
        skeletonContainer: null,
        startTime: null,
        isLoaded: false,
        checkersCompleted: {
            dom: false,
            images: false,
            fonts: false,
            scripts: false
        }
    };

    // ==================== SKELETON HTML BUILDER ====================
    function buildSkeletonHTML() {
        const isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;

        return `
            <div class="skeleton-layout">
                ${!isMobile ? buildSidebar() : ''}
                <div class="skeleton-main">
                    ${buildHeader(isMobile)}
                    <div class="skeleton-content">
                        <div class="skeleton-container">
                            ${buildHeroSection()}
                            ${buildQuickAccessSection()}
                            ${buildGridSection()}
                            ${buildNotificationsSection()}
                        </div>
                    </div>
                    ${isMobile ? buildBottomNav() : ''}
                </div>
            </div>
        `;
    }

    function buildHeader(isMobile) {
        return `
            <div class="skeleton-header${isMobile ? ' skeleton-header--mobile' : ' skeleton-header--desktop'}">
                <div class="skeleton-header-left">
                    ${isMobile ? '<div class="skeleton-menu-btn skeleton-shimmer"></div>' : ''}
                    <div class="skeleton-title-block">
                        <div class="skeleton-title skeleton-shimmer"></div>
                        <div class="skeleton-breadcrumb skeleton-shimmer"></div>
                    </div>
                </div>
                <div class="skeleton-header-right">
                    <div class="skeleton-icon-btn skeleton-shimmer"></div>
                    <div class="skeleton-icon-btn skeleton-shimmer"></div>
                    <div class="skeleton-icon-btn skeleton-shimmer"></div>
                </div>
            </div>
        `;
    }

    function buildSidebar() {
        // ✅ تصميم الأيقونات فقط (Icon-Only)
        const navItems = Array(6).fill(0).map(() => `
            <div class="skeleton-nav-item skeleton-shimmer">
                <div class="skeleton-nav-icon skeleton-shimmer"></div>
            </div>
        `).join('');

        return `
            <aside class="skeleton-sidebar">
                <div class="skeleton-sidebar-header">
                    <div class="skeleton-logo skeleton-shimmer"></div>
                    <div class="skeleton-logo-text skeleton-shimmer"></div>
                </div>
                <nav class="skeleton-sidebar-nav">
                    <div class="skeleton-nav-item skeleton-shimmer">
                        <div class="skeleton-nav-icon skeleton-shimmer"></div>
                    </div>
                    <div class="skeleton-divider skeleton-shimmer"></div>
                    ${navItems}
                </nav>
            </aside>
        `;
    }

    function buildHeroSection() {
        return `
            <div class="skeleton-hero skeleton-shimmer">
                <div class="skeleton-hero-title skeleton-shimmer"></div>
                <div class="skeleton-hero-text skeleton-shimmer"></div>
            </div>
        `;
    }

    function buildQuickAccessSection() {
        const cards = Array(5).fill(0).map(() => 
            '<div class="skeleton-quick-card skeleton-shimmer"></div>'
        ).join('');

        return `
            <div class="skeleton-quick-access">
                <div class="skeleton-section-header">
                    <div class="skeleton-section-title skeleton-shimmer"></div>
                    <div class="skeleton-section-link skeleton-shimmer"></div>
                </div>
                <div class="skeleton-cards-row">
                    ${cards}
                </div>
            </div>
        `;
    }

    function buildGridSection() {
        return `
            <div class="skeleton-grid">
                ${buildRecentFilesCard()}
                ${buildStatsCard()}
            </div>
        `;
    }

    function buildRecentFilesCard() {
        const files = Array(3).fill(0).map(() => `
            <div class="skeleton-file-item skeleton-shimmer">
                <div class="skeleton-file-icon skeleton-shimmer"></div>
                <div class="skeleton-file-content">
                    <div class="skeleton-file-name skeleton-shimmer"></div>
                    <div class="skeleton-file-meta skeleton-shimmer"></div>
                </div>
                <div class="skeleton-file-arrow skeleton-shimmer"></div>
            </div>
        `).join('');

        return `
            <div class="skeleton-recent-card">
                <div class="skeleton-card-title skeleton-shimmer"></div>
                ${files}
            </div>
        `;
    }

    function buildStatsCard() {
        const stats = Array(4).fill(0).map(() => 
            '<div class="skeleton-stat-box skeleton-shimmer"></div>'
        ).join('');

        return `
            <div class="skeleton-stats-card">
                <div class="skeleton-card-title skeleton-shimmer"></div>
                <div class="skeleton-chart skeleton-shimmer"></div>
                <div class="skeleton-stats-grid">
                    ${stats}
                </div>
            </div>
        `;
    }

    function buildNotificationsSection() {
        const notifications = Array(2).fill(0).map(() => `
            <div class="skeleton-notif-item skeleton-shimmer">
                <div class="skeleton-notif-icon skeleton-shimmer"></div>
                <div class="skeleton-notif-content">
                    <div class="skeleton-notif-title skeleton-shimmer"></div>
                    <div class="skeleton-notif-text skeleton-shimmer"></div>
                </div>
            </div>
        `).join('');

        return `
            <div class="skeleton-notifications">
                <div class="skeleton-card-title skeleton-shimmer"></div>
                ${notifications}
            </div>
        `;
    }

    function buildBottomNav() {
        return `
            <div class="skeleton-bottom-nav">
                <div class="skeleton-nav-bar skeleton-shimmer">
                    <div class="skeleton-nav-item-mobile skeleton-shimmer"></div>
                    <div class="skeleton-nav-item-mobile skeleton-shimmer"></div>
                    <div class="skeleton-nav-fab skeleton-shimmer"></div>
                    <div class="skeleton-nav-item-mobile skeleton-shimmer"></div>
                    <div class="skeleton-nav-item-mobile skeleton-shimmer"></div>
                </div>
            </div>
        `;
    }

    // ==================== LOADING CHECKERS ====================

    function checkDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                state.checkersCompleted.dom = true;
                resolve(true);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    state.checkersCompleted.dom = true;
                    resolve(true);
                });
            }
        });
    }

    function checkImagesLoaded() {
        return new Promise((resolve) => {
            const images = document.querySelectorAll('img[data-critical]');
            if (images.length === 0) {
                state.checkersCompleted.images = true;
                resolve(true);
                return;
            }
            let loadedCount = 0;
            images.forEach(img => {
                if (img.complete) loadedCount++;
                else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            state.checkersCompleted.images = true;
                            resolve(true);
                        }
                    });
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            state.checkersCompleted.images = true;
                            resolve(true);
                        }
                    });
                }
            });
            if (loadedCount === images.length) {
                state.checkersCompleted.images = true;
                resolve(true);
            }
        });
    }

    function checkFontsLoaded() {
        return new Promise((resolve) => {
            if (document.fonts) {
                document.fonts.ready.then(() => {
                    state.checkersCompleted.fonts = true;
                    resolve(true);
                }).catch(() => resolve(true));
            } else {
                resolve(true);
            }
        });
    }

    function checkScriptsLoaded() {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                // نتحقق من وجود App أو أي علامة تدل على تحميل تطبيقك الأساسي
                if (window.App && (window.App._initialized || window.App.State)) {
                    clearInterval(check);
                    state.checkersCompleted.scripts = true;
                    resolve(true);
                }
            }, CONFIG.CHECK_INTERVAL);

            setTimeout(() => {
                clearInterval(check);
                state.checkersCompleted.scripts = true; // نعتبرها مكتملة بعد الوقت الأقصى لضمان عدم تعليق الشاشة
                resolve(true);
            }, CONFIG.MAX_WAIT_TIME);
        });
    }

    // ==================== CONTROL LOGIC ====================

    function createSkeleton() {
        // نتحقق إذا كان موجوداً بالفعل
        if (document.getElementById('skeleton-loader')) return;

        state.skeletonContainer = document.createElement('div');
        state.skeletonContainer.id = 'skeleton-loader';
        state.skeletonContainer.innerHTML = buildSkeletonHTML();
        
        // إدراج في بداية الصفحة فوراً
        document.body.insertBefore(state.skeletonContainer, document.body.firstChild);
        state.startTime = Date.now();
    }

    function hideSkeleton() {
        if (!state.skeletonContainer || state.isLoaded) return;

        const elapsedTime = Date.now() - state.startTime;
        const remainingTime = Math.max(0, CONFIG.MIN_DISPLAY_TIME - elapsedTime);

        setTimeout(() => {
            state.skeletonContainer.classList.add('loaded');
            state.isLoaded = true;

            setTimeout(() => {
                if (state.skeletonContainer && state.skeletonContainer.parentNode) {
                    state.skeletonContainer.remove();
                }
                // إظهار الحاوية الأساسية للتطبيق إذا كانت مخفية بـ opacity: 0
                const appContainer = document.getElementById('app-container');
                if (appContainer) appContainer.style.opacity = '1';
            }, CONFIG.FADE_OUT_DURATION);
        }, remainingTime);
    }

    function handleResize() {
        if (state.isLoaded || !state.skeletonContainer) return;
        // Re-render only if breakpoint boundary crossed
        const wasMobile = state.skeletonContainer.querySelector('.skeleton-header--mobile') !== null;
        const isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
        if (wasMobile !== isMobile) {
            state.skeletonContainer.innerHTML = buildSkeletonHTML();
        }
    }

    // ==================== INITIALIZATION ====================

    async function init() {
        createSkeleton();

        window.addEventListener('resize', () => {
            clearTimeout(window.resizer);
            window.resizer = setTimeout(handleResize, 150);
        });

        // انتظار كل شيء
        await Promise.allSettled([
            checkDOMReady(),
            checkImagesLoaded(),
            checkFontsLoaded(),
            checkScriptsLoaded()
        ]);

        hideSkeleton();
    }

    // البدء الفوري
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global API
    window.SkeletonLoader = {
        hide: hideSkeleton,
        getState: () => ({ ...state })
    };

})();