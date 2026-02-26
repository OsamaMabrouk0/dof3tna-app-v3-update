(function (App) {
    'use strict';







    let allVideos = [];
    let filteredVideos = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let isLoading = false;
    let eventListeners = [];


    const SUBJECT_STYLES = {

        'محاسبة': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'محاسبه': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'accounting': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'محاسبة حكومية': { icon: 'fa-landmark', color: 'teal', gradient: 'from-teal-500/20 to-emerald-600/20' },
        'محاسبه حكوميه': { icon: 'fa-landmark', color: 'teal', gradient: 'from-teal-500/20 to-emerald-600/20' },
        'محاسبة بشرية': { icon: 'fa-users-gear', color: 'green', gradient: 'from-green-500/20 to-emerald-600/20' },
        'محاسبه بشريه': { icon: 'fa-users-gear', color: 'green', gradient: 'from-green-500/20 to-emerald-600/20' },
        'محاسبة التكاليف': { icon: 'fa-receipt', color: 'lime', gradient: 'from-lime-500/20 to-green-600/20' },
        'محاسبه التكاليف': { icon: 'fa-receipt', color: 'lime', gradient: 'from-lime-500/20 to-green-600/20' },

        'اقتصاد': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'economics': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'موازنة الدولة': { icon: 'fa-scale-unbalanced', color: 'violet', gradient: 'from-violet-500/20 to-purple-600/20' },
        'موازنه الدوله': { icon: 'fa-scale-unbalanced', color: 'violet', gradient: 'from-violet-500/20 to-purple-600/20' },
        'اقتصاد قياسي': { icon: 'fa-superscript', color: 'blue', gradient: 'from-blue-500/20 to-indigo-600/20' },
        'مبادئ اقتصاد': { icon: 'fa-seedling', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },

        'إحصاء': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'احصاء': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'استدلال': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'إستدلال': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'statistics': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'رياضيات': { icon: 'fa-square-root-variable', color: 'fuchsia', gradient: 'from-fuchsia-500/20 to-purple-600/20' },
        'رياضيات تجارية': { icon: 'fa-square-root-variable', color: 'fuchsia', gradient: 'from-fuchsia-500/20 to-purple-600/20' },

        'إدارة': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'اداره': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'ادارة': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'management': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'موارد بشرية': { icon: 'fa-people-group', color: 'orange', gradient: 'from-orange-500/20 to-amber-600/20' },
        'موارد بشريه': { icon: 'fa-people-group', color: 'orange', gradient: 'from-orange-500/20 to-amber-600/20' },
        'سلوك تنظيمي': { icon: 'fa-users', color: 'amber', gradient: 'from-amber-500/20 to-yellow-600/20' },
        'ريادة الاعمال': { icon: 'fa-rocket', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'ريادة الأعمال': { icon: 'fa-rocket', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },

        'نظم المعلومات': { icon: 'fa-database', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'نظم معلومات': { icon: 'fa-database', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'نظم معلومات ادارية': { icon: 'fa-server', color: 'sky', gradient: 'from-sky-500/20 to-cyan-600/20' },
        'تقنية المعلومات': { icon: 'fa-laptop-code', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'نظم و المعلومات': { icon: 'fa-database', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'نظم و معلومات': { icon: 'fa-database', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'نظم و معلومات ادارية': { icon: 'fa-server', color: 'sky', gradient: 'from-sky-500/20 to-cyan-600/20' },
        'تقنية و المعلومات': { icon: 'fa-laptop-code', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },

        'تسويق': { icon: 'fa-bullhorn', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'marketing': { icon: 'fa-bullhorn', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'سلوك المستهلك': { icon: 'fa-cart-shopping', color: 'rose', gradient: 'from-rose-500/20 to-red-600/20' },

        'مالية': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'ماليه': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'finance': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'تمويل': { icon: 'fa-sack-dollar', color: 'lime', gradient: 'from-lime-500/20 to-green-600/20' },
        'استثمار': { icon: 'fa-chart-pie', color: 'yellow', gradient: 'from-yellow-500/20 to-lime-600/20' },

        'بنوك': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'banking': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'عمليات بنوك': { icon: 'fa-vault', color: 'indigo', gradient: 'from-indigo-500/20 to-violet-600/20' },

        'قانون': { icon: 'fa-scale-balanced', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'law': { icon: 'fa-scale-balanced', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'قانون تجاري': { icon: 'fa-file-contract', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'قانون اعمال': { icon: 'fa-file-contract', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },

        'تأمين': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'تامين': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'insurance': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },

        'تجارة': { icon: 'fa-store', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'commerce': { icon: 'fa-store', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'اعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'أعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'business': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'لوجستيات': { icon: 'fa-truck-fast', color: 'orange', gradient: 'from-orange-500/20 to-amber-600/20' },
        'سلاسل الامداد': { icon: 'fa-link', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'جودة شاملة': { icon: 'fa-medal', color: 'teal', gradient: 'from-teal-500/20 to-green-600/20' },

        'انجليزي': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'انجليزى': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'english': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
    };
    const DEFAULT_STYLE = { icon: 'fa-book-open', color: 'blue' };

    function getSubjectStyle(subject) {
        if (!subject) return DEFAULT_STYLE;
        const key = subject.trim().toLowerCase();
        for (const [k, v] of Object.entries(SUBJECT_STYLES)) {
            if (key.includes(k.toLowerCase())) return v;
        }
        return DEFAULT_STYLE;
    }


    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) element.removeEventListener(event, handler);
        });
        eventListeners = [];
        isLoading = false;
        searchQuery = '';
        currentFilter = 'all';
    }


    App.Pages.videos = function () {
        cleanup();
        renderShell();
        fetchVideos();
        App.Router.registerCleanup(cleanup);
    };


    function renderShell() {
        const container = document.getElementById('app-content');
        if (!container) return;

        container.innerHTML = `
            <div class="container mx-auto max-w-6xl pb-28" id="videos-page-root">

                <!-- ══ شريط البحث والفلتر ══ -->
                <div class="glass-panel rounded-2xl p-3 mb-5 scroll-animate flex items-center gap-2 sticky top-0 z-20">
                    <!-- بحث -->
                    <div class="relative flex-1">
                        <i class="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 text-xs pointer-events-none"></i>
                        <input id="videos-search" type="text" placeholder="ابحث عن فيديو أو مادة…"
                               class="w-full pr-8 pl-3 py-2 rounded-xl text-xs font-medium
                                      bg-black/5 dark:bg-white/5
                                      border border-black/8 dark:border-white/8
                                      focus:border-red-400/60 focus:bg-red-500/5 focus:outline-none
                                      text-gray-700 dark:text-gray-200 placeholder:text-gray-400
                                      transition-all duration-250">
                    </div>
                    <!-- عدد النتائج -->
                    <span id="videos-count-badge"
                          class="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl
                                 bg-red-500/8 text-red-500 border border-red-500/15 hidden">
                        <i class="fa-solid fa-video text-[9px] mr-0.5"></i>
                        <span id="videos-count-num">0</span>
                    </span>
                </div>

                <!-- ══ فلتر المواد ══ -->
                <div class="mb-5 scroll-animate">
                    <div id="subjects-filter"
                         class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <!-- تُعبأ بعد جلب البيانات -->
                        ${buildFilterSkeleton()}
                    </div>
                </div>

                <!-- ══ شبكة الفيديوهات ══ -->
                <div id="videos-grid" class="space-y-3">
                    ${buildGridSkeleton()}
                </div>

            </div>`;

        setupSearch();
    }


    function fetchVideos() {
        if (isLoading) return;
        isLoading = true;

        const url = App.GITHUB.VIDEOS_URL;
        const cacheKey = 'videos_data';
        const cached = App.Cache.get ? App.Cache.get(cacheKey) : null;


        if (cached && cached.length) {
            allVideos = cached;
            applyFilter();
        }

        fetch(url)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                allVideos = Array.isArray(data) ? data : [];
                if (App.Cache.set) App.Cache.set(cacheKey, allVideos);
                isLoading = false;
                applyFilter();
            })
            .catch(() => {
                isLoading = false;
                if (!cached || !cached.length) renderError();
            });
    }


    function applyFilter() {
        let result = allVideos;


        if (currentFilter !== 'all') {
            result = result.filter(v => v.subject === currentFilter);
        }


        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(v =>
                (v.title || '').toLowerCase().includes(q) ||
                (v.subject || '').toLowerCase().includes(q)
            );
        }

        filteredVideos = result;
        renderFilterBar();
        renderGrid();
        updateCountBadge();
    }


    function renderFilterBar() {
        const bar = document.getElementById('subjects-filter');
        if (!bar) return;


        const subjects = ['all', ...new Set(allVideos.map(v => v.subject).filter(Boolean))];

        bar.innerHTML = subjects.map(subject => {
            const isAll = subject === 'all';
            const isActive = currentFilter === subject;
            const style = isAll ? { icon: 'fa-border-all', color: 'red' } : getSubjectStyle(subject);
            const label = isAll ? 'الكل' : subject;
            const count = isAll ? allVideos.length
                : allVideos.filter(v => v.subject === subject).length;

            return `
                <button data-filter="${subject}"
                        class="filter-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold
                               border transition-all duration-200 whitespace-nowrap
                               ${isActive
                    ? `bg-${style.color}-500/12 border-${style.color}-500/30 text-${style.color}-600 dark:text-${style.color}-400`
                    : 'bg-transparent border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/15'}">
                    <i class="fa-solid ${style.icon} text-[9px]"></i>
                    ${label}
                    <span class="px-1.5 py-0.5 rounded-full text-[9px] font-black
                                 ${isActive ? `bg-${style.color}-500/15 text-${style.color}-500` : 'bg-gray-100 dark:bg-white/8 text-gray-400'}">
                        ${count}
                    </span>
                </button>`;
        }).join('');


        bar.querySelectorAll('.filter-btn').forEach(btn => {
            const handler = () => {
                currentFilter = btn.getAttribute('data-filter');
                applyFilter();
            };
            btn.addEventListener('click', handler);
            eventListeners.push({ element: btn, event: 'click', handler });
        });
    }


    function renderGrid() {
        const grid = document.getElementById('videos-grid');
        if (!grid) return;

        if (filteredVideos.length === 0) {
            grid.innerHTML = renderEmpty();
            return;
        }


        const grouped = {};
        filteredVideos.forEach(v => {
            const key = v.subject || 'أخرى';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(v);
        });


        const showGrouped = currentFilter === 'all' && !searchQuery.trim();

        let html = '';

        if (showGrouped) {
            Object.entries(grouped).forEach(([subject, videos]) => {
                const style = getSubjectStyle(subject);
                html += `
                    <div class="mb-6 scroll-animate">
                        <!-- عنوان المجموعة -->
                        <div class="flex items-center gap-2 mb-3 px-0.5">
                            <div class="w-6 h-6 rounded-lg bg-${style.color}-500/12 flex items-center justify-center flex-shrink-0">
                                <i class="fa-solid ${style.icon} text-${style.color}-500 text-[10px]"></i>
                            </div>
                            <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">${subject}</h3>
                            <span class="text-[10px] text-gray-400 font-medium">${videos.length} ${videos.length === 1 ? 'فيديو' : 'فيديوهات'}</span>
                            <div class="flex-1 h-px bg-gray-200 dark:bg-white/6 mr-1"></div>
                        </div>
                        <!-- الكروت -->
                        <div class="space-y-2.5">
                            ${videos.map(v => renderVideoCard(v)).join('')}
                        </div>
                    </div>`;
            });
        } else {

            if (searchQuery.trim()) {
                html += `<div class="flex items-center gap-2 mb-3 px-0.5">
                    <i class="fa-solid fa-magnifying-glass text-[10px] text-red-400"></i>
                    <span class="text-xs text-gray-500">${filteredVideos.length} نتيجة لـ</span>
                    <span class="text-xs font-bold text-red-500">«${searchQuery}»</span>
                    <button id="vid-clear-search" class="text-[11px] text-red-400 hover:text-red-500 mr-auto flex items-center gap-1 transition">
                        <i class="fa-solid fa-xmark text-[9px]"></i> مسح
                    </button>
                </div>`;
            }
            html += `<div class="space-y-2.5">${filteredVideos.map(v => renderVideoCard(v)).join('')}</div>`;
        }

        grid.innerHTML = html;


        const clearBtn = grid.querySelector('#vid-clear-search');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchQuery = '';
                const input = document.getElementById('videos-search');
                if (input) input.value = '';
                applyFilter();
            });
        }


        grid.querySelectorAll('.video-item').forEach(card => {
            const handler = () => openVideo(card.getAttribute('data-url'), card.getAttribute('data-type'));
            card.addEventListener('click', handler);
            eventListeners.push({ element: card, event: 'click', handler });
        });

        if (App.Effects && App.Effects.initScrollAnimations) App.Effects.initScrollAnimations();
    }


    function renderVideoCard(video) {
        const style = getSubjectStyle(video.subject);
        const isYT = video.platform === 'youtube';
        const isDrive = video.platform === 'drive';
        const isPlaylist = video.type === 'playlist';
        const url = video.url || '';


        const platformIcon = isYT ? 'fa-brands fa-youtube' : 'fa-brands fa-google-drive';
        const platformColor = isYT ? 'text-red-500' : 'text-blue-400';
        const platformLabel = isYT ? 'YouTube' : 'Drive';


        const typeIcon = isPlaylist ? 'fa-list-ul' : 'fa-circle-play';
        const typeLabel = isPlaylist ? 'قائمة تشغيل' : 'فيديو';
        const typeColor = isPlaylist ? `text-${style.color}-500` : 'text-gray-400';

        return `
            <div class="video-item group cursor-pointer"
                 data-url="${url}"
                 data-type="${video.type || 'video'}"
                 style="animation: fadeInUp 0.2s ease-out both;">
                <div class="glass-panel rounded-xl px-4 py-3 flex items-center gap-3
                            border border-transparent
                            hover:border-${style.color}-500/20
                            hover:bg-${style.color}-500/3
                            transition-all duration-200 active:scale-[0.99]">

                    <!-- أيقونة المادة / نوع -->
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-${style.color}-500/18 to-${style.color}-600/8
                                border border-${style.color}-500/15
                                flex items-center justify-center flex-shrink-0
                                group-hover:scale-105 transition-transform duration-200">
                        <i class="fa-solid ${style.icon} text-sm text-${style.color}-500"></i>
                    </div>

                    <!-- النص -->
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-gray-800 dark:text-gray-100 leading-snug
                                   group-hover:text-${style.color}-600 dark:group-hover:text-${style.color}-400
                                   transition-colors truncate">
                            ${video.title || 'بدون عنوان'}
                        </p>
                        <div class="flex items-center gap-2 mt-1">
                            <!-- المادة -->
                            ${video.subject ? `
                            <span class="text-[10px] text-${style.color}-500/80 font-medium">${video.subject}</span>
                            <span class="text-gray-200 dark:text-white/10 text-[10px]">·</span>` : ''}
                            <!-- نوع المحتوى -->
                            <span class="flex items-center gap-1 text-[10px] ${typeColor} font-medium">
                                <i class="fa-solid ${typeIcon} text-[8px]"></i>${typeLabel}
                            </span>
                            <span class="text-gray-200 dark:text-white/10 text-[10px]">·</span>
                            <!-- المنصة -->
                            <span class="flex items-center gap-1 text-[10px] ${platformColor} font-medium">
                                <i class="${platformIcon} text-[8px]"></i>${platformLabel}
                            </span>
                        </div>
                    </div>

                    <!-- سهم الفتح -->
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-gray-100 dark:bg-white/5
                                group-hover:bg-${style.color}-500/12
                                transition-all duration-200">
                        <i class="fa-solid fa-arrow-up-right-from-square text-[9px]
                                   text-gray-400
                                   group-hover:text-${style.color}-500
                                   transition-colors"></i>
                    </div>

                </div>
            </div>`;
    }


    function openVideo(url, type) {

        if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
            App.Toast.warning('لم يُضف رابط لهذا الفيديو بعد', '⚠️ الرابط غير موجود');
            return;
        }


        const trimmed = url.trim();
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            App.Toast.error('الرابط المدخل غير صحيح', '❌ رابط خاطئ');
            return;
        }


        window.open(trimmed, '_blank');
    }


    function updateCountBadge() {
        const badge = document.getElementById('videos-count-badge');
        const numEl = document.getElementById('videos-count-num');
        if (!badge || !numEl) return;
        numEl.textContent = filteredVideos.length;
        badge.classList.toggle('hidden', allVideos.length === 0);
    }


    function setupSearch() {
        const input = document.getElementById('videos-search');
        if (!input) return;
        let timer;
        const handler = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                searchQuery = input.value;
                applyFilter();
            }, 200);
        };
        input.addEventListener('input', handler);
        eventListeners.push({ element: input, event: 'input', handler });

        const keyHandler = (e) => {
            if (e.key === 'Escape') { input.value = ''; searchQuery = ''; applyFilter(); input.blur(); }
        };
        input.addEventListener('keydown', keyHandler);
        eventListeners.push({ element: input, event: 'keydown', handler: keyHandler });
    }


    function renderEmpty() {
        const isSearch = searchQuery.trim();
        return `
            <div class="flex flex-col items-center py-14 gap-3 text-center">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10
                            border border-red-500/10 flex items-center justify-center">
                    <i class="fa-solid fa-video-slash text-xl text-red-400/60"></i>
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-700 dark:text-gray-200">
                        ${isSearch ? `لا توجد نتائج لـ «${searchQuery}»` : 'لا توجد فيديوهات'}
                    </p>
                    <p class="text-[11px] text-gray-400 mt-1">
                        ${isSearch ? 'جرّب كلمة بحث مختلفة' : 'لم يتم إضافة فيديوهات بعد'}
                    </p>
                </div>
            </div>`;
    }

    function renderError() {
        const grid = document.getElementById('videos-grid');
        if (!grid) return;
        grid.innerHTML = `
            <div class="flex flex-col items-center py-12 gap-3 text-center">
                <div class="relative">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200
                                dark:from-white/5 dark:to-white/[0.02]
                                border border-slate-200 dark:border-white/8
                                flex items-center justify-center shadow-sm">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-slate-400">
  <line x1="2" y1="2" x2="22" y2="22"/>
  <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
  <path d="M2 8.82a15 15 0 0 1 4.17-2.65"/>
  <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/>
  <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/>
  <path d="M5 13a10 10 0 0 1 5.24-2.76"/>
  <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
</svg>
                    </div>
                    <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full
                                 bg-amber-400 border-2 border-white dark:border-gray-900
                                 flex items-center justify-center">
                        <i class="fa-solid fa-exclamation text-[8px] text-white font-black"></i>
                    </span>
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-700 dark:text-gray-200">تعذّر تحميل الفيديوهات</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">تحقق من الاتصال وأعد المحاولة</p>
                </div>
                <button onclick="App.Router.go('videos', false, false)"
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold
                               bg-red-500/10 hover:bg-red-500/18 text-red-500
                               border border-red-500/20 hover:border-red-500/35
                               transition-all active:scale-95">
                    <i class="fa-solid fa-rotate-right text-[10px]"></i> إعادة المحاولة
                </button>
            </div>`;
    }


    function buildFilterSkeleton() {
        return Array(4).fill(0).map((_, i) => `
            <div class="flex-shrink-0 h-8 rounded-xl animate-pulse"
                 style="width:${60 + i * 15}px;
                        background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                        background-size:200% 100%;
                        animation:skeleton-wave 1.5s ease-in-out infinite;
                        animation-delay:${i * 80}ms;"></div>`
        ).join('');
    }

    function buildGridSkeleton() {
        return Array(5).fill(0).map((_, i) => `
            <div class="glass-panel rounded-xl px-4 py-3 flex items-center gap-3"
                 style="animation-delay:${i * 60}ms">
                <div class="w-10 h-10 rounded-xl flex-shrink-0"
                     style="background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                            background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 60}ms;"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3.5 rounded-md"
                         style="width:${50 + i * 8}%;
                                background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                                background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 60}ms;"></div>
                    <div class="h-2.5 rounded-md"
                         style="width:35%;
                                background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                                background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 60 + 80}ms;"></div>
                </div>
                <div class="w-7 h-7 rounded-lg flex-shrink-0"
                     style="background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                            background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 60}ms;"></div>
            </div>`
        ).join('');
    }

})(window.App);
