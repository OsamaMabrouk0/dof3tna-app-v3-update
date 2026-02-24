(function (App) {
    'use strict';

    const NOTIFICATIONS_URL = 'https://raw.githubusercontent.com/OsamaMabrouk0/notifications/main/notifications.json';
    const LS_KEY = 'dof3atna_read_notifications_v3';

    // ── الكاش الداخلي — مشترك بين الصفحة والـ badge ────────────────
    let _cachedNotifications = [];

    // ══════════════════════════════════════════════════════════════════
    //  دالة تهيئة الـ Badge عند بدء التطبيق (بدون دخول الصفحة)
    // ══════════════════════════════════════════════════════════════════
    function initBadge() {
        const cacheKey = App.CACHE_KEYS.NOTIFICATIONS;

        // جرّب الكاش المحلي أولاً للسرعة
        const cached = App.Cache.get(cacheKey);
        if (cached) {
            _cachedNotifications = processNotifications(cached);
            _renderBadge();
        }

        // ثم جلب أحدث نسخة من الشبكة بصمت
        if (navigator.onLine) {
            fetch(NOTIFICATIONS_URL)
                .then(r => r.ok ? r.json() : Promise.reject())
                .then(data => {
                    App.Cache.set(cacheKey, data);
                    _cachedNotifications = processNotifications(data);
                    _renderBadge();
                })
                .catch(function () { }); // صمت تام — لا toast هنا
        }
    }

    // ══════════════════════════════════════════════════════════════════
    //  صفحة الإشعارات
    // ══════════════════════════════════════════════════════════════════
    App.Pages.notifications = function () {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;

        _cachedNotifications = [];
        showLoadingSkeleton();
        updateMarkAllBtnState(false);

        fetchNotifications()
            .then(function (notifications) {
                _cachedNotifications = notifications;
                notifications.length === 0 ? showEmptyState() : renderNotifications(notifications);
            })
            .catch(showErrorState);

        const markAllBtn = document.getElementById('mark-all-read');
        if (markAllBtn) markAllBtn.addEventListener('click', markAllAsRead);
    };

    // ══════════════════════════════════════════════════════════════════
    function fetchNotifications() {
        return new Promise(function (resolve, reject) {
            const cacheKey = App.CACHE_KEYS.NOTIFICATIONS;

            if (!navigator.onLine) {
                const cached = App.Cache.get(cacheKey);
                if (cached) {
                    App.Toast.info('البيانات محفوظة محلياً', 'غير متصل');
                    resolve(processNotifications(cached));
                } else reject(new Error('No internet and no cache'));
                return;
            }

            fetch(NOTIFICATIONS_URL)
                .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                .then(data => {
                    App.Cache.set(cacheKey, data);
                    resolve(processNotifications(data));
                })
                .catch(function () {
                    const cached = App.Cache.get(cacheKey);
                    if (cached) {
                        App.Toast.warning('تم تحميل البيانات المحفوظة', 'غير متصل');
                        resolve(processNotifications(cached));
                    } else reject(new Error('Fetch failed'));
                });
        });
    }

    // ── ترتيب بالوقت فقط — بدون priority ───────────────────────────
    function processNotifications(notifications) {
        const readIds = getReadIds();
        return notifications
            .map(n => Object.assign({}, n, {
                isRead: readIds.includes(n.id),
                timeAgo: calculateTimeAgo(n.timestamp)
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function calculateTimeAgo(timestamp) {
        const s = Math.floor((Date.now() - new Date(timestamp)) / 1000);
        if (s < 60) return 'الآن';
        const m = Math.floor(s / 60);
        if (m < 60) return `منذ ${m} ${m === 1 ? 'دقيقة' : 'دقائق'}`;
        const h = Math.floor(m / 60);
        if (h < 24) return `منذ ${h} ${h === 1 ? 'ساعة' : 'ساعات'}`;
        const d = Math.floor(h / 24);
        if (d < 7) return `منذ ${d} ${d === 1 ? 'يوم' : 'أيام'}`;
        const w = Math.floor(d / 7);
        if (w < 4) return `منذ ${w} ${w === 1 ? 'أسبوع' : 'أسابيع'}`;
        const mo = Math.floor(d / 30);
        if (mo < 12) return `منذ ${mo} ${mo === 1 ? 'شهر' : 'أشهر'}`;
        const y = Math.floor(d / 365);
        return `منذ ${y} ${y === 1 ? 'سنة' : 'سنوات'}`;
    }

    function getReadIds() {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; }
    }
    function saveReadIds(ids) { localStorage.setItem(LS_KEY, JSON.stringify(ids)); }

    // ══════════════════════════════════════════════════════════════════
    function showLoadingSkeleton() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        fullList.innerHTML = Array(4).fill(0).map(() => `
            <div class="glass-panel rounded-2xl p-5 animate-pulse">
                <div class="flex items-start gap-4">
                    <div class="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>
                    <div class="flex-1 space-y-3">
                        <div class="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-3/4"></div>
                        <div class="h-3 bg-gray-200 dark:bg-white/10 rounded-lg w-full"></div>
                        <div class="h-3 bg-gray-200 dark:bg-white/10 rounded-lg w-2/5"></div>
                    </div>
                </div>
            </div>`).join('');
    }

    function renderNotifications(notifications) {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;

        const unreadCount = notifications.filter(n => !n.isRead).length;
        const label = document.getElementById('unread-count-label');
        if (label) {
            label.textContent = unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كل الإشعارات مقروءة';
        }
        updateMarkAllBtnState(unreadCount > 0);
        fullList.innerHTML = notifications.map(buildCard).join('');
        _renderBadge();

        if (App.Effects && App.Effects.initScrollAnimations) {
            setTimeout(App.Effects.initScrollAnimations, 100);
        }
    }

    function buildCard(notif) {
        const unread = !notif.isRead;
        return `
        <div class="notification-card glass-panel rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer scroll-animate
                    ${unread
                ? 'border border-blue-200/60 dark:border-blue-700/40 bg-blue-50/30 dark:bg-blue-900/[0.08] shadow-sm'
                : 'border border-transparent hover:border-gray-200/60 dark:hover:border-white/10 opacity-70 hover:opacity-100'}"
             data-notif-id="${notif.id}"
             onclick="markNotificationAsRead('${notif.id}')">
            <div class="flex items-start gap-4">
                <div class="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center
                            bg-${notif.color}-500/10 border border-${notif.color}-500/20">
                    <i class="fa-solid ${notif.icon} text-${notif.color}-500 text-base"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 class="font-bold text-sm leading-snug
                                   ${unread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}">
                            ${notif.title}
                        </h3>
                        ${unread ? `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                                     bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"></span>
                            جديد
                        </span>` : ''}
                    </div>
                    <p class="text-xs leading-relaxed mb-2
                              ${unread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}">
                        ${notif.message}
                    </p>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <i class="fa-regular fa-clock text-[10px]"></i>
                            ${notif.timeAgo}
                        </span>
                        ${getCategoryBadge(notif.category)}
                        ${!unread ? `
                        <span class="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mr-auto">
                            <i class="fa-solid fa-check-double text-[10px]"></i> مقروءة
                        </span>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }

    function getCategoryBadge(category) {
        const map = {
            update: ['blue', 'تحديث'],
            content: ['green', 'محتوى'],
            maintenance: ['orange', 'صيانة'],
            fix: ['emerald', 'إصلاح'],
            tips: ['purple', 'نصائح'],
            announcement: ['pink', 'إعلان'],
        };
        const e = map[category];
        if (!e) return '';
        return `<span class="text-[10px] px-1.5 py-0.5 rounded-full
                             bg-${e[0]}-500/10 text-${e[0]}-600 dark:text-${e[0]}-400
                             border border-${e[0]}-500/15">${e[1]}</span>`;
    }

    function showEmptyState() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        updateMarkAllBtnState(false);
        const label = document.getElementById('unread-count-label');
        if (label) label.textContent = '';
        fullList.innerHTML = `
            <div class="text-center py-20">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20
                            flex items-center justify-center mx-auto mb-5">
                    <i class="fa-solid fa-bell-slash text-4xl text-gray-400"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">لا توجد إشعارات</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">سيتم عرض الإشعارات الجديدة هنا</p>
            </div>`;
    }

    function showErrorState() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        updateMarkAllBtnState(false);
        const label = document.getElementById('unread-count-label');
        if (label) label.textContent = '';
        fullList.innerHTML = `
            <div class="text-center py-20">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20
                            flex items-center justify-center mx-auto mb-5">
                    <i class="fa-solid fa-wifi-slash text-4xl text-red-500"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">فشل تحميل الإشعارات</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">تحقق من الاتصال بالإنترنت</p>
                <button onclick="App.Router.go('notifications', false, false)"
                        class="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition shadow-lg">
                    <i class="fa-solid fa-rotate-right ml-2"></i> إعادة المحاولة
                </button>
            </div>`;
    }

    function updateMarkAllBtnState(hasUnread) {
        const btn = document.getElementById('mark-all-read');
        if (!btn) return;
        hasUnread ? btn.removeAttribute('disabled') : btn.setAttribute('disabled', 'true');
    }

    // ══════════════════════════════════════════════════════════════════
    //  تحديد إشعار واحد — DOM update فوري
    // ══════════════════════════════════════════════════════════════════
    window.markNotificationAsRead = function (notifId) {
        const readIds = getReadIds();
        if (readIds.includes(notifId)) return;

        readIds.push(notifId);
        saveReadIds(readIds);

        const notif = _cachedNotifications.find(n => n.id === notifId);
        if (notif) notif.isRead = true;

        const card = document.querySelector(`[data-notif-id="${notifId}"]`);
        if (card && notif) {
            const temp = document.createElement('div');
            temp.innerHTML = buildCard(notif);
            card.replaceWith(temp.firstElementChild);
        }

        const unreadCount = _cachedNotifications.filter(n => !n.isRead).length;
        const label = document.getElementById('unread-count-label');
        if (label) {
            label.textContent = unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كل الإشعارات مقروءة';
        }
        updateMarkAllBtnState(unreadCount > 0);
        _renderBadge();
    };

    // ══════════════════════════════════════════════════════════════════
    //  تحديد الكل — DOM update فوري
    // ══════════════════════════════════════════════════════════════════
    function markAllAsRead() {
        if (_cachedNotifications.length === 0) return;
        saveReadIds(_cachedNotifications.map(n => n.id));
        _cachedNotifications.forEach(n => { n.isRead = true; });
        renderNotifications(_cachedNotifications);
        App.Toast.success('تم تحديد جميع الإشعارات كمقروءة', 'تم ✓');
    }

    // ══════════════════════════════════════════════════════════════════
    //  رسم الـ Badge (مستقل — يعمل من أي مكان)
    // ══════════════════════════════════════════════════════════════════
function _renderBadge() {
    const badge = document.getElementById('notif-unread-badge');
    if (!badge) return;

    const unreadCount = _cachedNotifications.filter(n => !n.isRead).length;

    if (unreadCount <= 0) {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
        badge.textContent = '';
        return;
    }

    badge.textContent = unreadCount > 99 ? '+99' : unreadCount;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
}

    // ══════════════════════════════════════════════════════════════════
    //  تصدير
    // ══════════════════════════════════════════════════════════════════
    App.Pages.updateNotificationsBadge = _renderBadge;
    App.Pages.initNotificationsBadge = initBadge;

})(window.App);