(function (App) {
    'use strict';


    const TYPES = {
        intizam: {
            key: 'intizam',
            label: 'انتظام',
            icon: 'fa-user-graduate',
            color: '#3b82f6',
            desc: 'جدول الفرقة الثانية — انتظام',
            images: [
                { id: 'i1', label: 'مجموعة 1 و 2', src: '../../../assets/images/schedules/intizam/1-2.jpg' },
                { id: 'i2', label: 'مجموعة 3 و 4', src: '../../../assets/images/schedules/intizam/3-4.jpg' },
                { id: 'i3', label: 'مجموعة 5 و 6', src: '../../../assets/images/schedules/intizam/5-6.jpg' }
            ]
        },
        intisab: {
            key: 'intisab',
            label: 'انتساب',
            icon: 'fa-user-tie',
            color: '#10b981',
            desc: 'جدول الفرقة الثانية — انتساب',
            images: [
                { id: 'e1', label: 'مجموعة 1 و 2', src: '../../../assets/images/schedules/intisab/1-2.jpg' },
                { id: 'e2', label: 'مجموعة 3 و 4', src: '../../../assets/images/schedules/intisab/3-4.jpg' },
                { id: 'e3', label: 'مجموعة 5 و 6', src: '../../../assets/images/schedules/intisab/5-6.jpg' },
                { id: 'e4', label: 'مجموعة 7 و 8', src: '../../../assets/images/schedules/intisab/7-8.jpg' },
                { id: 'e5', label: 'مجموعة 9 و 10', src: '../../../assets/images/schedules/intisab/9-10.jpg' }
            ]
        },
        sections: {
            key: 'sections',
            label: 'سكاشن',
            icon: 'fa-users',
            color: '#a855f7',
            desc: 'جدول الفرقة الثانية — سكاشن',
            images: [
                { id: 's1', label: 'جدول انتظام', src: '../../../assets/images/schedules/sections/intizam.jpg' },
                { id: 's2', label: 'جدول انتساب', src: '../../../assets/images/schedules/sections/intisab.jpg' },
            ]
        }
    };


    let activeType = 'intizam';
    let activeImgIdx = 0;
    let zoom = 1;
    let pan = { x: 0, y: 0 };
    let dragOrigin = null;
    let panAtDrag = { x: 0, y: 0 };
    let eventListeners = [];

    function currentImages() { return TYPES[activeType].images; }
    function currentImage() { return currentImages()[activeImgIdx] || currentImages()[0]; }

    function cleanup() {
        eventListeners.forEach(({ el, ev, fn, opts }) => el?.removeEventListener(ev, fn, opts));
        eventListeners = [];

        document.getElementById('sp-lightbox')?.remove();
    }
    function on(el, ev, fn, opts) {
        if (!el) return;
        el.addEventListener(ev, fn, opts);
        eventListeners.push({ el, ev, fn, opts });
    }


    App.Pages.schedules = function () {
        cleanup();
        const container = document.getElementById('app-content');
        if (!container) return;
        renderPage(container);
        attachEvents();
        if (App.Effects?.refresh) App.Effects.refresh();
        App.Router.registerCleanup(cleanup);
    };


    function renderPage(container) {
        container.innerHTML = `
<style>
/* ═══ Schedules Page ═══ */
#sp-root { font-family:'Cairo',sans-serif; }

/* ── Type Switcher ── */
.sp-switcher {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: .45rem;
    padding: .35rem;
    border-radius: 1.15rem;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(255,255,255,.07);
}
.sp-type-btn {
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    gap: .45rem; padding: .9rem .5rem;
    border-radius: .8rem; border: 1px solid transparent;
    cursor: pointer; transition: all .25s cubic-bezier(.34,1.4,.64,1);
    background: none; font-family: inherit; overflow: hidden;
    text-align: center;
}
.sp-type-btn::after {
    content:'';
    position: absolute; inset: 0; border-radius: inherit;
    background: radial-gradient(circle at 50% 100%, var(--tc) 0%, transparent 65%);
    opacity: 0; transition: opacity .25s; pointer-events: none;
}
.sp-type-btn.sp-active {
    background: var(--tc-bg);
    border-color: var(--tc-border);
    box-shadow: 0 4px 20px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.06);
}
.sp-type-btn.sp-active::after { opacity: .1; }

.sp-type-icon-ring {
    position: relative;
    width: 2.6rem; height: 2.6rem; border-radius: .75rem;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; justify-content: center;
    transition: all .28s cubic-bezier(.34,1.4,.64,1);
    flex-shrink: 0;
}
.sp-type-btn.sp-active .sp-type-icon-ring {
    background: var(--tc-bg);
    border-color: var(--tc-border);
    transform: scale(1.1);
    box-shadow: 0 0 16px var(--tc-glow);
}
.sp-type-icon-ring i { font-size: .9rem; color: rgba(156,163,175,.55); transition: color .25s; }
.sp-type-btn.sp-active .sp-type-icon-ring i { color: var(--tc); }

.sp-type-lbl {
    font-size: .82rem; font-weight: 800; letter-spacing: -.01em;
    color: rgba(156,163,175,.55); transition: color .25s;
}
.sp-type-btn.sp-active .sp-type-lbl { color: var(--tc); }

.sp-type-sub {
    font-size: .58rem; color: rgba(156,163,175,.32);
    transition: color .25s; line-height: 1.3;
    display: none;
}
@media(min-width:400px){ .sp-type-sub { display: block; } }
.sp-type-btn.sp-active .sp-type-sub { color: rgba(156,163,175,.5); }

.sp-type-dot {
    position: absolute; bottom: .5rem; left: 50%; transform: translateX(-50%);
    width: .35rem; height: .35rem; border-radius: 50%;
    background: var(--tc); opacity: 0;
    box-shadow: 0 0 8px var(--tc);
    transition: opacity .25s;
}
.sp-type-btn.sp-active .sp-type-dot { opacity: 1; }

/* ── Grade Tabs ── */
.sp-grade-tabs {
    display: flex; gap: .4rem;
    overflow-x: auto; scrollbar-width: none; padding-bottom: .05rem;
}
.sp-grade-tabs::-webkit-scrollbar { display: none; }
.sp-gtab {
    flex-shrink: 0;
    display: flex; align-items: center; gap: .35rem;
    padding: .38rem .85rem;
    border-radius: .6rem; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03);
    font-family: inherit; font-size: .74rem; font-weight: 700;
    cursor: pointer; transition: all .2s; color: rgba(156,163,175,.5);
    white-space: nowrap;
}
.sp-gtab:hover { background: rgba(255,255,255,.07); color: rgba(156,163,175,.85); }
.sp-gtab.sp-active {
    background: var(--gt-bg); border-color: var(--gt-border); color: var(--gt-color);
}
.sp-gtab-num {
    width: 1.3rem; height: 1.3rem; border-radius: .35rem;
    background: rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: center;
    font-size: .62rem; font-weight: 900; transition: background .2s, color .2s;
}
.sp-gtab.sp-active .sp-gtab-num { background: var(--gt-bg2); color: var(--gt-color); }

/* ── Viewer ── */
.sp-viewer {
    position: relative;
    border-radius: 1.1rem;
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(0,0,0,.3);
    overflow: hidden;
    min-height: 380px;
    display: flex; align-items: center; justify-content: center;
}
/* canvas/img wrap */
.sp-canvas {
    width: 100%; height: 100%; min-height: 380px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; cursor: grab; user-select: none;
    /* ✅ عند zoom=1 يسمح للصفحة بالتمرير العمودي — يتغيّر ديناميكياً بـ JS عند التكبير */
    touch-action: pan-y;
}
.sp-canvas.sp-dragging { cursor: grabbing; }
.sp-canvas img {
    max-width: 90%; max-height: 68vh;
    object-fit: contain;
    display: block;
    border-radius: .4rem;
    box-shadow: 0 20px 60px rgba(0,0,0,.5);
    will-change: transform;
    pointer-events: none;
    transform-origin: center center;
}

/* Placeholder */
.sp-placeholder {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: .85rem; min-height: 380px; padding: 2rem;
    pointer-events: none;
}
.sp-ph-ring {
    width: 4.5rem; height: 4.5rem; border-radius: 1.2rem;
    background: rgba(255,255,255,.04); border: 1.5px dashed rgba(255,255,255,.12);
    display: flex; align-items: center; justify-content: center;
    animation: sp-ph-pulse 2.5s ease-in-out infinite;
}
.sp-ph-ring i { font-size: 1.6rem; color: rgba(156,163,175,.3); }
@keyframes sp-ph-pulse {
    0%,100%{ transform: scale(1); opacity:.6; }
    50%    { transform: scale(1.05); opacity:1; }
}
.sp-ph-txt { font-size: .8rem; color: rgba(156,163,175,.35); font-weight: 700; }
.sp-ph-sub { font-size: .68rem; color: rgba(156,163,175,.22); margin-top: -.4rem; }

/* Top-right actions */
.sp-top-acts {
    position: absolute; top: .7rem; left: .7rem; z-index: 20;
    display: flex; gap: .3rem;
}
.sp-act {
    width: 2.1rem; height: 2.1rem; border-radius: .55rem;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(5,5,15,.7); backdrop-filter: blur(12px);
    color: rgba(200,210,230,.75); font-size: .78rem;
    cursor: pointer; transition: all .18s;
    display: flex; align-items: center; justify-content: center;
}
.sp-act:hover { background: rgba(255,255,255,.15); color: #fff; transform: scale(1.08); }
.sp-act:active { transform: scale(.92); }

/* Bottom toolbar */
.sp-toolbar {
    position: absolute; bottom: .75rem; left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex; align-items: center; gap: .28rem;
    padding: .38rem .45rem;
    border-radius: .85rem;
    background: rgba(5,5,15,.78); backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,.1);
    white-space: nowrap;
}
.sp-tb-btn {
    width: 1.95rem; height: 1.95rem; border-radius: .48rem;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.06);
    color: rgba(200,210,230,.8); font-size: .75rem;
    cursor: pointer; transition: all .18s;
    display: flex; align-items: center; justify-content: center;
}
.sp-tb-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
.sp-tb-btn:active { transform: scale(.9); }
.sp-tb-sep { width: 1px; height: 1.1rem; background: rgba(255,255,255,.1); margin: 0 .05rem; }
.sp-zoom-lbl {
    font-size: .65rem; font-weight: 800;
    color: rgba(200,210,230,.55); min-width: 2.6rem; text-align: center;
}

/* ── Nav Arrows ── */
.sp-nav-arrow {
    position: absolute; top: 50%; z-index: 20;
    transform: translateY(-50%);
    width: 2.4rem; height: 2.4rem; border-radius: 50%;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(5,5,15,.7); backdrop-filter: blur(12px);
    color: rgba(200,210,230,.85); font-size: .85rem;
    cursor: pointer; transition: all .18s;
    display: flex; align-items: center; justify-content: center;
}
.sp-nav-arrow:hover { background: rgba(255,255,255,.18); color: #fff; transform: translateY(-50%) scale(1.08); }
.sp-nav-arrow:active { transform: translateY(-50%) scale(.93); }
.sp-nav-prev { right: .7rem; }
.sp-nav-next { left: .7rem; }

/* ── Dot Indicators ── */
.sp-dots {
    position: absolute; top: .7rem; left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex; align-items: center; gap: .35rem;
    padding: .3rem .55rem;
    border-radius: 999px;
    background: rgba(5,5,15,.65); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.1);
}
.sp-dot {
    width: .45rem; height: .45rem; border-radius: 50%;
    border: none; cursor: pointer; padding: 0;
    background: rgba(255,255,255,.2);
    transition: all .2s cubic-bezier(.34,1.4,.64,1);
}
.sp-dot:hover { background: rgba(255,255,255,.4); transform: scale(1.2); }
.sp-dot.sp-dot-active {
    background: var(--dc);
    box-shadow: 0 0 8px var(--dc);
    transform: scale(1.3);
    width: .9rem; border-radius: .25rem;
}
.sp-loading {
    position: absolute; inset: 0; z-index: 15;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,.3); border-radius: inherit;
    pointer-events: none;
}
.sp-spinner {
    width: 2rem; height: 2rem; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.1);
    border-top-color: var(--sp-color, #3b82f6);
    animation: sp-spin .7s linear infinite;
}
@keyframes sp-spin { to { transform: rotate(360deg); } }

/* ── LIGHTBOX ── */
#sp-lightbox {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,.93); backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
    animation: sp-lb-in .2s ease;
    touch-action: none;
}
@keyframes sp-lb-in { from{opacity:0;} to{opacity:1;} }
#sp-lightbox img {
    max-width: 95vw; max-height: 90vh;
    object-fit: contain; border-radius: .5rem;
    box-shadow: 0 30px 80px rgba(0,0,0,.7);
    transform-origin: center center;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
}
.sp-lb-canvas {
    width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    cursor: grab; overflow: hidden;
}
.sp-lb-canvas.sp-dragging { cursor: grabbing; }
.sp-lb-close {
    position: fixed; top: 1rem; right: 1rem;
    width: 2.4rem; height: 2.4rem; border-radius: .65rem;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
    color: #fff; font-size: .9rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .18s; z-index: 10000;
}
.sp-lb-close:hover { background: rgba(239,68,68,.25); border-color: rgba(239,68,68,.4); }
.sp-lb-info {
    position: fixed; bottom: 1.2rem; left: 50%; transform: translateX(-50%);
    padding: .4rem 1rem; border-radius: .75rem;
    background: rgba(5,5,15,.8); border: 1px solid rgba(255,255,255,.1);
    font-size: .72rem; color: rgba(200,210,230,.7); font-weight: 700;
    white-space: nowrap; z-index: 10000; font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; gap: .5rem;
}
.sp-lb-info span.hint { color: rgba(200,210,230,.35); font-weight: 400; }

/* ── Info bar (replaces old header) ── */
.sp-infobar {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: .5rem 1.2rem;
    padding: .75rem 1.1rem;
    border-radius: .95rem;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
}
.sp-info-chip {
    display: flex; align-items: center; gap: .4rem;
    font-size: .7rem; color: rgba(156,163,175,.5); font-weight: 600;
}
.sp-info-chip i { font-size: .68rem; }
.sp-info-chip b { color: rgba(156,163,175,.8); font-weight: 700; }
.sp-info-sep { width: 1px; height: .9rem; background: rgba(255,255,255,.07); }
.sp-info-tag {
    display: flex; align-items: center; gap: .3rem;
    font-size: .64rem; font-weight: 800; padding: .18rem .55rem;
    border-radius: 999px; border: 1px solid var(--it-border);
    background: var(--it-bg); color: var(--it-color);
    letter-spacing: .02em; text-transform: uppercase;
}
.sp-info-dot {
    width: .35rem; height: .35rem; border-radius: 50%;
    background: var(--it-color); box-shadow: 0 0 6px var(--it-color);
    animation: sp-pulse 2s infinite;
}
@keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* section label */
.sp-label {
    display: flex; align-items: center; gap: .45rem;
    font-size: .62rem; font-weight: 800; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(156,163,175,.35);
}
.sp-label::after { content:''; flex:1; height:1px; background: rgba(255,255,255,.05); }

/* card-in animation */
@keyframes sp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.sp-viewer, .sp-switcher, .sp-infobar { animation: sp-in .3s both; }

/* light mode */
html:not(.dark) .sp-switcher { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.08); }
html:not(.dark) .sp-type-btn.sp-active { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
html:not(.dark) .sp-viewer { background: rgba(0,0,0,.06); border-color:rgba(0,0,0,.08); }
html:not(.dark) .sp-toolbar, html:not(.dark) .sp-top-acts .sp-act { background: rgba(255,255,255,.85); border-color:rgba(0,0,0,.1); color:#374151; }
html:not(.dark) .sp-infobar { background:rgba(0,0,0,.025); border-color:rgba(0,0,0,.07); }
html:not(.dark) .sp-label::after { background:rgba(0,0,0,.07); }
html:not(.dark) .sp-gtab { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.07); }
html:not(.dark) .sp-gtab:hover { background:rgba(0,0,0,.08); }
html:not(.dark) .sp-zoom-lbl, html:not(.dark) .sp-tb-btn { color:#374151; }
html:not(.dark) .sp-tb-btn { background:rgba(0,0,0,.05); border-color:rgba(0,0,0,.08); }
html:not(.dark) .sp-tb-btn:hover { background:rgba(0,0,0,.12); }
</style>

<div id="sp-root" class="container mx-auto max-w-4xl pb-24 space-y-4">

    <!-- Info Bar (بدل الهيدر) -->
    <div class="sp-infobar" id="sp-infobar">
        ${renderInfoBar()}
    </div>

    <!-- Type Switcher -->
    <div class="sp-switcher" id="sp-switcher">${renderSwitcher()}</div>

    <!-- Image Nav -->
    <div>
        <div class="sp-label mb-2"><i class="fa-solid fa-images text-[9px]"></i> اختر الجدول</div>
        <div class="sp-grade-tabs" id="sp-img-nav">${renderImgNav()}</div>
    </div>

    <!-- Viewer -->
    <div class="sp-viewer" id="sp-viewer">
        ${renderViewerContent()}
    </div>

</div>`;
    }



    function renderInfoBar() {
        const t = TYPES[activeType];
        const img = currentImage();
        const total = currentImages().length;
        const color = t.color;
        const bg = hexA(color, .12);
        const bdr = hexA(color, .3);
        return `
        <span class="sp-info-chip"><i class="fa-solid fa-layer-group"></i> الفرقة الثانية</span>
        <span class="sp-info-sep"></span>
        <span class="sp-info-chip"><i class="fa-solid fa-images"></i> <b>${activeImgIdx + 1}</b> / <b>${total}</b></span>
        <span class="sp-info-sep"></span>
        <span class="sp-info-chip"><i class="fa-solid fa-calendar-days"></i> الفصل الدراسي الحالي</span>
        <span class="sp-info-sep"></span>
        <span class="sp-info-tag" style="--it-bg:${bg};--it-border:${bdr};--it-color:${color}">
            <span class="sp-info-dot"></span>
            ${t.label} — ${img.label}
        </span>
        <span class="sp-info-chip" style="margin-right:auto;">
            <i class="fa-solid fa-hand-pointer" style="color:rgba(156,163,175,.35)"></i>
            <span style="color:rgba(156,163,175,.3)">دبل-كليك للتكبير</span>
        </span>`;
    }

    function renderSwitcher() {
        return Object.values(TYPES).map(t => {
            const isActive = t.key === activeType;
            const bg = hexA(t.color, .12);
            const bdr = hexA(t.color, .28);
            const glow = hexA(t.color, .25);
            return `
            <button class="sp-type-btn ${isActive ? 'sp-active' : ''}"
                    data-type="${t.key}"
                    style="--tc:${t.color};--tc-bg:${bg};--tc-border:${bdr};--tc-glow:${glow}">
                <div class="sp-type-icon-ring">
                    <i class="fa-solid ${t.icon}"></i>
                </div>
                <span class="sp-type-lbl">${t.label}</span>
                <span class="sp-type-sub">${t.desc}</span>
                <span class="sp-type-dot"></span>
            </button>`;
        }).join('');
    }

    function renderImgNav() {
        const t = TYPES[activeType];
        const color = t.color;
        const bg = hexA(color, .12);
        const bg2 = hexA(color, .22);
        const bdr = hexA(color, .3);
        return currentImages().map((img, i) => `
        <button class="sp-gtab ${i === activeImgIdx ? 'sp-active' : ''}"
                data-idx="${i}"
                style="--gt-bg:${bg};--gt-bg2:${bg2};--gt-border:${bdr};--gt-color:${color}">
            <span class="sp-gtab-num">${i + 1}</span>
            ${img.label}
        </button>`).join('');
    }

    function renderViewerContent() {
        const t = TYPES[activeType];
        const img = currentImage();
        const isPending = img.src === 'YOUR_IMAGE_HERE';
        const total = currentImages().length;

        if (isPending) {
            return `
            <div class="sp-placeholder">
                <div class="sp-ph-ring"><i class="fa-solid fa-image"></i></div>
                <p class="sp-ph-txt">الصورة غير متاحة بعد</p>
                <p class="sp-ph-sub">سيتم إضافة ${img.label} قريباً</p>
            </div>`;
        }

        return `
        <div id="sp-loading" class="sp-loading" style="--sp-color:${t.color}">
            <div class="sp-spinner"></div>
        </div>

        <!-- Top actions -->
        <div class="sp-top-acts">
            <button class="sp-act" id="sp-fullscreen" title="ملء الشاشة">
                <i class="fa-solid fa-expand"></i>
            </button>
        </div>

        <!-- Prev / Next arrows -->
        ${activeImgIdx > 0 ? `
        <button class="sp-nav-arrow sp-nav-prev" id="sp-prev" title="السابق">
            <i class="fa-solid fa-chevron-right"></i>
        </button>` : ''}
        ${activeImgIdx < total - 1 ? `
        <button class="sp-nav-arrow sp-nav-next" id="sp-next" title="التالي">
            <i class="fa-solid fa-chevron-left"></i>
        </button>` : ''}

        <!-- Image canvas -->
        <div class="sp-canvas" id="sp-canvas">
            <img id="sp-img" src="${resolveSrc(img.src)}" alt="${img.label}" draggable="false" />
        </div>

        <!-- Dot indicators -->
        ${total > 1 ? `
        <div class="sp-dots" id="sp-dots">
            ${currentImages().map((_, i) => `
            <button class="sp-dot ${i === activeImgIdx ? 'sp-dot-active' : ''}"
                    data-idx="${i}"
                    style="--dc:${t.color}"></button>`).join('')}
        </div>` : ''}

        <!-- Toolbar -->
        <div class="sp-toolbar">
            <button class="sp-tb-btn" id="sp-zoom-out" title="تصغير"><i class="fa-solid fa-minus"></i></button>
            <span class="sp-zoom-lbl" id="sp-zoom-lbl">100%</span>
            <button class="sp-tb-btn" id="sp-zoom-in"  title="تكبير"><i class="fa-solid fa-plus"></i></button>
            <span class="sp-tb-sep"></span>
            <button class="sp-tb-btn" id="sp-reset"    title="إعادة ضبط"><i class="fa-solid fa-arrows-rotate"></i></button>

        </div>`;
    }


    function attachEvents() {

        on(document.getElementById('sp-switcher'), 'click', e => {
            const btn = e.target.closest('.sp-type-btn');
            if (!btn) return;
            const newType = btn.dataset.type;
            if (newType === activeType) return;
            activeType = newType;
            activeImgIdx = 0;
            resetZoom();
            refreshSwitcher();
            refreshImgNav();
            refreshViewer();
            refreshInfoBar();
        });


        on(document.getElementById('sp-img-nav'), 'click', e => {
            const tab = e.target.closest('.sp-gtab');
            if (!tab) return;
            const newIdx = parseInt(tab.dataset.idx, 10);
            if (newIdx === activeImgIdx) return;
            activeImgIdx = newIdx;
            resetZoom();
            refreshViewer();
            refreshInfoBar();
            refreshImgNav();
        });

        attachViewerEvents();
    }

    function attachViewerEvents() {
        const canvas = document.getElementById('sp-canvas');
        const img = document.getElementById('sp-img');
        if (!canvas || !img) return;


        on(img, 'load', () => { document.getElementById('sp-loading')?.remove(); });
        on(img, 'error', () => { document.getElementById('sp-loading')?.remove(); img.style.opacity = '.3'; });


        on(canvas, 'wheel', e => {
            e.preventDefault();
            applyZoom(zoom + (e.deltaY < 0 ? .15 : -.15));
        }, { passive: false });


        on(canvas, 'mousedown', e => {
            if (e.button !== 0) return;
            dragOrigin = { x: e.clientX, y: e.clientY };
            panAtDrag = { ...pan };
            canvas.classList.add('sp-dragging');
        });
        on(window, 'mousemove', e => {
            if (!dragOrigin) return;
            pan = { x: panAtDrag.x + (e.clientX - dragOrigin.x), y: panAtDrag.y + (e.clientY - dragOrigin.y) };
            applyTransform(false);
        });
        on(window, 'mouseup', () => { dragOrigin = null; canvas.classList.remove('sp-dragging'); });


        let lastTouchDist = null;
        on(canvas, 'touchstart', e => {
            if (e.touches.length === 1) {
                dragOrigin = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                panAtDrag = { ...pan };
            } else if (e.touches.length === 2) {
                lastTouchDist = getTouchDist(e); dragOrigin = null;
            }
        }, { passive: true });
        on(canvas, 'touchmove', e => {
            e.preventDefault();
            if (e.touches.length === 1 && dragOrigin) {
                pan = { x: panAtDrag.x + (e.touches[0].clientX - dragOrigin.x), y: panAtDrag.y + (e.touches[0].clientY - dragOrigin.y) };
                applyTransform(false);
            } else if (e.touches.length === 2) {
                const dist = getTouchDist(e);
                if (lastTouchDist) applyZoom(zoom * (dist / lastTouchDist));
                lastTouchDist = dist;
            }
        }, { passive: false });
        on(canvas, 'touchend', () => { dragOrigin = null; lastTouchDist = null; });


        let swipeStartX = null;
        on(canvas, 'touchstart', e => {
            if (e.touches.length === 1) swipeStartX = e.touches[0].clientX;
        }, { passive: true });
        on(canvas, 'touchend', e => {
            if (swipeStartX === null || zoom > 1.05) { swipeStartX = null; return; }
            const dx = (e.changedTouches[0]?.clientX || 0) - swipeStartX;
            if (Math.abs(dx) > 60) {
                navigateImage(dx < 0 ? 1 : -1);
            }
            swipeStartX = null;
        });


        on(canvas, 'dblclick', () => { zoom > 1.2 ? resetZoom() : applyZoom(2.2); });


        on(document.getElementById('sp-zoom-in'), 'click', () => applyZoom(zoom + .2));
        on(document.getElementById('sp-zoom-out'), 'click', () => applyZoom(zoom - .2));
        on(document.getElementById('sp-reset'), 'click', () => resetZoom(true));


        on(document.getElementById('sp-prev'), 'click', () => navigateImage(-1));
        on(document.getElementById('sp-next'), 'click', () => navigateImage(1));


        on(document.getElementById('sp-dots'), 'click', e => {
            const dot = e.target.closest('.sp-dot');
            if (!dot) return;
            const idx = parseInt(dot.dataset.idx, 10);
            if (idx === activeImgIdx) return;
            activeImgIdx = idx;
            resetZoom(); refreshViewer(); refreshInfoBar(); refreshImgNav();
        });


        on(document.getElementById('sp-fullscreen'), 'click', openLightbox);
    } (dir) => {
        const total = currentImages().length;
        const newIdx = activeImgIdx + dir;
        if (newIdx < 0 || newIdx >= total) return;
        activeImgIdx = newIdx;
        resetZoom(); refreshViewer(); refreshInfoBar(); refreshImgNav();
    }


    function openLightbox() {
        const t = TYPES[activeType];
        const cur = currentImage();
        if (!cur || cur.src === 'YOUR_IMAGE_HERE') return;

        let lbZoom = 1, lbPan = { x: 0, y: 0 }, lbDrag = null, lbPanAt = { x: 0, y: 0 };

        const lb = document.createElement('div');
        lb.id = 'sp-lightbox';
        lb.innerHTML = `
            <div class="sp-lb-canvas" id="sp-lb-canvas">
                <img id="sp-lb-img" src="${resolveSrc(cur.src)}" alt="${cur.label}" />
            </div>
            <button class="sp-lb-close" id="sp-lb-close"><i class="fa-solid fa-xmark"></i></button>
            <div class="sp-lb-info">
                ${t.label} — ${cur.label}
                <span class="hint">· اسحب للتحريك · اسكرول للتكبير · دبل-كليك للإعادة</span>
            </div>`;
        document.body.appendChild(lb);

        const lbCanvas = lb.querySelector('#sp-lb-canvas');
        const lbImg = lb.querySelector('#sp-lb-img');

        function lbApply(anim) {
            lbImg.style.transition = anim ? 'transform .3s cubic-bezier(.25,.8,.25,1)' : 'none';
            lbImg.style.transform = `translate(${lbPan.x}px,${lbPan.y}px) scale(${lbZoom})`;
        }

        lbCanvas.addEventListener('wheel', e => {
            e.preventDefault();
            lbZoom = Math.min(5, Math.max(.5, lbZoom + (e.deltaY < 0 ? .2 : -.2)));
            lbApply(false);
        }, { passive: false });

        lbCanvas.addEventListener('mousedown', e => {
            lbDrag = { x: e.clientX, y: e.clientY }; lbPanAt = { ...lbPan };
            lbCanvas.classList.add('sp-dragging');
        });
        document.addEventListener('mousemove', e => {
            if (!lbDrag) return;
            lbPan = { x: lbPanAt.x + (e.clientX - lbDrag.x), y: lbPanAt.y + (e.clientY - lbDrag.y) };
            lbApply(false);
        });
        document.addEventListener('mouseup', () => { lbDrag = null; lbCanvas.classList.remove('sp-dragging'); });

        lbCanvas.addEventListener('dblclick', () => { lbZoom = 1; lbPan = { x: 0, y: 0 }; lbApply(true); });

        const closeLb = () => {

            if (App.UI?.BackButtonManager) App.UI.BackButtonManager.unregister();
            lb.style.opacity = '0';
            setTimeout(() => lb.remove(), 200);
        };


        if (App.UI?.BackButtonManager) {
            App.UI.BackButtonManager.register(function () {
                closeLb();
                return true;
            });
        }

        lb.querySelector('#sp-lb-close').addEventListener('click', closeLb);
        lb.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
        lb.setAttribute('tabindex', '-1'); lb.focus();
    }


    function applyZoom(newZoom) {
        zoom = Math.min(5, Math.max(.5, newZoom));
        applyTransform(true);
        updateZoomLabel();
    }
    function applyTransform(animate) {
        const img = document.getElementById('sp-img');
        if (!img) return;
        img.style.transition = animate ? 'transform .2s cubic-bezier(.25,.8,.25,1)' : 'none';
        img.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    }
    function updateZoomLabel() {
        const el = document.getElementById('sp-zoom-lbl');
        if (el) el.textContent = Math.round(zoom * 100) + '%';
    }
    function resetZoom(animate) {
        zoom = 1; pan = { x: 0, y: 0 };
        applyTransform(animate || false);
        updateZoomLabel();
    }
    function getTouchDist(e) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }


    function refreshSwitcher() {
        const el = document.getElementById('sp-switcher');
        if (el) el.innerHTML = renderSwitcher();
    }
    function refreshImgNav() {
        const el = document.getElementById('sp-img-nav');
        if (el) el.innerHTML = renderImgNav();
    }
    function refreshViewer() {
        const el = document.getElementById('sp-viewer');
        if (el) { el.innerHTML = renderViewerContent(); attachViewerEvents(); }
    }
    function refreshInfoBar() {
        const el = document.getElementById('sp-infobar');
        if (el) el.innerHTML = renderInfoBar();
    }


    function hexA(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }



    function resolveSrc(relativePath) {
        try {
            if (window.Android && typeof window.Android.getBasePath === 'function') {

                const clean = relativePath.replace(/^(\.\.\/)+/, '');
                return window.Android.getBasePath() + '/' + clean;
            }
        } catch (e) {  }
        return relativePath;
    }

    function renderSwitcher() {
        return Object.values(TYPES).map(t => {
            const isActive = t.key === activeType;
            const bg = hexA(t.color, .12);
            const bdr = hexA(t.color, .28);
            const glow = hexA(t.color, .25);
            return `
            <button class="sp-type-btn ${isActive ? 'sp-active' : ''}"
                    data-type="${t.key}"
                    style="--tc:${t.color};--tc-bg:${bg};--tc-border:${bdr};--tc-glow:${glow}">
                <div class="sp-type-icon-ring">
                    <i class="fa-solid ${t.icon}"></i>
                </div>
                <span class="sp-type-lbl">${t.label}</span>
                <span class="sp-type-sub">${t.desc}</span>
                <span class="sp-type-dot"></span>
            </button>`;
        }).join('');
    }

    function renderImgNav() {
        const t = TYPES[activeType];
        const color = t.color;
        const bg = hexA(color, .12);
        const bg2 = hexA(color, .22);
        const bdr = hexA(color, .3);
        return currentImages().map((img, i) => `
        <button class="sp-gtab ${i === activeImgIdx ? 'sp-active' : ''}"
                data-idx="${i}"
                style="--gt-bg:${bg};--gt-bg2:${bg2};--gt-border:${bdr};--gt-color:${color}">
            <span class="sp-gtab-num">${i + 1}</span>
            ${img.label}
        </button>`).join('');
    }

    function renderViewerContent() {
        const t = TYPES[activeType];
        const img = currentImage();
        const total = currentImages().length;
        const isPending = img.src === 'YOUR_IMAGE_HERE';

        if (isPending) {
            return `
            <div class="sp-placeholder">
                <div class="sp-ph-ring"><i class="fa-solid fa-image"></i></div>
                <p class="sp-ph-txt">الصورة غير متاحة بعد</p>
                <p class="sp-ph-sub">سيتم إضافة ${img.label} قريباً</p>
            </div>`;
        }

        return `
        <div id="sp-loading" class="sp-loading" style="--sp-color:${t.color}">
            <div class="sp-spinner"></div>
        </div>
        <!-- Top actions -->
        <div class="sp-top-acts">
            <button class="sp-act" id="sp-fullscreen" title="ملء الشاشة">
                <i class="fa-solid fa-expand"></i>
            </button>
        </div>
        <!-- Image canvas -->
        <div class="sp-canvas" id="sp-canvas">
            <img id="sp-img" src="${resolveSrc(img.src)}" alt="${img.label}" draggable="false" />
        </div>
        <!-- Toolbar -->
        <div class="sp-toolbar">
            <button class="sp-tb-btn" id="sp-zoom-out" title="تصغير"><i class="fa-solid fa-minus"></i></button>
            <span class="sp-zoom-lbl" id="sp-zoom-lbl">100%</span>
            <button class="sp-tb-btn" id="sp-zoom-in"  title="تكبير"><i class="fa-solid fa-plus"></i></button>
            <span class="sp-tb-sep"></span>
            <button class="sp-tb-btn" id="sp-reset"    title="إعادة ضبط"><i class="fa-solid fa-arrows-rotate"></i></button>

        </div>`;
    }


    function attachEvents() {

        on(document.getElementById('sp-switcher'), 'click', e => {
            const btn = e.target.closest('.sp-type-btn');
            if (!btn) return;
            const newType = btn.dataset.type;
            if (newType === activeType) return;
            activeType = newType;
            activeImgIdx = 0;
            resetZoom();
            refreshSwitcher();
            refreshImgNav();
            refreshViewer();
            refreshInfoBar();
        });


        on(document.getElementById('sp-img-nav'), 'click', e => {
            const tab = e.target.closest('.sp-gtab');
            if (!tab) return;
            const newIdx = parseInt(tab.dataset.idx, 10);
            if (newIdx === activeImgIdx) return;
            activeImgIdx = newIdx;
            resetZoom();
            refreshViewer();
            refreshInfoBar();
            refreshImgNav();
        });

        attachViewerEvents();
    }

    function attachViewerEvents() {
        const canvas = document.getElementById('sp-canvas');
        const img = document.getElementById('sp-img');
        if (!canvas || !img) return;


        on(img, 'load', () => {
            document.getElementById('sp-loading')?.remove();
        });
        on(img, 'error', () => {
            document.getElementById('sp-loading')?.remove();
            img.style.opacity = '.3';
        });


        on(canvas, 'wheel', e => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? .15 : -.15;
            applyZoom(zoom + delta);
        }, { passive: false });


        on(canvas, 'mousedown', e => {
            if (e.button !== 0) return;
            dragOrigin = { x: e.clientX, y: e.clientY };
            panAtDrag = { ...pan };
            canvas.classList.add('sp-dragging');
        });
        on(window, 'mousemove', e => {
            if (!dragOrigin) return;
            const dx = e.clientX - dragOrigin.x;
            const dy = e.clientY - dragOrigin.y;
            pan = { x: panAtDrag.x + dx, y: panAtDrag.y + dy };
            applyTransform(false);
        });
        on(window, 'mouseup', () => {
            dragOrigin = null;
            canvas.classList.remove('sp-dragging');
        });


        let lastTouchDist = null;


        function syncTouchAction() {
            canvas.style.touchAction = zoom > 1 ? 'none' : 'pan-y';
        }
        syncTouchAction();

        on(canvas, 'touchstart', e => {
            if (e.touches.length === 1) {
                if (zoom > 1) {
                    dragOrigin = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    panAtDrag = { ...pan };
                } else {
                    dragOrigin = null;
                }
            } else if (e.touches.length === 2) {
                canvas.style.touchAction = 'none';
                lastTouchDist = getTouchDist(e);
                dragOrigin = null;
            }
        }, { passive: true });

        on(canvas, 'touchmove', e => {
            if (e.touches.length === 1 && dragOrigin && zoom > 1) {
                e.preventDefault();
                const dx = e.touches[0].clientX - dragOrigin.x;
                const dy = e.touches[0].clientY - dragOrigin.y;
                pan = { x: panAtDrag.x + dx, y: panAtDrag.y + dy };
                applyTransform(false);
            } else if (e.touches.length === 2) {
                e.preventDefault();
                const dist = getTouchDist(e);
                if (lastTouchDist) {
                    const ratio = dist / lastTouchDist;
                    applyZoom(zoom * ratio);
                }
                lastTouchDist = dist;
            }

        }, { passive: false });

        on(canvas, 'touchend', () => {
            dragOrigin = null; lastTouchDist = null;
            syncTouchAction();
        });


        canvas._syncTA = syncTouchAction;


        on(canvas, 'dblclick', () => {
            if (zoom > 1.2) { resetZoom(); } else { applyZoom(2.2); }
        });


        on(document.getElementById('sp-zoom-in'), 'click', () => applyZoom(zoom + .2));
        on(document.getElementById('sp-zoom-out'), 'click', () => applyZoom(zoom - .2));
        on(document.getElementById('sp-reset'), 'click', () => resetZoom(true));


        on(document.getElementById('sp-fullscreen'), 'click', openLightbox);
    }


    function openLightbox() {
        const t = TYPES[activeType];
        const cur = currentImage();
        if (!cur || cur.src === 'YOUR_IMAGE_HERE') return;

        let lbZoom = 1, lbPan = { x: 0, y: 0 }, lbDrag = null, lbPanAt = { x: 0, y: 0 };

        const lb = document.createElement('div');
        lb.id = 'sp-lightbox';
        lb.innerHTML = `
            <div class="sp-lb-canvas" id="sp-lb-canvas">
                <img id="sp-lb-img" src="${resolveSrc(cur.src)}" alt="${cur.label}" />
            </div>
            <button class="sp-lb-close" id="sp-lb-close"><i class="fa-solid fa-xmark"></i></button>
            <div class="sp-lb-info">
                ${t.label} — ${cur.label}
                <span class="hint">· اسحب للتحريك · اسكرول للتكبير · دبل-كليك للإعادة</span>
            </div>`;
        document.body.appendChild(lb);

        const lbCanvas = lb.querySelector('#sp-lb-canvas');
        const lbImg = lb.querySelector('#sp-lb-img');

        function lbApply(animate) {
            lbImg.style.transition = animate ? 'transform .3s cubic-bezier(.25,.8,.25,1)' : 'none';
            lbImg.style.transform = `translate(${lbPan.x}px,${lbPan.y}px) scale(${lbZoom})`;
        }


        lbCanvas.addEventListener('wheel', e => {
            e.preventDefault();
            const d = e.deltaY < 0 ? .2 : -.2;
            lbZoom = Math.min(5, Math.max(.5, lbZoom + d));
            lbApply(false);
        }, { passive: false });


        lbCanvas.addEventListener('mousedown', e => {
            lbDrag = { x: e.clientX, y: e.clientY }; lbPanAt = { ...lbPan };
            lbCanvas.classList.add('sp-dragging');
        });
        document.addEventListener('mousemove', e => {
            if (!lbDrag) return;
            lbPan = { x: lbPanAt.x + (e.clientX - lbDrag.x), y: lbPanAt.y + (e.clientY - lbDrag.y) };
            lbApply(false);
        });
        document.addEventListener('mouseup', () => { lbDrag = null; lbCanvas.classList.remove('sp-dragging'); });


        lbCanvas.addEventListener('dblclick', () => {
            lbZoom = 1; lbPan = { x: 0, y: 0 }; lbApply(true);
        });


        const closeLb = () => {

            if (App.UI?.BackButtonManager) App.UI.BackButtonManager.unregister();
            lb.style.opacity = '0';
            setTimeout(() => lb.remove(), 200);
        };


        if (App.UI?.BackButtonManager) {
            App.UI.BackButtonManager.register(function () {
                closeLb();
                return true;
            });
        }

        lb.querySelector('#sp-lb-close').addEventListener('click', closeLb);
        lb.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
        lb.setAttribute('tabindex', '-1'); lb.focus();
    }


    function applyZoom(newZoom) {
        zoom = Math.min(5, Math.max(.5, newZoom));
        applyTransform(true);
        updateZoomLabel();

        const cv = document.getElementById('sp-canvas');
        if (cv && cv._syncTA) cv._syncTA();
    }
    function applyTransform(animate) {
        const img = document.getElementById('sp-img');
        if (!img) return;
        img.style.transition = animate ? 'transform .2s cubic-bezier(.25,.8,.25,1)' : 'none';
        img.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    }
    function updateZoomLabel() {
        const el = document.getElementById('sp-zoom-lbl');
        if (el) el.textContent = Math.round(zoom * 100) + '%';
    }
    function resetZoom(animate) {
        zoom = 1; pan = { x: 0, y: 0 };
        applyTransform(animate || false);
        updateZoomLabel();

        const cv = document.getElementById('sp-canvas');
        if (cv && cv._syncTA) cv._syncTA();
    }
    function getTouchDist(e) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }


    function refreshSwitcher() {
        const el = document.getElementById('sp-switcher');
        if (el) el.innerHTML = renderSwitcher();
    }

    function refreshViewer() {
        const el = document.getElementById('sp-viewer');
        if (el) {
            el.innerHTML = renderViewerContent();
            attachViewerEvents();
        }
    }
    function refreshInfoBar() {
        const el = document.getElementById('sp-infobar');
        if (el) el.innerHTML = renderInfoBar();
    }


    function hexA(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

})(window.App);