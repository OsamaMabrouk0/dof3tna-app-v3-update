(function(App) {
    'use strict';
    
    // ✅ الروابط المهمة - استبدل "YOUR_LINK_HERE" بالروابط الحقيقية
    const IMPORTANT_LINKS = [
        {
            id: 'college-services',
            title: 'خدمات الكلية',
            description: 'بوابة الخدمات الإلكترونية للطلاب',
            icon: 'fa-graduation-cap',
            color: 'blue',
            gradient: 'from-blue-500/20 to-blue-600/5',
            url: 'https://umis.alexu.edu.eg/umisapp/Registration/ED_Login.aspx',
            category: 'academic'
        },
        {
            id: 'college-website',
            title: 'موقع الكلية',
            description: 'الموقع الرسمي لكلية التجارة',
            icon: 'fa-building-columns',
            color: 'indigo',
            gradient: 'from-indigo-500/20 to-indigo-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'academic'
        },
        {
            id: 'online-platform',
            title: 'منصة التعليم الإلكتروني',
            description: 'منصة المحاضرات والاختبارات الأونلاين',
            icon: 'fa-laptop-code',
            color: 'purple',
            gradient: 'from-purple-500/20 to-purple-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'academic'
        },
        {
            id: 'facebook-college',
            title: 'صفحة الكلية - فيسبوك',
            description: 'الأخبار والإعلانات الرسمية',
            icon: 'fa-facebook',
            color: 'blue',
            gradient: 'from-blue-600/20 to-blue-700/5',
            url: 'YOUR_LINK_HERE',
            category: 'social'
        },
        {
            id: 'facebook-affairs',
            title: 'شؤون الطلاب - فيسبوك',
            description: 'متابعة شؤون الطلاب والخدمات',
            icon: 'fa-facebook',
            color: 'cyan',
            gradient: 'from-cyan-500/20 to-cyan-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'social'
        },
        {
            id: 'college-books',
            title: 'مكتبة الكتب الجامعية',
            description: 'روابط تحميل الكتب والمراجع',
            icon: 'fa-book-open',
            color: 'emerald',
            gradient: 'from-emerald-500/20 to-emerald-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'resources'
        },
        {
            id: 'student-union',
            title: 'اتحاد الطلاب',
            description: 'أنشطة وفعاليات اتحاد الطلاب',
            icon: 'fa-users',
            color: 'orange',
            gradient: 'from-orange-500/20 to-orange-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'social'
        },
        {
            id: 'academic-calendar',
            title: 'التقويم الأكاديمي',
            description: 'مواعيد الامتحانات والعطلات',
            icon: 'fa-calendar-days',
            color: 'rose',
            gradient: 'from-rose-500/20 to-rose-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'academic'
        },
        {
            id: 'library',
            title: 'المكتبة الرقمية',
            description: 'قواعد البيانات والأبحاث العلمية',
            icon: 'fa-book-bookmark',
            color: 'violet',
            gradient: 'from-violet-500/20 to-violet-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'resources'
        },
        {
            id: 'email',
            title: 'البريد الجامعي',
            description: 'الوصول إلى البريد الإلكتروني الجامعي',
            icon: 'fa-envelope',
            color: 'red',
            gradient: 'from-red-500/20 to-red-600/5',
            url: 'YOUR_LINK_HERE',
            category: 'academic'
        }
    ];
    
    App.Pages.links = function() {
        const container = document.getElementById('app-content');
        if (!container) return;
        
        renderLinksPage(container);
        attachLinkEvents();
        
        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }
    };
    
    function renderLinksPage(container) {
        const academicLinks = IMPORTANT_LINKS.filter(link => link.category === 'academic');
        const socialLinks = IMPORTANT_LINKS.filter(link => link.category === 'social');
        const resourceLinks = IMPORTANT_LINKS.filter(link => link.category === 'resources');
        
        container.innerHTML = `
            <div class="container mx-auto max-w-6xl pb-24 space-y-8">
                <!-- Header -->
                <div class="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden scroll-animate">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20 animate-float">
                            <i class="fa-solid fa-link text-3xl text-indigo-400"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold mb-1 gradient-text">الروابط المهمة</h1>
                            <p class="text-gray-500 dark:text-gray-300 text-xs md:text-sm">روابط مفيدة ومصادر إضافية للطلاب</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-link absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>
                </div>
                
                <!-- Academic Links -->
                <section class="scroll-animate">
                    <div class="flex items-center gap-3 mb-4 px-2">
                        <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <i class="fa-solid fa-graduation-cap text-blue-500"></i>
                        </div>
                        <h2 class="text-xl font-bold">الروابط الأكاديمية</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${renderLinkCards(academicLinks)}
                    </div>
                </section>
                
                <!-- Social Links -->
                <section class="scroll-animate">
                    <div class="flex items-center gap-3 mb-4 px-2">
                        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <i class="fa-solid fa-users text-cyan-500"></i>
                        </div>
                        <h2 class="text-xl font-bold">وسائل التواصل</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${renderLinkCards(socialLinks)}
                    </div>
                </section>
                
                <!-- Resource Links -->
                <section class="scroll-animate">
                    <div class="flex items-center gap-3 mb-4 px-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <i class="fa-solid fa-book text-emerald-500"></i>
                        </div>
                        <h2 class="text-xl font-bold">المصادر التعليمية</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${renderLinkCards(resourceLinks)}
                    </div>
                </section>
                
                <!-- Quick Info Section -->
                <section class="glass-panel rounded-2xl p-6 scroll-animate bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-info-circle text-2xl text-blue-500"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold mb-2">ملاحظة مهمة</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                جميع الروابط المذكورة هي روابط رسمية ومعتمدة من الكلية. في حالة عدم عمل أي رابط، يرجى الإبلاغ عنه من خلال قسم الإشعارات.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }
    
    function renderLinkCards(links) {
        return links.map(link => `
            <div class="link-card group cursor-pointer" data-url="${link.url}">
                <div class="glass-panel rounded-xl p-5 hover:shadow-xl transition-all hover:-translate-y-1 border border-${link.color}-500/10 hover:border-${link.color}-500/30 h-full relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div class="relative z-10">
                        <div class="flex items-start justify-between mb-3">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-${link.color}-500/20">
                                <i class="fa-solid ${link.icon} text-xl text-${link.color}-500"></i>
                            </div>
                            <i class="fa-solid fa-arrow-up-left text-${link.color}-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        
                        <h3 class="font-bold text-base mb-2 group-hover:text-${link.color}-500 dark:group-hover:text-${link.color}-400 transition-colors">
                            ${link.title}
                        </h3>
                        
                        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            ${link.description}
                        </p>
                        
                        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <span class="text-[10px] text-${link.color}-500 font-medium flex items-center gap-1">
                                <i class="fa-solid fa-external-link"></i>
                                رابط خارجي
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function attachLinkEvents() {
        const linkCards = document.querySelectorAll('.link-card');
        
        linkCards.forEach(card => {
            card.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                
                if (url === 'YOUR_LINK_HERE') {
                    App.Toast.warning('هذا الرابط لم يتم تحديثه بعد', 'انتظر التحديث');
                    return;
                }
                
                window.open(url, '_blank');
            });
        });
    }
    
})(window.App);