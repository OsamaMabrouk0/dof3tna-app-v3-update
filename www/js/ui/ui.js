(function(App) {
    'use strict';
    
    // ==================== MODERN ICON-ONLY SIDEBAR (Desktop) ====================
    App.UI.Sidebar = {
        isOpen: false,
        
        render: function() {
            const container = App.DOM.sidebarLinks;
            if (!container) return;
            
            if (window.innerWidth < 768) {
                container.innerHTML = '';
                return;
            }
            
            const currentPage = App.State.currentPage;
            
            const createLink = (page, id, isHome = false) => {
                const isActive = currentPage === id;
                const icon  = isHome ? 'fa-solid fa-house' : page.icon;
                const title = isHome ? 'الرئيسية'          : page.title;
                const color = isHome ? 'text-blue-500'     : page.color;
                
                return `
                    <div class="sidebar-link-wrapper group relative">
                        <a href="#${id}" data-page="${id}"
                           class="sidebar-link ${isActive ? 'active' : ''}"
                           aria-label="${title}">
                            ${isActive ? `
                                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10
                                            bg-gradient-to-b from-blue-500 to-cyan-500
                                            rounded-r-full transition-all duration-300"></div>
                            ` : ''}
                            <div class="sidebar-icon-container ${isActive ? 'active' : ''}">
                                <i class="${icon} text-lg ${color} transition-all duration-300"></i>
                                ${isActive ? `
                                    <div class="absolute inset-0 bg-blue-500/20 rounded-xl blur-md scale-110 animate-pulse"></div>
                                ` : ''}
                            </div>
                            <div class="sidebar-tooltip">
                                <span>${title}</span>
                                <div class="tooltip-arrow"></div>
                            </div>
                        </a>
                    </div>
                `;
            };
            
            let content = createLink(null, 'home', true);
            content += `<div class="sidebar-divider"></div>`;
            App.PAGES.forEach(page => { content += createLink(page, page.id); });
            
            container.innerHTML = content;
            this.attachEvents();
        },
        
        attachEvents: function() {
            const links = App.DOM.sidebarLinks.querySelectorAll('a[data-page]');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    App.Router.go(this.getAttribute('data-page'));
                });
            });
        },
        
        toggle: function(show) {
            if (window.innerWidth < 768) {
                App.UI.BottomSheet.toggle(show);
                return;
            }
        },
        
        collapse: function() {}
    };
    
    // ==================== ENHANCED BOTTOM SHEET (Mobile) ====================
    App.UI.BottomSheet = {
        isOpen: false,
        sheet: null,
        overlay: null,
        dragHandle: null,
        contentArea: null,
        isDragging: false,
        startY: 0,
        currentY: 0,
        
        create: function() {
            if (this.sheet) return;
            
            this.overlay = document.createElement('div');
            this.overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] hidden transition-opacity duration-300 opacity-0';
            
            this.sheet = document.createElement('div');
            this.sheet.className = 'fixed bottom-0 left-0 right-0 z-[80] transform translate-y-full transition-transform duration-300 ease-out';
            
            this.sheet.innerHTML = `
                <div class="bg-white dark:bg-[#0f172a] dark:oled:bg-black rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <div class="drag-handle-area px-6 pt-4 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0">
                        <div class="flex justify-center mb-2">
                            <div class="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full"></div>
                        </div>
                        <div class="text-center">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">القائمة الرئيسية</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">استكشف جميع الأقسام</p>
                        </div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-white/10 flex-shrink-0"></div>
                    <div class="content-scrollable overflow-y-auto custom-scrollbar flex-1 p-4" id="bottom-sheet-content"></div>
                </div>
            `;
            
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.sheet);
            
            this.dragHandle  = this.sheet.querySelector('.drag-handle-area');
            this.contentArea = this.sheet.querySelector('.content-scrollable');
            
            this.overlay.addEventListener('click', () => this.toggle(false));
            this.setupDragToClose();
        },
        
        setupDragToClose: function() {
            this.dragHandle.addEventListener('touchstart', (e) => {
                this.isDragging = true;
                this.startY = e.touches[0].clientY;
                this.dragHandle.style.cursor = 'grabbing';
            }, { passive: true });
            
            this.dragHandle.addEventListener('touchmove', (e) => {
                if (!this.isDragging) return;
                this.currentY = e.touches[0].clientY;
                const diff = this.currentY - this.startY;
                if (diff > 0) {
                    e.preventDefault();
                    this.sheet.style.transform = `translateY(${diff}px)`;
                    this.overlay.style.opacity = Math.max(0.6 - (diff / 500), 0);
                }
            }, { passive: false });
            
            this.dragHandle.addEventListener('touchend', (e) => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.dragHandle.style.cursor = 'grab';
                const diff = e.changedTouches[0].clientY - this.startY;
                if (diff > 150) {
                    this.toggle(false);
                } else {
                    this.sheet.style.transform = '';
                    this.overlay.style.opacity = '';
                }
            }, { passive: true });
            
            this.contentArea.addEventListener('touchstart', () => {
                this.isDragging = false;
            }, { passive: true });
        },
        
        toggle: function(show) {
            this.create();
            const shouldShow = show !== undefined ? show : !this.isOpen;
            if      (shouldShow  && !this.isOpen) this.open();
            else if (!shouldShow &&  this.isOpen) this.close();
        },
        
        open: function() {
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            
            // pushState حتى يُمسك BackButtonManager هذا الحدث
            if (window.history && window.history.pushState) {
                window.history.pushState({ bottomSheet: true }, '');
            }
            
            this.renderContent();
            this.overlay.classList.remove('hidden');
            requestAnimationFrame(() => {
                this.overlay.classList.add('opacity-100');
                this.sheet.style.transform = 'translateY(0)';
            });
        },
        
        close: function() {
            this.isOpen = false;
            document.body.style.overflow = '';
            this.overlay.classList.remove('opacity-100');
            this.sheet.style.transform = 'translateY(100%)';
            setTimeout(() => {
                this.overlay.classList.add('hidden');
                this.sheet.style.transform = '';
                this.overlay.style.opacity = '';
            }, 300);
        },
        
        renderContent: function() {
            const container = document.getElementById('bottom-sheet-content');
            if (!container) return;
            
            const currentPage = App.State.currentPage;
            
            const createCard = (page, id, isHome = false) => {
                const isActive = currentPage === id;
                const icon  = isHome ? 'fa-solid fa-house'             : page.icon;
                const title = isHome ? 'الرئيسية'                      : page.title;
                const desc  = isHome ? 'العودة للصفحة الرئيسية'        : page.description;
                const color = isHome ? 'text-blue-500'                 : page.color;
                const bg    = isHome ? 'from-blue-500/20 to-blue-600/5': page.bg;
                
                return `
                    <a href="#${id}" data-page="${id}"
                       class="bottom-sheet-card ${isActive ? 'active' : ''}" role="button">
                        <div class="flex items-center gap-4 flex-1">
                            <div class="bottom-sheet-icon bg-gradient-to-br ${bg}">
                                <i class="${icon} text-xl ${color}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-base text-gray-900 dark:text-white truncate">${title}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">${desc}</p>
                            </div>
                        </div>
                        ${isActive ? `
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <i class="fa-solid fa-chevron-left text-blue-500 text-sm"></i>
                            </div>
                        ` : `
                            <i class="fa-solid fa-chevron-left text-gray-400 text-sm group-hover:text-blue-500 transition"></i>
                        `}
                    </a>
                `;
            };
            
            let content = '<div class="space-y-2">';
            content += createCard(null, 'home', true);
            content += `<div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent my-3"></div>`;
            App.PAGES.forEach(page => { content += createCard(page, page.id); });
            content += '</div>';
            
            container.innerHTML = content;
            this.attachEvents();
        },
        
        attachEvents: function() {
            document.querySelectorAll('#bottom-sheet-content a[data-page]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    this.toggle(false);
                    setTimeout(() => App.Router.go(pageId), 100);
                });
            });
        }
    };
    
    // ==================== HEADER ====================
    App.UI.Header = {
        updateTitle: function(pageId) {
            const header = App.DOM.pageTitleHeader;
            if (!header) return;
            if (pageId === 'home') { header.innerText = 'الرئيسية'; return; }
            const page = App.PAGES.find(p => p.id === pageId);
            header.innerText = page ? page.title : 'الرئيسية';
        }
    };
    
    // ==================== BOTTOM NAV ====================
    App.UI.BottomNav = {
        toggle: function(show) {
            const nav = App.DOM.bottomNav;
            if (!nav) return;
            nav.classList.toggle('nav-hidden', !show);
        },
        
        updateActive: function(pageId) {
            const buttons = {
                'nav-home': 'home', 'nav-lectures': 'lectures',
                'nav-summaries': 'summaries', 'nav-links': 'links',
                'nav-bookmarks': 'bookmarks', 'nav-settings': 'settings'
            };
            Object.entries(buttons).forEach(([btnId, page]) => {
                const btn = document.getElementById(btnId);
                if (!btn) return;
                const isActive = page === pageId;
                const icon = btn.querySelector('i');
                btn.classList.toggle('text-blue-500', isActive);
                btn.classList.toggle('text-gray-400', !isActive);
                if (icon) icon.classList.toggle('scale-110', isActive);
            });
        },
        
        attachEvents: function() {
            const handlers = {
                'nav-home':          () => App.Router.go('home'),
                'nav-lectures':      () => App.Router.go('lectures'),
                'nav-summaries':     () => App.Router.go('summaries'),
                'nav-links':         () => App.Router.go('links'),
                'nav-fab':           () => App.UI.BottomSheet.toggle(true),
                'nav-menu':          () => App.UI.BottomSheet.toggle(true),
                'nav-settings':      () => App.Router.go('settings'),
                'nav-bookmarks':     () => App.Router.go('bookmarks'),
                'center-action-btn': () => App.Toast.info('الإجراء السريع قيد التطوير!', 'قريباً')
            };
            Object.entries(handlers).forEach(([id, handler]) => {
                const btn = document.getElementById(id);
                if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); handler(); });
            });
        }
    };
    
    // ==================== HEADER BUTTONS ====================
    App.UI.bindHeaderButtons = function() {
        const handlers = {
            'theme-btn':     () => App.State.Theme.toggleDark(),
            'notif-btn':     () => App.Router.go('notifications'),
            'open-sidebar':  () => {
                if (window.innerWidth < 768) App.UI.BottomSheet.toggle(true);
                else App.UI.Sidebar.toggle(true);
            },
            'close-sidebar': () => App.UI.Sidebar.toggle(false)
        };
        Object.entries(handlers).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); handler(); });
        });
        
        const overlay = App.DOM.sidebarOverlay;
        if (overlay) overlay.addEventListener('click', (e) => { e.preventDefault(); App.UI.Sidebar.toggle(false); });
        
        this.setupKeyboardShortcuts();
        
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && App.UI.BottomSheet.isOpen) {
                App.UI.BottomSheet.toggle(false);
            }
        });
    };
    
    App.UI.setupKeyboardShortcuts = function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && App.UI.BottomSheet.isOpen) {
                App.UI.BottomSheet.toggle(false);
            }
        });
    };

    // ══════════════════════════════════════════════════════════════════════
    //
    //   BACK BUTTON MANAGER
    //   ─────────────────────────────────────────────────────────────────
    //   المستمع الوحيد والوحيد لحدث popstate في التطبيق بأكمله.
    //   router.js لا يُسجّل أي popstate — هذا هو المكان الوحيد.
    //
    //   ترتيب الأولويات عند الضغط على زر الرجوع:
    //
    //   ┌──────────────────────────────────────────────────────────────┐
    //   │ 1. القائمة (BottomSheet) مفتوحة؟                            │
    //   │    → أغلقها فقط. لا يحدث أي شيء آخر إطلاقاً.              │
    //   ├──────────────────────────────────────────────────────────────┤
    //   │ 2. الصفحة الحالية سجّلت handler خاصًا (مسارات المجلدات)؟   │
    //   │    → استدعه؛ إذا أعاد true فقد تعامل مع الحدث، توقف.       │
    //   │    مثال: داخل مجلد 3 → رجوع إلى مجلد 2  (يُعيد true)       │
    //   │    مثال: في الجذر   → لا يتعامل          (يُعيد false)      │
    //   ├──────────────────────────────────────────────────────────────┤
    //   │ 3. لم يتعامل أحد مع الحدث؟                                  │
    //   │    → العودة إلى الصفحة الرئيسية.                            │
    //   └──────────────────────────────────────────────────────────────┘
    //
    // ══════════════════════════════════════════════════════════════════════
    App.UI.BackButtonManager = {

        // handler مُسجَّل من الصفحة الحالية — يُعيد true إذا تعامل مع الحدث
        _pageHandler: null,

        /**
         * تُسجّل الصفحة handler خاصًا بها.
         * تُستدعى من lectures.js / summaries.js عند تحميل الصفحة.
         * @param {Function} handler - يُعيد true إذا أخذ الحدث، false إذا تركه
         */
        register: function(handler) {
            this._pageHandler = handler;
        },

        /**
         * تُلغي تسجيل handler الصفحة.
         * تُستدعى من cleanup() عند مغادرة الصفحة.
         */
        unregister: function() {
            this._pageHandler = null;
        },

        /**
         * يُهيّئ المستمع على popstate — يُستدعى مرة واحدة فقط.
         */
        init: function() {
            const self = this;

            window.addEventListener('popstate', function(e) {
                const state = e.state || {};

                // ── تخطي مدخل bottomSheet القديم في التاريخ ────────────────
                // يحدث عند: فتح القائمة ← النقر على رابط ← ضغط رجوع.
                // المدخل { bottomSheet: true } يبقى في سجل التاريخ بعد إغلاق
                // القائمة بالنقر، فنتخطاه برجوع خطوة إضافية تلقائياً.
                if (state.bottomSheet === true && !App.UI.BottomSheet.isOpen) {
                    history.back();
                    return;
                }

                // ── الأولوية 1: القائمة مفتوحة ──────────────────────────────
                if (App.UI.BottomSheet.isOpen) {
                    App.UI.BottomSheet.toggle(false);
                    return;
                }

                // ── الأولوية 2: handler من الصفحة (مسارات المجلدات) ─────────
                if (self._pageHandler && self._pageHandler(e) === true) {
                    return;
                }

                // ── الأولوية 3: العودة للرئيسية ─────────────────────────────
                if (App.State && App.State.currentPage !== 'home') {
                    App.Router.go('home', true, false);
                }
            });
        }
    };

    // تهيئة فور تحميل ui.js
    App.UI.BackButtonManager.init();



})(window.App);