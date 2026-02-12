(function(App) {
    'use strict';
    
    let currentFolder = null;
    let currentPath = [];
    let allData = null;
    let previewCache = {};
    let folderFileCounts = {};
    let isLoadingFolderCounts = false;
    let eventListeners = [];
    let pdfObserver = null;
    
    const SUBJECT_MAPPINGS = {
        'محاسبة': { icon: 'fa-file-invoice', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'محاسبه': { icon: 'fa-file-invoice', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'accounting': { icon: 'fa-file-invoice', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-600/20' },
        'اقتصاد': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'economics': { icon: 'fa-chart-line', color: 'blue', gradient: 'from-blue-500/20 to-cyan-600/20' },
        'إحصاء': { icon: 'fa-chart-simple', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'احصاء': { icon: 'fa-chart-simple', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'statistics': { icon: 'fa-chart-simple', color: 'purple', gradient: 'from-purple-500/20 to-violet-600/20' },
        'إدارة': { icon: 'fa-sitemap', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'اداره': { icon: 'fa-sitemap', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'ادارة': { icon: 'fa-sitemap', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'management': { icon: 'fa-sitemap', color: 'amber', gradient: 'from-amber-500/20 to-orange-600/20' },
        'تسويق': { icon: 'fa-megaphone', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'marketing': { icon: 'fa-megaphone', color: 'rose', gradient: 'from-rose-500/20 to-pink-600/20' },
        'مالية': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'ماليه': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'finance': { icon: 'fa-money-bill-trend-up', color: 'yellow', gradient: 'from-yellow-500/20 to-amber-600/20' },
        'بنوك': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'banking': { icon: 'fa-building-columns', color: 'indigo', gradient: 'from-indigo-500/20 to-blue-600/20' },
        'قانون': { icon: 'fa-gavel', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'law': { icon: 'fa-gavel', color: 'slate', gradient: 'from-slate-500/20 to-gray-600/20' },
        'تأمين': { icon: 'fa-shield', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'تامين': { icon: 'fa-shield', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'insurance': { icon: 'fa-shield', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' },
        'تجارة': { icon: 'fa-shop', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'commerce': { icon: 'fa-shop', color: 'orange', gradient: 'from-orange-500/20 to-red-600/20' },
        'اعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'أعمال': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'business': { icon: 'fa-handshake', color: 'teal', gradient: 'from-teal-500/20 to-cyan-600/20' },
        'انجليزي': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'انجليزى': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' },
        'english': { icon: 'fa-language', color: 'sky', gradient: 'from-sky-500/20 to-blue-600/20' }
    };
    
    const DEFAULT_ICON = { icon: 'fa-file-lines', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-600/20' };
    
    function getSubjectStyle(folderName) {
        const name = folderName.toLowerCase();
        
        for (const [key, value] of Object.entries(SUBJECT_MAPPINGS)) {
            if (name.includes(key)) {
                return value;
            }
        }
        
        return DEFAULT_ICON;
    }
    
    function cleanup() {
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
    }
    
    App.Pages.summaries = function() {
        cleanup();
        
        const container = document.getElementById('summaries-container');
        const errorEl = document.getElementById('summaries-error');
        const breadcrumbEl = document.getElementById('summaries-breadcrumb');
        
        const statsContainer = document.getElementById('summaries-stats');
        if (statsContainer) {
            statsContainer.style.display = 'none';
        }
        
        currentFolder = null;
        currentPath = [];
        allData = null;
        folderFileCounts = {};
        
        fetchData();
        
        // ✅ إضافة دعم زر الرجوع في المتصفح
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
        
        function fetchData() {
            showSkeleton();
            if (errorEl) errorEl.classList.add('hidden');
            
            const folderId = currentFolder || App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID;
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                `&orderBy=folder,name`;
            
            const cacheKey = App.CACHE_KEYS.SUMMARIES_STRUCTURE + '_' + folderId;
            
            App.API.fetchWithCache(url, cacheKey)
                .then(result => {
                    allData = result.data.files || [];
                    renderItems();
                    updateBreadcrumb();
                    
                    const folders = allData.filter(item => 
                        item.mimeType === 'application/vnd.google-apps.folder'
                    );
                    
                    if (folders.length > 0) {
                        fetchFolderFileCountsBatch(folders);
                    }
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
                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 animate-pulse">
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
                    
                    // ✅ تحديث الـ history للسماح بالرجوع
                    updateHistory();
                    
                    fetchData();
                };
                
                card.addEventListener('click', handler);
                eventListeners.push({ element: card, event: 'click', handler });
            });
        }
        
        // ✅ كارت المادة المحسّن - الاسم بجانب الأيقونة
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
            const isPDF = item.mimeType && item.mimeType.indexOf('pdf') > -1;
            const isDoc = item.mimeType && (item.mimeType.indexOf('document') > -1 || item.mimeType.indexOf('word') > -1);
            const icon = isPDF ? 'fa-file-pdf' : (isDoc ? 'fa-file-word' : 'fa-file-lines');
            const iconColor = isPDF ? 'text-red-500' : (isDoc ? 'text-blue-500' : 'text-cyan-500');
            const bgGradient = isPDF ? 'from-red-500/20 to-pink-500/20' : (isDoc ? 'from-blue-500/20 to-indigo-500/20' : 'from-cyan-500/20 to-teal-500/20');
            
            return `
                <div class="file-card group">
                    <div class="glass-panel rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col border border-white/10 hover:border-cyan-500/30">
                        <div class="h-24 bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden pdf-preview-container" data-file-id="${item.id}" data-is-pdf="${isPDF}">
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
                                <button class="flex-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-500 text-[10px] font-medium transition-all flex items-center justify-center gap-1" onclick="window.open('${item.webViewLink}', '_blank')">
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
        
        // ✅ تحسين الـ Breadcrumb
        function updateBreadcrumb() {
            if (!breadcrumbEl) return;
            
            let breadcrumbHtml = `
                <button class="breadcrumb-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-all hover:scale-105 flex items-center gap-1.5" data-nav="root">
                    <i class="fa-solid fa-house text-[10px]"></i>
                    الملخصات
                </button>
            `;
            
            currentPath.forEach((item, index) => {
                breadcrumbHtml += `
                    <i class="fa-solid fa-chevron-left text-[10px] text-gray-400"></i>
                    <button class="breadcrumb-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-105" data-nav="${index}">
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
        
        // ✅ دعم زر الرجوع في المتصفح/الهاتف
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
                const title = pathStr || 'الملخصات';
                window.history.pushState(
                    { 
                        page: 'summaries',
                        folder: currentFolder,
                        path: currentPath 
                    },
                    title,
                    '#summaries'
                );
            }
        }
    };
    
})(window.App);