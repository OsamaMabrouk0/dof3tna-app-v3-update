(function(App) {
    'use strict';

    App.VERSION = '3.0';

    App.GOOGLE_DRIVE = {
        API_KEY: 'AIzaSyB7EeH3hx7I3Kuit6UQdpVD2jnt2QmnAWY',       //AIzaSyB7EeH3hx7I3Kuit6UQdpVD2jnt2QmnAWY  dof3tna@gmai.com
        LECTURES_FOLDER_ID: 'fCpKx2qCVyqKW-yeR9aGGN-WsQPa1Nbp',  //fCpKx2qCVyqKW-yeR9aGGN-WsQPa1Nbp  dof3tna@gmai.com
        SUMMARIES_FOLDER_ID: 'QhwlElfcRSdPk5gIrbe_mM5vql4xrrEy', //QhwlElfcRSdPk5gIrbe_mM5vql4xrrEy  dof3tna@gmai.com
        API_BASE_URL: 'https://www.googleapis.com/drive/v3',
        FIELDS: 'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,modifiedTime,description)'
    };

    App.GITHUB = {
        NOTIFICATIONS_URL: 'https://raw.githubusercontent.com/OsamaMabrouk0/dof3tna-app-v3-update/main/notifications.json',
        VIDEOS_URL:        'https://raw.githubusercontent.com/OsamaMabrouk0/dof3tna-app-v3-update/main/videos.json'
    };

    App.CACHE_KEYS = {
        LECTURES: 'cache_lectures_v3',
        SUMMARIES: 'cache_summaries_v3',
        NOTIFICATIONS: 'cache_notifications_v3',
        STATS: 'cache_stats_v3',
        RECENT_FILES: 'cache_recent_files_v3',
        LECTURES_STRUCTURE: 'cache_lectures_structure_v3',
        SUMMARIES_STRUCTURE: 'cache_summaries_structure_v3',
        LECTURES_STATS: 'cache_lectures_stats_v3',
        SUMMARIES_STATS: 'cache_summaries_stats_v3'
    };

    App.CACHE_DURATION = 24 * 60 * 60 * 1000;

    App.PAGES = [
        {
            id: 'lectures',
            title: 'المحاضرات',
            icon: 'fa-solid fa-chalkboard-user',
            color: 'text-blue-400',
            bg: 'from-blue-500/20 to-blue-600/5',
            description: 'جميع المحاضرات والدروس'
        },
        {
            id: 'summaries',
            title: 'الملخصات',
            icon: 'fa-solid fa-file-pen',
            color: 'text-cyan-400',
            bg: 'from-cyan-500/20 to-cyan-600/5',
            description: 'ملخصات شاملة للمواد'
        },
        {
            id: 'videos',
            title: 'الفيديوهات',
            icon: 'fa-brands fa-youtube',
            color: 'text-red-400',
            bg: 'from-red-500/20 to-red-600/5',
            description: 'مكتبة الفيديوهات التعليمية'
        },
        {
            id: 'links',
            title: 'الروابط',
            icon: 'fa-solid fa-link',
            color: 'text-indigo-400',
            bg: 'from-indigo-500/20 to-indigo-600/5',
            description: 'روابط مفيدة ومصادر إضافية'
        },
        {
            id: 'schedules',
            title: 'الجداول',
            icon: 'fa-regular fa-calendar-days',
            color: 'text-emerald-400',
            bg: 'from-emerald-500/20 to-emerald-600/5',
            description: 'جداول المحاضرات والاختبارات'
        },
        {
            id: 'buildings',
            title: 'المباني',
            icon: 'fa-solid fa-building-columns',
            color: 'text-amber-400',
            bg: 'from-amber-500/20 to-amber-600/5',
            description: 'مواقع المباني والقاعات'
        },
        {
            id: 'notifications',
            title: 'الاشعارات',
            icon: 'fa-solid fa-bell',
            color: 'text-rose-400',
            bg: 'from-rose-500/20 to-rose-600/5',
            description: 'جميع الإشعارات والتنبيهات'
        },
        {
            id: 'settings',
            title: 'الاعدادات',
            icon: 'fa-solid fa-gear',
            color: 'text-slate-400',
            bg: 'from-slate-500/20 to-slate-600/5',
            description: 'تخصيص التطبيق وإعداداته'
        },
        {
            id: 'about',
            title: 'حول',
            icon: 'fa-solid fa-circle-info',
            color: 'text-violet-400',
            bg: 'from-violet-500/20 to-violet-600/5',
            description: 'معلومات عن المنصة والمطور'
        }
    ];

    App.NOTIFICATIONS = [];

})(window.App);
