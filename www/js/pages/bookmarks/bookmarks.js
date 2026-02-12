(function(App) {
    'use strict';
    
    const STORAGE_KEY = 'dof3atna_bookmarks_v3';
    
    let bookmarks = [];
    let eventListeners = [];
    let currentFilter = 'all';

    const BOOKMARK_TYPES = [
        { id: 'all', name: 'الكل', icon: 'fa-grid-2', color: 'blue' },
        { id: 'lecture', name: 'محاضرات', icon: 'fa-chalkboard-user', color: 'emerald' },
        { id: 'summary', name: 'ملخصات', icon: 'fa-file-pen', color: 'cyan' },
        { id: 'video', name: 'فيديوهات', icon: 'fa-video', color: 'red' },
        { id: 'link', name: 'روابط', icon: 'fa-link', color: 'purple' }
    ];

    // بيانات وهمية للمحفوظات
    const DEMO_BOOKMARKS = [
        {
            id: 'bm_1',
            title: 'محاضرة المحاسبة المالية - الفصل الأول',
            description: 'شرح مفصل للمبادئ الأساسية للمحاسبة المالية',
            type: 'lecture',
            subject: 'محاسبة',
            addedDate: Date.now() - 86400000,
            url: '#lectures',
            icon: 'fa-file-pdf',
            color: 'blue'
        },
        {
            id: 'bm_2',
            title: 'ملخص الاقتصاد الكلي',
            description: 'ملخص شامل لمادة الاقتصاد الكلي للفصل الدراسي',
            type: 'summary',
            subject: 'اقتصاد',
            addedDate: Date.now() - 172800000,
            url: '#summaries',
            icon: 'fa-file-lines',
            color: 'cyan'
        },
        {
            id: 'bm_3',
            title: 'فيديو شرح الإحصاء التطبيقي',
            description: 'شرح عملي للإحصاء الوصفي والاستدلالي',
            type: 'video',
            subject: 'إحصاء',
            addedDate: Date.now() - 259200000,
            url: '#videos',
            icon: 'fa-circle-play',
            color: 'red'
        },
        {
            id: 'bm_4',
            title: 'رابط مكتبة الكتب الجامعية',
            description: 'مكتبة شاملة للكتب والمراجع الجامعية',
            type: 'link',
            subject: 'عام',
            addedDate: Date.now() - 345600000,
            url: '#links',
            icon: 'fa-external-link',
            color: 'purple'
        }
    ];

    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
    }

    function loadBookmarks() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                bookmarks = JSON.parse(stored);
            } else {
                // استخدام البيانات الوهمية إذا لم يكن هناك محفوظات
                bookmarks = DEMO_BOOKMARKS;
                saveBookmarks();
            }
        } catch (e) {
            console.error('Error loading bookmarks:', e);
            bookmarks = DEMO_BOOKMARKS;
        }
    }

    function saveBookmarks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.error('Error saving bookmarks:', e);
        }
    }

    App.Pages.bookmarks = function() {
        cleanup();
        loadBookmarks();
        
        const container = document.getElementById('app-content');
        if (!container) return;

        renderBookmarksPage(container);
        attachEvents();

        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }

        App.Router.registerCleanup(cleanup);
    };

    function renderBookmarksPage(container) {
        container.innerHTML = `
            <div class="container mx-auto max-w-6xl pb-24 space-y-6">
                <!-- Header -->
                <div class="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden scroll-animate">
                    <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 animate-float">
                                    <i class="fa-solid fa-bookmark text-3xl text-purple-500"></i>
                                </div>
                                <div>
                                    <h1 class="text-2xl md:text-3xl font-bold mb-1 gradient-text">المحفوظات</h1>
                                    <p class="text-gray-500 dark:text-gray-300 text-xs md:text-sm">جميع الملفات والروابط المحفوظة</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <span class="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold">
                                    ${bookmarks.length} عنصر
                                </span>
                            </div>
                        </div>
                    </div>
                    <i class="fa-solid fa-bookmark absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>
                </div>

                <!-- Filter Tabs -->
                <div class="glass-panel rounded-2xl p-4 scroll-animate">
                    <div class="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2" id="filter-tabs">
                        ${renderFilterTabs()}
                    </div>
                </div>

                <!-- Bookmarks Grid -->
                <div id="bookmarks-container">
                    ${renderBookmarks()}
                </div>
            </div>
        `;
    }

    function renderFilterTabs() {
        return BOOKMARK_TYPES.map(type => {
            const isActive = currentFilter === type.id;
            const count = type.id === 'all' 
                ? bookmarks.length 
                : bookmarks.filter(b => b.type === type.id).length;
            
            return `
                <button data-filter="${type.id}" class="filter-tab flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                    isActive 
                        ? `bg-${type.color}-500/10 border-${type.color}-500/30 text-${type.color}-600 dark:text-${type.color}-400 shadow-lg` 
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                }">
                    <i class="fa-solid ${type.icon} text-sm"></i>
                    <span class="text-sm font-medium">${type.name}</span>
                    <span class="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-xs font-bold">
                        ${count}
                    </span>
                </button>
            `;
        }).join('');
    }

    function renderBookmarks() {
        const filteredBookmarks = currentFilter === 'all'
            ? bookmarks
            : bookmarks.filter(b => b.type === currentFilter);

        if (filteredBookmarks.length === 0) {
            return `
                <div class="glass-panel rounded-2xl p-12 text-center scroll-animate">
                    <div class="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <i class="fa-solid fa-bookmark-slash text-4xl text-purple-400"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">لا توجد محفوظات</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">ابدأ بحفظ الملفات والروابط المهمة</p>
                    <button onclick="App.Router.go('home')" class="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all shadow-lg">
                        <i class="fa-solid fa-house ml-2"></i>
                        العودة للرئيسية
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 scroll-animate">
                ${filteredBookmarks.map(bookmark => renderBookmarkCard(bookmark)).join('')}
            </div>
        `;
    }

    function renderBookmarkCard(bookmark) {
        const typeInfo = BOOKMARK_TYPES.find(t => t.id === bookmark.type) || BOOKMARK_TYPES[0];
        const timeAgo = getTimeAgo(bookmark.addedDate);
        
        return `
            <div class="bookmark-card group" data-bookmark-id="${bookmark.id}">
                <div class="glass-panel rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <div class="flex items-start gap-4">
                        <!-- Icon -->
                        <div class="w-12 h-12 rounded-lg bg-${bookmark.color}-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <i class="fa-solid ${bookmark.icon} text-xl text-${bookmark.color}-500"></i>
                        </div>
                        
                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <h3 class="font-bold text-sm line-clamp-2 group-hover:text-${bookmark.color}-500 transition-colors">
                                    ${bookmark.title}
                                </h3>
                                <button class="remove-bookmark flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all" data-bookmark-id="${bookmark.id}">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </div>
                            
                            <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                                ${bookmark.description}
                            </p>
                            
                            <!-- Meta -->
                            <div class="flex items-center justify-between flex-wrap gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-1 rounded-full bg-${typeInfo.color}-500/10 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400 text-xs font-medium">
                                        ${typeInfo.name}
                                    </span>
                                    <span class="px-2 py-1 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-medium">
                                        ${bookmark.subject}
                                    </span>
                                </div>
                                
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    <i class="fa-solid fa-clock ml-1"></i>
                                    ${timeAgo}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'منذ لحظات';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
        
        const months = Math.floor(days / 30);
        return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    }

    function attachEvents() {
        // Filter Tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            const handler = function() {
                currentFilter = this.getAttribute('data-filter');
                updateBookmarksDisplay();
                updateFilterTabs();
            };
            
            tab.addEventListener('click', handler);
            eventListeners.push({ element: tab, event: 'click', handler });
        });

        // Bookmark Cards - Open
        const bookmarkCards = document.querySelectorAll('.bookmark-card');
        bookmarkCards.forEach(card => {
            const handler = function(e) {
                if (e.target.closest('.remove-bookmark')) return;
                
                const bookmarkId = this.getAttribute('data-bookmark-id');
                const bookmark = bookmarks.find(b => b.id === bookmarkId);
                
                if (bookmark) {
                    if (bookmark.url.startsWith('#')) {
                        const page = bookmark.url.substring(1);
                        App.Router.go(page);
                    } else {
                        window.open(bookmark.url, '_blank');
                    }
                }
            };
            
            card.addEventListener('click', handler);
            eventListeners.push({ element: card, event: 'click', handler });
        });

        // Remove Bookmark Buttons
        const removeButtons = document.querySelectorAll('.remove-bookmark');
        removeButtons.forEach(btn => {
            const handler = function(e) {
                e.stopPropagation();
                const bookmarkId = this.getAttribute('data-bookmark-id');
                removeBookmark(bookmarkId);
            };
            
            btn.addEventListener('click', handler);
            eventListeners.push({ element: btn, event: 'click', handler });
        });
    }

    function removeBookmark(id) {
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({
            title: 'حذف المحفوظة؟',
            text: 'هل أنت متأكد من حذف هذا العنصر؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            customClass: {
                popup: isDark ? 'swal-dark' : ''
            }
        }).then(result => {
            if (result.isConfirmed) {
                bookmarks = bookmarks.filter(b => b.id !== id);
                saveBookmarks();
                updateBookmarksDisplay();
                
                App.Toast.success('تم حذف المحفوظة بنجاح');
            }
        });
    }

    function updateBookmarksDisplay() {
        const container = document.getElementById('bookmarks-container');
        if (container) {
            container.innerHTML = renderBookmarks();
            attachEvents();
            
            if (App.Effects && App.Effects.initScrollAnimations) {
                App.Effects.initScrollAnimations();
            }
        }
    }

    function updateFilterTabs() {
        const tabsContainer = document.getElementById('filter-tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = renderFilterTabs();
            
            const filterTabs = tabsContainer.querySelectorAll('.filter-tab');
            filterTabs.forEach(tab => {
                const handler = function() {
                    currentFilter = this.getAttribute('data-filter');
                    updateBookmarksDisplay();
                    updateFilterTabs();
                };
                
                tab.addEventListener('click', handler);
                eventListeners.push({ element: tab, event: 'click', handler });
            });
        }
    }

})(window.App);