(function(App) {
    'use strict';
    
    let homeSwiperInstance = null;
    let statsChartInstance = null;
    
    App.Pages.home = function() {
        cleanup();
        
        // ── تهيئة بطاقة الترحيب (كانت inline scripts في index.html) ──
        initHeroCard();
        
        renderQuickAccess();
        fetchRecentFiles();
        fetchAndRenderRealStats();
        renderHomeNotifications();
        
        initHomeSwiper();
        
        const showAllBtn = document.getElementById('show-all-pages');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', function() {
                App.UI.Sidebar.toggle(true);
            });
        }
        
        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }
        
        App.Router.registerCleanup(cleanup);
    };
    
    function cleanup() {
        if (homeSwiperInstance) {
            homeSwiperInstance.destroy(true, true);
            homeSwiperInstance = null;
        }
        
        if (statsChartInstance) {
            statsChartInstance.destroy();
            statsChartInstance = null;
        }
    }

    // ── بطاقة الترحيب Hero Card ──────────────────────────────────────
    function initHeroCard() {
        const d = new Date();
        const h = d.getHours();

        const days   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                        'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

        // ── التاريخ ──────────────────────────────────────────────────
        const dateEl = document.getElementById('home-date');
        if (dateEl) {
            dateEl.textContent = days[d.getDay()] + '، '
                + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        }

        // ── اليوم ────────────────────────────────────────────────────
        const dayEl = document.getElementById('home-day-name');
        if (dayEl) dayEl.textContent = days[d.getDay()];

        // ── إيموجي + أيقونة + تصنيف الوقت ───────────────────────────
        const emojiEl     = document.getElementById('home-greeting-emoji');
        const timeIconEl  = document.getElementById('home-time-icon');
        const timeLabelEl = document.getElementById('home-time-label');

        let emoji, iconClass, iconColor, label;

        if      (h >= 5  && h < 12) { emoji = '🌅'; iconClass = 'fa-sun';       iconColor = 'text-yellow-400'; label = 'صباح النور';   }
        else if (h >= 12 && h < 17) { emoji = '☀️'; iconClass = 'fa-sun';       iconColor = 'text-orange-400'; label = 'وقت النشاط';   }
        else if (h >= 17 && h < 21) { emoji = '🌆'; iconClass = 'fa-cloud-sun'; iconColor = 'text-purple-400'; label = 'وقت المذاكرة'; }
        else                         { emoji = '🌙'; iconClass = 'fa-moon';      iconColor = 'text-blue-300';   label = 'دراسة ليلية';  }

        if (emojiEl)     emojiEl.textContent = emoji;
        if (timeIconEl)  timeIconEl.className = 'fa-solid ' + iconClass + ' text-sm ' + iconColor;
        if (timeLabelEl) timeLabelEl.textContent = label;

        // ── رسالة التحفيز (حسب يوم الأسبوع) ──────────────────────────
        const msgs = [
            'استغل يومك الجديد، كل درس تراجعه اليوم هو خطوة نحو النجاح. 💪',
            'الاثنين بداية الأسبوع — ضع أهدافك وابدأ قوياً! 🎯',
            'الثلاثاء الإنجاز — راجع محاضراتك وتقدّم خطوة إضافية. 📚',
            'منتصف الأسبوع! الالتزام هنا هو ما يفرّق المتميز عن غيره. ✅',
            'الخميس — استعد للأسبوع القادم وراجع كل ما أنجزته. 🔥',
            'الجمعة — مراجعة خفيفة تُثبّت المعلومات وتريح العقل. 🌟',
            'السبت — وقت مثالي للمذاكرة العميقة والتحضير الجيد. 🚀'
        ];
        const motivEl = document.getElementById('home-motivate');
        if (motivEl) motivEl.textContent = msgs[d.getDay()];
    }
    
    function renderQuickAccess() {
        const slidesContainer = document.getElementById('quick-access-slides');
        if (!slidesContainer) return;
        
        let slidesHtml = '';
        
        for (let i = 0; i < App.PAGES.length; i++) {
            const page = App.PAGES[i];
            const colorClass = page.color.replace('text-', '');
            
            slidesHtml += `
                <div class="swiper-slide">
                    <div data-page="${page.id}" class="quick-access-card h-28 glass-panel rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:-translate-y-1 transition-all border border-white/5 hover:border-${colorClass}-500/30 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br ${page.bg} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10 flex flex-col items-center gap-2">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${page.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-${colorClass}-500/20">
                                <i class="${page.icon} text-xl ${page.color}"></i>
                            </div>
                            <span class="text-xs font-bold text-center line-clamp-1 group-hover:text-${colorClass}-500 transition-colors">${page.title}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        slidesContainer.innerHTML = slidesHtml;
        
        const cards = slidesContainer.querySelectorAll('.quick-access-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                App.Router.go(pageId);
            });
        });
    }
    
    function fetchRecentFiles() {
        const recentList = document.getElementById('recent-files-list');
        if (!recentList) return;
        
        recentList.innerHTML = `
            <div class="space-y-2">
                ${Array(3).fill(0).map(() => `
                    <div class="glass-panel rounded-lg p-2.5 flex items-center gap-2.5 animate-pulse">
                        <div class="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/10"></div>
                        <div class="flex-1 space-y-1.5">
                            <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                            <div class="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                        </div>
                        <div class="w-4 h-4 bg-gray-200 dark:bg-white/10 rounded"></div>
                    </div>
                `).join('')}
            </div>
        `;
        
        Promise.all([
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures'),
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries')
        ])
        .then(([lecturesFiles, summariesFiles]) => {
            const allFiles = [...lecturesFiles, ...summariesFiles];
            allFiles.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
            const recentFiles = allFiles.slice(0, 3);
            
            renderRecentFilesList(recentFiles);
        })
        .catch(error => {
            console.error('Error fetching recent files:', error);
            recentList.innerHTML = `
                <div class="text-center py-6">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center mx-auto mb-3">
                        <i class="fa-solid fa-wifi-slash text-xl text-gray-400"></i>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">لا يوجد اتصال بالإنترنت</p>
                </div>
            `;
        });
    }
    
    function renderRecentFilesList(files) {
        const recentList = document.getElementById('recent-files-list');
        if (!recentList) return;
        
        if (files.length === 0) {
            recentList.innerHTML = `
                <div class="text-center py-6">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-3">
                        <i class="fa-solid fa-inbox text-xl text-gray-400"></i>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">لا توجد ملفات حديثة</p>
                </div>
            `;
            return;
        }
        
        let listHtml = '';
        
        files.forEach(file => {
            const isVideo = file.mimeType && file.mimeType.indexOf('video') > -1;
            const isPDF = file.mimeType && file.mimeType.indexOf('pdf') > -1;
            const icon = isVideo ? 'fa-circle-play' : (isPDF ? 'fa-file-pdf' : 'fa-file');
            const iconBg = isVideo ? 'from-red-500/20 to-pink-500/20' : (isPDF ? 'from-blue-500/20 to-cyan-500/20' : 'from-purple-500/20 to-indigo-500/20');
            const iconColor = isVideo ? 'text-red-500' : (isPDF ? 'text-blue-500' : 'text-purple-500');
            
            const sourceInfo = file.source === 'lectures' 
                ? { icon: 'fa-chalkboard-user', color: 'blue', label: 'محاضرات' }
                : { icon: 'fa-file-pen', color: 'cyan', label: 'ملخصات' };
            
            const subjectName = file.path && file.path.length > 0 ? file.path[0].name : 'غير محدد';
            
            listHtml += `
                <div class="group cursor-pointer" data-file-link="${file.webViewLink}">
                    <div class="glass-panel rounded-lg p-2.5 hover:shadow-lg transition-all border border-transparent hover:border-${sourceInfo.color}-500/30 hover:-translate-y-0.5">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <i class="fa-solid ${icon} text-base ${iconColor}"></i>
                            </div>
                            
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-xs line-clamp-1 mb-0.5 group-hover:text-${sourceInfo.color}-500 dark:group-hover:text-${sourceInfo.color}-400 transition-colors">
                                    ${file.name}
                                </h4>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[10px] text-${sourceInfo.color}-500/80 flex items-center gap-1">
                                        <i class="fa-solid ${sourceInfo.icon} text-[9px]"></i>
                                        ${subjectName}
                                    </span>
                                </div>
                            </div>
                            
                            <i class="fa-solid fa-arrow-up-right-from-square text-xs text-gray-400 group-hover:text-${sourceInfo.color}-500 transition-colors flex-shrink-0"></i>
                        </div>
                    </div>
                </div>
            `;
        });
        
        recentList.innerHTML = listHtml;
        
        recentList.querySelectorAll('[data-file-link]').forEach(el => {
            el.addEventListener('click', function() {
                const link = this.getAttribute('data-file-link');
                if (link) window.open(link, '_blank');
            });
        });
    }

    function fetchAndRenderRealStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        Promise.all([
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures'),
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries')
        ])
        .then(([lecturesFiles, summariesFiles]) => {
            renderStatsChart(lecturesFiles.length, summariesFiles.length);
        })
        .catch(() => {
            renderStatsChart(0, 0);
        });
    }

    function renderStatsChart(lecturesCount, summariesCount) {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const totalCount          = lecturesCount + summariesCount;
        const lecturesPercentage  = totalCount > 0 ? Math.round((lecturesCount  / totalCount) * 100) : 0;
        const summariesPercentage = totalCount > 0 ? Math.round((summariesCount / totalCount) * 100) : 0;

        statsContainer.innerHTML = `
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-cyan-400"></i> إحصائياتي
            </h3>
            <div class="flex flex-col items-center gap-4">
                <div class="relative w-32 h-32">
                    <canvas id="stats-chart" width="128" height="128"></canvas>
                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">${totalCount}</div>
                        <div class="text-[9px] text-gray-500 dark:text-gray-400 font-medium">إجمالي</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 w-full">
                    <div class="glass-panel p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group cursor-pointer" onclick="App.Router.go('lectures')">
                        <div class="flex items-center justify-between mb-2">
                            <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-chalkboard-user text-blue-500"></i>
                            </div>
                            <span class="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                                ${lecturesPercentage}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">${lecturesCount}</div>
                        <div class="text-[10px] text-gray-600 dark:text-gray-400 font-medium">محاضرات</div>
                    </div>
                    
                    <div class="glass-panel p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group cursor-pointer" onclick="App.Router.go('summaries')">
                        <div class="flex items-center justify-between mb-2">
                            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-file-pen text-cyan-500"></i>
                            </div>
                            <span class="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold">
                                ${summariesPercentage}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">${summariesCount}</div>
                        <div class="text-[10px] text-gray-600 dark:text-gray-400 font-medium">ملخصات</div>
                    </div>
                </div>
            </div>
        `;
        
        const canvas = document.getElementById('stats-chart');
        if (!canvas || !window.Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        statsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['المحاضرات', 'الملخصات'],
                datasets: [{
                    data: [lecturesCount, summariesCount],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(6, 182, 212, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.95)',
                        padding: 12,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    function renderHomeNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        fetch(App.GITHUB.NOTIFICATIONS_URL)
            .then(response => response.json())
            .then(data => {
                App.Cache.set(App.CACHE_KEYS.NOTIFICATIONS, data);
                renderNotificationsList(data.slice(0, 3));
                // ── تحديث عداد الإشعارات غير المقروءة في الهيدر ──────────
                const unreadCount = Array.isArray(data)
                    ? data.filter(n => !n.read).length
                    : 0;
                if (App.UI.updateNotifBadge) App.UI.updateNotifBadge(unreadCount);
            })
            .catch(error => {
                const cached = App.Cache.get(App.CACHE_KEYS.NOTIFICATIONS);
                if (cached) {
                    renderNotificationsList(cached.slice(0, 3));
                    const unreadCount = Array.isArray(cached)
                        ? cached.filter(n => !n.read).length
                        : 0;
                    if (App.UI.updateNotifBadge) App.UI.updateNotifBadge(unreadCount);
                } else {
                    notificationsList.innerHTML = '<div class="text-center py-4 text-gray-400 text-xs">لا توجد إشعارات</div>';
                }
            });
    }
    
    function renderNotificationsList(notifications) {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        let notifHtml = '';
        
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
            
            notifHtml += `
                <div class="glass-panel rounded-xl p-3 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 border border-transparent hover:border-${notif.color}-500/30" onclick="App.Router.go('notifications')">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-lg bg-${notif.color}-500/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <i class="fa-solid ${notif.icon} ${notif.color}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-sm truncate mb-1">${notif.title}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">${notif.message}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        notificationsList.innerHTML = notifHtml;
    }
    
    function initHomeSwiper() {
        const swiperEl = document.querySelector('.mySwiper');
        if (!swiperEl) return;
        
        homeSwiperInstance = new Swiper('.mySwiper', {
            slidesPerView: 2.5,
            spaceBetween: 10,
            freeMode: true,
            grabCursor: true,
            breakpoints: {
                640: { slidesPerView: 3.5, spaceBetween: 12 },
                768: { slidesPerView: 4.5, spaceBetween: 14 },
                1024: { slidesPerView: 6, spaceBetween: 16 }
            }
        });
    }
    
})(window.App);