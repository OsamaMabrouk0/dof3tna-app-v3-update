(function (App) {
    'use strict';

    let currentPageCleanup = null;

    App.Router.go = function (pageId, animate, pushState) {
        if (pageId === App.State.currentPage || App.State.isNavigating) {
            return;
        }

        if (animate === undefined) animate = true;
        if (pushState === undefined) pushState = true;

        App.State.isNavigating = true;

        if (App.UI.Sidebar.isOpen) {
            App.UI.Sidebar.toggle(false);
        }

        if (pageId === 'home') {
            App.UI.BottomNav.toggle(false);
        } else {
            App.UI.BottomNav.toggle(true);
        }

        const previousPage = App.State.currentPage;
        App.State.currentPage = pageId;

        if (pushState && window.history && window.history.pushState) {
            window.history.pushState(
                { page: pageId },
                '',
                '#' + pageId
            );
        }

        App.UI.Header.updateTitle(pageId);
        App.UI.Sidebar.render();

        const loadContent = function () {
            performCleanup();
            
            App.Router._mountTemplate(pageId);

            if (App.DOM.appContent) {
                App.DOM.appContent.scrollTo(0, 0);
                App.DOM.appContent.scrollTop = 0;
            }
            
            window.scrollTo(0, 0);

            if (App.Effects && App.Effects.refresh) {
                setTimeout(function () {
                    App.Effects.refresh();
                }, 100);
            }

            if (animate) {
                gsap.fromTo(
                    App.DOM.appContent,
                    { opacity: 0, y: 8 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: function () {
                            App.State.isNavigating = false;
                        }
                    }
                );
            } else {
                gsap.set(App.DOM.appContent, { opacity: 1, y: 0 });
                App.State.isNavigating = false;
            }
        };

        if (animate) {
            gsap.to(App.DOM.appContent, {
                opacity: 0,
                y: -8,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: loadContent
            });
        } else {
            loadContent();
        }
    };

    function performCleanup() {
        const oldContent = App.DOM.appContent;
        if (oldContent) {
            const allElements = oldContent.querySelectorAll('*');
            allElements.forEach(element => {
                const clone = element.cloneNode(true);
                if (element.parentNode) {
                    element.parentNode.replaceChild(clone, element);
                }
            });
        }

        if (currentPageCleanup && typeof currentPageCleanup === 'function') {
            try {
                currentPageCleanup();
            } catch (e) {
                console.error('Cleanup error:', e);
            }
            currentPageCleanup = null;
        }

        if (window._pageObservers) {
            window._pageObservers.forEach(observer => {
                if (observer && observer.disconnect) {
                    observer.disconnect();
                }
            });
            window._pageObservers = [];
        }

        if (window._pageTimers) {
            window._pageTimers.forEach(timerId => {
                clearTimeout(timerId);
                clearInterval(timerId);
            });
            window._pageTimers = [];
        }
    }

    App.Router._mountTemplate = function (pageId) {
        let templateId;

        // ✅ تحديد Template المناسب
        if (pageId === 'home') {
            templateId = 'page-home';
        } else if (pageId === 'settings') {
            templateId = 'page-settings';
        } else if (pageId === 'notifications') {
            templateId = 'page-notifications';
        } else if (pageId === 'lectures') {
            templateId = 'page-lectures';
        } else if (pageId === 'summaries') {
            templateId = 'page-summaries';
        } else if (pageId === 'links') {
            templateId = 'page-links';
        } else if (pageId === 'videos') { // ✅ إضافة
            templateId = 'page-videos';
        } else if (pageId === 'schedules') { // ✅ إضافة
            templateId = 'page-schedules';
        } else if (pageId === 'buildings') { // ✅ إضافة
            templateId = 'page-buildings';
        } else if (pageId === 'bookmarks') { // ✅ إضافة
            templateId = 'page-bookmarks';
        } else {
            templateId = 'page-default';
        }

        const template = document.getElementById(templateId);
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }

        App.DOM.appContent.replaceChildren();

        const clone = template.content.cloneNode(true);
        App.DOM.appContent.appendChild(clone);

        window._pageObservers = [];
        window._pageTimers = [];

        // ✅ تحميل الصفحة المناسبة
        if (pageId === 'home' && typeof App.Pages.home === 'function') {
            App.Pages.home();
        } else if (pageId === 'settings' && typeof App.Pages.settings === 'function') {
            App.Pages.settings();
        } else if (pageId === 'notifications' && typeof App.Pages.notifications === 'function') {
            App.Pages.notifications();
        } else if (pageId === 'lectures' && typeof App.Pages.lectures === 'function') {
            App.Pages.lectures();
        } else if (pageId === 'summaries' && typeof App.Pages.summaries === 'function') {
            App.Pages.summaries();
        } else if (pageId === 'links' && typeof App.Pages.links === 'function') {
            App.Pages.links();
        } else if (pageId === 'videos' && typeof App.Pages.videos === 'function') { // ✅ إضافة
            App.Pages.videos();
        } else if (pageId === 'schedules' && typeof App.Pages.schedules === 'function') { // ✅ إضافة
            App.Pages.schedules();
        } else if (pageId === 'buildings' && typeof App.Pages.buildings === 'function') { // ✅ إضافة
            App.Pages.buildings();
        } else if (pageId === 'bookmarks' && typeof App.Pages.bookmarks === 'function') { // ✅ إضافة
            App.Pages.bookmarks();
        } else if (typeof App.Pages.default === 'function') {
            App.Pages.default(pageId);
        }
    };

    App.Router.registerCleanup = function(cleanupFn) {
        currentPageCleanup = cleanupFn;
    };

    App.Router.initHistory = function () {
        window.addEventListener('popstate', function (e) {
            const sidebar = App.DOM.sidebar;
            const isMobile = window.innerWidth < 768;

            if (isMobile && sidebar && App.UI.Sidebar.isOpen) {
                App.UI.Sidebar.toggle(false);
                window.history.pushState(
                    { page: App.State.currentPage },
                    '',
                    '#' + App.State.currentPage
                );
                return;
            }

            App.Router.go('home', true, false);
        });

        window.addEventListener('beforeunload', function() {
            performCleanup();
        });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (App.Effects && App.Effects.pause) {
                    App.Effects.pause();
                }
            } else {
                if (App.Effects && App.Effects.resume) {
                    App.Effects.resume();
                }
            }
        });
    };

})(window.App);