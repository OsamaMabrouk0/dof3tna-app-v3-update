(function(App) {
    'use strict';
    
    // ✅ رابط ملف JSON على GitHub
    const NOTIFICATIONS_URL = 'https://raw.githubusercontent.com/OsamaMabrouk0/notifications/main/notifications.json';
    
    App.Pages.notifications = function() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        showLoadingSkeleton();
        
        fetchNotifications()
            .then(function(notifications) {
                if (notifications.length === 0) {
                    showEmptyState();
                } else {
                    renderNotifications(notifications);
                }
            })
            .catch(function(error) {
                console.error('Error fetching notifications:', error);
                showErrorState();
            });
        
        // Attach mark all as read button
        const markAllBtn = document.getElementById('mark-all-read');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', function() {
                markAllAsRead();
            });
        }
    };
    
    // ✅ جلب الإشعارات من GitHub
    function fetchNotifications() {
        return new Promise(function(resolve, reject) {
            const cacheKey = App.CACHE_KEYS.NOTIFICATIONS;
            
            if (!navigator.onLine) {
                const cached = App.Cache.get(cacheKey);
                if (cached) {
                    const processed = processNotifications(cached);
                    resolve(processed);
                    App.Toast.info('البيانات محفوظة محلياً', 'غير متصل');
                } else {
                    reject(new Error('No internet and no cache'));
                }
                return;
            }
            
            fetch(NOTIFICATIONS_URL)
                .then(response => {
                    if (!response.ok) throw new Error('Network error');
                    return response.json();
                })
                .then(data => {
                    App.Cache.set(cacheKey, data);
                    const processed = processNotifications(data);
                    resolve(processed);
                })
                .catch(error => {
                    const cached = App.Cache.get(cacheKey);
                    if (cached) {
                        const processed = processNotifications(cached);
                        resolve(processed);
                        App.Toast.warning('تم تحميل البيانات المحفوظة', 'غير متصل');
                    } else {
                        reject(error);
                    }
                });
        });
    }
    
    // ✅ معالجة الإشعارات وإضافة حالة القراءة
    function processNotifications(notifications) {
        const readNotifs = getReadNotifications();
        
        return notifications.map(function(notif) {
            notif.isRead = readNotifs.includes(notif.id);
            notif.timeAgo = calculateTimeAgo(notif.timestamp);
            return notif;
        }).sort(function(a, b) {
            // ترتيب حسب الأولوية ثم التاريخ
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }
    
    // ✅ حساب الوقت المنقضي
    function calculateTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'الآن';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
        
        const years = Math.floor(days / 365);
        return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    }
    
    // ✅ الحصول على الإشعارات المقروءة
    function getReadNotifications() {
        const stored = localStorage.getItem('dof3atna_read_notifications_v3');
        return stored ? JSON.parse(stored) : [];
    }
    
    // ✅ حفظ الإشعارات المقروءة
    function saveReadNotifications(readIds) {
        localStorage.setItem('dof3atna_read_notifications_v3', JSON.stringify(readIds));
    }
    
    // ✅ عرض skeleton loading
    function showLoadingSkeleton() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        fullList.innerHTML = `
            <div class="space-y-4">
                ${Array(5).fill(0).map(() => `
                    <div class="glass-panel rounded-2xl p-5 animate-pulse">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10"></div>
                            <div class="flex-1 space-y-3">
                                <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-full"></div>
                                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ✅ عرض الإشعارات
    function renderNotifications(notifications) {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        let html = '<div class="space-y-4">';
        
        notifications.forEach(function(notif, index) {
            const isUnread = !notif.isRead;
            const priorityBadge = getPriorityBadge(notif.priority);
            const categoryBadge = getCategoryBadge(notif.category);
            
            html += `
                <div class="notification-card glass-panel rounded-2xl p-5 transition-all cursor-pointer scroll-animate ${isUnread ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg' : 'hover:shadow-lg'}" 
                     data-notif-id="${notif.id}"
                     onclick="markNotificationAsRead('${notif.id}')">
                    <div class="flex items-start gap-4">
                        <!-- Icon -->
                        <div class="relative">
                            <div class="w-14 h-14 rounded-xl bg-${notif.color}-500/10 flex items-center justify-center flex-shrink-0 ${isUnread ? 'ring-2 ring-' + notif.color + '-500 ring-offset-2 dark:ring-offset-gray-900' : ''}">
                                <i class="fa-solid ${notif.icon} text-2xl text-${notif.color}-500"></i>
                            </div>
                            ${isUnread ? `<span class="absolute -top-1 -right-1 w-4 h-4 bg-${notif.color}-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>` : ''}
                        </div>
                        
                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-3 mb-2">
                                <h3 class="font-bold text-base leading-tight ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}">${notif.title}</h3>
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    ${priorityBadge}
                                    ${isUnread ? `<span class="px-2 py-1 bg-${notif.color}-500/10 text-${notif.color}-600 dark:text-${notif.color}-400 text-xs rounded-full border border-${notif.color}-500/20 font-bold animate-pulse">جديد</span>` : ''}
                                </div>
                            </div>
                            
                            <p class="text-sm ${isUnread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'} leading-relaxed mb-3">${notif.message}</p>
                            
                            <div class="flex items-center justify-between flex-wrap gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs ${isUnread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'} flex items-center gap-1">
                                        <i class="fa-regular fa-clock"></i>
                                        ${notif.timeAgo}
                                    </span>
                                    ${categoryBadge}
                                </div>
                                ${!isUnread ? `<span class="text-xs text-${notif.color}-500 flex items-center gap-1"><i class="fa-solid fa-check-double"></i> مقروءة</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        fullList.innerHTML = html;
        
        updateNotificationsBadge();
        
        if (App.Effects && App.Effects.initScrollAnimations) {
            setTimeout(App.Effects.initScrollAnimations, 100);
        }
    }
    
    // ✅ شارات الأولوية
    function getPriorityBadge(priority) {
        const badges = {
            high: '<span class="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-full border border-red-500/20 font-bold"><i class="fa-solid fa-exclamation-circle ml-1"></i>عالية</span>',
            medium: '<span class="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-full border border-yellow-500/20 font-bold"><i class="fa-solid fa-flag ml-1"></i>متوسطة</span>',
            low: ''
        };
        return badges[priority] || '';
    }
    
    // ✅ شارات الفئة
    function getCategoryBadge(category) {
        const badges = {
            update: '<span class="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">تحديث</span>',
            content: '<span class="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">محتوى</span>',
            maintenance: '<span class="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full">صيانة</span>',
            fix: '<span class="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">إصلاح</span>',
            tips: '<span class="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">نصائح</span>',
            announcement: '<span class="text-xs px-2 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full">إعلان</span>'
        };
        return badges[category] || '';
    }
    
    // ✅ عرض حالة فارغة
    function showEmptyState() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        fullList.innerHTML = `
            <div class="text-center py-20">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <i class="fa-solid fa-bell-slash text-5xl text-gray-400"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">لا توجد إشعارات</h3>
                <p class="text-gray-500 dark:text-gray-400">سيتم عرض الإشعارات الجديدة هنا</p>
            </div>
        `;
    }
    
    // ✅ عرض حالة خطأ
    function showErrorState() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        fullList.innerHTML = `
            <div class="text-center py-20">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
                    <i class="fa-solid fa-wifi-slash text-5xl text-red-500"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">فشل تحميل الإشعارات</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">تحقق من الاتصال بالإنترنت</p>
                <button onclick="App.Router.go('notifications', false, false)" class="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-lg hover:shadow-xl">
                    <i class="fa-solid fa-rotate-right ml-2"></i>
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
    
    // ✅ تحديد إشعار كمقروء
    window.markNotificationAsRead = function(notifId) {
        const readNotifs = getReadNotifications();
        
        if (!readNotifs.includes(notifId)) {
            readNotifs.push(notifId);
            saveReadNotifications(readNotifs);
            
            // تحديث العرض
            const card = document.querySelector(`[data-notif-id="${notifId}"]`);
            if (card) {
                card.classList.remove('bg-gradient-to-r', 'from-blue-50/50', 'to-purple-50/50', 'dark:from-blue-900/10', 'dark:to-purple-900/10', 'border-2', 'border-blue-200/50', 'dark:border-blue-800/50', 'shadow-lg');
                card.classList.add('hover:shadow-lg');
                
                // إعادة تحميل الصفحة لتحديث كل العناصر
                App.Router.go('notifications', false, false);
            }
            
            updateNotificationsBadge();
        }
    };
    
    // ✅ تحديد الكل كمقروء
    function markAllAsRead() {
        fetchNotifications().then(function(notifications) {
            const allIds = notifications.map(n => n.id);
            saveReadNotifications(allIds);
            
            App.Toast.success('تم تحديد جميع الإشعارات كمقروءة', 'تم');
            
            // إعادة تحميل الصفحة
            setTimeout(function() {
                App.Router.go('notifications', false, false);
            }, 500);
        });
    }
    
    // ✅ تحديث شارة الإشعارات
    function updateNotificationsBadge() {
        fetchNotifications().then(function(notifications) {
            const unreadCount = notifications.filter(n => !n.isRead).length;
            
            const notifBtn = document.getElementById('notif-btn');
            if (!notifBtn) return;
            
            // إزالة الشارات القديمة
            const oldBadge = notifBtn.querySelector('.notification-pulse');
            const oldCounter = notifBtn.querySelector('.notification-counter');
            if (oldBadge) oldBadge.remove();
            if (oldCounter) oldCounter.remove();
            
            if (unreadCount > 0) {
                // إضافة نقطة التنبيه
                const pulse = document.createElement('span');
                // pulse.className = 'notification-pulse absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg-main)] animate-pulse';
                notifBtn.appendChild(pulse);
                
                // إضافة العداد إذا كان أكثر من واحد
                if (unreadCount > 1) {
                    const counter = document.createElement('span');
                    counter.className = 'notification-counter absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-[var(--bg-main)]';
                    counter.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    notifBtn.appendChild(counter);
                }
            }
        });
    }
    
    // ✅ تصدير الدوال
    App.Pages.updateNotificationsBadge = updateNotificationsBadge;
    
})(window.App);