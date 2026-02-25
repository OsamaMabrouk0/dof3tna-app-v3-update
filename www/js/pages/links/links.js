(function(App) {
    'use strict';

    const IMPORTANT_LINKS = [
        {
            id: 'college-services',
            title: 'خدمات الكلية',
            description: 'بوابة الخدمات الإلكترونية للطلاب',
            icon: 'fa-graduation-cap',
            color: '#3b82f6',
            url: 'https://umis.alexu.edu.eg/umisapp/Registration/ED_Login.aspx',
            category: 'أكاديمي',
            pinned: true
        },
        {
            id: 'online-platform',
            title: 'منصة التعليم الإلكتروني',
            description: 'المحاضرات والاختبارات أونلاين',
            icon: 'fa-laptop-code',
            color: '#a855f7',
            url: 'YOUR_LINK_HERE',
            category: 'أكاديمي',
            pinned: true
        },
        {
            id: 'college-books',
            title: 'مكتبة الكتب',
            description: 'تحميل الكتب والمراجع',
            icon: 'fa-book-open',
            color: '#10b981',
            url: 'YOUR_LINK_HERE',
            category: 'مصادر',
            pinned: true
        },
        {
            id: 'college-website',
            title: 'موقع الكلية',
            description: 'الموقع الرسمي لكلية التجارة',
            icon: 'fa-building-columns',
            color: '#6366f1',
            url: 'YOUR_LINK_HERE',
            category: 'أكاديمي',
            pinned: false
        },
        {
            id: 'facebook-college',
            title: 'صفحة الكلية',
            description: 'الأخبار والإعلانات الرسمية',
            icon: 'fa-facebook',
            color: '#1d9bf0',
            url: 'YOUR_LINK_HERE',
            category: 'تواصل',
            pinned: false
        },
        {
            id: 'facebook-affairs',
            title: 'شؤون الطلاب',
            description: 'متابعة الخدمات الطلابية',
            icon: 'fa-facebook',
            color: '#06b6d4',
            url: 'YOUR_LINK_HERE',
            category: 'تواصل',
            pinned: false
        },
        {
            id: 'student-union',
            title: 'اتحاد الطلاب',
            description: 'الأنشطة والفعاليات',
            icon: 'fa-users',
            color: '#f97316',
            url: 'YOUR_LINK_HERE',
            category: 'تواصل',
            pinned: false
        },
        {
            id: 'academic-calendar',
            title: 'التقويم الأكاديمي',
            description: 'مواعيد الامتحانات والعطلات',
            icon: 'fa-calendar-days',
            color: '#f43f5e',
            url: 'YOUR_LINK_HERE',
            category: 'أكاديمي',
            pinned: false
        },
        {
            id: 'library',
            title: 'المكتبة الرقمية',
            description: 'قواعد البيانات والأبحاث',
            icon: 'fa-book-bookmark',
            color: '#8b5cf6',
            url: 'YOUR_LINK_HERE',
            category: 'مصادر',
            pinned: false
        },
        {
            id: 'email',
            title: 'البريد الجامعي',
            description: 'البريد الإلكتروني الجامعي',
            icon: 'fa-envelope',
            color: '#ef4444',
            url: 'YOUR_LINK_HERE',
            category: 'أكاديمي',
            pinned: false
        }
    ];

    App.Pages.links = function() {
        const container = document.getElementById('app-content');
        if (!container) return;
        renderLinksPage(container);
        attachEvents();
        if (App.Effects && App.Effects.refresh) App.Effects.refresh();
    };

    /* ═══════════════ RENDER ═══════════════ */
    function renderLinksPage(container) {
        const pinned = IMPORTANT_LINKS.filter(l => l.pinned);
        const rest   = IMPORTANT_LINKS.filter(l => !l.pinned);
        const active = IMPORTANT_LINKS.filter(l => l.url !== 'YOUR_LINK_HERE').length;

        container.innerHTML = `
<style>
/* ════ Links Page ════ */
#lp-root { font-family: 'Cairo', sans-serif; }

/* Search */
.lp-search-shell { position: relative; max-width: 360px; }
.lp-search {
    width: 100%;
    padding: .6rem 1rem .6rem 2.5rem;
    border-radius: .85rem;
    font-family: inherit; font-size: .82rem;
    outline: none; transition: border .2s, box-shadow .2s;
    background: rgba(255,255,255,.045);
    border: 1px solid rgba(255,255,255,.08);
    color: inherit; direction: rtl;
}
.lp-search:focus {
    background: rgba(255,255,255,.07);
    border-color: rgba(99,102,241,.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.lp-search::placeholder { color: rgba(156,163,175,.45); }
.lp-search-ico {
    position: absolute; left: .8rem; top: 50%;
    transform: translateY(-50%);
    color: rgba(156,163,175,.45); font-size: .75rem;
    pointer-events: none;
}
.lp-clear {
    position: absolute; right: .75rem; top: 50%;
    transform: translateY(-50%);
    color: rgba(156,163,175,.4); font-size: .7rem;
    background: none; border: none; cursor: pointer;
    display: none; transition: color .15s; padding: 0;
}
.lp-clear:hover { color: #ef4444; }

/* Meta row */
.lp-meta {
    display: flex; align-items: center; gap: 1.2rem;
    font-size: .68rem; color: rgba(156,163,175,.45);
}
.lp-meta-sep { width: 1px; height: 10px; background: rgba(255,255,255,.08); }
.lp-meta b { color: rgba(156,163,175,.75); font-weight: 700; }

/* ── PINNED wide cards ── */
.lp-pinned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: .55rem;
}
.lp-pin-card {
    position: relative;
    border-radius: .9rem;
    padding: .9rem 1rem .9rem 1rem;
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03);
    cursor: pointer; overflow: hidden;
    display: flex; align-items: center; gap: .75rem;
    transition: transform .22s cubic-bezier(.34,1.4,.64,1), box-shadow .22s, border-color .2s;
}
.lp-pin-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 0% 50%, var(--c) 0%, transparent 60%);
    opacity: 0; transition: opacity .25s; pointer-events: none;
}
.lp-pin-card:hover {
    transform: translateY(-2px);
    border-color: var(--c-border);
    box-shadow: 0 8px 28px rgba(0,0,0,.2), 0 0 0 1px var(--c-border);
}
.lp-pin-card:hover::before { opacity: .08; }
.lp-pin-card:active { transform: scale(.97); }

/* shimmer sweep */
.lp-pin-card::after {
    content: '';
    position: absolute; top: 0; left: -120%;
    width: 55%; height: 100%;
    background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,.06) 50%, transparent 75%);
    transition: left .45s ease; pointer-events: none;
}
.lp-pin-card:hover::after { left: 160%; }

.lp-pin-icon {
    width: 2.2rem; height: 2.2rem; flex-shrink: 0;
    border-radius: .6rem;
    background: var(--c-bg); border: 1px solid var(--c-border);
    display: flex; align-items: center; justify-content: center;
    transition: transform .22s cubic-bezier(.34,1.4,.64,1);
    position: relative; z-index: 1;
}
.lp-pin-card:hover .lp-pin-icon { transform: scale(1.1) rotate(-5deg); }
.lp-pin-icon i { font-size: .85rem; color: var(--c); }

.lp-pin-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.lp-pin-title {
    font-size: .82rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .2s;
}
.lp-pin-card:hover .lp-pin-title { color: var(--c); }
.lp-pin-desc {
    font-size: .65rem; color: rgba(156,163,175,.6);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: .1rem;
}

.lp-pin-arrow {
    font-size: .6rem; color: var(--c);
    opacity: 0; transform: translateX(-4px);
    transition: opacity .18s, transform .18s;
    position: relative; z-index: 1; flex-shrink: 0;
}
.lp-pin-card:hover .lp-pin-arrow { opacity: 1; transform: translateX(0); }

/* left bar */
.lp-pin-bar {
    position: absolute; top: 20%; left: 0;
    width: 2.5px; height: 60%;
    border-radius: 0 2px 2px 0;
    background: var(--c);
    opacity: 0; transition: opacity .2s, height .25s;
}
.lp-pin-card:hover .lp-pin-bar { opacity: .65; height: 75%; }

/* ── COMPACT ROWS ── */
.lp-rows {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
    gap: .4rem;
}
.lp-row {
    position: relative;
    display: flex; align-items: center; gap: .6rem;
    padding: .55rem .75rem;
    border-radius: .7rem;
    border: 1px solid rgba(255,255,255,.055);
    background: rgba(255,255,255,.02);
    cursor: pointer; overflow: hidden;
    transition: background .18s, border-color .18s, transform .2s cubic-bezier(.34,1.4,.64,1);
}
.lp-row::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 0% 50%, var(--c) 0%, transparent 55%);
    opacity: 0; transition: opacity .2s; pointer-events: none;
}
.lp-row:hover {
    background: rgba(255,255,255,.048);
    border-color: var(--c-border);
    transform: translateX(-2px);
}
.lp-row:hover::after { opacity: .05; }
.lp-row:active { transform: scale(.97); }

.lp-row-icon {
    width: 1.75rem; height: 1.75rem; flex-shrink: 0;
    border-radius: .45rem;
    background: rgba(255,255,255,.05);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1;
    transition: background .18s;
}
.lp-row:hover .lp-row-icon { background: var(--c-bg); }
.lp-row-icon i { font-size: .72rem; color: rgba(156,163,175,.65); transition: color .18s; }
.lp-row:hover .lp-row-icon i { color: var(--c); }

.lp-row-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.lp-row-title {
    font-size: .75rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .18s;
}
.lp-row:hover .lp-row-title { color: var(--c); }
.lp-row-cat {
    font-size: .58rem; color: rgba(156,163,175,.4);
    margin-top: .05rem; font-weight: 600; letter-spacing: .02em;
}

.lp-row-pill {
    font-size: .56rem; font-weight: 700;
    padding: .12rem .38rem; border-radius: 999px;
    white-space: nowrap; flex-shrink: 0;
    position: relative; z-index: 1;
    background: rgba(156,163,175,.07);
    color: rgba(156,163,175,.38);
    border: 1px solid rgba(255,255,255,.05);
}
.lp-row-pill.ready {
    background: rgba(16,185,129,.1);
    color: #10b981;
    border-color: rgba(16,185,129,.2);
}

/* left glow line on row */
.lp-row-line {
    position: absolute; top: 20%; left: 0;
    width: 2px; height: 60%;
    border-radius: 0 2px 2px 0;
    background: var(--c); opacity: 0;
    transition: opacity .18s;
}
.lp-row:hover .lp-row-line { opacity: .5; }

/* Section label */
.lp-label {
    display: flex; align-items: center; gap: .45rem;
    font-size: .62rem; font-weight: 800; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(156,163,175,.38);
}
.lp-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.05); }

/* Empty */
.lp-empty {
    grid-column: 1/-1; padding: 2rem 1rem;
    display: flex; flex-direction: column; align-items: center; gap: .45rem;
    color: rgba(156,163,175,.3); font-size: .78rem;
}
.lp-empty i { font-size: 1.6rem; }

/* Entry animation */
@keyframes lp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.lp-pin-card, .lp-row { animation: lp-in .28s both; }

/* Light mode */
html:not(.dark) .lp-search { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.09); color:#111; }
html:not(.dark) .lp-search:focus { background:rgba(0,0,0,.06); }
html:not(.dark) .lp-pin-card, html:not(.dark) .lp-row { background:rgba(255,255,255,.75); border-color:rgba(0,0,0,.07); }
html:not(.dark) .lp-pin-card:hover, html:not(.dark) .lp-row:hover { background:#fff; }
html:not(.dark) .lp-pin-desc, html:not(.dark) .lp-row-cat { color:rgba(75,85,99,.55); }
html:not(.dark) .lp-row-icon { background:rgba(0,0,0,.04); }
html:not(.dark) .lp-row-pill { background:rgba(0,0,0,.05); color:rgba(75,85,99,.45); border-color:rgba(0,0,0,.07); }
html:not(.dark) .lp-meta { color:rgba(75,85,99,.45); }
html:not(.dark) .lp-label { color:rgba(75,85,99,.35); }
html:not(.dark) .lp-label::after { background:rgba(0,0,0,.07); }
</style>

<div id="lp-root" class="container mx-auto max-w-4xl pb-24 space-y-5">

    <!-- Top: search + meta -->
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="lp-search-shell">
            <i class="fa-solid fa-magnifying-glass lp-search-ico"></i>
            <input id="lp-search" class="lp-search" type="search" placeholder="ابحث عن رابط..." autocomplete="off" />
            <button id="lp-clear" class="lp-clear"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="lp-meta">
            <span><b>${IMPORTANT_LINKS.length}</b> رابط</span>
            <span class="lp-meta-sep"></span>
            <span><b>${active}</b> فعّال</span>
            <span class="lp-meta-sep"></span>
            <span><b>${IMPORTANT_LINKS.length - active}</b> قيد الإضافة</span>
        </div>
    </div>

    <!-- Pinned -->
    <div>
        <div class="lp-label mb-2"><i class="fa-solid fa-thumbtack text-[9px]"></i> وصول سريع</div>
        <div class="lp-pinned-grid" id="lp-pinned">${renderPinned(pinned)}</div>
    </div>

    <!-- Rest -->
    <div>
        <div class="lp-label mb-2" id="lp-rest-label"><i class="fa-solid fa-list text-[9px]"></i> جميع الروابط</div>
        <div class="lp-rows" id="lp-rows">${renderRows(rest)}</div>
    </div>

</div>`;
    }

    /* ═══ PINNED ═══ */
    function renderPinned(links) {
        if (!links.length) return `<div class="lp-empty"><i class="fa-solid fa-wind"></i><p>لا توجد نتائج</p></div>`;
        return links.map((l, i) => `
<div class="lp-pin-card link-card" data-url="${l.url}"
     style="--c:${l.color};--c-bg:${hexA(l.color,.12)};--c-border:${hexA(l.color,.25)};animation-delay:${(i*.06).toFixed(2)}s">
    <div class="lp-pin-bar"></div>
    <div class="lp-pin-icon"><i class="fa-solid ${l.icon}"></i></div>
    <div class="lp-pin-body">
        <div class="lp-pin-title">${l.title}</div>
        <div class="lp-pin-desc">${l.description}</div>
    </div>
    <i class="fa-solid fa-arrow-up-left lp-pin-arrow"></i>
</div>`).join('');
    }

    /* ═══ ROWS ═══ */
    function renderRows(links) {
        if (!links.length) return `<div class="lp-empty"><i class="fa-solid fa-magnifying-glass-minus"></i><p>لا توجد نتائج</p></div>`;
        return links.map((l, i) => {
            const ready = l.url !== 'YOUR_LINK_HERE';
            return `
<div class="lp-row link-card" data-url="${l.url}"
     style="--c:${l.color};--c-bg:${hexA(l.color,.12)};--c-border:${hexA(l.color,.25)};animation-delay:${(i*.04).toFixed(2)}s">
    <div class="lp-row-line"></div>
    <div class="lp-row-icon"><i class="fa-solid ${l.icon}"></i></div>
    <div class="lp-row-body">
        <div class="lp-row-title">${l.title}</div>
        <div class="lp-row-cat">${l.category}</div>
    </div>
    <span class="lp-row-pill ${ready ? 'ready' : ''}">${ready ? 'متاح' : 'قريباً'}</span>
</div>`; }).join('');
    }

    /* ═══ EVENTS ═══ */
    function attachEvents() {
        const search = document.getElementById('lp-search');
        const clear  = document.getElementById('lp-clear');

        search?.addEventListener('input', () => {
            clear.style.display = search.value ? 'block' : 'none';
            filterLinks(search.value.trim());
        });
        clear?.addEventListener('click', () => {
            search.value = ''; clear.style.display = 'none';
            search.focus(); filterLinks('');
        });
        document.getElementById('lp-root')?.addEventListener('click', e => {
            const card = e.target.closest('.link-card');
            if (!card) return;
            const url = card.dataset.url;
            if (url === 'YOUR_LINK_HERE') { App.Toast.warning('هذا الرابط لم يتم تحديثه بعد', 'انتظر التحديث'); return; }
            window.open(url, '_blank');
        });
    }

    /* ═══ FILTER ═══ */
    function filterLinks(q) {
        const ql = q.toLowerCase();
        const found = IMPORTANT_LINKS.filter(l => !q || l.title.toLowerCase().includes(ql) || l.description.toLowerCase().includes(ql));
        const pinnedEl = document.getElementById('lp-pinned');
        const rowsEl   = document.getElementById('lp-rows');
        const labelEl  = document.getElementById('lp-rest-label');

        if (q) {
            if (pinnedEl) pinnedEl.innerHTML = '';
            if (rowsEl)   rowsEl.innerHTML   = renderRows(found);
            if (labelEl)  labelEl.innerHTML  = `<i class="fa-solid fa-magnifying-glass text-[9px]"></i> نتائج البحث (${found.length})`;
        } else {
            if (pinnedEl) pinnedEl.innerHTML = renderPinned(IMPORTANT_LINKS.filter(l => l.pinned));
            if (rowsEl)   rowsEl.innerHTML   = renderRows(IMPORTANT_LINKS.filter(l => !l.pinned));
            if (labelEl)  labelEl.innerHTML  = `<i class="fa-solid fa-list text-[9px]"></i> جميع الروابط`;
        }
    }

    /* ═══ UTIL ═══ */
    function hexA(hex, a) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }

})(window.App);