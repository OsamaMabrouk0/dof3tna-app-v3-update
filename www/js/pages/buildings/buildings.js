(function(App) {
    'use strict';
    
    const BUILDINGS_DATA = [
        {
            id: 'building_a',
            name: 'المبنى A',
            nameEn: 'Building A',
            description: 'المبنى الرئيسي - القاعات الكبرى',
            floors: 4,
            rooms: 25,
            facilities: ['قاعات محاضرات', 'معامل', 'مكتبة', 'كافيتريا'],
            color: 'blue',
            icon: 'fa-building',
            image: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=Building+A',
            halls: [
                { room: 'A-101', capacity: 50, type: 'قاعة محاضرات', floor: 1 },
                { room: 'A-105', capacity: 40, type: 'قاعة محاضرات', floor: 1 },
                { room: 'A-201', capacity: 60, type: 'قاعة محاضرات', floor: 2 },
                { room: 'A-Hall', capacity: 300, type: 'قاعة كبرى', floor: 1 }
            ]
        },
        {
            id: 'building_b',
            name: 'المبنى B',
            nameEn: 'Building B',
            description: 'المبنى الإداري والمكاتب',
            floors: 3,
            rooms: 18,
            facilities: ['مكاتب إدارية', 'شؤون طلاب', 'خدمات', 'مصلى'],
            color: 'emerald',
            icon: 'fa-building-columns',
            image: 'https://via.placeholder.com/400x250/10b981/ffffff?text=Building+B',
            halls: [
                { room: 'B-105', capacity: 45, type: 'قاعة محاضرات', floor: 1 },
                { room: 'B-202', capacity: 35, type: 'قاعة محاضرات', floor: 2 },
                { room: 'B-301', capacity: 55, type: 'قاعة محاضرات', floor: 3 }
            ]
        },
        {
            id: 'building_c',
            name: 'المبنى C',
            nameEn: 'Building C',
            description: 'مبنى المعامل والتقنية',
            floors: 5,
            rooms: 30,
            facilities: ['معامل حاسب', 'معامل إحصاء', 'مركز تقني', 'قاعات'],
            color: 'purple',
            icon: 'fa-building-flag',
            image: 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Building+C',
            halls: [
                { room: 'C-101', capacity: 40, type: 'معمل حاسب', floor: 1 },
                { room: 'C-205', capacity: 30, type: 'معمل إحصاء', floor: 2 },
                { room: 'C-301', capacity: 50, type: 'قاعة محاضرات', floor: 3 }
            ]
        },
        {
            id: 'library',
            name: 'المكتبة المركزية',
            nameEn: 'Central Library',
            description: 'مكتبة الكلية الرئيسية',
            floors: 3,
            rooms: 12,
            facilities: ['قاعات مطالعة', 'مراجع', 'إنترنت', 'طباعة'],
            color: 'amber',
            icon: 'fa-book-open-reader',
            image: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Library',
            halls: [
                { room: 'L-101', capacity: 80, type: 'قاعة مطالعة', floor: 1 },
                { room: 'L-201', capacity: 60, type: 'قاعة مراجع', floor: 2 }
            ]
        }
    ];

    let selectedBuilding = null;
    let eventListeners = [];

    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
        selectedBuilding = null;
    }

    App.Pages.buildings = function() {
        cleanup();
        
        const container = document.getElementById('app-content');
        if (!container) return;

        renderBuildingsPage(container);
        attachEvents();

        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }

        App.Router.registerCleanup(cleanup);
    };

    function renderBuildingsPage(container) {
        container.innerHTML = `
            <div class="container mx-auto max-w-7xl pb-24 space-y-6">
                <!-- Header -->
                <div class="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden scroll-animate">
                    <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-50"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 animate-float">
                            <i class="fa-solid fa-building-columns text-3xl text-amber-500"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold mb-1 gradient-text">مباني الكلية</h1>
                            <p class="text-gray-500 dark:text-gray-300 text-xs md:text-sm">خريطة المباني والقاعات الدراسية</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-building-columns absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>
                </div>

                <!-- Stats Overview -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 scroll-animate">
                    ${renderStats()}
                </div>

                <!-- Buildings Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="buildings-grid">
                    ${renderBuildings()}
                </div>

                <!-- Building Details Modal -->
                <div id="building-details" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div class="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div id="building-details-content"></div>
                    </div>
                </div>

                <!-- Campus Map Info -->
                <div class="glass-panel rounded-2xl p-6 scroll-animate">
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-map-location-dot text-blue-500"></i>
                        معلومات الحرم الجامعي
                    </h2>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="font-bold mb-3 text-sm">العنوان</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <i class="fa-solid fa-location-dot text-red-500 ml-2"></i>
                                كلية التجارة - جامعة الإسكندرية<br/>
                                الشاطبي، الإسكندرية، مصر
                            </p>
                        </div>
                        <div>
                            <h3 class="font-bold mb-3 text-sm">مواعيد العمل</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <i class="fa-solid fa-clock text-blue-500 ml-2"></i>
                                الأحد - الخميس: 8:00 ص - 4:00 م<br/>
                                الجمعة - السبت: عطلة رسمية
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderStats() {
        const totalBuildings = BUILDINGS_DATA.length;
        const totalRooms = BUILDINGS_DATA.reduce((sum, b) => sum + b.rooms, 0);
        const totalFloors = BUILDINGS_DATA.reduce((sum, b) => sum + b.floors, 0);
        const totalHalls = BUILDINGS_DATA.reduce((sum, b) => sum + b.halls.length, 0);

        const stats = [
            { label: 'عدد المباني', value: totalBuildings, icon: 'fa-building', color: 'blue' },
            { label: 'إجمالي الطوابق', value: totalFloors, icon: 'fa-layer-group', color: 'emerald' },
            { label: 'إجمالي القاعات', value: totalRooms, icon: 'fa-door-open', color: 'purple' },
            { label: 'قاعات المحاضرات', value: totalHalls, icon: 'fa-chalkboard', color: 'amber' }
        ];

        return stats.map(stat => `
            <div class="glass-panel rounded-xl p-4 hover:shadow-lg transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center">
                        <i class="fa-solid ${stat.icon} text-xl text-${stat.color}-500"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${stat.label}</p>
                        <p class="text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderBuildings() {
        return BUILDINGS_DATA.map(building => `
            <div class="building-card group scroll-animate cursor-pointer" data-building-id="${building.id}">
                <div class="glass-panel rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                    <!-- Building Image -->
                    <div class="h-48 bg-gradient-to-br from-${building.color}-200 to-${building.color}-400 dark:from-${building.color}-800 dark:to-${building.color}-950 relative overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i class="fa-solid ${building.icon} text-8xl text-white/20"></i>
                        </div>
                        <div class="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/90 rounded-full text-xs font-bold text-${building.color}-600 dark:text-${building.color}-400">
                            ${building.nameEn}
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-5">
                        <h3 class="text-xl font-bold mb-2 group-hover:text-${building.color}-500 transition-colors">
                            ${building.name}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            ${building.description}
                        </p>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="flex items-center gap-2 text-sm">
                                <div class="w-8 h-8 rounded-lg bg-${building.color}-500/10 flex items-center justify-center">
                                    <i class="fa-solid fa-layer-group text-${building.color}-500 text-xs"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">الطوابق</p>
                                    <p class="font-bold text-sm">${building.floors}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <div class="w-8 h-8 rounded-lg bg-${building.color}-500/10 flex items-center justify-center">
                                    <i class="fa-solid fa-door-open text-${building.color}-500 text-xs"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">القاعات</p>
                                    <p class="font-bold text-sm">${building.rooms}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Facilities -->
                        <div class="flex flex-wrap gap-2">
                            ${building.facilities.slice(0, 3).map(facility => `
                                <span class="px-2 py-1 rounded-full bg-${building.color}-500/10 text-${building.color}-600 dark:text-${building.color}-400 text-xs font-medium">
                                    ${facility}
                                </span>
                            `).join('')}
                            ${building.facilities.length > 3 ? `<span class="px-2 py-1 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-medium">+${building.facilities.length - 3}</span>` : ''}
                        </div>

                        <!-- View Details Button -->
                        <button class="mt-4 w-full px-4 py-2 rounded-lg bg-${building.color}-500/10 hover:bg-${building.color}-500 hover:text-white text-${building.color}-600 dark:text-${building.color}-400 text-sm font-medium transition-all">
                            <i class="fa-solid fa-eye ml-1"></i>
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderBuildingDetails(building) {
        return `
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded-xl bg-${building.color}-500/10 flex items-center justify-center">
                            <i class="fa-solid ${building.icon} text-2xl text-${building.color}-500"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">${building.name}</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${building.nameEn}</p>
                        </div>
                    </div>
                    <button id="close-building-details" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <!-- Description -->
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    ${building.description}
                </p>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="glass-panel p-4 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-${building.color}-500/10 flex items-center justify-center">
                                <i class="fa-solid fa-layer-group text-${building.color}-500"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400">الطوابق</p>
                                <p class="text-xl font-bold">${building.floors}</p>
                            </div>
                        </div>
                    </div>
                    <div class="glass-panel p-4 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-${building.color}-500/10 flex items-center justify-center">
                                <i class="fa-solid fa-door-open text-${building.color}-500"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400">القاعات</p>
                                <p class="text-xl font-bold">${building.rooms}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Facilities -->
                <div class="mb-6">
                    <h3 class="font-bold mb-3">المرافق المتاحة</h3>
                    <div class="flex flex-wrap gap-2">
                        ${building.facilities.map(facility => `
                            <span class="px-3 py-2 rounded-lg bg-${building.color}-500/10 text-${building.color}-600 dark:text-${building.color}-400 text-sm font-medium">
                                <i class="fa-solid fa-check ml-1"></i>
                                ${facility}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Halls List -->
                <div>
                    <h3 class="font-bold mb-3">القاعات والغرف</h3>
                    <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        ${building.halls.map(hall => `
                            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-${building.color}-500/10 flex items-center justify-center">
                                        <span class="text-sm font-bold text-${building.color}-600 dark:text-${building.color}-400">${hall.floor}</span>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm">${hall.room}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${hall.type}</p>
                                    </div>
                                </div>
                                <div class="text-left">
                                    <p class="text-xs text-gray-500 dark:text-gray-400">السعة</p>
                                    <p class="font-bold text-sm">${hall.capacity}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        // Building Cards
        const buildingCards = document.querySelectorAll('.building-card');
        buildingCards.forEach(card => {
            const handler = function() {
                const buildingId = this.getAttribute('data-building-id');
                const building = BUILDINGS_DATA.find(b => b.id === buildingId);
                
                if (building) {
                    selectedBuilding = building;
                    showBuildingDetails(building);
                }
            };
            
            card.addEventListener('click', handler);
            eventListeners.push({ element: card, event: 'click', handler });
        });
    }

    function showBuildingDetails(building) {
        const modal = document.getElementById('building-details');
        const content = document.getElementById('building-details-content');
        
        if (modal && content) {
            content.innerHTML = renderBuildingDetails(building);
            modal.classList.remove('hidden');
            
            // Close Button
            const closeBtn = document.getElementById('close-building-details');
            if (closeBtn) {
                const handler = function() {
                    modal.classList.add('hidden');
                    selectedBuilding = null;
                };
                closeBtn.addEventListener('click', handler);
                eventListeners.push({ element: closeBtn, event: 'click', handler });
            }

            // Click Outside to Close
            const outsideHandler = function(e) {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    selectedBuilding = null;
                }
            };
            modal.addEventListener('click', outsideHandler);
            eventListeners.push({ element: modal, event: 'click', handler: outsideHandler });
        }
    }

})(window.App);