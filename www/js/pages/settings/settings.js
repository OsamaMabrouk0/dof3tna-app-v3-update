(function (App) {
    'use strict';

    const DEFAULTS = {
        darkMode: true,
        oledMode: false,
        animationsEnabled: true,
        particlesEnabled: true,
        accentColor: 'default',
        fontFamily: 'cairo',
        fontSize: 'md',
        reduceTransparency: false,
        compactMode: false,
        scrollAnimations: true,
        fullscreenNav: false,
    };

    const ACCENT_COLORS = [
        { key: 'default', label: 'افتراضي', hex: '#3b82f6' },
        { key: 'indigo', label: 'نيلي', hex: '#6366f1' },
        { key: 'violet', label: 'بنفسجي', hex: '#8b5cf6' },
        { key: 'emerald', label: 'أخضر', hex: '#10b981' },
        { key: 'cyan', label: 'سماوي', hex: '#06b6d4' },
        { key: 'rose', label: 'وردي', hex: '#f43f5e' },
        { key: 'orange', label: 'برتقالي', hex: '#f97316' },
        { key: 'amber', label: 'ذهبي', hex: '#f59e0b' },
        { key: 'custom', label: 'مخصص', hex: null },
    ];

    const FONT_SIZES = [
        { key: 'sm', label: 'صغير', factor: .9 },
        { key: 'md', label: 'متوسط', factor: 1 },
        { key: 'lg', label: 'كبير', factor: 1.1 },
    ];

    const FONT_FAMILIES = [
        { key: 'cairo', label: 'Cairo', css: "'Cairo', sans-serif", url: null },
        { key: 'tajawal', label: 'Tajawal', css: "'Tajawal', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700&display=swap' },
        { key: 'amiri', label: 'Amiri', css: "'Amiri', serif", url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap' },
        { key: 'ibm', label: 'IBM Arabic', css: "'IBM Plex Arabic', sans-serif", url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;700&display=swap' },
    ];

    let eventListeners = [];

    function on(el, ev, fn) {
        if (!el) return;
        el.addEventListener(ev, fn);
        eventListeners.push({ el, ev, fn });
    }

    function cleanup() {
        eventListeners.forEach(({ el, ev, fn }) => el?.removeEventListener(ev, fn));
        eventListeners = [];
    }

    function getSetting(key) {
        const v = localStorage.getItem('app_s_' + key);
        if (v === null) return DEFAULTS[key] !== undefined ? DEFAULTS[key] : null;
        try { return JSON.parse(v); } catch { return v; }
    }

    function setSetting(key, val) {
        localStorage.setItem('app_s_' + key, JSON.stringify(val));
        if (App._settings) App._settings[key] = val;
    }

    App.Settings = App.Settings || {};

    App.Settings.applyAll = function () {
        applyDark(getSetting('darkMode'));
        applyOled(getSetting('oledMode'));
        applyAnimations(getSetting('animationsEnabled'));
        applyScrollAnimations(getSetting('scrollAnimations'));
        applyParticles(getSetting('particlesEnabled'));
        applyReduceTransparency(getSetting('reduceTransparency'));
        applyCompactMode(getSetting('compactMode'));
        applyFontSize(getSetting('fontSize'));
        applyFontFamily(getSetting('fontFamily'));
        applyFullscreenNav(getSetting('fullscreenNav'));
        const acc = getSetting('accentColor') || 'default';
        const customHex = getSetting('customAccentColor');
        applyAccent(acc, customHex);
    };

    App.Settings.initGlobal = function () {
        if (App.Settings._booted) return;
        App.Settings._booted = true;
        App.Settings.applyAll();

        function _persistTheme() {
            setTimeout(function () {
                var nowDark = document.documentElement.classList.contains('dark');
                setSetting('darkMode', nowDark);
                if (!nowDark) {
                    setSetting('oledMode', false);
                    document.documentElement.classList.remove('oled');
                }
            }, 80);
        }

        function _attachGlobalThemeBtn() {
            var btn = document.getElementById('theme-btn');
            if (btn) {
                btn.removeEventListener('click', _persistTheme);
                btn.addEventListener('click', _persistTheme);
                App.Settings._globalThemeListener = _persistTheme;
            }
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            _attachGlobalThemeBtn();
        } else {
            document.addEventListener('DOMContentLoaded', _attachGlobalThemeBtn);
        }
    };

    App.Pages.settings = function () {
        cleanup();
        const container = document.getElementById('app-content');
        if (!container) return;
        injectCSS();
        renderPage(container);
        syncAllToggles();
        attachEvents();
        updateOledRowState();
        if (App.Effects?.refresh) App.Effects.refresh();
        App.Router.registerCleanup(cleanup);
    };

    App.Pages.about = function () {
        const container = document.getElementById('app-content');
        if (!container) return;
        injectAboutCSS();
        renderAboutPage(container);
        if (App.Effects?.refresh) App.Effects.refresh();
    };

    function injectAboutCSS() {
        if (document.getElementById('_ab_css')) return;
        const s = document.createElement('style');
        s.id = '_ab_css';
        s.textContent = `
#_ab_root { font-family: inherit; }
.ab-hero {
    position: relative; overflow: hidden;
    border-radius: 1.25rem;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(139,92,246,.2);
    padding: 2rem 1.5rem 1.5rem;
    text-align: center;
}
html:not(.dark) .ab-hero {
    background: rgba(255,255,255,.85);
    border-color: rgba(139,92,246,.2);
    box-shadow: 0 4px 24px rgba(139,92,246,.08);
}
.ab-hero-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 0%, rgba(139,92,246,.18) 0%, transparent 65%);
}
.ab-logo {
    width: 4.5rem; height: 4.5rem; border-radius: 1.25rem;
    background: linear-gradient(135deg, #6d28d9, #7c3aed, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto .9rem;
    box-shadow: 0 8px 32px rgba(109,40,217,.35);
}
.ab-version-badge {
    display: inline-flex; align-items: center; gap: .35rem;
    font-size: .62rem; font-weight: 800;
    padding: .22rem .65rem; border-radius: 999px;
    background: rgba(139,92,246,.12);
    border: 1px solid rgba(139,92,246,.28);
    color: #a78bfa;
    margin-bottom: .6rem;
    letter-spacing: .04em;
}
.ab-card {
    border-radius: 1.05rem;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(255,255,255,.07);
    overflow: hidden;
    animation: _ab_in .22s both;
}
html:not(.dark) .ab-card {
    background: rgba(255,255,255,.82);
    border-color: rgba(0,0,0,.07);
    box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.ab-sec {
    display: flex; align-items: center; gap: .45rem;
    font-size: .6rem; font-weight: 800;
    letter-spacing: .07em; text-transform: uppercase;
    color: rgba(156,163,175,.38);
    padding: .55rem .1rem .2rem;
}
.ab-sec i { font-size: .58rem; }
.ab-feature-row {
    display: flex; align-items: flex-start; gap: .75rem;
    padding: .75rem 1rem;
    transition: background .13s;
}
.ab-feature-row + .ab-feature-row {
    border-top: 1px solid rgba(255,255,255,.04);
}
html:not(.dark) .ab-feature-row + .ab-feature-row {
    border-color: rgba(0,0,0,.05);
}
.ab-feature-ico {
    width: 2rem; height: 2rem; border-radius: .5rem;
    flex-shrink: 0; display: flex; align-items: center;
    justify-content: center; font-size: .8rem;
}
.ab-feature-title { font-size: .78rem; font-weight: 700; }
.ab-feature-desc { font-size: .62rem; color: rgba(156,163,175,.55); margin-top: .06rem; line-height: 1.4; }
.ab-dev-card {
    border-radius: 1.05rem;
    background: linear-gradient(135deg, rgba(109,40,217,.08), rgba(79,70,229,.06));
    border: 1px solid rgba(139,92,246,.18);
    padding: 1.25rem 1rem;
    display: flex; align-items: center; gap: 1rem;
}
html:not(.dark) .ab-dev-card {
    background: linear-gradient(135deg, rgba(109,40,217,.06), rgba(79,70,229,.04));
}
.ab-dev-avatar {
    width: 3.5rem; height: 3.5rem; border-radius: 50%;
    background: linear-gradient(135deg, #6d28d9, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
    box-shadow: 0 4px 18px rgba(109,40,217,.3);
}
.ab-dev-name { font-size: .87rem; font-weight: 800; margin-bottom: .15rem; }
.ab-dev-role { font-size: .62rem; color: #a78bfa; font-weight: 600; }
.ab-contact-row {
    display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .75rem;
}
.ab-contact-btn {
    display: inline-flex; align-items: center; gap: .35rem;
    font-size: .67rem; font-weight: 700;
    padding: .38rem .72rem; border-radius: .52rem;
    cursor: pointer; transition: all .15s;
    font-family: inherit; text-decoration: none;
    border: 1px solid;
}
.ab-btn-gh  { background: rgba(255,255,255,.06); color: rgba(209,213,219,.9); border-color: rgba(255,255,255,.1); }
.ab-btn-gh:hover  { background: rgba(255,255,255,.12); transform: translateY(-1px); }
html:not(.dark) .ab-btn-gh  { background: rgba(0,0,0,.05); color: rgba(30,30,30,.8); border-color: rgba(0,0,0,.1); }
.ab-btn-tg  { background: rgba(14,165,233,.1); color: #38bdf8; border-color: rgba(14,165,233,.2); }
.ab-btn-tg:hover  { background: rgba(14,165,233,.18); transform: translateY(-1px); }
.ab-btn-wa  { background: rgba(34,197,94,.09); color: #4ade80; border-color: rgba(34,197,94,.2); }
.ab-btn-wa:hover  { background: rgba(34,197,94,.16); transform: translateY(-1px); }
.ab-btn-fb { background: rgba(24,119,242,.1); color: #60a5fa; border-color: rgba(24,119,242,.2); }
.ab-btn-fb:hover { background: rgba(24,119,242,.18); transform: translateY(-1px); }
.ab-footer {
    text-align: center;
    font-size: .6rem;
    color: rgb(156, 163, 175);
    padding: .6rem 0 .2rem;
    line-height: 1.7;
}
@keyframes _ab_in { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
.ab-card { animation: _ab_in .22s both; }
        `;
        document.head.appendChild(s);
    }

    function renderAboutPage(c) {
        const features = [
            { ico: 'fa-solid fa-bolt', bg: 'rgba(59,130,246,.12)', clr: '#60a5fa', title: 'واجهة احترافية جديدة', desc: 'تصميم كامل من الصفر بأسلوب Glassmorphism مع تأثيرات GSAP' },
            { ico: 'fa-solid fa-folder-tree', bg: 'rgba(16,185,129,.12)', clr: '#34d399', title: 'نظام مجلدات هرمي', desc: 'تصفح المحاضرات والملخصات في هيكل تنظيمي متعدد المستويات' },
            { ico: 'fa-solid fa-video', bg: 'rgba(239,68,68,.12)', clr: '#f87171', title: 'مكتبة فيديوهات', desc: 'تشغيل مدمج ومنظم لجميع الفيديوهات التعليمية' },
            { ico: 'fa-solid fa-bell', bg: 'rgba(245,158,11,.12)', clr: '#fbbf24', title: 'نظام إشعارات ذكي', desc: 'إشعارات فورية مع عداد للرسائل غير المقروءة' },
            { ico: 'fa-solid fa-palette', bg: 'rgba(139,92,246,.12)', clr: '#a78bfa', title: 'تخصيص كامل', desc: 'ألوان تمييز، خطوط متعددة، وضع OLED، وضع مضغوط' },
            { ico: 'fa-solid fa-wifi-slash', bg: 'rgba(249,115,22,.12)', clr: '#fb923c', title: 'دعم وضع عدم الاتصال', desc: 'التخزين المؤقت يضمن استمرار العمل بدون إنترنت' },
        ];

        const fixes = [
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'إعادة هيكلة كاملة للكود بنهج Module Pattern' },
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'تحسين أداء التحميل وتقليل وقت الاستجابة' },
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'إصلاح تعارض زر الرجوع في Android WebView' },
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'تحسين إدارة الذاكرة وتنظيف Event Listeners' },
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'دعم كامل للوضع الليلي والـ OLED على جميع الصفحات' },
            { ico: 'fa-solid fa-check', clr: '#34d399', text: 'شريط تنقل سفلي محسّن مع انتقالات سلسة' },
        ];

        c.innerHTML = `
<div id="_ab_root" class="container mx-auto max-w-2xl pb-24 space-y-1">

    <div class="ab-hero scroll-animate" style="animation-delay:.02s">
        <div class="ab-hero-glow"></div>
        <div class="ab-logo relative z-10">
            <i class="fa-solid fa-graduation-cap text-3xl text-white"></i>
        </div>
        <div class="relative z-10">
            <div class="ab-version-badge">
                <i class="fa-solid fa-tag"></i>
                الإصدار 3.0
            </div>
            <h1 class="text-2xl font-black mb-1" style="background:linear-gradient(135deg,#7c3aed,#6366f1,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">منصة دفعتنا</h1>
            <p class="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">منصة تعليمية متكاملة تجمع المحاضرات والملخصات والفيديوهات في مكان واحد لدعم رحلتك الأكاديمية</p>
        </div>
        <div class="relative z-10 mt-4 flex justify-center gap-3 text-center">
            <div>
                <div class="text-lg font-black" style="color:#a78bfa">3.0</div>
                <div class="text-[10px] text-gray-400">الإصدار</div>
            </div>
            <div class="w-px bg-white/10 self-stretch mx-1"></div>
            <div>
                <div class="text-lg font-black" style="color:#60a5fa">2024</div>
                <div class="text-[10px] text-gray-400">سنة الإطلاق</div>
            </div>
            <div class="w-px bg-white/10 self-stretch mx-1"></div>
            <div>
                <div class="text-lg font-black" style="color:#34d399">PWA</div>
                <div class="text-[10px] text-gray-400">التقنية</div>
            </div>
        </div>
    </div>

    <p class="ab-sec"><i class="fa-solid fa-star"></i> مميزات الإصدار 3.0</p>
    <div class="ab-card scroll-animate" style="animation-delay:.06s">
        ${features.map(f => `
        <div class="ab-feature-row">
            <div class="ab-feature-ico" style="background:${f.bg};color:${f.clr}">
                <i class="${f.ico}"></i>
            </div>
            <div>
                <div class="ab-feature-title">${f.title}</div>
                <div class="ab-feature-desc">${f.desc}</div>
            </div>
        </div>`).join('')}
    </div>

    <p class="ab-sec"><i class="fa-solid fa-wrench"></i> إصلاحات وتحسينات</p>
    <div class="ab-card scroll-animate" style="animation-delay:.09s">
        ${fixes.map(f => `
        <div class="ab-feature-row">
            <div class="ab-feature-ico" style="background:${f.clr}14;color:${f.clr}">
                <i class="${f.ico}"></i>
            </div>
            <div class="ab-feature-title" style="padding-top:.25rem">${f.text}</div>
        </div>`).join('')}
    </div>

    <p class="ab-sec"><i class="fa-solid fa-user-code"></i> المطور</p>
    <div class="ab-card scroll-animate" style="animation-delay:.12s">
        <div class="ab-feature-row" style="border:none">
            <div class="ab-dev-avatar">👨‍💻</div>
            <div style="flex:1">
                <div class="ab-dev-name">أسامة مبروك</div>
                <div class="ab-dev-role"><i class="fa-solid fa-code ml-1"></i>Full-Stack & Mobile App Developer</div>
                    <div class="ab-contact-row">
                        <a href="https://github.com/OsamaMabrouk0" target="_blank" class="ab-contact-btn ab-btn-gh">
                            <i class="fa-brands fa-github"></i> GitHub
                        </a>
                        <a href="https://t.me/OsamaMabrouk" target="_blank" class="ab-contact-btn ab-btn-tg">
                            <i class="fa-brands fa-telegram"></i> Telegram
                        </a>
                        <a href="https://wa.me/201229288395?text=السلام%20عليكم%20ورحمة%20الله%20وبركاته%20،%20جيلك%20من%20تطبيق%20دفعتنا" target="_blank" class="ab-contact-btn ab-btn-wa">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp
                        </a>
                        <a href="https://www.facebook.com/share/1DnKJPp1Au/" target="_blank" class="ab-contact-btn ab-btn-fb">
                            <i class="fa-brands fa-facebook"></i> Facebook
                        </a>
                    </div>
            </div>
        </div>
    </div>


    <div class="ab-footer scroll-animate" style="animation-delay:.16s">
        <div>منصة دفعتنا • الإصدار 3.0 • 2026</div>
        <div style="margin-top:.2rem">مبني بـ ❤️ لدعم الطلاب في رحلتهم الأكاديمية</div>
    </div>
</div>`;
    }

    function injectCSS() {
        if (document.getElementById('_sp_css')) return;
        const s = document.createElement('style');
        s.id = '_sp_css';
        s.textContent = `
html.no-animations *,html.no-animations *::before,html.no-animations *::after{
    animation:none!important;transition:none!important;}
html.no-scroll-anims .scroll-animate{opacity:1!important;transform:none!important;transition:none!important;}
html.reduce-tp .glass-panel{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgba(15,23,42,.97)!important;}
html:not(.dark).reduce-tp .glass-panel{background:rgba(248,250,252,.99)!important;}
html.compact .glass-panel{padding:.65rem!important;}
html.compact .space-y-6>*+*{margin-top:.65rem!important;}
html.compact .space-y-4>*+*{margin-top:.45rem!important;}
#bottom-nav{
    transition: transform .4s cubic-bezier(.4,0,.2,1),
                opacity .35s ease,
                filter .35s ease !important;
}
html.hide-bottom-nav #bottom-nav{
    transform: translateY(calc(100% + 1.5rem)) !important;
    opacity: 0 !important;
    filter: blur(4px) !important;
    pointer-events: none !important;
}
#_sp_root{font-family:inherit;}
.sp-card{border-radius:1.05rem;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);overflow:hidden;}
html:not(.dark) .sp-card{background:rgba(255,255,255,.82);border-color:rgba(0,0,0,.07);box-shadow:0 1px 3px rgba(0,0,0,.05);}
.sp-sec{display:flex;align-items:center;gap:.45rem;font-size:.6rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:rgba(156,163,175,.38);padding:.55rem .1rem .2rem;}
.sp-sec i{font-size:.58rem;}
.sp-row{display:flex;align-items:center;justify-content:space-between;gap:.7rem;padding:.72rem 1rem;transition:background .13s;}
.sp-row+.sp-row{border-top:1px solid rgba(255,255,255,.04);}
html:not(.dark) .sp-row+.sp-row{border-color:rgba(0,0,0,.05);}
.sp-row:hover{background:rgba(255,255,255,.022);}
html:not(.dark) .sp-row:hover{background:rgba(0,0,0,.012);}
.sp-row.sp-dim{opacity:.32;pointer-events:none;}
.sp-ico{width:1.95rem;height:1.95rem;border-radius:.52rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.76rem;border:1px solid transparent;}
.sp-body{flex:1;min-width:0;}
.sp-lbl{font-size:.79rem;font-weight:700;}
.sp-desc{font-size:.61rem;color:rgba(156,163,175,.5);margin-top:.04rem;}
.sp-tw{position:relative;flex-shrink:0;}
.sp-ti{position:absolute;opacity:0;width:0;height:0;}
.sp-tt{display:block;width:2.3rem;height:1.28rem;border-radius:999px;background:rgba(255,255,255,.1);cursor:pointer;position:relative;border:1px solid rgba(255,255,255,.1);transition:background .18s,border-color .18s;}
html:not(.dark) .sp-tt{background:rgba(0,0,0,.11);border-color:rgba(0,0,0,.1);}
.sp-tt::after{content:'';position:absolute;top:.13rem;right:.13rem;width:.94rem;height:.94rem;border-radius:50%;background:rgba(255,255,255,.55);transition:transform .2s cubic-bezier(.34,1.4,.64,1),background .18s;}
html:not(.dark) .sp-tt::after{background:rgba(0,0,0,.32);}
.sp-ti:checked+.sp-tt{background:var(--tc,#3b82f6);border-color:transparent;}
.sp-ti:checked+.sp-tt::after{background:#fff;transform:translateX(-1.02rem);}
.sp-sws{display:flex;gap:.45rem;flex-wrap:wrap;padding:.55rem 1rem .8rem;align-items:center;}
.sp-sw{width:1.5rem;height:1.5rem;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .18s cubic-bezier(.34,1.4,.64,1);position:relative;flex-shrink:0;}
.sp-sw:hover{transform:scale(1.14);}
.sp-sw.on{border-color:rgba(255,255,255,.9);transform:scale(1.2);box-shadow:0 0 0 3px rgba(255,255,255,.11);}
.sp-sw[data-ac="default"]{background:linear-gradient(135deg,#3b82f6,#06b6d4);}
.sp-sw[data-ac="default"]::before{content:'↺';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:rgba(255,255,255,.95);font-style:normal;font-family:sans-serif;border-radius:50%;}
.sp-custom-wrap{position:relative;width:1.5rem;height:1.5rem;border-radius:50%;flex-shrink:0;}
.sp-custom-wrap input[type="color"]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;border:none;padding:0;border-radius:50%;}
.sp-custom-circle{width:1.5rem;height:1.5rem;border-radius:50%;border:2px solid rgba(255,255,255,.22);pointer-events:none;background:conic-gradient(red 0deg,#ff0 60deg,lime 120deg,cyan 180deg,blue 240deg,magenta 300deg,red 360deg);transition:transform .18s;}
.sp-custom-wrap:hover .sp-custom-circle{transform:scale(1.14);}
.sp-custom-wrap.on .sp-custom-circle{border-color:rgba(255,255,255,.9);transform:scale(1.2);box-shadow:0 0 0 3px rgba(255,255,255,.11);}
.sp-ffb{display:flex;gap:.3rem;padding:.55rem 1rem .8rem;flex-wrap:wrap;}
.sp-ff{flex:1;min-width:3.6rem;padding:.42rem .3rem;border-radius:.5rem;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);font-size:.7rem;font-weight:700;cursor:pointer;transition:all .14s;color:rgba(156,163,175,.55);display:flex;align-items:center;justify-content:center;}
html:not(.dark) .sp-ff{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.08);color:rgba(0,0,0,.32);}
.sp-ff:hover{background:rgba(255,255,255,.08);}
.sp-ff.on{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.32);color:#a5b4fc;}
html:not(.dark) .sp-ff.on{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.28);color:#4f46e5;}
.sp-fsb{display:flex;gap:.3rem;padding:.55rem 1rem .8rem;}
.sp-fb{flex:1;padding:.4rem .3rem;border-radius:.5rem;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);font-family:inherit;font-size:.7rem;font-weight:700;cursor:pointer;transition:all .14s;color:rgba(156,163,175,.55);display:flex;align-items:center;justify-content:center;gap:.28rem;}
html:not(.dark) .sp-fb{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.08);color:rgba(0,0,0,.32);}
.sp-fb:hover{background:rgba(255,255,255,.08);}
.sp-fb.on{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.32);color:#a5b4fc;}
html:not(.dark) .sp-fb.on{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.28);color:#4f46e5;}
.sp-status{display:grid;grid-template-columns:repeat(3,1fr);}
.sp-stat{display:flex;flex-direction:column;align-items:center;gap:.28rem;padding:.72rem .35rem;}
.sp-stat+.sp-stat{border-right:1px solid rgba(255,255,255,.05);}
html:not(.dark) .sp-stat+.sp-stat{border-color:rgba(0,0,0,.06);}
.sp-stat-ico{width:2.1rem;height:2.1rem;border-radius:.55rem;display:flex;align-items:center;justify-content:center;font-size:.85rem;}
.sp-stat-val{font-size:.67rem;font-weight:800;color:rgba(255,255,255,.75);}
html:not(.dark) .sp-stat-val{color:rgba(0,0,0,.6);}
.sp-stat-key{font-size:.54rem;color:rgba(156,163,175,.42);}
.sp-badges{border-top:1px solid rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;gap:.45rem;padding:.38rem .8rem;flex-wrap:wrap;}
.sp-badge{display:inline-flex;align-items:center;gap:.22rem;font-size:.57rem;font-weight:700;padding:.16rem .48rem;border-radius:999px;border:1px solid;}
.sp-badge.on{background:rgba(52,211,153,.08);color:#34d399;border-color:rgba(52,211,153,.2);}
.sp-badge.off{background:rgba(107,114,128,.07);color:rgba(156,163,175,.4);border-color:rgba(107,114,128,.1);}
.sp-ab{padding:.38rem .82rem;border-radius:.5rem;font-family:inherit;font-size:.69rem;font-weight:800;cursor:pointer;transition:all .14s;flex-shrink:0;}
.sp-ora{background:rgba(249,115,22,.12);color:#fb923c;border:1px solid rgba(249,115,22,.2);}
.sp-ora:hover{background:rgba(249,115,22,.2);}
.sp-red{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2);}
.sp-red:hover{background:rgba(239,68,68,.2);}

.sp-card.sp-cache{border-color:rgba(249,115,22,.16);background:rgba(249,115,22,.025);}
.sp-cache-header{display:flex;align-items:center;gap:.7rem;padding:.72rem 1rem .5rem;}
.sp-cache-icon-wrap{width:2.1rem;height:2.1rem;border-radius:.52rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.82rem;background:rgba(249,115,22,.12);color:#fb923c;border:1px solid rgba(249,115,22,.22);}
.sp-cache-body{padding:.25rem 1rem .9rem;border-top:1px solid rgba(249,115,22,.08);margin-top:.05rem;}
.sp-cache-chips{display:flex;flex-wrap:wrap;gap:.3rem;padding:.55rem 0 .7rem;}
.sp-cache-chip{display:inline-flex;align-items:center;gap:.28rem;font-size:.58rem;font-weight:700;padding:.2rem .55rem;border-radius:999px;background:rgba(249,115,22,.08);color:rgba(251,146,60,.75);border:1px solid rgba(249,115,22,.14);}
.sp-cache-note{display:flex;align-items:center;gap:.38rem;padding:.42rem .6rem;border-radius:.5rem;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.12);margin-bottom:.7rem;}
.sp-cache-note i{color:#34d399;font-size:.65rem;flex-shrink:0;}
.sp-cache-note span{font-size:.63rem;color:rgba(52,211,153,.8);font-weight:600;line-height:1.4;}
.sp-cache-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.55rem;padding:.7rem 1.2rem;border-radius:.65rem;background:rgba(249,115,22,.1);color:#fb923c;border:1px solid rgba(249,115,22,.22);font-size:.78rem;font-weight:800;cursor:pointer;transition:all .17s cubic-bezier(.4,0,.2,1);font-family:inherit;letter-spacing:.02em;}
.sp-cache-btn:hover{background:rgba(249,115,22,.18);border-color:rgba(249,115,22,.38);color:#fdba74;transform:translateY(-1px);box-shadow:0 4px 18px rgba(249,115,22,.18);}
.sp-cache-btn:active{transform:translateY(0) scale(.98);}

.sp-card.sp-dng{border-color:rgba(239,68,68,.17);background:rgba(239,68,68,.027);}
.sp-reset-header{display:flex;align-items:center;gap:.7rem;padding:.72rem 1rem .55rem;}
.sp-reset-icon-wrap{width:2.1rem;height:2.1rem;border-radius:.52rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.85rem;background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.22);}
.sp-reset-body{padding:.3rem 1rem .9rem;border-top:1px solid rgba(239,68,68,.1);margin-top:.1rem;}
.sp-reset-info{margin-bottom:.75rem;}
.sp-reset-info-row{display:flex;align-items:flex-start;gap:.6rem;padding:.55rem 0 .4rem;}
.sp-reset-chips{display:flex;flex-wrap:wrap;gap:.3rem;padding-bottom:.15rem;}
.sp-chip{display:inline-flex;align-items:center;gap:.25rem;font-size:.57rem;font-weight:700;padding:.18rem .52rem;border-radius:999px;background:rgba(239,68,68,.08);color:rgba(248,113,113,.7);border:1px solid rgba(239,68,68,.15);}
.sp-reset-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.55rem;padding:.68rem 1.2rem;border-radius:.65rem;background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.22);font-size:.78rem;font-weight:800;cursor:pointer;transition:all .17s cubic-bezier(.4,0,.2,1);font-family:inherit;letter-spacing:.02em;}
.sp-reset-btn:hover{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35);color:#fca5a5;transform:translateY(-1px);box-shadow:0 4px 16px rgba(239,68,68,.15);}
.sp-reset-btn:active{transform:translateY(0) scale(.98);}

@keyframes _sp_in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.sp-card{animation:_sp_in .2s both;}

@keyframes _swal_shrink{from{width:100%}to{width:0%}}
.sp-swal-progress{height:2px;border-radius:999px;overflow:hidden;background:rgba(249,115,22,.12);margin-top:.85rem;}
.sp-swal-bar{height:100%;border-radius:999px;width:100%;background:linear-gradient(to left,#f97316,#fdba74);animation:_swal_shrink 4s linear forwards;}

.sp-mobile-only { display: block; }
@media (min-width: 768px) { .sp-mobile-only { display: none; } }
        `;
        document.head.appendChild(s);
    }

    function buildStatus() {
        const isDark = document.documentElement.classList.contains('dark');
        const isOled = document.documentElement.classList.contains('oled');
        const themeLabel = isOled ? 'OLED' : isDark ? 'ليلي' : 'نهاري';
        const themeIcon = isOled ? 'fa-circle' : isDark ? 'fa-moon' : 'fa-sun';
        const themeClr = isOled ? '#9ca3af' : isDark ? '#a78bfa' : '#fbbf24';
        const curAcc = getSetting('accentColor') || 'default';
        const customHex = getSetting('customAccentColor') || '#ff6b6b';
        const accObj = ACCENT_COLORS.find(a => a.key === curAcc) || ACCENT_COLORS[0];
        const accHex = curAcc === 'custom' ? customHex : (accObj.hex || '#3b82f6');
        const curFF = getSetting('fontFamily') || 'cairo';
        const ffObj = FONT_FAMILIES.find(f => f.key === curFF) || FONT_FAMILIES[0];
        const animOn = getSetting('animationsEnabled');
        const partOn = getSetting('particlesEnabled');
        const navHide = getSetting('fullscreenNav');
        return `
        <div class="sp-status">
            <div class="sp-stat">
                <div class="sp-stat-ico" style="background:${themeClr}18;color:${themeClr}">
                    <i class="fa-solid ${themeIcon}"></i>
                </div>
                <span class="sp-stat-val">${themeLabel}</span>
                <span class="sp-stat-key">المظهر</span>
            </div>
            <div class="sp-stat">
                <div class="sp-stat-ico" style="background:${accHex}20;color:${accHex}">
                    <i class="fa-solid fa-droplet"></i>
                </div>
                <span class="sp-stat-val">${accObj.label}</span>
                <span class="sp-stat-key">اللون</span>
            </div>
            <div class="sp-stat">
                <div class="sp-stat-ico" style="background:rgba(251,191,36,.1);color:#fbbf24">
                    <i class="fa-solid fa-font"></i>
                </div>
                <span class="sp-stat-val">${ffObj.label}</span>
                <span class="sp-stat-key">الخط</span>
            </div>
        </div>
        <div class="sp-badges">
            <span class="sp-badge ${animOn ? 'on' : 'off'}"><i class="fa-solid fa-wand-magic-sparkles"></i>التأثيرات</span>
            <span class="sp-badge ${partOn ? 'on' : 'off'}"><i class="fa-solid fa-wind"></i>الخلفية</span>
            <span class="sp-badge ${navHide ? 'on' : 'off'}"><i class="fa-solid fa-expand"></i>إخفاء التنقل</span>
        </div>`;
    }

    function refreshStatus() {
        const c = document.getElementById('sp-status-card');
        if (c) c.innerHTML = buildStatus();
    }

    function renderPage(c) {
        c.innerHTML = `
<div id="_sp_root" class="container mx-auto max-w-2xl pb-24 space-y-1">

    <div class="sp-card" id="sp-status-card" style="animation-delay:.02s">${buildStatus()}</div>

    <p class="sp-sec"><i class="fa-solid fa-palette"></i> المظهر</p>
    <div class="sp-card" style="animation-delay:.04s">
        ${mkRow({ id: 'dark-mode-toggle', ico: 'fa-moon', icoBg: 'rgba(139,92,246,.11)', icoC: '#a78bfa', lbl: 'الوضع الليلي', desc: 'تبديل بين المظهر الفاتح والداكن', tc: '#8b5cf6' })}
        ${mkRow({ id: 'oled-mode-toggle', ico: 'fa-circle-half-stroke', icoBg: 'rgba(107,114,128,.1)', icoC: '#9ca3af', lbl: 'وضع OLED', desc: 'أسود نقي — يعمل في الوضع الليلي فقط', tc: '#374151' })}
        <div class="sp-row" style="flex-wrap:wrap;gap:.35rem;padding-bottom:.12rem">
            <div class="sp-ico" style="background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.18);color:#818cf8">
                <i class="fa-solid fa-droplet"></i>
            </div>
            <div class="sp-body">
                <div class="sp-lbl">لون التمييز</div>
                <div class="sp-desc">اللون الأول يعيد الألوان الافتراضية — الدائرة الأخيرة لاختيار لون مخصص</div>
            </div>
        </div>
        <div class="sp-sws" id="sp-sws">${mkSwatches()}</div>
    </div>

    <p class="sp-sec"><i class="fa-solid fa-font"></i> الخط</p>
    <div class="sp-card" style="animation-delay:.055s">
        <div class="sp-row" style="padding-bottom:.1rem">
            <div class="sp-ico" style="background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.18);color:#818cf8">
                <i class="fa-solid fa-a"></i>
            </div>
            <div class="sp-body"><div class="sp-lbl">نوع الخط</div><div class="sp-desc">يطبق على كامل واجهة التطبيق</div></div>
        </div>
        <div class="sp-ffb" id="sp-ffb">${mkFontFamilyBtns()}</div>
        <div class="sp-row" style="padding-bottom:.1rem;border-top:1px solid rgba(255,255,255,.04)">
            <div class="sp-ico" style="background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.18);color:#fbbf24">
                <i class="fa-solid fa-text-height"></i>
            </div>
            <div class="sp-body"><div class="sp-lbl">حجم الخط</div><div class="sp-desc">يؤثر على القراءة في كل الصفحات</div></div>
        </div>
        <div class="sp-fsb" id="sp-fsb">${mkFontBtns()}</div>
    </div>

    <p class="sp-sec"><i class="fa-solid fa-bolt"></i> الأداء والتأثيرات</p>
    <div class="sp-card" style="animation-delay:.08s">
        ${mkRow({ id: 'animations-toggle', ico: 'fa-wand-magic-sparkles', icoBg: 'rgba(59,130,246,.1)', icoC: '#60a5fa', lbl: 'التأثيرات المتقدمة', desc: 'الحركات والانتقالات', tc: '#3b82f6' })}
        ${mkRow({ id: 'scroll-animations-toggle', ico: 'fa-scroll', icoBg: 'rgba(16,185,129,.1)', icoC: '#34d399', lbl: 'رسوم التمرير', desc: 'ظهور تدريجي للعناصر عند التمرير', tc: '#10b981' })}
        ${mkRow({ id: 'particles-toggle', ico: 'fa-wind', icoBg: 'rgba(6,182,212,.1)', icoC: '#22d3ee', lbl: 'الخلفية المتحركة', desc: 'جزيئات متحركة في الخلفية', tc: '#06b6d4' })}
        ${mkRow({ id: 'reduce-transparency-toggle', ico: 'fa-layer-group', icoBg: 'rgba(249,115,22,.1)', icoC: '#fb923c', lbl: 'تقليل الشفافية', desc: 'يزيل تأثير الزجاج — مفيد للأجهزة القديمة', tc: '#f97316' })}
        ${mkRow({ id: 'compact-mode-toggle', ico: 'fa-compress', icoBg: 'rgba(139,92,246,.1)', icoC: '#a78bfa', lbl: 'الوضع المضغوط', desc: 'مسافات أصغر وكثافة معلومات أعلى', tc: '#8b5cf6' })}
    </div>

    <div class="sp-mobile-only">
        <p class="sp-sec"><i class="fa-solid fa-sliders"></i> التطبيق</p>
        <div class="sp-card" style="animation-delay:.1s">
            ${mkRow({ id: 'fullscreen-nav-toggle', ico: 'fa-expand', icoBg: 'rgba(99,102,241,.1)', icoC: '#818cf8', lbl: 'إخفاء شريط التنقل السفلي', desc: 'مساحة عرض أكبر على الشاشات الصغيرة', tc: '#6366f1' })}
        </div>
    </div>

    <p class="sp-sec"><i class="fa-solid fa-database"></i> البيانات</p>

    <div class="sp-card sp-cache" id="sp-cache-card" style="animation-delay:.12s">
        <div class="sp-cache-header">
            <div class="sp-cache-icon-wrap">
                <i class="fa-solid fa-broom"></i>
            </div>
            <div>
                <div class="sp-lbl" style="font-size:.82rem;color:#fb923c">مسح البيانات المحفوظة</div>
                <div class="sp-desc">حذف الكاش وإعادة تشغيل التطبيق تلقائياً</div>
            </div>
        </div>
        <div class="sp-cache-body">
            <div class="sp-cache-chips">
                <span class="sp-cache-chip"><i class="fa-solid fa-database"></i> بيانات الكاش</span>
                <span class="sp-cache-chip"><i class="fa-solid fa-image"></i> الصور المخزنة</span>
                <span class="sp-cache-chip"><i class="fa-solid fa-file"></i> الملفات المؤقتة</span>
            </div>
            <div class="sp-cache-note">
                <i class="fa-solid fa-circle-check"></i>
                <span>لن تُفقد أي إعدادات أو تفضيلات — فقط الملفات المؤقتة</span>
            </div>
            <button class="sp-cache-btn" id="clear-cache-btn">
                <i class="fa-solid fa-trash-can"></i>
                <span>مسح الكاش وإعادة التشغيل</span>
            </button>
        </div>
    </div>

    <div class="sp-card sp-dng" id="sp-reset-card" style="animation-delay:.13s">
        <div class="sp-reset-header">
            <div class="sp-reset-icon-wrap">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
                <div class="sp-lbl" style="font-size:.82rem;color:#f87171">منطقة الخطر</div>
                <div class="sp-desc">الإجراءات التالية لا يمكن التراجع عنها</div>
            </div>
        </div>
        <div class="sp-reset-body">
            <div class="sp-reset-info">
                <div class="sp-reset-info-row">
                    <i class="fa-solid fa-rotate-left" style="color:#f87171;width:.9rem;text-align:center"></i>
                    <div>
                        <div class="sp-lbl">إعادة ضبط المصنع</div>
                        <div class="sp-desc">مسح كافة التفضيلات والعودة للوضع الافتراضي تماماً</div>
                    </div>
                </div>
                <div class="sp-reset-chips">
                    <span class="sp-chip"><i class="fa-solid fa-palette"></i> الألوان</span>
                    <span class="sp-chip"><i class="fa-solid fa-font"></i> الخطوط</span>
                    <span class="sp-chip"><i class="fa-solid fa-moon"></i> المظهر</span>
                    <span class="sp-chip"><i class="fa-solid fa-bolt"></i> الأداء</span>
                    <span class="sp-chip"><i class="fa-solid fa-database"></i> الكاش</span>
                </div>
            </div>
            <button class="sp-reset-btn" id="reset-settings-btn">
                <i class="fa-solid fa-rotate-left"></i>
                <span>إعادة ضبط المصنع وإعادة التشغيل</span>
            </button>
        </div>
    </div>

</div>`;
    }

    function mkRow({ id, ico, icoBg, icoC, lbl, desc, tc }) {
        return `
        <div class="sp-row">
            <div class="sp-ico" style="background:${icoBg};color:${icoC};border-color:${icoC}22">
                <i class="fa-solid ${ico}"></i>
            </div>
            <div class="sp-body">
                <div class="sp-lbl">${lbl}</div>
                <div class="sp-desc">${desc}</div>
            </div>
            <label class="sp-tw">
                <input type="checkbox" class="sp-ti" id="${id}" style="--tc:${tc}">
                <span class="sp-tt" style="--tc:${tc}"></span>
            </label>
        </div>`;
    }

    function mkSwatches() {
        const cur = getSetting('accentColor') || 'default';
        const customHex = getSetting('customAccentColor') || '#ff6b6b';
        return ACCENT_COLORS.map(a => {
            if (a.key === 'custom') {
                const isOn = cur === 'custom';
                const cirStyle = isOn ? `background:${customHex};background-image:none` : '';
                return `
                <div class="sp-custom-wrap ${isOn ? 'on' : ''}" id="sp-custom-wrap" title="لون مخصص">
                    <input type="color" id="sp-custom-color" value="${customHex}">
                    <div class="sp-custom-circle" id="sp-custom-circle" style="${cirStyle}"></div>
                </div>`;
            }
            if (a.key === 'default') {
                return `<div class="sp-sw ${cur === 'default' ? 'on' : ''}" data-ac="default" title="افتراضي — يعيد الألوان الأصلية"></div>`;
            }
            return `<div class="sp-sw ${a.key === cur ? 'on' : ''}" data-ac="${a.key}" title="${a.label}" style="background:${a.hex}"></div>`;
        }).join('');
    }

    function mkFontFamilyBtns() {
        const cur = getSetting('fontFamily') || 'cairo';
        return FONT_FAMILIES.map(f =>
            `<button class="sp-ff ${f.key === cur ? 'on' : ''}" data-ff="${f.key}" style="font-family:${f.css}">${f.label}</button>`
        ).join('');
    }

    function mkFontBtns() {
        const cur = getSetting('fontSize') || 'md';
        return FONT_SIZES.map(f =>
            `<button class="sp-fb ${f.key === cur ? 'on' : ''}" data-fs="${f.key}">
                <span style="font-size:${f.factor * .75}rem;font-weight:900">أ</span>${f.label}
            </button>`
        ).join('');
    }

    function syncAllToggles() {
        [
            ['dark-mode-toggle', 'darkMode'],
            ['oled-mode-toggle', 'oledMode'],
            ['animations-toggle', 'animationsEnabled'],
            ['scroll-animations-toggle', 'scrollAnimations'],
            ['particles-toggle', 'particlesEnabled'],
            ['reduce-transparency-toggle', 'reduceTransparency'],
            ['compact-mode-toggle', 'compactMode'],
            ['fullscreen-nav-toggle', 'fullscreenNav'],
        ].forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.checked = !!getSetting(key);
        });
    }

    function updateOledRowState() {
        const isDark = document.documentElement.classList.contains('dark');
        const row = document.getElementById('oled-mode-toggle')?.closest?.('.sp-row');
        if (row) row.classList.toggle('sp-dim', !isDark);
    }

    function attachEvents() {

        on(document.getElementById('dark-mode-toggle'), 'change', function () {
            setSetting('darkMode', this.checked);
            applyDark(this.checked);
            refreshStatus();
        });

        on(document.getElementById('theme-btn'), 'click', function () {
            setTimeout(() => {
                const nowDark = document.documentElement.classList.contains('dark');
                const tog = document.getElementById('dark-mode-toggle');
                if (tog) tog.checked = nowDark;
                updateOledRowState();
                if (!nowDark) {
                    const oledT = document.getElementById('oled-mode-toggle');
                    if (oledT) oledT.checked = false;
                }
                refreshStatus();
            }, 90);
        });

        on(document.getElementById('oled-mode-toggle'), 'change', function () {
            setSetting('oledMode', this.checked);
            applyOled(this.checked);
            refreshStatus();
        });

        on(document.getElementById('animations-toggle'), 'change', function () {
            setSetting('animationsEnabled', this.checked);
            applyAnimations(this.checked);
            refreshStatus();
        });

        on(document.getElementById('scroll-animations-toggle'), 'change', function () {
            setSetting('scrollAnimations', this.checked);
            applyScrollAnimations(this.checked);
        });

        on(document.getElementById('particles-toggle'), 'change', function () {
            setSetting('particlesEnabled', this.checked);
            applyParticles(this.checked);
            refreshStatus();
        });

        on(document.getElementById('reduce-transparency-toggle'), 'change', function () {
            setSetting('reduceTransparency', this.checked);
            applyReduceTransparency(this.checked);
        });

        on(document.getElementById('compact-mode-toggle'), 'change', function () {
            setSetting('compactMode', this.checked);
            applyCompactMode(this.checked);
        });

        on(document.getElementById('fullscreen-nav-toggle'), 'change', function () {
            setSetting('fullscreenNav', this.checked);
            applyFullscreenNav(this.checked);
            refreshStatus();
            App.Toast?.success(this.checked ? 'تم إخفاء شريط التنقل' : 'تم إظهار شريط التنقل');
        });

        on(document.getElementById('sp-sws'), 'click', function (e) {
            const sw = e.target.closest('.sp-sw');
            if (!sw) return;
            const key = sw.dataset.ac;
            setSetting('accentColor', key);
            applyAccent(key);
            document.querySelectorAll('.sp-sw').forEach(s => s.classList.remove('on'));
            sw.classList.add('on');
            const circle = document.getElementById('sp-custom-circle');
            const wrap = document.getElementById('sp-custom-wrap');
            if (circle) circle.style.cssText = '';
            if (wrap) wrap.classList.remove('on');
            refreshStatus();
        });

        const colorInput = document.getElementById('sp-custom-color');
        if (colorInput) {
            on(colorInput, 'click', function () {
                setSetting('accentColor', 'custom');
                document.querySelectorAll('.sp-sw').forEach(s => s.classList.remove('on'));
                document.getElementById('sp-custom-wrap')?.classList.add('on');
            });
            on(colorInput, 'change', function () {
                const hex = this.value;
                setSetting('customAccentColor', hex);
                setSetting('accentColor', 'custom');
                const circle = document.getElementById('sp-custom-circle');
                if (circle) { circle.style.background = hex; circle.style.backgroundImage = 'none'; }
                document.querySelectorAll('.sp-sw').forEach(s => s.classList.remove('on'));
                document.getElementById('sp-custom-wrap')?.classList.add('on');
                applyAccent('custom', hex);
                refreshStatus();
            });
            on(colorInput, 'input', function () {
                const hex = this.value;
                const circle = document.getElementById('sp-custom-circle');
                if (circle) { circle.style.background = hex; circle.style.backgroundImage = 'none'; }
                applyAccent('custom', hex);
            });
        }

        on(document.getElementById('sp-ffb'), 'click', function (e) {
            const btn = e.target.closest('.sp-ff');
            if (!btn) return;
            const key = btn.dataset.ff;
            setSetting('fontFamily', key);
            applyFontFamily(key);
            document.querySelectorAll('.sp-ff').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            refreshStatus();
        });

        on(document.getElementById('sp-fsb'), 'click', function (e) {
            const btn = e.target.closest('.sp-fb');
            if (!btn) return;
            const key = btn.dataset.fs;
            setSetting('fontSize', key);
            applyFontSize(key);
            document.querySelectorAll('.sp-fb').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
        });

        on(document.getElementById('clear-cache-btn'), 'click', function () {
            const isDark = document.documentElement.classList.contains('dark');
            Swal.fire({
                html: `
                    <div style="text-align:center;padding:.35rem 0 .1rem">
                        <div style="
                            width:58px;height:58px;border-radius:50%;
                            background:rgba(249,115,22,.12);
                            border:2px solid rgba(249,115,22,.25);
                            display:flex;align-items:center;justify-content:center;
                            margin:0 auto .85rem;font-size:1.35rem;color:#fb923c
                        "><i class="fa-solid fa-broom"></i></div>
                        <div style="font-size:.97rem;font-weight:800;margin-bottom:.38rem;color:inherit">
                            مسح البيانات المحفوظة؟
                        </div>
                        <div style="font-size:.76rem;opacity:.6;line-height:1.7">
                            سيتم <strong>حذف جميع ملفات الكاش</strong> المخزنة<br>
                            وإعادة تشغيل التطبيق تلقائياً.
                        </div>
                        <div style="
                            margin-top:.8rem;padding:.45rem .65rem;
                            border-radius:.55rem;
                            background:rgba(16,185,129,.07);
                            border:1px solid rgba(16,185,129,.14);
                            display:flex;align-items:center;gap:.4rem;justify-content:center
                        ">
                            <i class="fa-solid fa-circle-check" style="color:#34d399;font-size:.7rem"></i>
                            <span style="font-size:.67rem;color:rgba(52,211,153,.85);font-weight:600">
                                إعداداتك وتفضيلاتك محفوظة ولن تُمسح
                            </span>
                        </div>
                        <div class="sp-swal-progress">
                            <div class="sp-swal-bar" id="sp-swal-bar"></div>
                        </div>
                    </div>`,
                showCancelButton: true,
                confirmButtonColor: '#f97316',
                cancelButtonColor: isDark ? '#374151' : '#9ca3af',
                confirmButtonText: '<i class="fa-solid fa-trash-can" style="margin-left:.35rem"></i> نعم، امسح وأعِد التشغيل',
                cancelButtonText: '<i class="fa-solid fa-xmark" style="margin-left:.3rem"></i> إلغاء',
                reverseButtons: true,
                customClass: { popup: isDark ? 'swal-dark' : '' },
                buttonsStyling: true,
                focusCancel: true,
                didOpen: () => {
                    const bar = document.getElementById('sp-swal-bar');
                    if (bar) bar.style.animationPlayState = 'running';
                }
            }).then(r => {
                if (!r.isConfirmed) return;
                App.Cache?.clearAll?.();
                App.Toast?.success('✓ تم المسح — جارٍ إعادة التشغيل…');
                setTimeout(() => {
                    try {
                        if ('caches' in window) {
                            caches.keys()
                                .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                                .finally(() => location.reload(true));
                        } else {
                            location.reload(true);
                        }
                    } catch {
                        location.reload(true);
                    }
                }, 950);
            });
        });

        on(document.getElementById('reset-settings-btn'), 'click', function () {
            const isDark = document.documentElement.classList.contains('dark');
            Swal.fire({
                html: `
                    <div style="text-align:center;padding:.5rem 0 .2rem">
                        <div style="
                            width:64px;height:64px;border-radius:50%;
                            background:rgba(239,68,68,.12);
                            border:2px solid rgba(239,68,68,.28);
                            display:flex;align-items:center;justify-content:center;
                            margin:0 auto 1rem;font-size:1.5rem;color:#f87171
                        "><i class="fa-solid fa-rotate-left"></i></div>
                        <div style="font-size:1rem;font-weight:800;margin-bottom:.45rem;color:inherit">
                            إعادة ضبط المصنع؟
                        </div>
                        <div style="font-size:.78rem;opacity:.65;line-height:1.7">
                            سيتم <strong>مسح جميع تفضيلاتك</strong> تماماً<br>
                            والعودة إلى الإعدادات الافتراضية.<br>
                            لا يمكن التراجع عن هذا الإجراء.
                        </div>
                        <div style="
                            display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;
                            margin-top:.85rem;
                        ">
                            ${['الألوان', 'الخطوط', 'المظهر', 'الأداء', 'الكاش', 'التفضيلات'].map(t =>
                    `<span style="font-size:.58rem;font-weight:700;padding:.18rem .52rem;border-radius:999px;background:rgba(239,68,68,.09);color:rgba(248,113,113,.75);border:1px solid rgba(239,68,68,.18)">${t}</span>`
                ).join('')}
                        </div>
                        <div style="
                            margin-top:.85rem;padding:.42rem .65rem;
                            border-radius:.52rem;
                            background:rgba(239,68,68,.06);
                            border:1px solid rgba(239,68,68,.14);
                            display:flex;align-items:center;gap:.4rem;justify-content:center;
                        ">
                            <i class="fa-solid fa-rotate-right" style="color:#f87171;font-size:.7rem"></i>
                            <span style="font-size:.67rem;color:rgba(248,113,113,.85);font-weight:600">
                                سيتم إعادة تشغيل التطبيق تلقائياً بعد الضبط
                            </span>
                        </div>
                        <div class="sp-swal-progress" style="background:rgba(239,68,68,.1);margin-top:.85rem">
                            <div class="sp-swal-bar" id="sp-swal-bar-reset" style="background:linear-gradient(to left,#ef4444,#fca5a5)"></div>
                        </div>
                    </div>`,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: isDark ? '#374151' : '#9ca3af',
                confirmButtonText: '<i class="fa-solid fa-rotate-left" style="margin-left:.35rem"></i> نعم، أعد الضبط والتشغيل',
                cancelButtonText: '<i class="fa-solid fa-xmark" style="margin-left:.3rem"></i> إلغاء',
                reverseButtons: true,
                customClass: { popup: isDark ? 'swal-dark' : '' },
                buttonsStyling: true,
                focusCancel: true,
                didOpen: () => {
                    const bar = document.getElementById('sp-swal-bar-reset');
                    if (bar) bar.style.animationPlayState = 'running';
                }
            }).then(result => {
                if (!result.isConfirmed) return;

                Object.keys(DEFAULTS).forEach(k => localStorage.removeItem('app_s_' + k));
                localStorage.removeItem('app_s_customAccentColor');
                Object.keys(DEFAULTS).forEach(k => setSetting(k, DEFAULTS[k]));

                applyDark(DEFAULTS.darkMode);
                applyOled(false);
                applyAnimations(DEFAULTS.animationsEnabled);
                applyScrollAnimations(DEFAULTS.scrollAnimations !== undefined ? DEFAULTS.scrollAnimations : true);
                applyParticles(DEFAULTS.particlesEnabled);
                applyAccent('default');
                applyFontSize(DEFAULTS.fontSize);
                applyFontFamily(DEFAULTS.fontFamily);
                applyReduceTransparency(false);
                applyCompactMode(false);
                applyFullscreenNav(false);

                App.Toast?.success('✓ تم إعادة الضبط — جارٍ إعادة التشغيل…');

                setTimeout(() => {
                    try {
                        if ('caches' in window) {
                            caches.keys()
                                .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                                .finally(() => location.reload(true));
                        } else {
                            location.reload(true);
                        }
                    } catch {
                        location.reload(true);
                    }
                }, 1000);
            });
        });
    }

    function applyDark(val) {
        document.documentElement.classList.toggle('dark', !!val);
        updateOledRowState();
        if (!val && getSetting('oledMode')) {
            setSetting('oledMode', false);
            document.documentElement.classList.remove('oled');
            const t = document.getElementById('oled-mode-toggle');
            if (t) t.checked = false;
        }
    }

    function applyOled(val) {
        if (val && !document.documentElement.classList.contains('dark')) {
            setSetting('oledMode', false);
            const t = document.getElementById('oled-mode-toggle');
            if (t) t.checked = false;
            App.Toast?.info('وضع OLED يعمل في الوضع الليلي فقط');
            return;
        }
        document.documentElement.classList.toggle('oled', !!val);
    }

    function applyAnimations(val) {
        document.documentElement.classList.toggle('no-animations', !val);
        try { App.Effects?.toggleAnimations?.(!!val); } catch { }
    }

    function applyScrollAnimations(val) {
        document.documentElement.classList.toggle('no-scroll-anims', !val);
        if (!val) document.querySelectorAll('.scroll-animate').forEach(el => {
            el.style.opacity = '1'; el.style.transform = 'none';
        });
    }

    function applyParticles(val) {
        const pc = document.getElementById('particles-container');
        if (pc) pc.style.display = val ? '' : 'none';
        try { App.Effects?.toggleParticles?.(!!val); } catch { }
    }

    function applyReduceTransparency(val) {
        document.documentElement.classList.toggle('reduce-tp', !!val);
    }

    function applyCompactMode(val) {
        document.documentElement.classList.toggle('compact', !!val);
    }

    function applyFullscreenNav(val) {
        document.documentElement.classList.toggle('hide-bottom-nav', !!val);
    }

    function applyFontFamily(key) {
        const ff = FONT_FAMILIES.find(f => f.key === key) || FONT_FAMILIES[0];
        if (ff.url) {
            const linkId = '_ff_link_' + ff.key;
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId; link.rel = 'stylesheet'; link.href = ff.url;
                document.head.appendChild(link);
            }
        }
        document.documentElement.style.fontFamily = ff.css;
        document.body.style.fontFamily = ff.css;

        let globalFF = document.getElementById('_ff_global_style');
        if (!globalFF) {
            globalFF = document.createElement('style');
            globalFF.id = '_ff_global_style';
            document.head.appendChild(globalFF);
        }
        globalFF.textContent = `
            html, body,
            body *:not(i):not([class*="fa-"]):not([class*=" fa"]):not(.fa):not([data-icon]) {
                font-family: ${ff.css} !important;
            }
        `;
    }

    function applyFontSize(key) {
        const f = FONT_SIZES.find(x => x.key === key) || FONT_SIZES[1];
        document.documentElement.style.fontSize = (f.factor * 16) + 'px';
    }

    function applyAccent(colorKey, customHex) {
        if (!colorKey || colorKey === 'default') {
            const style = document.getElementById('_accent_style');
            if (style) style.textContent = '';
            document.documentElement.style.removeProperty('--accent');
            return;
        }
        let hex;
        if (colorKey === 'custom') {
            hex = customHex || getSetting('customAccentColor') || '#ff6b6b';
        } else {
            const found = ACCENT_COLORS.find(a => a.key === colorKey);
            if (!found || !found.hex) return;
            hex = found.hex;
        }
        if (colorKey === 'custom' && customHex) setSetting('customAccentColor', hex);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        document.documentElement.style.setProperty('--accent', hex);
        let style = document.getElementById('_accent_style');
        if (!style) {
            style = document.createElement('style');
            style.id = '_accent_style';
            document.head.appendChild(style);
        }
        style.textContent = `
            .text-blue-400,.text-blue-500,.text-blue-600{color:${hex}!important;}
            .bg-blue-500,.bg-blue-600{background-color:${hex}!important;}
            .bg-blue-500\\/10,.bg-blue-500\\/20,.bg-blue-600\\/20{background-color:rgba(${r},${g},${b},.12)!important;}
            .border-blue-500,.border-blue-500\\/20,.border-blue-500\\/30{border-color:rgba(${r},${g},${b},.3)!important;}
            .from-blue-500,.from-blue-600{--tw-gradient-from:${hex}!important;}
            .to-blue-500,.to-cyan-500{--tw-gradient-to:${hex}!important;}
            .peer-checked\\:bg-blue-600,.peer-checked\\:bg-purple-600{background-color:${hex}!important;}
            .text-primary,.gradient-text{color:${hex}!important;}
            .shadow-blue-500\\/40{box-shadow:0 10px 15px -3px rgba(${r},${g},${b},.4)!important;}
            .bg-gradient-to-r.from-blue-600.to-cyan-500{background:linear-gradient(135deg,${hex},rgba(${r},${g},${b},.7))!important;}
        `;
    }

})(window.App);

(function () {
    'use strict';
    var tries = 0;
    function tryBoot() {
        if (window.App && window.App.Settings && window.App.Settings.initGlobal) {
            window.App.Settings.initGlobal();
        } else if (tries++ < 25) {
            setTimeout(tryBoot, 100);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(tryBoot, 120); });
    } else {
        setTimeout(tryBoot, 120);
    }
})();
