(function (App) {
    'use strict';


    const IMPORTANT_LINKS = [


        {
            id: 'college-portal',
            title: 'بوابة الكلية',
            description: 'بوابة الخدمات الإلكترونية للطلاب',
            icon: 'fa-graduation-cap', brands: false,
            color: '#3b82f6',
            url: 'https://umis.alexu.edu.eg/umisapp/registration/ed_login.aspx',
            category: 'أكاديمي', pinned: true, isNew: false
        },
        {
            id: 'new-portal',
            title: 'بوابة الكلية',
            description: 'البوابة الإلكترونية المحدّثة',
            icon: 'fa-graduation-cap', brands: false,
            color: '#06b6d4',
            url: 'https://numis.alexu.edu.eg/umisapp/registration/ed_login.aspx',
            category: 'أكاديمي', pinned: true, isNew: true
        },
        {
            id: 'thinqi',
            title: 'منصة Thinqi',
            description: 'المحاضرات والاختبارات أونلاين',
            icon: 'fa-laptop-code', brands: false,
            color: '#a855f7',
            url: 'https://sso.eetest.online/studenthome?view=dashboard',
            category: 'أكاديمي', pinned: true, isNew: false
        },
        {
            id: 'college-books',
            title: 'مكتبة الكتب',
            description: 'تحميل الكتب والمراجع الدراسية',
            icon: 'fa-book-open', brands: false,
            color: '#10b981',
            url: 'YOUR_LINK_HERE',
            category: 'مصادر', pinned: false, isNew: false
        },


        {
            id: 'college-website',
            title: 'موقع الكلية',
            description: 'الموقع الرسمي لكلية التجارة',
            icon: 'fa-building-columns', brands: false,
            color: '#6366f1',
            url: 'http://www.comm.alexu.edu.eg/',
            category: 'أكاديمي', pinned: true, isNew: false
        },
        {
            id: 'email',
            title: 'البريد الجامعي',
            description: 'البريد الإلكتروني الجامعي',
            icon: 'fa-envelope', brands: false,
            color: '#ef4444',
            url: 'https://numis.alexu.edu.eg/umisapp/Registration/ED/OR_Stud_Email.aspx',
            category: 'أكاديمي', pinned: true, isNew: false
        },


        {
            id: 'library',
            title: 'المكتبة الرقمية',
            description: 'قواعد البيانات والأبحاث العلمية',
            icon: 'fa-book-bookmark', brands: false,
            color: '#8b5cf6',
            url: 'YOUR_LINK_HERE',
            category: 'مصادر', pinned: false, isNew: false
        },


        {
            id: 'facebook-college',
            title: 'صفحة الكلية',
            description: 'الأخبار والإعلانات الرسمية للكلية',
            icon: 'fa-facebook', brands: true,
            color: '#1877f2',
            url: 'https://www.facebook.com/@AlexuBusiness/?rdid=9BAErRdDtWtgjbf9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FEsBe1BLe%2F#',
            category: 'تواصل', pinned: true, isNew: false
        },
        {
            id: 'facebook-affairs',
            title: 'شؤون الطلاب',
            description: 'متابعة خدمات ومستجدات الطلاب',
            icon: 'fa-facebook', brands: true,
            color: '#1d9bf0',
            url: 'https://www.facebook.com/profile.php?id=61550529950164&rdid=raq3OfRruXFps0JH&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18Zd3SRgtz%2F#',
            category: 'تواصل', pinned: true, isNew: false
        },
    ];


    const CATS = [
        { key: 'الكل', icon: 'fa-border-all' },
        { key: 'أكاديمي', icon: 'fa-graduation-cap' },
        { key: 'مصادر', icon: 'fa-book-open' },
        { key: 'تواصل', icon: 'fa-users' },
    ];

    let activeCat = 'الكل';


    App.Pages.links = function () {
        const container = document.getElementById('app-content');
        if (!container) return;
        renderLinksPage(container);
        attachEvents();
        if (App.Effects && App.Effects.refresh) App.Effects.refresh();
    };


    function renderLinksPage(container) {
        const pinned = IMPORTANT_LINKS.filter(l => l.pinned);
        const rest = IMPORTANT_LINKS.filter(l => !l.pinned);
        const active = IMPORTANT_LINKS.filter(l => l.url !== 'YOUR_LINK_HERE').length;
        const newCount = IMPORTANT_LINKS.filter(l => l.isNew).length;

        container.innerHTML = `
<style>
/* ══════════════════════════════════
   Links Page — v2
══════════════════════════════════ */
#lp-root { font-family: inherit; }

/* ── Search bar ── */
.lp-search-shell { position: relative; flex: 1; min-width: 0; max-width: 300px; }
.lp-search {
    width: 100%; padding: .56rem .9rem .56rem 2.25rem;
    border-radius: .78rem; font-family: inherit; font-size: .8rem;
    outline: none; color: inherit; direction: rtl;
    background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08);
    transition: background .18s, border-color .18s, box-shadow .18s;
}
.lp-search:focus {
    background: rgba(255,255,255,.07);
    border-color: rgba(99,102,241,.45);
    box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.lp-search::placeholder { color: rgba(156,163,175,.38); }
.lp-search-ico {
    position: absolute; left: .72rem; top: 50%; transform: translateY(-50%);
    color: rgba(156,163,175,.38); font-size: .7rem; pointer-events: none;
}
.lp-clear {
    position: absolute; right: .65rem; top: 50%; transform: translateY(-50%);
    width: 1.2rem; height: 1.2rem; border-radius: .3rem;
    background: rgba(255,255,255,.07); border: none; cursor: pointer;
    color: rgba(156,163,175,.4); font-size: .58rem;
    display: none; align-items: center; justify-content: center;
    transition: background .15s, color .15s;
}
.lp-clear:hover { background: rgba(239,68,68,.15); color: #f87171; }

/* ── Stats chips ── */
.lp-stats { display: flex; align-items: center; gap: .3rem; flex-wrap: wrap; }
.lp-stat-chip {
    display: inline-flex; align-items: center; gap: .28rem;
    font-size: .63rem; font-weight: 700;
    padding: .2rem .55rem; border-radius: 999px;
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03); color: rgba(156,163,175,.48);
}
.lp-stat-chip i { font-size: .56rem; }
.lp-stat-chip.s-ok  { background:rgba(52,211,153,.07); border-color:rgba(52,211,153,.18); color:#34d399; }
.lp-stat-chip.s-new { background:rgba(6,182,212,.07);  border-color:rgba(6,182,212,.18);  color:#22d3ee; }

/* ── Category filter chips ── */
.lp-cats { display: flex; gap: .3rem; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.lp-cats::-webkit-scrollbar { display: none; }
.lp-cat {
    flex-shrink: 0; display: flex; align-items: center; gap: .28rem;
    padding: .28rem .72rem; border-radius: 999px;
    font-family: inherit; font-size: .67rem; font-weight: 700;
    cursor: pointer; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03); color: rgba(156,163,175,.45);
    transition: all .18s cubic-bezier(.34,1.4,.64,1); white-space: nowrap;
}
.lp-cat i { font-size: .58rem; }
.lp-cat:hover { background: rgba(255,255,255,.07); color: rgba(156,163,175,.8); border-color: rgba(255,255,255,.12); }
.lp-cat.on {
    background: rgba(99,102,241,.14); border-color: rgba(99,102,241,.3);
    color: #a5b4fc; box-shadow: 0 2px 10px rgba(99,102,241,.12);
}
.lp-cat-n {
    font-size: .54rem; font-weight: 900; padding: .04rem .26rem;
    border-radius: 999px; background: rgba(255,255,255,.07); color: rgba(156,163,175,.38);
    transition: background .18s, color .18s;
}
.lp-cat.on .lp-cat-n { background: rgba(99,102,241,.2); color: #a5b4fc; }
@keyframes lp-cat-in { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
.lp-cat { animation: lp-cat-in .2s both; }

/* ── Section label ── */
.lp-label {
    display: flex; align-items: center; gap: .42rem;
    font-size: .59rem; font-weight: 800; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(156,163,175,.3);
}
.lp-label i { font-size: .55rem; }
.lp-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.05); }

/* ══ PINNED CARDS ══ */
.lp-pinned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
    gap: .42rem;
}
.lp-pin-card {
    position: relative; border-radius: .95rem;
    padding: .88rem 1rem; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03);
    cursor: pointer; overflow: hidden;
    display: flex; align-items: center; gap: .7rem;
    transition: transform .22s cubic-bezier(.34,1.4,.64,1), box-shadow .22s, border-color .2s;
}
/* glow bg */
.lp-pin-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 5% 60%, var(--c) 0%, transparent 62%);
    opacity: 0; transition: opacity .25s; pointer-events: none;
}
.lp-pin-card:hover {
    transform: translateY(-2px);
    border-color: var(--c-border);
    box-shadow: 0 8px 28px rgba(0,0,0,.18), 0 0 0 1px var(--c-border);
}
.lp-pin-card:hover::before { opacity: .08; }
.lp-pin-card:active { transform: scale(.97); transition-duration: .08s; }
/* shimmer */
.lp-pin-card::after {
    content: ''; position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,.055) 50%, transparent 75%);
    transition: left .45s ease; pointer-events: none;
}
.lp-pin-card:hover::after { left: 160%; }
/* left accent bar */
.lp-pin-bar {
    position: absolute; top: 18%; left: 0; width: 2.5px; height: 64%;
    border-radius: 0 2px 2px 0; background: var(--c);
    opacity: 0; transition: opacity .22s, height .28s;
}
.lp-pin-card:hover .lp-pin-bar { opacity: .6; height: 72%; }
/* icon */
.lp-pin-icon {
    width: 2.25rem; height: 2.25rem; flex-shrink: 0; border-radius: .6rem;
    background: var(--c-bg); border: 1px solid var(--c-border);
    display: flex; align-items: center; justify-content: center;
    transition: transform .22s cubic-bezier(.34,1.4,.64,1); position: relative; z-index: 1;
}
.lp-pin-card:hover .lp-pin-icon { transform: scale(1.1) rotate(-5deg); }
.lp-pin-icon i { font-size: .9rem; color: var(--c); }
/* text */
.lp-pin-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.lp-pin-title {
    font-size: .79rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .2s;
}
.lp-pin-card:hover .lp-pin-title { color: var(--c); }
.lp-pin-desc {
    font-size: .61rem; color: rgba(156,163,175,.5);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: .08rem;
}
/* arrow */
.lp-pin-arr {
    font-size: .58rem; color: var(--c); opacity: 0;
    transform: translateX(-5px); flex-shrink: 0;
    transition: opacity .18s, transform .18s; position: relative; z-index: 1;
}
.lp-pin-card:hover .lp-pin-arr { opacity: 1; transform: translateX(0); }
/* NEW badge */
.lp-new-badge {
    position: absolute; top: .45rem; left: .45rem; z-index: 6;
    font-size: .46rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase;
    padding: .1rem .36rem; border-radius: 999px;
    background: linear-gradient(135deg, #06b6d4, #10b981);
    color: #fff; box-shadow: 0 2px 8px rgba(6,182,212,.3);
}

/* ══ ROWS ══ */
.lp-rows { display: flex; flex-direction: column; gap: .28rem; }
.lp-row {
    position: relative; display: flex; align-items: center; gap: .6rem;
    padding: .58rem .78rem; border-radius: .75rem;
    border: 1px solid rgba(255,255,255,.055);
    background: rgba(255,255,255,.02);
    cursor: pointer; overflow: hidden;
    transition: background .18s, border-color .18s, transform .2s cubic-bezier(.34,1.4,.64,1);
}
.lp-row::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 2% 50%, var(--c) 0%, transparent 52%);
    opacity: 0; transition: opacity .2s; pointer-events: none;
}
.lp-row:hover { background: rgba(255,255,255,.045); border-color: var(--c-border); transform: translateX(-2px); }
.lp-row:hover::before { opacity: .055; }
.lp-row:active { transform: scale(.98); transition-duration: .08s; }
/* left accent line */
.lp-row-line {
    position: absolute; top: 18%; left: 0; width: 2px; height: 64%;
    border-radius: 0 2px 2px 0; background: var(--c);
    opacity: 0; transition: opacity .18s;
}
.lp-row:hover .lp-row-line { opacity: .5; }
/* icon box */
.lp-row-icon {
    width: 1.85rem; height: 1.85rem; flex-shrink: 0; border-radius: .48rem;
    background: rgba(255,255,255,.05);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1;
    transition: background .18s, transform .18s;
}
.lp-row:hover .lp-row-icon { background: var(--c-bg); transform: scale(1.08); }
.lp-row-icon i { font-size: .74rem; color: rgba(156,163,175,.55); transition: color .18s; }
.lp-row:hover .lp-row-icon i { color: var(--c); }
/* text */
.lp-row-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.lp-row-title {
    font-size: .76rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .18s;
}
.lp-row:hover .lp-row-title { color: var(--c); }
.lp-row-cat { font-size: .58rem; color: rgba(156,163,175,.38); margin-top: .04rem; font-weight: 600; }
/* right side */
.lp-row-end { display: flex; align-items: center; gap: .35rem; flex-shrink: 0; position: relative; z-index: 1; }

/* copy button — يظهر عند hover فقط */
.lp-copy {
    width: 1.6rem; height: 1.6rem; border-radius: .38rem;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07);
    color: rgba(156,163,175,.32); font-size: .62rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0; pointer-events: none;
    transition: all .15s;
}
.lp-row:hover .lp-copy { opacity: 1; pointer-events: auto; }
.lp-copy:hover { background: rgba(99,102,241,.15); border-color: rgba(99,102,241,.28); color: #a5b4fc; transform: scale(1.1); }
.lp-copy.done { background: rgba(16,185,129,.14); border-color: rgba(16,185,129,.26); color: #34d399; }

/* status pill */
.lp-pill {
    font-size: .54rem; font-weight: 700; padding: .12rem .4rem;
    border-radius: 999px; white-space: nowrap;
    background: rgba(156,163,175,.07); color: rgba(156,163,175,.3);
    border: 1px solid rgba(255,255,255,.05);
}
.lp-pill.ok  { background: rgba(16,185,129,.09); color: #10b981; border-color: rgba(16,185,129,.2); }
.lp-pill.new { background: rgba(6,182,212,.09);  color: #06b6d4; border-color: rgba(6,182,212,.2); }

/* ── Empty state ── */
.lp-empty {
    padding: 2.8rem 1rem; display: flex; flex-direction: column;
    align-items: center; gap: .45rem; text-align: center;
}
.lp-empty-ring {
    width: 3.6rem; height: 3.6rem; border-radius: 1rem;
    background: rgba(255,255,255,.03); border: 1.5px dashed rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; color: rgba(156,163,175,.2); margin-bottom: .15rem;
}
.lp-empty p    { font-size: .76rem; color: rgba(156,163,175,.28); }
.lp-empty span { font-size: .64rem; color: rgba(156,163,175,.17); }

/* ── Animations ── */
@keyframes lp-in { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
.lp-pin-card { animation: lp-in .26s both; }
.lp-row      { animation: lp-in .22s both; }

/* ── Light mode ── */
html:not(.dark) .lp-search { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.09); color:#111827; }
html:not(.dark) .lp-search:focus { background:rgba(0,0,0,.06); }
html:not(.dark) .lp-clear { background:rgba(0,0,0,.06); }
html:not(.dark) .lp-pin-card { background:rgba(255,255,255,.82); border-color:rgba(0,0,0,.07); box-shadow:0 1px 4px rgba(0,0,0,.05); }
html:not(.dark) .lp-pin-card:hover { background:#fff; box-shadow:0 6px 22px rgba(0,0,0,.1), 0 0 0 1px var(--c-border); }
html:not(.dark) .lp-row { background:rgba(255,255,255,.65); border-color:rgba(0,0,0,.07); }
html:not(.dark) .lp-row:hover { background:#fff; }
html:not(.dark) .lp-pin-desc  { color:rgba(75,85,99,.48); }
html:not(.dark) .lp-row-cat   { color:rgba(75,85,99,.45); }
html:not(.dark) .lp-row-icon  { background:rgba(0,0,0,.04); }
html:not(.dark) .lp-row-icon i{ color:rgba(75,85,99,.45); }
html:not(.dark) .lp-pill { background:rgba(0,0,0,.05); color:rgba(75,85,99,.38); border-color:rgba(0,0,0,.07); }
html:not(.dark) .lp-copy { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.08); color:rgba(75,85,99,.32); }
html:not(.dark) .lp-cat { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.08); color:rgba(75,85,99,.48); }
html:not(.dark) .lp-cat:hover { background:rgba(0,0,0,.07); }
html:not(.dark) .lp-cat.on { background:rgba(99,102,241,.09); border-color:rgba(99,102,241,.25); color:#4338ca; }
html:not(.dark) .lp-cat.on .lp-cat-n { background:rgba(99,102,241,.13); color:#4338ca; }
html:not(.dark) .lp-stat-chip { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.07); color:rgba(75,85,99,.48); }
html:not(.dark) .lp-stat-chip.s-ok  { background:rgba(16,185,129,.07); color:#059669; border-color:rgba(16,185,129,.18); }
html:not(.dark) .lp-stat-chip.s-new { background:rgba(6,182,212,.07);  color:#0891b2; border-color:rgba(6,182,212,.15); }
html:not(.dark) .lp-label { color:rgba(75,85,99,.3); }
html:not(.dark) .lp-label::after { background:rgba(0,0,0,.07); }
html:not(.dark) .lp-empty-ring { background:rgba(0,0,0,.03); border-color:rgba(0,0,0,.1); color:rgba(75,85,99,.2); }
</style>

<div id="lp-root" class="container mx-auto max-w-4xl pb-24 space-y-4">

    <!-- ── Search + stats ── -->
    <div class="flex flex-wrap items-center gap-3">
        <div class="lp-search-shell">
            <i class="fa-solid fa-magnifying-glass lp-search-ico"></i>
            <input id="lp-search" class="lp-search" type="search"
                   placeholder="ابحث عن رابط..." autocomplete="off" />
            <button id="lp-clear" class="lp-clear">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="lp-stats">
            <span class="lp-stat-chip">
                <i class="fa-solid fa-link"></i>
                <b>${IMPORTANT_LINKS.length}</b> رابط
            </span>
            <span class="lp-stat-chip s-ok">
                <i class="fa-solid fa-circle-check"></i>
                <b>${active}</b> فعّال
            </span>
            ${newCount > 0 ? `<span class="lp-stat-chip s-new">
                <i class="fa-solid fa-star"></i>
                <b>${newCount}</b> جديد
            </span>` : ''}
        </div>
    </div>

    <!-- ── Category filters ── -->
    <div class="lp-cats" id="lp-cats">
        ${CATS.map((c, i) => {
            const n = c.key === 'الكل'
                ? IMPORTANT_LINKS.length
                : IMPORTANT_LINKS.filter(l => l.category === c.key).length;
            return `<button class="lp-cat ${c.key === activeCat ? 'on' : ''}"
                    data-cat="${c.key}"
                    style="animation-delay:${(i * .04).toFixed(2)}s">
                <i class="fa-solid ${c.icon}"></i>
                ${c.key}
                <span class="lp-cat-n">${n}</span>
            </button>`;
        }).join('')}
    </div>

    <!-- ── Pinned ── -->
    <div id="lp-pinned-section">
        <div class="lp-label mb-2">
            <i class="fa-solid fa-thumbtack"></i> وصول سريع
        </div>
        <div class="lp-pinned-grid" id="lp-pinned">${renderPinned(pinned)}</div>
    </div>

    <!-- ── All links ── -->
    <div>
        <div class="lp-label mb-2" id="lp-rest-label">
            <i class="fa-solid fa-list"></i> جميع الروابط
        </div>
        <div class="lp-rows" id="lp-rows">${renderRows(rest)}</div>
    </div>

</div>`;
    }


    function mkIcon(l, sz) {
        const cls = l.brands ? 'fa-brands' : 'fa-solid';
        return `<i class="${cls} ${l.icon}" style="font-size:${sz}rem"></i>`;
    }

    function renderPinned(links) {
        if (!links.length) return `
            <div class="lp-empty" style="grid-column:1/-1">
                <div class="lp-empty-ring"><i class="fa-solid fa-wind"></i></div>
                <p>لا توجد نتائج</p>
            </div>`;
        return links.map((l, i) => `
<div class="lp-pin-card link-card" data-url="${l.url}"
     style="--c:${l.color};--c-bg:${hexA(l.color, .13)};--c-border:${hexA(l.color, .26)};animation-delay:${(i * .07).toFixed(2)}s">
    ${l.isNew ? '<span class="lp-new-badge">جديد</span>' : ''}
    <div class="lp-pin-bar"></div>
    <div class="lp-pin-icon">${mkIcon(l, .9)}</div>
    <div class="lp-pin-body">
        <div class="lp-pin-title">${l.title}</div>
        <div class="lp-pin-desc">${l.description}</div>
    </div>
    <i class="fa-solid fa-arrow-up-left lp-pin-arr"></i>
</div>`).join('');
    }

    function renderRows(links) {
        if (!links.length) return `
<div class="lp-empty">
    <div class="lp-empty-ring"><i class="fa-solid fa-magnifying-glass-minus"></i></div>
    <p>لا توجد نتائج</p>
    <span>جرّب تغيير الفئة أو البحث بكلمة أخرى</span>
</div>`;
        return links.map((l, i) => {
            const ready = l.url !== 'YOUR_LINK_HERE';
            return `
<div class="lp-row link-card" data-url="${l.url}"
     style="--c:${l.color};--c-bg:${hexA(l.color, .13)};--c-border:${hexA(l.color, .26)};animation-delay:${(i * .04).toFixed(2)}s">
    <div class="lp-row-line"></div>
    <div class="lp-row-icon">${mkIcon(l, .74)}</div>
    <div class="lp-row-body">
        <div class="lp-row-title">${l.title}</div>
        <div class="lp-row-cat">${l.category}</div>
    </div>
    <div class="lp-row-end">
        ${ready ? `<button class="lp-copy" data-url="${l.url}" title="نسخ الرابط">
            <i class="fa-regular fa-copy"></i>
        </button>` : ''}
        <span class="lp-pill ${l.isNew ? 'new' : ready ? 'ok' : ''}">
            ${l.isNew ? 'جديد' : ready ? 'متاح' : 'قريباً'}
        </span>
    </div>
</div>`;
        }).join('');
    }


    function attachEvents() {
        const search = document.getElementById('lp-search');
        const clear = document.getElementById('lp-clear');
        const root = document.getElementById('lp-root');


        search?.addEventListener('input', () => {
            const v = search.value;
            clear.style.display = v ? 'flex' : 'none';
            applyView(v.trim(), activeCat);
        });
        clear?.addEventListener('click', () => {
            search.value = '';
            clear.style.display = 'none';
            search.focus();
            applyView('', activeCat);
        });


        document.getElementById('lp-cats')?.addEventListener('click', e => {
            const btn = e.target.closest('.lp-cat');
            if (!btn) return;
            activeCat = btn.dataset.cat;
            document.querySelectorAll('.lp-cat')
                .forEach(c => c.classList.toggle('on', c.dataset.cat === activeCat));
            applyView(search?.value?.trim() || '', activeCat);
        });


        root?.addEventListener('click', e => {

            const copyBtn = e.target.closest('.lp-copy');
            if (copyBtn) {
                e.stopPropagation();
                const url = copyBtn.dataset.url;
                navigator.clipboard?.writeText(url).then(() => {
                    copyBtn.classList.add('done');
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.classList.remove('done');
                        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                    }, 1800);
                }).catch(() => { });
                return;
            }

            const card = e.target.closest('.link-card');
            if (!card) return;
            const url = card.dataset.url;
            if (!url || url === 'YOUR_LINK_HERE') {
                App.Toast?.warning('هذا الرابط سيُضاف قريباً', 'انتظر التحديث');
                return;
            }
            window.open(url, '_blank');
        });
    }


    function applyView(q, cat) {
        const ql = q.toLowerCase();
        const filtered = IMPORTANT_LINKS.filter(l => {
            const matchCat = cat === 'الكل' || l.category === cat;
            const matchQ = !q || l.title.toLowerCase().includes(ql) || l.description.toLowerCase().includes(ql);
            return matchCat && matchQ;
        });

        const pinnedSec = document.getElementById('lp-pinned-section');
        const pinnedEl = document.getElementById('lp-pinned');
        const rowsEl = document.getElementById('lp-rows');
        const labelEl = document.getElementById('lp-rest-label');

        if (q) {

            if (pinnedSec) pinnedSec.style.display = 'none';
            if (rowsEl) rowsEl.innerHTML = renderRows(filtered);
            if (labelEl) labelEl.innerHTML =
                `<i class="fa-solid fa-magnifying-glass"></i> نتائج البحث (${filtered.length})`;
        } else {

            if (pinnedSec) pinnedSec.style.display = '';
            const pF = filtered.filter(l => l.pinned);
            const rF = filtered.filter(l => !l.pinned);
            if (pinnedEl) pinnedEl.innerHTML = renderPinned(pF);
            if (rowsEl) rowsEl.innerHTML = renderRows(rF);
            if (labelEl) labelEl.innerHTML = cat === 'الكل'
                ? '<i class="fa-solid fa-list"></i> جميع الروابط'
                : `<i class="fa-solid fa-tag"></i> ${cat}`;
        }
    }


    function hexA(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

})(window.App);