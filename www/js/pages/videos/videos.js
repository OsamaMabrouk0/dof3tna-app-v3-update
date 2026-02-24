(function(App) {
    'use strict';
    
    // بيانات وهمية للفيديوهات
    const VIDEOS_DATA = [
        {
            id: 'vid_1',
            title: 'مقدمة في المحاسبة المالية',
            description: 'شرح شامل لأساسيات المحاسبة المالية والمبادئ المحاسبية',
            subject: 'محاسبة',
            duration: '45:30',
            views: 1250,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'accounting',
            uploadDate: '2026-01-20',
            lecturer: 'د. أحمد محمد',
            level: 'مبتدئ'
        },
        {
            id: 'vid_2',
            title: 'مبادئ الاقتصاد الكلي',
            description: 'فهم الاقتصاد الكلي والسياسات النقدية والمالية',
            subject: 'اقتصاد',
            duration: '38:15',
            views: 980,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'economics',
            uploadDate: '2026-01-18',
            lecturer: 'د. سارة أحمد',
            level: 'متوسط'
        },
        {
            id: 'vid_3',
            title: 'الإحصاء التطبيقي',
            description: 'تطبيقات عملية على الإحصاء الوصفي والاستدلالي',
            subject: 'إحصاء',
            duration: '52:00',
            views: 750,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'statistics',
            uploadDate: '2026-01-15',
            lecturer: 'د. محمد علي',
            level: 'متقدم'
        },
        {
            id: 'vid_4',
            title: 'استراتيجيات التسويق الحديثة',
            description: 'أحدث استراتيجيات التسويق الرقمي والتقليدي',
            subject: 'تسويق',
            duration: '41:20',
            views: 1100,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'marketing',
            uploadDate: '2026-01-12',
            lecturer: 'د. فاطمة حسن',
            level: 'متوسط'
        },
        {
            id: 'vid_5',
            title: 'إدارة الموارد البشرية',
            description: 'مفاهيم وممارسات إدارة الموارد البشرية الحديثة',
            subject: 'إدارة',
            duration: '48:45',
            views: 890,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'management',
            uploadDate: '2026-01-10',
            lecturer: 'د. خالد عبدالله',
            level: 'مبتدئ'
        },
        {
            id: 'vid_6',
            title: 'التحليل المالي المتقدم',
            description: 'تقنيات التحليل المالي وقراءة القوائم المالية',
            subject: 'مالية',
            duration: '55:10',
            views: 1450,
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            category: 'finance',
            uploadDate: '2026-01-08',
            lecturer: 'د. نور الدين',
            level: 'متقدم'
        }
    ];

    const CATEGORIES = [
        { id: 'all', name: 'الكل', icon: 'fa-grid-2', color: 'blue' },
        { id: 'accounting', name: 'محاسبة', icon: 'fa-calculator', color: 'emerald' },
        { id: 'economics', name: 'اقتصاد', icon: 'fa-chart-line', color: 'blue' },
        { id: 'statistics', name: 'إحصاء', icon: 'fa-chart-bar', color: 'purple' },
        { id: 'marketing', name: 'تسويق', icon: 'fa-bullhorn', color: 'rose' },
        { id: 'management', name: 'إدارة', icon: 'fa-briefcase', color: 'amber' },
        { id: 'finance', name: 'مالية', icon: 'fa-coins', color: 'yellow' }
    ];

    let currentCategory = 'all';
    let eventListeners = [];

    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
    }

    App.Pages.videos = function() {
        cleanup();
        
        const container = document.getElementById('app-content');
        if (!container) return;

        renderVideosPage(container);
        attachEvents();

        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }

        App.Router.registerCleanup(cleanup);
    };

    function renderVideosPage(container) {
        container.innerHTML = `
            <div class="container mx-auto max-w-7xl pb-24 space-y-6">
                <!-- Header -->
                <div class="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden scroll-animate">
                    <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-50"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center border border-red-500/20 animate-float">
                            <i class="fa-brands fa-youtube text-3xl text-red-500"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold mb-1 gradient-text">مكتبة الفيديوهات</h1>
                            <p class="text-gray-500 dark:text-gray-300 text-xs md:text-sm">شروحات مرئية شاملة لجميع المواد الدراسية</p>
                        </div>
                    </div>
                    <i class="fa-brands fa-youtube absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>
                </div>

                <!-- Categories Filter -->
                <div class="glass-panel rounded-2xl p-4 scroll-animate">
                    <div class="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2" id="categories-filter">
                        ${renderCategories()}
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 scroll-animate">
                    ${renderStats()}
                </div>

                <!-- Videos Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="videos-grid">
                    ${renderVideos()}
                </div>
            </div>
        `;
    }

    function renderCategories() {
        return CATEGORIES.map(cat => {
            const isActive = currentCategory === cat.id;
            return `
                <button data-category="${cat.id}" class="category-btn flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                    isActive 
                        ? `bg-${cat.color}-500/10 border-${cat.color}-500/30 text-${cat.color}-600 dark:text-${cat.color}-400 shadow-lg` 
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                }">
                    <i class="fa-solid ${cat.icon} text-sm"></i>
                    <span class="text-sm font-medium">${cat.name}</span>
                </button>
            `;
        }).join('');
    }

    function renderStats() {
        const totalVideos = VIDEOS_DATA.length;
        const totalViews = VIDEOS_DATA.reduce((sum, v) => sum + v.views, 0);
        const totalDuration = VIDEOS_DATA.reduce((sum, v) => {
            const [min, sec] = v.duration.split(':').map(Number);
            return sum + min * 60 + sec;
        }, 0);
        const avgDuration = Math.floor(totalDuration / totalVideos / 60);

        const stats = [
            { label: 'إجمالي الفيديوهات', value: totalVideos, icon: 'fa-video', color: 'blue' },
            { label: 'إجمالي المشاهدات', value: totalViews.toLocaleString(), icon: 'fa-eye', color: 'green' },
            { label: 'متوسط المدة', value: `${avgDuration} دقيقة`, icon: 'fa-clock', color: 'purple' },
            { label: 'محاضرين', value: '5+', icon: 'fa-user-tie', color: 'orange' }
        ];

        return stats.map(stat => `
            <div class="glass-panel rounded-xl p-4 hover:shadow-lg transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center">
                        <i class="fa-solid ${stat.icon} text-xl text-${stat.color}-500"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${stat.label}</p>
                        <p class="text-xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderVideos() {
        const filteredVideos = currentCategory === 'all' 
            ? VIDEOS_DATA 
            : VIDEOS_DATA.filter(v => v.category === currentCategory);

        if (filteredVideos.length === 0) {
            return `
                <div class="col-span-full text-center py-12">
                    <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-video-slash text-3xl text-gray-400"></i>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400">لا توجد فيديوهات في هذا القسم</p>
                </div>
            `;
        }

        return filteredVideos.map(video => `
            <div class="video-card group scroll-animate cursor-pointer" data-video-id="${video.id}">
                <div class="glass-panel rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full flex flex-col">
                    <!-- Thumbnail -->
                    <div class="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                <i class="fa-solid fa-play text-white text-xl mr-1"></i>
                            </div>
                        </div>
                        
                        <!-- Duration Badge -->
                        <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded font-bold">
                            ${video.duration}
                        </div>
                        
                        <!-- Level Badge -->
                        <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getLevelBadgeClass(video.level)}">
                            ${video.level}
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="font-bold text-base mb-2 line-clamp-2 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                            ${video.title}
                        </h3>
                        
                        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            ${video.description}
                        </p>
                        
                        <!-- Meta Info -->
                        <div class="mt-auto space-y-2">
                            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <i class="fa-solid fa-user-tie"></i>
                                <span>${video.lecturer}</span>
                            </div>
                            
                            <div class="flex items-center justify-between text-xs">
                                <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <i class="fa-solid fa-eye"></i>
                                    <span>${video.views.toLocaleString()} مشاهدة</span>
                                </div>
                                
                                <span class="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                    ${video.subject}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function getLevelBadgeClass(level) {
        switch(level) {
            case 'مبتدئ': return 'bg-green-500 text-white';
            case 'متوسط': return 'bg-yellow-500 text-white';
            case 'متقدم': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

    function attachEvents() {
        // Category Filter
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            const handler = function() {
                currentCategory = this.getAttribute('data-category');
                const videosGrid = document.getElementById('videos-grid');
                if (videosGrid) {
                    videosGrid.innerHTML = renderVideos();
                }
                
                categoryBtns.forEach(b => {
                    const cat = CATEGORIES.find(c => c.id === b.getAttribute('data-category'));
                    const isActive = b === this;
                    b.className = `category-btn flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                        isActive 
                            ? `bg-${cat.color}-500/10 border-${cat.color}-500/30 text-${cat.color}-600 dark:text-${cat.color}-400 shadow-lg` 
                            : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`;
                });

                if (App.Effects && App.Effects.initScrollAnimations) {
                    App.Effects.initScrollAnimations();
                }
            };
            
            btn.addEventListener('click', handler);
            eventListeners.push({ element: btn, event: 'click', handler });
        });

        // Video Cards
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            const handler = function() {
                const videoId = this.getAttribute('data-video-id');
                const video = VIDEOS_DATA.find(v => v.id === videoId);
                
                if (video) {
                    App.Toast.info(`سيتم فتح الفيديو: ${video.title}`, 'قريباً');
                }
            };
            
            card.addEventListener('click', handler);
            eventListeners.push({ element: card, event: 'click', handler });
        });
    }

})(window.App);