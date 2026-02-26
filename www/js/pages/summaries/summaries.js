(function (App) {
    'use strict';

    let currentFolder = null;
    let currentPath = [];
    let allData = null;
    let previewCache = {};
    let folderFileCounts = {};
    let isLoadingFolderCounts = false;
    let eventListeners = [];
    let pdfObserver = null;


    let searchQuery = '';


    const SUBJECT_MAPPINGS = {

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

    const DEFAULT_ICON = { icon: 'fa-file-lines', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' };

    function getSubjectStyle(folderName) {
        const name = folderName.toLowerCase();
        for (const [key, value] of Object.entries(SUBJECT_MAPPINGS)) {
            if (name.includes(key)) return value;
        }
        return DEFAULT_ICON;
    }

    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) element.removeEventListener(event, handler);
        });
        eventListeners = [];
        if (pdfObserver) { pdfObserver.disconnect(); pdfObserver = null; }
        searchQuery = '';


        App.UI.BackButtonManager.unregister();
    }


    App.Pages.summaries = function () {
        cleanup();

        const container = document.getElementById('summaries-container');
        const errorEl = document.getElementById('summaries-error');
        const breadcrumbEl = document.getElementById('summaries-breadcrumb');
        const searchInput = document.getElementById('summaries-search');

        const statsContainer = document.getElementById('summaries-stats');
        if (statsContainer) statsContainer.style.display = 'none';

        currentFolder = null;
        currentPath = [];
        allData = null;
        folderFileCounts = {};

        fetchData();
        setupSearch(searchInput);



        App.UI.BackButtonManager.register(function () {
            if (currentPath.length > 0) {
                searchQuery = '';
                if (searchInput) searchInput.value = '';
                currentPath.pop();
                currentFolder = currentPath.length > 0
                    ? currentPath[currentPath.length - 1].id
                    : null;
                fetchData();
                updateBreadcrumb();
                return true;
            }
            return false;
        });

        App.Router.registerCleanup(cleanup);


        function showSkeleton() {
            if (container) {
                container.innerHTML = `
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        ${Array(8).fill(0).map(() => `
                            <div class="glass-panel rounded-xl p-3 h-32 animate-pulse">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="w-11 h-11 rounded-lg bg-gray-200 dark:bg-white/10"></div>
                                    <div class="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                                </div>
                                <div class="space-y-2">
                                    <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                    <div class="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                                </div>
                            </div>`).join('')}
                    </div>`;
            }
        }


        function fetchData() {
            showSkeleton();
            if (errorEl) errorEl.classList.add('hidden');

            const folderId = currentFolder || App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID;
            const cacheKey = App.CACHE_KEYS.SUMMARIES_STRUCTURE + '_' + folderId;
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                `&orderBy=folder,name`;

            App.API.fetchWithCache(url, cacheKey)
                .then(result => {
                    allData = result.data.files || [];
                    renderItems();
                    updateBreadcrumb();
                    const folders = allData.filter(i => i.mimeType === 'application/vnd.google-apps.folder');
                    if (folders.length) fetchFolderFileCountsBatch(folders);
                })
                .catch(error => {
                    console.error('Error fetching summaries:', error);
                    if (errorEl) errorEl.classList.remove('hidden');
                    container.innerHTML = '';
                });
        }


        function fetchFolderFileCountsBatch(folders) {
            if (isLoadingFolderCounts) return;
            isLoadingFolderCounts = true;
            const toFetch = folders.filter(f => folderFileCounts[f.id] === undefined);
            if (!toFetch.length) { isLoadingFolderCounts = false; return; }

            App.API.fetchFoldersCounts(toFetch.map(f => f.id))
                .then(map => { Object.assign(folderFileCounts, map); updateFolderCounts(); isLoadingFolderCounts = false; })
                .catch(() => { isLoadingFolderCounts = false; });
        }

        function updateFolderCounts() {
            container.querySelectorAll('.folder-card').forEach(card => {
                const badge = card.querySelector('.file-count-badge');
                const count = folderFileCounts[card.getAttribute('data-folder-id')];
                if (badge && count !== undefined) {
                    badge.textContent = count;
                    badge.classList.remove('opacity-50', 'animate-pulse');
                }
            });
        }


        function renderItems() {
            if (!container || !allData) return;


            if (searchQuery.trim()) {
                performDeepSearch(searchQuery.trim());
                return;
            }

            if (allData.length === 0) {
                container.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    <div class="col-span-full flex flex-col items-center justify-center py-20">
                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 animate-pulse">
                            <i class="fa-solid fa-inbox text-3xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-400 text-base font-medium">لا توجد ملفات</p>
                    </div></div>`;
                return;
            }

            let html = '<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">';
            allData.forEach(item => {
                html += item.mimeType === 'application/vnd.google-apps.folder'
                    ? renderFolderCard(item)
                    : renderFileCard(item);
            });
            html += '</div>';

            container.innerHTML = html;
            attachEventListeners();
            loadPDFPreviewsLazy();
            if (App.Effects && App.Effects.initScrollAnimations) App.Effects.initScrollAnimations();
        }


        function performDeepSearch(q) {
            const query = q.toLowerCase();
            const folders = allData.filter(i => i.mimeType === 'application/vnd.google-apps.folder');
            const filesInCurrent = allData.filter(i => i.mimeType !== 'application/vnd.google-apps.folder');


            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 gap-3">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center animate-pulse">
                        <i class="fa-solid fa-magnifying-glass text-xl text-cyan-400"></i>
                    </div>
                    <p class="text-sm text-gray-400">جاري البحث في جميع المجلدات…</p>
                </div>`;


            const fetchFolder = (folder) => {
                const cacheKey = App.CACHE_KEYS.SUMMARIES_STRUCTURE + '_' + folder.id;
                const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                    `q='${folder.id}' in parents and trashed=false` +
                    `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                    `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                    `&orderBy=folder,name`;
                return App.API.fetchWithCache(url, cacheKey)
                    .then(result => ({ folder, files: result.data.files || [] }))
                    .catch(() => ({ folder, files: [] }));
            };

            Promise.all(folders.map(fetchFolder)).then(results => {

                let allFiles = filesInCurrent.map(f => ({ file: f, folderName: null }));
                results.forEach(({ folder, files }) => {
                    files
                        .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
                        .forEach(f => allFiles.push({ file: f, folderName: folder.name }));
                });


                const matched = allFiles.filter(({ file }) =>
                    file.name.toLowerCase().includes(query)
                );

                if (matched.length === 0) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-16 gap-3">
                            <div class="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                <i class="fa-solid fa-magnifying-glass text-2xl text-cyan-400/60"></i>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 font-semibold text-sm">لا توجد نتائج لـ «${q}»</p>
                            <p class="text-gray-400 text-xs">جرّب كلمة بحث مختلفة</p>
                        </div>`;
                    return;
                }


                let html = `
                    <div class="flex items-center gap-2 mb-3 px-1">
                        <i class="fa-solid fa-magnifying-glass text-[10px] text-cyan-400"></i>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${matched.length} نتيجة لـ</span>
                        <span class="text-xs font-bold text-cyan-500">«${q}»</span>
                        <span class="text-[10px] text-gray-400 dark:text-gray-600 mr-1">• شامل داخل المجلدات</span>
                        <button id="sum-clear-search" class="text-xs text-red-400 hover:text-red-500 mr-auto flex items-center gap-1 transition">
                            <i class="fa-solid fa-xmark text-[10px]"></i> مسح
                        </button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">`;

                matched.forEach(({ file, folderName }) => {
                    const cardHtml = renderFileCard(file);
                    if (folderName) {
                        const style = getSubjectStyle(folderName);
                        html += cardHtml.replace(
                            'class="file-card group"',
                            `class="file-card group" data-folder-context="${folderName}"`
                        ).replace(
                            '<div class="p-2.5 flex-1 flex flex-col">',
                            `<div class="p-2.5 flex-1 flex flex-col">
                                <div class="flex items-center gap-1 mb-1.5">
                                    <i class="fa-solid fa-folder-open text-[8px] text-${style.color}-400"></i>
                                    <span class="text-[9px] text-${style.color}-500 dark:text-${style.color}-400 font-medium truncate">${folderName}</span>
                                </div>`
                        );
                    } else {
                        html += cardHtml;
                    }
                });

                html += '</div>';
                container.innerHTML = html;

                const clearBtn = container.querySelector('#sum-clear-search');
                if (clearBtn) {
                    clearBtn.addEventListener('click', function () {
                        searchQuery = '';
                        if (searchInput) searchInput.value = '';
                        renderItems();
                    });
                }

                loadPDFPreviewsLazy();
                if (App.Effects && App.Effects.initScrollAnimations) App.Effects.initScrollAnimations();
            });
        }


        function attachEventListeners() {
            container.querySelectorAll('.folder-card').forEach(card => {
                const handler = function () {
                    const folderId = this.getAttribute('data-folder-id');
                    const folderName = this.getAttribute('data-folder-name');
                    currentFolder = folderId;
                    currentPath.push({ id: folderId, name: folderName });
                    searchQuery = '';
                    if (searchInput) searchInput.value = '';
                    updateHistory();
                    fetchData();
                };
                card.addEventListener('click', handler);
                eventListeners.push({ element: card, event: 'click', handler });
            });
        }


        function setupSearch(input) {
            if (!input) return;
            let debounceTimer;
            const handler = function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    searchQuery = input.value;
                    renderItems();
                }, 220);
            };
            input.addEventListener('input', handler);
            eventListeners.push({ element: input, event: 'input', handler });

            const keyHandler = function (e) {
                if (e.key === 'Escape') {
                    input.value = '';
                    searchQuery = '';
                    renderItems();
                    input.blur();
                }
            };
            input.addEventListener('keydown', keyHandler);
            eventListeners.push({ element: input, event: 'keydown', handler: keyHandler });
        }


        function updateBreadcrumb() {
            if (!breadcrumbEl) return;

            let html = `
                <button class="breadcrumb-icon-btn flex-shrink-0 w-8 h-8 rounded-lg
                               flex items-center justify-center
                               bg-cyan-500/10 hover:bg-cyan-500/20
                               border border-cyan-500/20 hover:border-cyan-500/40
                               text-cyan-500 dark:text-cyan-400
                               transition-all hover:scale-110 active:scale-95"
                        title="الملخصات" data-nav="root">
                    <i class="fa-solid fa-house text-xs pointer-events-none"></i>
                </button>`;

            currentPath.forEach((item, index) => {
                const style = getSubjectStyle(item.name);
                const isLast = index === currentPath.length - 1;

                html += `<i class="fa-solid fa-chevron-left text-[9px] text-gray-300 dark:text-white/20 flex-shrink-0 mx-0.5 pointer-events-none"></i>`;

                if (isLast) {
                    html += `
                        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                    bg-${style.color}-500/20 border border-${style.color}-500/40
                                    text-${style.color}-500 dark:text-${style.color}-400"
                             title="${item.name}">
                            <i class="fa-solid ${style.icon} text-xs pointer-events-none"></i>
                        </div>`;
                } else {
                    html += `
                        <button class="breadcrumb-icon-btn flex-shrink-0 w-8 h-8 rounded-lg
                                       flex items-center justify-center
                                       bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10
                                       border border-gray-200/80 dark:border-white/10 hover:border-${style.color}-400/40
                                       text-gray-500 dark:text-gray-400 hover:text-${style.color}-500
                                       transition-all hover:scale-110 active:scale-95"
                                title="${item.name}" data-nav="${index}">
                            <i class="fa-solid ${style.icon} text-xs pointer-events-none"></i>
                        </button>`;
                }
            });

            breadcrumbEl.innerHTML = html;

            breadcrumbEl.querySelectorAll('.breadcrumb-icon-btn').forEach(btn => {
                const handler = function () {
                    const nav = this.getAttribute('data-nav');
                    if (nav === 'root') {
                        currentFolder = null;
                        currentPath = [];
                    } else {
                        const idx = parseInt(nav);
                        currentPath = currentPath.slice(0, idx + 1);
                        currentFolder = currentPath[currentPath.length - 1].id;
                    }
                    searchQuery = '';
                    if (searchInput) searchInput.value = '';
                    updateHistory();
                    fetchData();
                };
                btn.addEventListener('click', handler);
                eventListeners.push({ element: btn, event: 'click', handler });
            });
        }

        function updateHistory() {
            if (window.history && window.history.pushState) {
                window.history.pushState(
                    { page: 'summaries', folder: currentFolder, path: currentPath },
                    currentPath.map(p => p.name).join(' > ') || 'الملخصات',
                    '#summaries'
                );
            }
        }


        function renderFolderCard(item) {
            const style = getSubjectStyle(item.name);
            const count = folderFileCounts[item.id];
            const hasCount = count !== undefined;

            return `
                <div class="folder-card group cursor-pointer" data-folder-id="${item.id}" data-folder-name="${item.name}">
                    <div class="glass-panel rounded-xl p-3 hover:shadow-lg transition-all hover:-translate-y-1
                                border border-${style.color}-500/10 hover:border-${style.color}-500/30
                                h-full relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-11 h-11 rounded-lg bg-gradient-to-br from-${style.color}-500/30 to-${style.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-sm border border-${style.color}-500/20">
                                    <i class="fa-solid ${style.icon} text-lg text-${style.color}-400"></i>
                                </div>
                                <h3 class="font-bold text-xs group-hover:text-${style.color}-500 dark:group-hover:text-${style.color}-400 transition line-clamp-2 leading-tight flex-1">${item.name}</h3>
                            </div>
                            <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-white/5">
                                <span class="flex items-center gap-1"><i class="fa-solid fa-folder-open"></i> مجلد</span>
                                <span class="file-count-badge px-2 py-0.5 rounded-full bg-${style.color}-500/10 text-${style.color}-500 font-medium ${!hasCount ? 'opacity-50 animate-pulse' : ''}">${hasCount ? count : '...'}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        function renderFileCard(item) {
            const isPDF = item.mimeType && item.mimeType.includes('pdf');
            const isDoc = item.mimeType && (item.mimeType.includes('document') || item.mimeType.includes('word'));
            const icon = isPDF ? 'fa-file-pdf' : (isDoc ? 'fa-file-word' : 'fa-file-lines');
            const iconColor = isPDF ? 'text-red-500' : (isDoc ? 'text-blue-500' : 'text-cyan-500');
            const bgGrad = isPDF ? 'from-red-500/20 to-pink-500/20' : (isDoc ? 'from-blue-500/20 to-indigo-500/20' : 'from-cyan-500/20 to-teal-500/20');

            return `
                <div class="file-card group">
                    <div class="glass-panel rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col border border-white/10 hover:border-cyan-500/30">
                        <div class="h-24 bg-gradient-to-br ${bgGrad} flex items-center justify-center relative overflow-hidden pdf-preview-container" data-file-id="${item.id}" data-is-pdf="${isPDF}">
                            ${isPDF ? '<div class="pdf-preview-loader absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm"><i class="fa-solid fa-spinner animate-spin text-2xl text-cyan-400"></i></div>' : ''}
                            <div class="pdf-preview-fallback">
                                <i class="fa-solid ${icon} text-4xl ${iconColor} opacity-30 group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            ${isPDF ? '<div class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-red-500/90 text-white text-[9px] font-bold rounded-md shadow-lg">PDF</div>' : ''}
                            ${isDoc ? '<div class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-blue-500/90 text-white text-[9px] font-bold rounded-md shadow-lg">WORD</div>' : ''}
                        </div>
                        <div class="p-2.5 flex-1 flex flex-col">
                            <h3 class="font-bold text-xs mb-2 line-clamp-2 min-h-[2rem] group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition leading-tight">${item.name}</h3>
                            <div class="flex gap-1.5 mt-auto">
                                <button class="flex-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-500 text-[10px] font-medium transition-all flex items-center justify-center gap-1"
                                    onclick="window.open('${item.webViewLink}', '_blank')">
                                    <i class="fa-solid fa-eye text-[9px]"></i> عرض
                                </button>
                                ${item.webContentLink ? `
                                <button class="px-2 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 text-[10px] transition-all"
                                    onclick="window.open('${item.webContentLink}', '_blank')">
                                    <i class="fa-solid fa-download text-[9px]"></i>
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
        }


        function loadPDFPreviewsLazy() {
            const containers = container.querySelectorAll('.pdf-preview-container[data-is-pdf="true"]');
            if (!containers.length) return;
            pdfObserver = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) { loadSinglePDFPreview(e.target); pdfObserver.unobserve(e.target); } });
            }, { rootMargin: '50px' });
            containers.forEach(c => pdfObserver.observe(c));
        }

        function loadSinglePDFPreview(c) {
            const fileId = c.getAttribute('data-file-id');
            const loader = c.querySelector('.pdf-preview-loader');
            const fallback = c.querySelector('.pdf-preview-fallback');
            if (previewCache[fileId]) { showPreview(c, previewCache[fileId], loader, fallback); return; }
            const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
            const img = new Image();
            img.onload = () => { previewCache[fileId] = url; showPreview(c, url, loader, fallback); };
            img.onerror = () => { if (loader) loader.style.display = 'none'; };
            img.src = url;
        }

        function showPreview(c, url, loader, fallback) {
            if (loader) loader.style.display = 'none';
            if (fallback) fallback.style.display = 'none';
            const img = document.createElement('img');
            img.src = url;
            img.className = 'w-full h-full object-cover opacity-0 transition-opacity duration-500';
            c.appendChild(img);
            setTimeout(() => { img.style.opacity = '1'; }, 50);
        }

    };

})(window.App);