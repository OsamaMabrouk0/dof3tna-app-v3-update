(function (App) {
    'use strict';

    let currentPageCleanup = null;

    App.Router.go = function (pageId, animate, pushState) {
        if (pageId === App.State.currentPage || App.State.isNavigating) return;

        if (animate === undefined) animate = true;
        if (pushState === undefined) pushState = true;

        App.State.isNavigating = true;

        if (App.UI.Sidebar.isOpen) App.UI.Sidebar.toggle(false);

        if (pageId === 'home') {
            App.UI.BottomNav.toggle(false);
        } else {
            App.UI.BottomNav.toggle(true);
        }

        const previousPage = App.State.currentPage;
        App.State.currentPage = pageId;

        if (pushState && window.history && window.history.pushState) {
            window.history.pushState({ page: pageId }, '', '#' + pageId);
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
                setTimeout(function () { App.Effects.refresh(); }, 100);
            }

            if (animate) {
                gsap.fromTo(
                    App.DOM.appContent,
                    { opacity: 0, y: 8 },
                    {
                        opacity: 1, y: 0, duration: 0.3, ease: 'power2.out',
                        onComplete: function () { App.State.isNavigating = false; }
                    }
                );
            } else {
                gsap.set(App.DOM.appContent, { opacity: 1, y: 0 });
                App.State.isNavigating = false;
            }
        };

        if (animate) {
            gsap.to(App.DOM.appContent, {
                opacity: 0, y: -8, duration: 0.2, ease: 'power2.in',
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
                if (element.parentNode) element.parentNode.replaceChild(clone, element);
            });
        }

        if (currentPageCleanup && typeof currentPageCleanup === 'function') {
            try { currentPageCleanup(); } catch (e) { console.error('Cleanup error:', e); }
            currentPageCleanup = null;
        }

        if (window._pageObservers) {
            window._pageObservers.forEach(observer => {
                if (observer && observer.disconnect) observer.disconnect();
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
        const templateMap = {
            'home':          'page-home',
            'settings':      'page-settings',
            'notifications': 'page-notifications',
            'lectures':      'page-lectures',
            'summaries':     'page-summaries',
            'links':         'page-links',
            'videos':        'page-videos',
            'schedules':     'page-schedules',
            'buildings':     'page-buildings',
            'bookmarks':     'page-bookmarks',
            'about':         'page-about'
        };

        const templateId = templateMap[pageId] || 'page-default';
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

        const pageHandlers = {
            'home':          App.Pages.home,
            'settings':      App.Pages.settings,
            'notifications': App.Pages.notifications,
            'lectures':      App.Pages.lectures,
            'summaries':     App.Pages.summaries,
            'links':         App.Pages.links,
            'videos':        App.Pages.videos,
            'schedules':     App.Pages.schedules,
            'buildings':     App.Pages.buildings,
            'bookmarks':     App.Pages.bookmarks,
            'about':         App.Pages.about
        };

        const handler = pageHandlers[pageId];
        if (typeof handler === 'function') {
            handler();
        } else if (typeof App.Pages.default === 'function') {
            App.Pages.default(pageId);
        }
    };

    App.Router.registerCleanup = function(cleanupFn) {
        currentPageCleanup = cleanupFn;
    };

    App.Router.initHistory = function () {
        window.addEventListener('beforeunload', function() { performCleanup(); });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (App.Effects && App.Effects.pause) App.Effects.pause();
            } else {
                if (App.Effects && App.Effects.resume) App.Effects.resume();
            }
        });
    };

})(window.App);