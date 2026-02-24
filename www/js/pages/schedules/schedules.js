(function(App) {
    'use strict';
    
    const SCHEDULE_DATA = {
        lectures: [
            { day: 'الأحد', time: '08:00 - 10:00', subject: 'محاسبة مالية', lecturer: 'د. أحمد محمد', room: 'A-201', type: 'lecture' },
            { day: 'الأحد', time: '10:15 - 12:15', subject: 'اقتصاد كلي', lecturer: 'د. سارة أحمد', room: 'B-105', type: 'lecture' },
            { day: 'الاثنين', time: '08:00 - 10:00', subject: 'إحصاء تطبيقي', lecturer: 'د. محمد علي', room: 'C-301', type: 'lecture' },
            { day: 'الاثنين', time: '12:30 - 14:30', subject: 'تسويق', lecturer: 'د. فاطمة حسن', room: 'A-105', type: 'lecture' },
            { day: 'الثلاثاء', time: '08:00 - 10:00', subject: 'إدارة أعمال', lecturer: 'د. خالد عبدالله', room: 'B-202', type: 'lecture' },
            { day: 'الثلاثاء', time: '10:15 - 12:15', subject: 'مالية عامة', lecturer: 'د. نور الدين', room: 'C-101', type: 'lecture' },
            { day: 'الأربعاء', time: '08:00 - 10:00', subject: 'محاسبة تكاليف', lecturer: 'د. أحمد محمد', room: 'A-201', type: 'section' },
            { day: 'الأربعاء', time: '12:30 - 14:30', subject: 'اقتصاد جزئي', lecturer: 'د. سارة أحمد', room: 'B-105', type: 'section' },
            { day: 'الخميس', time: '10:15 - 12:15', subject: 'إحصاء وصفي', lecturer: 'د. محمد علي', room: 'C-301', type: 'section' }
        ],
        exams: [
            { subject: 'محاسبة مالية', date: '2026-02-15', time: '09:00', duration: '3 ساعات', room: 'القاعة الكبرى', type: 'نهائي' },
            { subject: 'اقتصاد كلي', date: '2026-02-18', time: '09:00', duration: '3 ساعات', room: 'القاعة الكبرى', type: 'نهائي' },
            { subject: 'إحصاء تطبيقي', date: '2026-02-20', time: '09:00', duration: '3 ساعات', room: 'A-Hall', type: 'نهائي' },
            { subject: 'تسويق', date: '2026-01-28', time: '10:00', duration: 'ساعتان', room: 'B-301', type: 'منتصف الفصل' },
            { subject: 'إدارة أعمال', date: '2026-01-30', time: '10:00', duration: 'ساعتان', room: 'C-205', type: 'منتصف الفصل' }
        ]
    };

    const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const TIME_SLOTS = ['08:00 - 10:00', '10:15 - 12:15', '12:30 - 14:30', '14:45 - 16:45'];

    let currentView = 'table'; // 'table' or 'list'
    let eventListeners = [];

    function cleanup() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element && handler) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
    }

    App.Pages.schedules = function() {
        cleanup();
        
        const container = document.getElementById('app-content');
        if (!container) return;

        renderSchedulesPage(container);
        attachEvents();

        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }

        App.Router.registerCleanup(cleanup);
    };

    function renderSchedulesPage(container) {
        container.innerHTML = `
            <div class="container mx-auto max-w-7xl pb-24 space-y-6">
                <!-- Header -->
                <div class="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden scroll-animate">
                    <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-50"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 animate-float">
                                    <i class="fa-regular fa-calendar-days text-3xl text-emerald-500"></i>
                                </div>
                                <div>
                                    <h1 class="text-2xl md:text-3xl font-bold mb-1 gradient-text">الجداول الدراسية</h1>
                                    <p class="text-gray-500 dark:text-gray-300 text-xs md:text-sm">جداول المحاضرات والامتحانات</p>
                                </div>
                            </div>
                            
                            <!-- View Toggle -->
                            <div class="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                <button id="view-table" class="view-btn px-4 py-2 rounded text-sm font-medium transition-all ${currentView === 'table' ? 'bg-white dark:bg-white/10 shadow-md' : ''}">
                                    <i class="fa-solid fa-table-cells ml-1"></i>
                                    جدول
                                </button>
                                <button id="view-list" class="view-btn px-4 py-2 rounded text-sm font-medium transition-all ${currentView === 'list' ? 'bg-white dark:bg-white/10 shadow-md' : ''}">
                                    <i class="fa-solid fa-list ml-1"></i>
                                    قائمة
                                </button>
                            </div>
                        </div>
                    </div>
                    <i class="fa-regular fa-calendar-days absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>
                </div>

                <!-- Content Container -->
                <div id="schedule-content">
                    ${renderScheduleContent()}
                </div>

                <!-- Upcoming Exams -->
                <div class="glass-panel rounded-2xl p-6 scroll-animate">
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-file-pen text-red-500"></i>
                        الامتحانات القادمة
                    </h2>
                    <div class="space-y-3">
                        ${renderUpcomingExams()}
                    </div>
                </div>
            </div>
        `;
    }

    function renderScheduleContent() {
        if (currentView === 'table') {
            return renderTableView();
        } else {
            return renderListView();
        }
    }

    function renderTableView() {
        return `
            <div class="glass-panel rounded-2xl p-4 overflow-x-auto scroll-animate">
                <table class="w-full min-w-[800px]">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="p-3 text-right font-bold text-sm">الوقت</th>
                            ${DAYS.map(day => `<th class="p-3 text-center font-bold text-sm">${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${TIME_SLOTS.map(timeSlot => `
                            <tr class="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td class="p-3 font-medium text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                                    ${timeSlot}
                                </td>
                                ${DAYS.map(day => {
                                    const lecture = SCHEDULE_DATA.lectures.find(l => l.day === day && l.time === timeSlot);
                                    return `<td class="p-2">${lecture ? renderLectureCell(lecture) : '<div class="h-20"></div>'}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderLectureCell(lecture) {
        const isLecture = lecture.type === 'lecture';
        const bgColor = isLecture ? 'bg-blue-500/10' : 'bg-purple-500/10';
        const borderColor = isLecture ? 'border-blue-500/30' : 'border-purple-500/30';
        const textColor = isLecture ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400';
        
        return `
            <div class="h-20 ${bgColor} ${borderColor} border-r-4 rounded-lg p-2 hover:shadow-md transition-all cursor-pointer group">
                <p class="font-bold text-xs ${textColor} mb-1 line-clamp-1 group-hover:text-blue-500">${lecture.subject}</p>
                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                    <i class="fa-solid fa-user-tie ml-1"></i>${lecture.lecturer}
                </p>
                <p class="text-[10px] text-gray-500 dark:text-gray-500">
                    <i class="fa-solid fa-location-dot ml-1"></i>${lecture.room}
                </p>
            </div>
        `;
    }

    function renderListView() {
        return `
            <div class="space-y-4 scroll-animate">
                ${DAYS.map(day => {
                    const dayLectures = SCHEDULE_DATA.lectures.filter(l => l.day === day);
                    return `
                        <div class="glass-panel rounded-2xl p-5">
                            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                ${day}
                            </h3>
                            <div class="space-y-3">
                                ${dayLectures.length > 0 ? dayLectures.map(lecture => renderListLecture(lecture)).join('') : '<p class="text-gray-400 text-sm text-center py-4">لا توجد محاضرات</p>'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderListLecture(lecture) {
        const isLecture = lecture.type === 'lecture';
        const icon = isLecture ? 'fa-chalkboard-user' : 'fa-users';
        const color = isLecture ? 'blue' : 'purple';
        
        return `
            <div class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group cursor-pointer">
                <div class="w-12 h-12 rounded-lg bg-${color}-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <i class="fa-solid ${icon} text-${color}-500"></i>
                </div>
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm mb-1 group-hover:text-${color}-500 transition-colors">${lecture.subject}</h4>
                    <div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span><i class="fa-solid fa-clock ml-1"></i>${lecture.time}</span>
                        <span><i class="fa-solid fa-user-tie ml-1"></i>${lecture.lecturer}</span>
                        <span><i class="fa-solid fa-location-dot ml-1"></i>${lecture.room}</span>
                    </div>
                </div>
                
                <div class="flex-shrink-0">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${isLecture ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'}">
                        ${isLecture ? 'محاضرة' : 'سكشن'}
                    </span>
                </div>
            </div>
        `;
    }

    function renderUpcomingExams() {
        const sortedExams = [...SCHEDULE_DATA.exams].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return sortedExams.map((exam, index) => {
            const examDate = new Date(exam.date);
            const today = new Date();
            const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
            const isPast = daysUntil < 0;
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;
            
            return `
                <div class="flex items-center gap-4 p-4 rounded-xl border ${isPast ? 'border-gray-300 dark:border-white/5 opacity-50' : isUrgent ? 'border-red-500/30 bg-red-500/5' : 'border-gray-200 dark:border-white/10'} transition-all hover:shadow-md group">
                    <div class="w-16 h-16 rounded-lg ${isPast ? 'bg-gray-500/10' : isUrgent ? 'bg-red-500/10' : 'bg-orange-500/10'} flex flex-col items-center justify-center flex-shrink-0">
                        <span class="text-xs font-medium ${isPast ? 'text-gray-500' : isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}">
                            ${examDate.toLocaleDateString('ar-EG', { month: 'short' })}
                        </span>
                        <span class="text-2xl font-bold ${isPast ? 'text-gray-500' : isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}">
                            ${examDate.getDate()}
                        </span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-sm mb-1">${exam.subject}</h4>
                        <div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                            <span><i class="fa-solid fa-clock ml-1"></i>${exam.time}</span>
                            <span><i class="fa-solid fa-hourglass-half ml-1"></i>${exam.duration}</span>
                            <span><i class="fa-solid fa-location-dot ml-1"></i>${exam.room}</span>
                        </div>
                    </div>
                    
                    <div class="flex-shrink-0 flex flex-col items-end gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${exam.type === 'نهائي' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}">
                            ${exam.type}
                        </span>
                        ${!isPast ? `
                            <span class="text-xs ${isUrgent ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500'}">
                                ${daysUntil === 0 ? 'اليوم' : daysUntil === 1 ? 'غداً' : `بعد ${daysUntil} يوم`}
                            </span>
                        ` : '<span class="text-xs text-gray-500">انتهى</span>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    function attachEvents() {
        const viewTableBtn = document.getElementById('view-table');
        const viewListBtn = document.getElementById('view-list');

        if (viewTableBtn) {
            const handler = function() {
                currentView = 'table';
                updateContent();
                updateViewButtons();
            };
            viewTableBtn.addEventListener('click', handler);
            eventListeners.push({ element: viewTableBtn, event: 'click', handler });
        }

        if (viewListBtn) {
            const handler = function() {
                currentView = 'list';
                updateContent();
                updateViewButtons();
            };
            viewListBtn.addEventListener('click', handler);
            eventListeners.push({ element: viewListBtn, event: 'click', handler });
        }
    }

    function updateContent() {
        const contentContainer = document.getElementById('schedule-content');
        if (contentContainer) {
            contentContainer.innerHTML = renderScheduleContent();
            
            if (App.Effects && App.Effects.initScrollAnimations) {
                App.Effects.initScrollAnimations();
            }
        }
    }

    function updateViewButtons() {
        const viewTableBtn = document.getElementById('view-table');
        const viewListBtn = document.getElementById('view-list');

        if (viewTableBtn) {
            viewTableBtn.className = `view-btn px-4 py-2 rounded text-sm font-medium transition-all ${currentView === 'table' ? 'bg-white dark:bg-white/10 shadow-md' : ''}`;
        }

        if (viewListBtn) {
            viewListBtn.className = `view-btn px-4 py-2 rounded text-sm font-medium transition-all ${currentView === 'list' ? 'bg-white dark:bg-white/10 shadow-md' : ''}`;
        }
    }

})(window.App);