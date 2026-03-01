(function (App) {
    'use strict';

    let homeSwiperInstance = null;
    let statsChartInstance = null;
    let clockTickId = null;

    App.Pages.home = function () {
        cleanup();
        initHeroCard();
        renderQuickAccess();
        fetchRecentFiles();
        fetchAndRenderRealStats();
        renderHomeNotifications();
        initHomeSwiper();

        const showAllBtn = document.getElementById('show-all-pages');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', function () {
                App.UI.Sidebar.toggle(true);
            });
        }

        if (App.Effects && App.Effects.refresh) App.Effects.refresh();
        App.Router.registerCleanup(cleanup);
    };

    function cleanup() {
        if (homeSwiperInstance) { homeSwiperInstance.destroy(true, true); homeSwiperInstance = null; }
        if (statsChartInstance) { statsChartInstance.destroy(); statsChartInstance = null; }
        if (clockTickId) { clearTimeout(clockTickId); clockTickId = null; }
    }




    // ─── Hero Card Live Clock ───────────────────────────────────────────────────
    // يعمل بـ setTimeout متزامن مع بداية كل دقيقة الحقيقية على الجهاز
    // بدلاً من setInterval الذي يتأخر تراكمياً بمرور الوقت

    const HERO_DAYS   = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const HERO_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                         'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const HERO_MSGS   = [
        'استغل يومك، كل درس تراجعه هو خطوة نحو النجاح. 💪',
        'الاثنين بداية الأسبوع — ابدأ قوياً وضع أهدافك! 🎯',
        'الثلاثاء الإنجاز — راجع محاضراتك وتقدّم خطوة إضافية. 📚',
        'منتصف الأسبوع! الالتزام هنا هو ما يُفرّق المتميز. ✅',
        'الخميس — راجع كل ما أنجزته هذا الأسبوع. 🔥',
        'الجمعة — مراجعة خفيفة تُثبّت المعلومات وتريح العقل. 🌟',
        'السبت — وقت مثالي للمذاكرة العميقة والتحضير. 🚀',
    ];

    function renderHeroClock() {
        const d    = new Date();
        const h    = d.getHours();
        const mins = d.getMinutes();
        const h12  = h % 12 || 12;
        const period = h < 12 ? 'ص' : 'م';

        let iconClass, iconColor, label, greeting;
        if      (h >=  5 && h < 12) { iconClass = 'fa-sun';       iconColor = 'text-yellow-400'; label = 'صباح النور';    greeting = 'صباح الخير';   }
        else if (h >= 12 && h < 17) { iconClass = 'fa-sun';       iconColor = 'text-orange-400'; label = 'وقت النشاط';    greeting = 'مرحباً';        }
        else if (h >= 17 && h < 21) { iconClass = 'fa-cloud-sun'; iconColor = 'text-purple-400'; label = 'وقت المذاكرة'; greeting = 'أهلاً وسهلاً'; }
        else                         { iconClass = 'fa-moon';      iconColor = 'text-blue-300';   label = 'دراسة ليلية';   greeting = 'ليلة نشاط';    }

        // ── تحديث التاريخ ──
        const dateEl = document.getElementById('home-date');
        if (dateEl) {
            dateEl.textContent =
                `${HERO_DAYS[d.getDay()]}، ${d.getDate()} ${HERO_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        }

        // ── تحديث التحية (فقط عند تغيّر الفترة) ──
        const greetingEl = document.getElementById('home-greeting-text');
        if (greetingEl && greetingEl.textContent !== greeting) {
            greetingEl.textContent = greeting;
        }

        // ── تحديث الأيقونة والتسمية (فقط عند تغيّر الفترة) ──
        const timeIconEl  = document.getElementById('home-time-icon');
        const timeLabelEl = document.getElementById('home-time-label');
        if (timeIconEl) {
            const newClass = `fa-solid ${iconClass} ${iconColor}`;
            if (timeIconEl.className !== newClass) timeIconEl.className = newClass;
        }
        if (timeLabelEl && timeLabelEl.textContent !== label) {
            timeLabelEl.textContent = label;
        }

        // ── تحديث الوقت ──
        const timeValEl = document.getElementById('home-time-value');
        if (timeValEl) {
            timeValEl.textContent = `${h12}:${String(mins).padStart(2, '0')} ${period}`;
        }

        // ── تحديث رسالة التحفيز (مرة واحدة عند الدقيقة 0) ──
        const motivEl = document.getElementById('home-motivate');
        if (motivEl && mins === 0) {
            motivEl.textContent = HERO_MSGS[d.getDay()];
        } else if (motivEl && !motivEl.textContent) {
            motivEl.textContent = HERO_MSGS[d.getDay()];
        }

        // ── جدولة النبضة القادمة عند بداية الدقيقة التالية بالضبط ──
        const msUntilNextMinute = (60 - d.getSeconds()) * 1000 - d.getMilliseconds();
        clockTickId = setTimeout(renderHeroClock, msUntilNextMinute);
    }

    function initHeroCard() {
        // عرض فوري ثم تشغيل الساعة الحية
        renderHeroClock();
    }




    function renderQuickAccess() {
        const slidesContainer = document.getElementById('quick-access-slides');
        if (!slidesContainer) return;

        let html = '';
        for (let i = 0; i < App.PAGES.length; i++) {
            const page = App.PAGES[i];
            const c = page.color.replace('text-', '');
            html += `
                <div class="swiper-slide">
                    <div data-page="${page.id}"
                         class="quick-card glass-panel rounded-2xl p-0 cursor-pointer group
                                transition-all duration-200 border border-white/5
                                hover:border-${c}-500/25 hover:-translate-y-1 relative overflow-hidden h-[100px]">
                        <!-- hover glow -->
                        <div class="absolute inset-0 bg-gradient-to-br ${page.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <!-- top accent line -->
                        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${page.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div class="relative z-10 h-full flex flex-col items-center justify-center gap-2.5 p-3">
                            <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${page.bg}
                                        flex items-center justify-center
                                        group-hover:scale-110 transition-transform duration-200
                                        shadow-sm border border-${c}-500/15">
                                <i class="${page.icon} text-lg ${page.color}"></i>
                            </div>
                            <span class="text-[11px] font-bold text-center leading-tight
                                         text-gray-700 dark:text-gray-300
                                         group-hover:text-${c}-500 dark:group-hover:text-${c}-400
                                         transition-colors">${page.title}</span>
                        </div>
                    </div>
                </div>`;
        }
        slidesContainer.innerHTML = html;
        slidesContainer.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', () => App.Router.go(el.getAttribute('data-page')));
        });
    }




    function fetchRecentFiles() {
        const el = document.getElementById('recent-files-list');
        if (!el) return;

        el.innerHTML = buildRecentSkeleton();

        const isMobile = () => window.innerWidth < 768;
        const limit = () => isMobile() ? 3 : 4;


        const cl = App.Cache.get ? App.Cache.get('lectures_files') : null;
        const cs = App.Cache.get ? App.Cache.get('summaries_files') : null;
        if (cl && cs) {
            const all = [...cl, ...cs].sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
            renderRecentFilesList(all.slice(0, limit()));
        }

        Promise.all([
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures'),
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries')
        ])
            .then(([lf, sf]) => {
                const all = [...lf, ...sf].sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
                renderRecentFilesList(all.slice(0, limit()));
            })
            .catch(() => {
                if (!cl && !cs) {
                    el.innerHTML = `
                    <div class="flex flex-col items-center py-6 gap-3 text-center">
                        <div class="relative">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/[0.02]
                                        border border-slate-200 dark:border-white/8
                                        flex items-center justify-center shadow-sm">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-slate-400 dark:text-slate-500">
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
                        <div class="space-y-1">
                            <p class="text-sm font-bold text-gray-700 dark:text-gray-200">لا يوجد اتصال بالإنترنت</p>
                            <p class="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed max-w-[200px]">
                                تحقق من الاتصال وأعد تحميل الصفحة
                            </p>
                        </div>
                        <button onclick="window.location.reload()"
                                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold
                                       bg-blue-500/10 hover:bg-blue-500/18 text-blue-500
                                       border border-blue-500/20 hover:border-blue-500/35
                                       transition-all duration-200 active:scale-95">
                            <i class="fa-solid fa-rotate-right text-[10px]"></i>
                            إعادة المحاولة
                        </button>
                    </div>`;
                }
            });
    }

    function buildRecentSkeleton() {
        return `<div class="space-y-1">${Array(3).fill(0).map((_, i) => `
            <div class="flex items-center gap-3 px-2 py-2.5 rounded-xl" style="animation-delay:${i * 70}ms">
                <div class="w-9 h-9 rounded-xl flex-shrink-0" style="
                    background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                    background-size:200% 100%; animation:skeleton-wave 1.5s ease-in-out infinite; animation-delay:${i * 70}ms;"></div>
                <div class="flex-1 space-y-1.5">
                    <div class="h-3 rounded-md" style="width:${60 + i * 10}%;background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 70}ms;"></div>
                    <div class="h-2.5 rounded-md" style="width:40%;background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 70 + 80}ms;"></div>
                </div>
            </div>`).join('')}</div>`;
    }

    function renderRecentFilesList(files) {
        const el = document.getElementById('recent-files-list');
        if (!el) return;

        if (!files || files.length === 0) {
            el.innerHTML = `<div class="flex flex-col items-center py-6 gap-1.5">
                <i class="fa-solid fa-inbox text-2xl text-gray-300 dark:text-gray-600"></i>
                <p class="text-xs text-gray-400">لا توجد ملفات حديثة</p></div>`;
            return;
        }

        const now = new Date();
        let html = '';
        files.forEach((file, idx) => {
            const isVideo = file.mimeType && file.mimeType.includes('video');
            const isPDF = file.mimeType && file.mimeType.includes('pdf');
            let icon, iconBg, iconColor;
            if (isVideo) { icon = 'fa-circle-play'; iconBg = 'from-red-500/15 to-pink-500/15'; iconColor = 'text-red-400'; }
            else if (isPDF) { icon = 'fa-file-pdf'; iconBg = 'from-blue-500/15 to-cyan-500/15'; iconColor = 'text-blue-400'; }
            else { icon = 'fa-file-lines'; iconBg = 'from-violet-500/15 to-indigo-500/15'; iconColor = 'text-violet-400'; }

            const src = file.source === 'lectures'
                ? { icon: 'fa-chalkboard-user', color: 'blue', label: 'محاضرات' }
                : { icon: 'fa-file-pen', color: 'cyan', label: 'ملخصات' };

            const subject = file.path && file.path.length > 0 ? file.path[0].name : '';


            let ago = '';
            if (file.modifiedTime) {
                const diff = now - new Date(file.modifiedTime);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                if (hours < 1) ago = 'الآن';
                else if (hours < 24) ago = `${hours}س`;
                else if (days < 7) ago = `${days}ي`;
                else ago = new Date(file.modifiedTime).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            }

            const isNew = file.modifiedTime && (now - new Date(file.modifiedTime)) < 48 * 3600000;

            html += `
                <div class="group flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer
                            hover:bg-${src.color}-500/5 border border-transparent
                            hover:border-${src.color}-500/15 transition-all duration-150"
                     data-link="${file.webViewLink || '#'}"
                     style="animation:fadeInUp 0.25s ease-out ${idx * 50}ms both;">
                    <div class="relative flex-shrink-0">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center
                                    group-hover:scale-105 transition-transform shadow-sm">
                            <i class="fa-solid ${icon} text-sm ${iconColor}"></i>
                        </div>
                        ${isNew ? `<span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-gray-900"></span>` : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-800 dark:text-gray-100
                                group-hover:text-${src.color}-500 dark:group-hover:text-${src.color}-400
                                transition-colors truncate leading-snug">${file.name}</p>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="text-[10px] text-${src.color}-500/70 flex items-center gap-1">
                                <i class="fa-solid ${src.icon} text-[8px]"></i>${subject || src.label}
                            </span>
                            ${ago ? `<span class="text-[9px] text-gray-300 dark:text-gray-600">·</span><span class="text-[10px] text-gray-400">${ago}</span>` : ''}
                        </div>
                    </div>
                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-300
                            group-hover:text-${src.color}-400 transition-colors flex-shrink-0"></i>
                </div>`;
        });

        el.innerHTML = html;
        el.querySelectorAll('[data-link]').forEach(row => {
            row.addEventListener('click', () => {
                const link = row.getAttribute('data-link');
                if (link && link !== '#') window.open(link, '_blank');
            });
        });
    }




    function fetchAndRenderRealStats() {
        const container = document.getElementById('stats-container');
        if (!container) return;

        showStatsSkeleton(container);

        const cl = App.Cache.get ? App.Cache.get('lectures_files') : null;
        const cs = App.Cache.get ? App.Cache.get('summaries_files') : null;
        if (cl && cs) renderStatsChart(cl.length, cs.length, true);

        Promise.all([
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures'),
            App.API.fetchFilesWithPath(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries')
        ])
            .then(([lf, sf]) => renderStatsChart(lf.length, sf.length, false))
            .catch(() => { if (!cl && !cs) renderStatsChart(0, 0, false); });
    }

    function showStatsSkeleton(c) {
        c.innerHTML = `
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-chart-pie text-cyan-400 text-[11px]"></i></span>
                إحصائياتي
            </h3>
            <div class="flex flex-col items-center gap-3">
                <div class="w-24 h-24 rounded-full" style="
                    -webkit-mask:radial-gradient(farthest-side,transparent 62%,black 63%);
                    mask:radial-gradient(farthest-side,transparent 62%,black 63%);
                    background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                    background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div>
                <div class="grid grid-cols-2 gap-2.5 w-full">
                    ${Array(2).fill(0).map(() => `
                        <div class="h-20 rounded-xl" style="
                            background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                            background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div>
                    `).join('')}
                </div>
            </div>`;
    }

    function renderStatsChart(lCount, sCount, isCached) {
        const container = document.getElementById('stats-container');
        if (!container) return;
        if (statsChartInstance) { statsChartInstance.destroy(); statsChartInstance = null; }

        const total = lCount + sCount;
        const lPct = total > 0 ? Math.round((lCount / total) * 100) : 0;
        const sPct = total > 0 ? Math.round((sCount / total) * 100) : 0;

        container.innerHTML = `
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-chart-pie text-cyan-400 text-[11px]"></i></span>
                إحصائياتي
            </h3>
            <div class="flex flex-col items-center gap-3">
                <div class="relative w-24 h-24">
                    <canvas id="stats-chart" width="96" height="96"></canvas>
                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">${total}</span>
                        <span class="text-[9px] text-gray-400 font-medium">ملف</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2.5 w-full">
                    <div class="glass-panel p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-600/8
                                border border-blue-500/15 hover:border-blue-500/30 transition-all cursor-pointer group"
                         onclick="App.Router.go('lectures')">
                        <div class="flex items-center justify-between mb-1.5">
                            <div class="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center
                                        group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-chalkboard-user text-blue-500 text-xs"></i>
                            </div>
                            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-bold">${lPct}%</span>
                        </div>
                        <div class="text-xl font-black text-blue-500 leading-none">${lCount}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5">محاضرات</div>
                        <div class="mt-2 h-1 bg-blue-500/10 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full" style="width:${lPct}%"></div>
                        </div>
                    </div>
                    <div class="glass-panel p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-cyan-600/8
                                border border-cyan-500/15 hover:border-cyan-500/30 transition-all cursor-pointer group"
                         onclick="App.Router.go('summaries')">
                        <div class="flex items-center justify-between mb-1.5">
                            <div class="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center
                                        group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-file-pen text-cyan-500 text-xs"></i>
                            </div>
                            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 font-bold">${sPct}%</span>
                        </div>
                        <div class="text-xl font-black text-cyan-500 leading-none">${sCount}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5">ملخصات</div>
                        <div class="mt-2 h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                            <div class="h-full bg-cyan-500 rounded-full" style="width:${sPct}%"></div>
                        </div>
                    </div>
                </div>
            </div>`;

        const canvas = document.getElementById('stats-chart');
        if (!canvas || !window.Chart) return;

        statsChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['المحاضرات', 'الملخصات'],
                datasets: [{
                    data: total > 0 ? [lCount, sCount] : [1, 1],
                    backgroundColor: total > 0
                        ? ['rgba(59,130,246,0.85)', 'rgba(6,182,212,0.85)']
                        : ['rgba(100,116,139,0.15)', 'rgba(100,116,139,0.08)'],
                    borderColor: total > 0
                        ? ['rgba(59,130,246,1)', 'rgba(6,182,212,1)']
                        : ['rgba(100,116,139,0.2)', 'rgba(100,116,139,0.1)'],
                    borderWidth: 2,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: true, cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: total > 0,
                        backgroundColor: 'rgba(15,23,42,0.95)',
                        padding: 8,
                        borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
                        titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.75)',
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.parsed} (${total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0}%)`
                        }
                    }
                },
                animation: { animateRotate: !isCached, animateScale: !isCached, duration: isCached ? 0 : 800, easing: 'easeInOutQuart' }
            }
        });
    }




    function renderHomeNotifications() {
        const el = document.getElementById('notifications-list');
        if (!el) return;

        el.innerHTML = buildNotifSkeleton();


        const cached = App.Cache.get ? App.Cache.get(App.CACHE_KEYS.NOTIFICATIONS) : null;
        if (cached && cached.length) {
            const sortedCached = [...cached].sort((a, b) => {
                const ta = new Date(a.timestamp || a.date || a.createdAt || 0);
                const tb = new Date(b.timestamp || b.date || b.createdAt || 0);
                return tb - ta;
            });
            renderNotificationsList(sortedCached.slice(0, 3));
            updateUnreadBadge(cached);
        }

        fetch(App.GITHUB.NOTIFICATIONS_URL)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                if (App.Cache.set) App.Cache.set(App.CACHE_KEYS.NOTIFICATIONS, data);
                const sortedData = [...data].sort((a, b) => {
                    const ta = new Date(a.timestamp || a.date || a.createdAt || 0);
                    const tb = new Date(b.timestamp || b.date || b.createdAt || 0);
                    return tb - ta;
                });
                renderNotificationsList(sortedData.slice(0, 3));
                updateUnreadBadge(data);
            })
            .catch(() => {
                if (!cached || !cached.length) {
                    el.innerHTML = `
                        <div class="flex flex-col items-center py-6 gap-3 text-center">
                            <div class="relative">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/[0.02]
                                            border border-slate-200 dark:border-white/8
                                            flex items-center justify-center shadow-sm">
                                    <i class="fa-regular fa-bell-slash text-lg text-slate-400 dark:text-slate-500"></i>
                                </div>
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full
                                             bg-amber-400 border-2 border-white dark:border-gray-900
                                             flex items-center justify-center">
                                    <i class="fa-solid fa-exclamation text-[7px] text-white font-black"></i>
                                </span>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-gray-700 dark:text-gray-200">تعذّر تحميل الإشعارات</p>
                                <p class="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                    لا يوجد اتصال بالإنترنت حالياً
                                </p>
                            </div>
                        </div>`;
                }
            });
    }

    function buildNotifSkeleton() {
        return `<div class="space-y-1">${Array(3).fill(0).map((_, i) => `
            <div class="flex items-start gap-3 px-2 py-2.5 rounded-xl" style="animation-delay:${i * 70}ms">
                <div class="w-8 h-8 rounded-xl flex-shrink-0" style="
                    background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);
                    background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 70}ms;"></div>
                <div class="flex-1 pt-0.5 space-y-1.5">
                    <div class="h-3 rounded" style="width:60%;background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 70}ms;"></div>
                    <div class="h-2.5 rounded" style="width:85%;background-image:linear-gradient(90deg,var(--skeleton-base) 25%,var(--skeleton-highlight) 50%,var(--skeleton-base) 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;animation-delay:${i * 70 + 80}ms;"></div>
                </div>
            </div>`).join('')}</div>`;
    }

    function updateUnreadBadge(data) {
        const count = Array.isArray(data) ? data.filter(n => !n.read).length : 0;

        const dot = document.getElementById('hero-notif-dot');
        if (dot) dot.classList.toggle('hidden', count === 0);

        if (App.UI.updateNotifBadge) App.UI.updateNotifBadge(count);
    }

    function renderNotificationsList(notifications) {
        const el = document.getElementById('notifications-list');
        if (!el) return;

        if (!notifications || !notifications.length) {
            el.innerHTML = `<div class="flex flex-col items-center py-5 gap-1.5">
                <i class="fa-regular fa-bell text-xl text-gray-300 dark:text-gray-600"></i>
                <p class="text-xs text-gray-400">لا توجد إشعارات جديدة</p></div>`;
            return;
        }

        const now = new Date();
        let html = '';

        notifications.forEach((notif, idx) => {
            const color = notif.color || 'blue';
            const icon = notif.icon || 'fa-bell';
            const isRead = notif.read === true;


            let ago = '';
            const ts = notif.timestamp || notif.date || notif.createdAt;
            if (ts) {
                const d = new Date(ts);
                const diff = now - d;
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                if (mins < 1) ago = 'الآن';
                else if (mins < 60) ago = `${mins} دقيقة`;
                else if (hours < 24) ago = `${hours} ساعة`;
                else if (days < 7) ago = `${days > 1 ? days + ' أيام' : 'أمس'}`;
                else ago = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            }


            const catMap = {
                'lecture': 'محاضرة', 'lectures': 'محاضرة', 'محاضرة': 'محاضرة', 'محاضرات': 'محاضرة',
                'summary': 'ملخص', 'summaries': 'ملخص', 'ملخص': 'ملخص', 'ملخصات': 'ملخص',
                'schedule': 'جدول', 'schedules': 'جدول', 'جدول': 'جدول', 'جداول': 'جدول',
                'building': 'مبنى', 'buildings': 'مبنى', 'مبنى': 'مبنى', 'مباني': 'مبنى',
                'video': 'فيديو', 'videos': 'فيديو', 'فيديو': 'فيديو', 'فيديوهات': 'فيديو',
                'link': 'رابط', 'links': 'رابط', 'رابط': 'رابط', 'روابط': 'رابط',
                'exam': 'اختبار', 'exams': 'اختبار', 'اختبار': 'اختبار', 'اختبارات': 'اختبار',
                'update': 'تحديث', 'updates': 'تحديث', 'تحديث': 'تحديث', 'تحديثات': 'تحديث',
                'news': 'أخبار', 'أخبار': 'أخبار', 'خبر': 'أخبار',
                'urgent': 'عاجل', 'عاجل': 'عاجل',
                'general': 'عام', 'عام': 'عام',
                'content': 'محتوى',
                'maintenance': 'صيانة',
                'fix': 'إصلاح',
                'tips': 'نصائح',
            };
            const catKey = (notif.category || notif.type || '').toLowerCase();
            const catAr = catMap[catKey] || notif.category || notif.type || null;

            html += `
                <div class="group flex items-start gap-3 px-2 py-2.5 rounded-xl cursor-pointer
                            hover:bg-${color}-500/5 border border-transparent
                            hover:border-${color}-500/15 transition-all duration-150 relative
                            ${isRead ? 'opacity-70' : ''}"
                     onclick="App.Router.go('notifications')"
                     style="animation:fadeInUp 0.25s ease-out ${idx * 50}ms both;">
                    ${!isRead ? `<span class="absolute top-3 left-2 w-1.5 h-1.5 rounded-full bg-${color}-500 flex-shrink-0"></span>` : ''}
                    <div class="w-8 h-8 rounded-xl bg-${color}-500/10 border border-${color}-500/10
                                flex items-center justify-center flex-shrink-0
                                group-hover:bg-${color}-500/20 transition-all">
                        <i class="fa-solid ${icon} text-${color}-500 text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0 pt-0.5">
                        <div class="flex items-center gap-2 mb-0.5">
                            <p class="text-xs font-bold text-gray-800 dark:text-gray-100
                                       group-hover:text-${color}-500 dark:group-hover:text-${color}-400
                                       transition-colors truncate flex-1">${notif.title || 'إشعار'}</p>
                            ${ago ? `<span class="text-[9px] text-gray-400 flex-shrink-0">${ago}</span>` : ''}
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">${notif.message || notif.body || ''}</p>
                        ${catAr ? `<span class="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-${color}-500/10 text-${color}-500 font-bold border border-${color}-500/15">${catAr}</span>` : ''}
                    </div>
                </div>`;
        });

        html += `
            <button onclick="App.Router.go('notifications')"
                    class="w-full mt-1 py-2 rounded-xl text-[11px] font-bold text-blue-500
                           hover:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10
                           border border-blue-500/10 hover:border-blue-500/20
                           transition-all flex items-center justify-center gap-1.5 group">
                كل الإشعارات
                <i class="fa-solid fa-arrow-left text-[9px] group-hover:-translate-x-0.5 transition-transform"></i>
            </button>`;

        el.innerHTML = html;
    }




    function initHomeSwiper() {
        if (!document.querySelector('.mySwiper')) return;
        homeSwiperInstance = new Swiper('.mySwiper', {
            slidesPerView: 2.8,
            spaceBetween: 8,
            freeMode: true,
            grabCursor: true,
            breakpoints: {
                480: { slidesPerView: 3.5, spaceBetween: 10 },
                640: { slidesPerView: 4.2, spaceBetween: 10 },
                768: { slidesPerView: 5, spaceBetween: 12 },
                1024: { slidesPerView: 6.5, spaceBetween: 14 }
            }
        });
    }

})(window.App);
