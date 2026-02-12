(function(App) {
    'use strict';
    
    let currentFolder = null;
    let currentPath = [];
    let allData = null;
    let previewCache = {};
    let folderFileCounts = {};
    
    const MAX_CACHE_SIZE = 30;
    let foldersDataCache = { initialized: true };
    let cacheQueue = [];
    
    let isLoading = false;
    let currentAbortController = null;
    let isLoadingFolderCounts = false;
    
    let eventListeners = [];
    let pdfObserver = null;
    
    const SUBJECT_MAPPINGS = {
        'محاسبة': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'محاسبه': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'accounting': { icon: 'fa-calculator', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'اقتصاد': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'economics': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'إحصاء': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'احصاء': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'statistics': { icon: 'fa-chart-bar', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'إدارة': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'اداره': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'ادارة': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'management': { icon: 'fa-briefcase', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'تسويق': { icon: 'fa-bullhorn', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'marketing': { icon: 'fa-bullhorn', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'مالية': { icon: 'fa-coins', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'ماليه': { icon: 'fa-coins', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'finance': { icon: 'fa-coins', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'بنوك': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'banking': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'قانون': { icon: 'fa-scale-balanced', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'law': { icon: 'fa-scale-balanced', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'تأمين': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'تامين': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'insurance': { icon: 'fa-shield-halved', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'تجارة': { icon: 'fa-store', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'commerce': { icon: 'fa-store', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'اعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'أعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'business': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'انجليزي': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'انجليزى': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'english': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' }
    };
    
    const DEFAULT_ICON = { icon: 'fa-book', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' };
    
    function getSubjectStyle(folderName) {
        const name = folderName.toLowerCase();
        
        for (const [key, value] of Object.entries(SUBJECT_MAPPINGS)) {
            if (name.includes(key)) {
                return value;
            }
        }
        
        return DEFAULT_ICON;
    }
    
    function addToFoldersCache(key, data) {
        if (cacheQueue.length >= MAX_CACHE_SIZE) {
            const oldKey = cacheQueue.shift();
            delete foldersDataCache[oldKey];
        }
        
        foldersDataCache[key] = data;
        if (!cacheQueue.includes(key)) {
            cacheQueue.push(key);
        }
    }
    
    function cleanup() {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
        
        if (pdfObserver) {
            pdfObserver.disconnect();
            pdfObserver = null;
        }
        
        isLoading = false;
        isLoadingFolderCounts = false;
    }
    
    App.Pages.lectures = function() {
        cleanup();
        
        const container = document.getElementById('lectures-container');
        const errorEl = document.getElementById('lectures-error');
        const breadcrumbEl = document.getElementById('lectures-breadcrumb');
        
        if (!foldersDataCache.initialized) {
            currentFolder = null;
            currentPath = [];
            allData = null;
            foldersDataCache = { initialized: true };
            cacheQueue = [];
        }
        
        fetchData();
        setupBackButtonSupport();
        
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
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        // ✅ دعم العمل بدون إنترنت
        function fetchData() {
            if (isLoading) {
                if (currentAbortController) {
                    currentAbortController.abort();
                }
            }
            
            isLoading = true;
            const folderId = currentFolder || App.GOOGLE_DRIVE.LECTURES_FOLDER_ID;
            const cacheKey = App.CACHE_KEYS.LECTURES_STRUCTURE + '_' + folderId;
            
            // ✅ التحقق من cache في الذاكرة
            if (foldersDataCache[folderId]) {
                allData = foldersDataCache[folderId];
                renderItems();
                updateBreadcrumb();
                isLoading = false;
                
                const folders = allData.filter(item => 
                    item.mimeType === 'application/vnd.google-apps.folder'
                );
                
                const missingCounts = folders.filter(f => folderFileCounts[f.id] === undefined);
                if (missingCounts.length > 0 && !isLoadingFolderCounts) {
                    fetchFolderFileCountsBatch(missingCounts);
                }
                
                return;
            }
            
            // ✅ التحقق من localStorage cache
            const cached = App.Cache.get(cacheKey);
            if (cached && !navigator.onLine) {
                allData = cached;
                addToFoldersCache(folderId, cached);
                renderItems();
                updateBreadcrumb();
                isLoading = false;
                
                App.Toast.info('البيانات محفوظة محلياً', 'غير متصل');
                
                if (errorEl) errorEl.classList.add('hidden');
                return;
            }
            
            showSkeleton();
            if (errorEl) errorEl.classList.add('hidden');
            
            currentAbortController = new AbortController();
            
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                `&orderBy=folder,name`;
            
            fetch(url, { signal: currentAbortController.signal })
                .then(response => {
                    if (!response.ok) throw new Error('Network error');
                    return response.json();
                })
                .then(data => {
                    allData = data.files || [];
                    addToFoldersCache(folderId, allData);
                    App.Cache.set(cacheKey, allData);
                    
                    renderItems();
                    updateBreadcrumb();
                    
                    const folders = allData.filter(item => 
                        item.mimeType === 'application/vnd.google-apps.folder'
                    );
                    
                    if (folders.length > 0) {
                        fetchFolderFileCountsBatch(folders);
                    }
                    
                    isLoading = false;
                    currentAbortController = null;
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        return;
                    }
                    
                    console.error('Error fetching lectures:', error);
                    
                    // ✅ استخدام cache إذا فشل الاتصال
                    if (cached) {
                        allData = cached;
                        addToFoldersCache(folderId, cached);
                        renderItems();
                        updateBreadcrumb();
                        
                        App.Toast.warning('تم تحميل البيانات المحفوظة', 'غير متصل');
                        
                        if (errorEl) errorEl.classList.add('hidden');
                    } else {
                        if (errorEl) errorEl.classList.remove('hidden');
                        container.innerHTML = '';
                    }
                    
                    isLoading = false;
                    currentAbortController = null;
                });
        }
        
        function fetchFolderFileCountsBatch(folders) {
            if (isLoadingFolderCounts) return;
            
            isLoadingFolderCounts = true;
            
            const foldersToFetch = folders.filter(f => folderFileCounts[f.id] === undefined);
            
            if (foldersToFetch.length === 0) {
                isLoadingFolderCounts = false;
                return;
            }
            
            const folderIds = foldersToFetch.map(f => f.id);
            
            App.API.fetchFoldersCounts(folderIds)
                .then(countsMap => {
                    Object.assign(folderFileCounts, countsMap);
                    updateFolderCounts();
                    isLoadingFolderCounts = false;
                })
                .catch(error => {
                    console.error('Error fetching folder counts:', error);
                    isLoadingFolderCounts = false;
                });
        }
        
        function updateFolderCounts() {
            const folderCards = container.querySelectorAll('.folder-card');
            folderCards.forEach(card => {
                const folderId = card.getAttribute('data-folder-id');
                const badge = card.querySelector('.file-count-badge');
                
                if (badge && folderFileCounts[folderId] !== undefined) {
                    const count = folderFileCounts[folderId];
                    badge.textContent = count;
                    badge.classList.remove('opacity-50', 'animate-pulse');
                }
            });
        }
        
        function renderItems() {
            if (!container || !allData) return;
            
            if (allData.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center py-20">
                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 animate-pulse">
                            <i class="fa-solid fa-inbox text-3xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-400 text-base font-medium">لا توجد ملفات</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">';
            
            allData.forEach(item => {
                const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                
                if (isFolder) {
                    html += renderFolderCard(item);
                } else {
                    html += renderFileCard(item);
                }
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            attachEventListeners();
            loadPDFPreviewsLazy();
            
            if (App.Effects && App.Effects.initScrollAnimations) {
                App.Effects.initScrollAnimations();
            }
        }
        
        function attachEventListeners() {
            const folderCards = container.querySelectorAll('.folder-card');
            folderCards.forEach(card => {
                const handler = function() {
                    const folderId = this.getAttribute('data-folder-id');
                    const folderName = this.getAttribute('data-folder-name');
                    currentFolder = folderId;
                    currentPath.push({ id: folderId, name: folderName });
                    
                    updateHistory();
                    fetchData();
                };
                
                card.addEventListener('click', handler);
                eventListeners.push({ element: card, event: 'click', handler });
            });
        }
        
        function renderFolderCard(item) {
            const style = getSubjectStyle(item.name);
            const fileCount = folderFileCounts[item.id];
            const hasCount = fileCount !== undefined;
            const countText = hasCount ? fileCount : '...';
            
            return `
                <div class="folder-card group cursor-pointer" data-folder-id="${item.id}" data-folder-name="${item.name}">
                    <div class="glass-panel rounded-xl p-3 hover:shadow-lg transition-all hover:-translate-y-1 border border-${style.color}-500/10 hover:border-${style.color}-500/30 h-full relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-11 h-11 rounded-lg bg-gradient-to-br from-${style.color}-500/30 to-${style.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-sm border border-${style.color}-500/20">
                                    <i class="fa-solid ${style.icon} text-lg text-${style.color}-400"></i>
                                </div>
                                <h3 class="font-bold text-xs group-hover:text-${style.color}-500 dark:group-hover:text-${style.color}-400 transition line-clamp-2 leading-tight flex-1">${item.name}</h3>
                            </div>
                            
                            <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-white/5">
                                <span class="flex items-center gap-1">
                                    <i class="fa-solid fa-folder-open"></i>
                                    مجلد
                                </span>
                                <span class="file-count-badge px-2 py-0.5 rounded-full bg-${style.color}-500/10 text-${style.color}-500 font-medium ${!hasCount ? 'opacity-50 animate-pulse' : ''}">${countText}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderFileCard(item) {
            const isVideo = item.mimeType && item.mimeType.indexOf('video') > -1;
            const isPDF = item.mimeType && item.mimeType.indexOf('pdf') > -1;
            const icon = isVideo ? 'fa-circle-play' : (isPDF ? 'fa-file-pdf' : 'fa-file');
            const iconColor = isVideo ? 'text-red-500' : (isPDF ? 'text-blue-500' : 'text-purple-500');
            const bgGradient = isVideo ? 'from-red-500/20 to-pink-500/20' : (isPDF ? 'from-blue-500/20 to-cyan-500/20' : 'from-purple-500/20 to-indigo-500/20');
            
            return `
                <div class="file-card group">
                    <div class="glass-panel rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col border border-white/10 hover:border-blue-500/30">
                        <div class="h-24 bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden pdf-preview-container" data-file-id="${item.id}" data-is-pdf="${isPDF}">
                            ${isPDF ? '<div class="pdf-preview-loader absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm"><i class="fa-solid fa-spinner animate-spin text-2xl text-blue-400"></i></div>' : ''}
                            <div class="pdf-preview-fallback">
                                <i class="fa-solid ${icon} text-4xl ${iconColor} opacity-30 group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            ${isPDF ? '<div class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-blue-500/90 text-white text-[9px] font-bold rounded-md shadow-lg">PDF</div>' : ''}
                            ${isVideo ? '<div class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-red-500/90 text-white text-[9px] font-bold rounded-md shadow-lg">VIDEO</div>' : ''}
                        </div>
                        <div class="p-2.5 flex-1 flex flex-col">
                            <h3 class="font-bold text-xs mb-2 line-clamp-2 min-h-[2rem] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition leading-tight">${item.name}</h3>
                            
                            <div class="flex gap-1.5 mt-auto">
                                <button class="flex-1 px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 text-[10px] font-medium transition-all flex items-center justify-center gap-1" onclick="window.open('${item.webViewLink}', '_blank')">
                                    <i class="fa-solid fa-eye text-[9px]"></i>
                                    عرض
                                </button>
                                ${item.webContentLink ? `
                                    <button class="px-2 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 text-[10px] transition-all" onclick="window.open('${item.webContentLink}', '_blank')">
                                        <i class="fa-solid fa-download text-[9px]"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function loadPDFPreviewsLazy() {
            const pdfContainers = container.querySelectorAll('.pdf-preview-container[data-is-pdf="true"]');
            
            if (pdfContainers.length === 0) return;
            
            pdfObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadSinglePDFPreview(entry.target);
                        pdfObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            pdfContainers.forEach(container => {
                pdfObserver.observe(container);
            });
        }
        
        function loadSinglePDFPreview(container) {
            const fileId = container.getAttribute('data-file-id');
            const loader = container.querySelector('.pdf-preview-loader');
            const fallback = container.querySelector('.pdf-preview-fallback');
            
            if (previewCache[fileId]) {
                showPreview(container, previewCache[fileId], loader, fallback);
                return;
            }
            
            const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
            
            const img = new Image();
            img.onload = function() {
                previewCache[fileId] = thumbnailUrl;
                showPreview(container, thumbnailUrl, loader, fallback);
            };
            img.onerror = function() {
                if (loader) loader.style.display = 'none';
            };
            img.src = thumbnailUrl;
        }
        
        function showPreview(container, imageUrl, loader, fallback) {
            if (loader) loader.style.display = 'none';
            if (fallback) fallback.style.display = 'none';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'w-full h-full object-cover opacity-0 transition-opacity duration-500';
            img.style.opacity = '0';
            
            container.appendChild(img);
            
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        }
        
        // ✅ Breadcrumb محسّن - أحجام متناسقة
        function updateBreadcrumb() {
            if (!breadcrumbEl) return;
            
            let breadcrumbHtml = `
                <button class="breadcrumb-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all hover:scale-105" data-nav="root">
                    <i class="fa-solid fa-house text-[10px]"></i>
                    <span>المحاضرات</span>
                </button>
            `;
            
            currentPath.forEach((item, index) => {
                breadcrumbHtml += `
                    <i class="fa-solid fa-chevron-left text-[10px] text-gray-400"></i>
                    <button class="breadcrumb-btn px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-105 truncate max-w-[150px]" data-nav="${index}">
                        ${item.name}
                    </button>
                `;
            });
            
            breadcrumbEl.innerHTML = breadcrumbHtml;
            
            const navBtns = breadcrumbEl.querySelectorAll('.breadcrumb-btn');
            navBtns.forEach(btn => {
                const handler = function() {
                    const nav = this.getAttribute('data-nav');
                    if (nav === 'root') {
                        currentFolder = null;
                        currentPath = [];
                    } else {
                        const index = parseInt(nav);
                        currentPath = currentPath.slice(0, index + 1);
                        currentFolder = currentPath[currentPath.length - 1].id;
                    }
                    updateHistory();
                    fetchData();
                };
                
                btn.addEventListener('click', handler);
                eventListeners.push({ element: btn, event: 'click', handler });
            });
        }
        
        function setupBackButtonSupport() {
            const popstateHandler = function(e) {
                if (currentPath.length > 0) {
                    e.preventDefault();
                    
                    currentPath.pop();
                    if (currentPath.length > 0) {
                        currentFolder = currentPath[currentPath.length - 1].id;
                    } else {
                        currentFolder = null;
                    }
                    
                    fetchData();
                }
            };
            
            window.addEventListener('popstate', popstateHandler);
            eventListeners.push({ 
                element: window, 
                event: 'popstate', 
                handler: popstateHandler 
            });
        }
        
        function updateHistory() {
            if (window.history && window.history.pushState) {
                const pathStr = currentPath.map(p => p.name).join(' > ');
                const title = pathStr || 'المحاضرات';
                window.history.pushState(
                    { 
                        page: 'lectures',
                        folder: currentFolder,
                        path: currentPath 
                    },
                    title,
                    '#lectures'
                );
            }
        }
    };
    
    // ✅ إصلاح زر إعادة المحاولة
    window.retryLecturesConnection = function() {
        const errorEl = document.getElementById('lectures-error');
        const container = document.getElementById('lectures-container');
        
        if (errorEl) errorEl.classList.add('hidden');
        
        App.Toast.info('جاري إعادة المحاولة...', 'انتظر');
        
        App.API.clearSessionCache('lectures');
        
        setTimeout(() => {
            App.Router.go('lectures', false, false);
        }, 500);
    };
    
})(window.App);