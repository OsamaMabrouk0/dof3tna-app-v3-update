(function(App) {
    'use strict';

    /* ══════════════════════════════════════════════
       بيانات المباني الحقيقية
    ══════════════════════════════════════════════ */
    const BUILDINGS = [
        {
            id: 'arabi',
            name: 'تجارة عربي',
            icon: 'fa-building',
            color: '#3b82f6',
            totalRooms: 2,
            floors: [
                {
                    name: 'الدور الأرضي',
                    num: 0,
                    rooms: [
                        { id: 'arabi-j', label: 'مدرج ج',  type: 'مدرج' },
                    ]
                },
                {
                    name: 'الدور الرابع',
                    num: 4,
                    rooms: [
                        { id: 'arabi-d', label: 'مدرج د',  type: 'مدرج' },
                    ]
                }
            ]
        },
        {
            id: 'nour',
            name: 'مبنى النور',
            fullName: 'مبنى الدكتور أحمد نور',
            icon: 'fa-building-columns',
            color: '#10b981',
            totalRooms: 26,
            floors: [
                {
                    name: 'الدور الأول',
                    num: 1,
                    rooms: [
                        { id: 'n-202', label: 'حجرة 202', type: 'حجرة' },
                        { id: 'n-203', label: 'حجرة 203', type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الثاني',
                    num: 2,
                    rooms: [
                        { id: 'n-lec1', label: 'مدرج 1',   type: 'مدرج' },
                        { id: 'n-301',  label: 'حجرة 301',  type: 'حجرة' },
                        { id: 'n-302',  label: 'حجرة 302',  type: 'حجرة' },
                        { id: 'n-303',  label: 'حجرة 303',  type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الثالث',
                    num: 3,
                    rooms: [
                        { id: 'n-401', label: 'حجرة 401', type: 'حجرة' },
                        { id: 'n-402', label: 'حجرة 402', type: 'حجرة' },
                        { id: 'n-403', label: 'حجرة 403', type: 'حجرة' },
                        { id: 'n-404', label: 'حجرة 404', type: 'حجرة' },
                        { id: 'n-406', label: 'حجرة 406', type: 'حجرة' },
                        { id: 'n-407', label: 'حجرة 407', type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الرابع',
                    num: 4,
                    rooms: [
                        { id: 'n-lec2', label: 'مدرج 2',   type: 'مدرج' },
                        { id: 'n-lec3', label: 'مدرج 3',   type: 'مدرج' },
                        { id: 'n-501',  label: 'حجرة 501',  type: 'حجرة' },
                        { id: 'n-502',  label: 'حجرة 502',  type: 'حجرة' },
                        { id: 'n-503',  label: 'حجرة 503',  type: 'حجرة' },
                        { id: 'n-504',  label: 'حجرة 504',  type: 'حجرة' },
                        { id: 'n-506',  label: 'حجرة 506',  type: 'حجرة' },
                        { id: 'n-507',  label: 'حجرة 507',  type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الخامس',
                    num: 5,
                    rooms: [
                        { id: 'n-lec4', label: 'مدرج 4',   type: 'مدرج' },
                        { id: 'n-603',  label: 'حجرة 603',  type: 'حجرة' },
                        { id: 'n-604',  label: 'حجرة 604',  type: 'حجرة' },
                        { id: 'n-605',  label: 'حجرة 605',  type: 'حجرة' },
                        { id: 'n-606',  label: 'حجرة 606',  type: 'حجرة' },
                        { id: 'n-607',  label: 'حجرة 607',  type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور السادس',
                    num: 6,
                    rooms: [
                        { id: 'n-703', label: 'حجرة 703', type: 'حجرة' },
                        { id: 'n-704', label: 'حجرة 704', type: 'حجرة' },
                        { id: 'n-705', label: 'حجرة 705', type: 'حجرة' },
                        { id: 'n-707', label: 'حجرة 707', type: 'حجرة' },
                    ]
                }
            ]
        },
        {
            id: 'sections',
            name: 'مبنى السكاشن',
            icon: 'fa-users',
            color: '#a855f7',
            totalRooms: 9,
            floors: [
                {
                    name: 'الدور الأرضي',
                    num: 0,
                    rooms: [
                        { id: 's-lec5', label: 'مدرج 5', type: 'مدرج' },
                    ]
                },
                {
                    name: 'الدور الأول',
                    num: 1,
                    rooms: [
                        { id: 's-9',  label: 'حجرة 9',  type: 'حجرة' },
                        { id: 's-10', label: 'حجرة 10', type: 'حجرة' },
                        { id: 's-11', label: 'حجرة 11', type: 'حجرة' },
                        { id: 's-12', label: 'حجرة 12', type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الثاني',
                    num: 2,
                    rooms: [
                        { id: 's-90', label: 'حجرة 90', type: 'حجرة' },
                        { id: 's-91', label: 'حجرة 91', type: 'حجرة' },
                        { id: 's-92', label: 'حجرة 92', type: 'حجرة' },
                        { id: 's-93', label: 'حجرة 93', type: 'حجرة' },
                    ]
                },
                {
                    name: 'الدور الثالث',
                    num: 3,
                    rooms: [
                        { id: 's-94', label: 'حجرة 94', type: 'حجرة' },
                        { id: 's-95', label: 'حجرة 95', type: 'حجرة' },
                        { id: 's-96', label: 'حجرة 96', type: 'حجرة' },
                        { id: 's-97', label: 'حجرة 97', type: 'حجرة' },
                    ]
                }
            ]
        },
        {
            id: 'english',
            name: 'تجارة انجليزي',
            icon: 'fa-building-flag',
            color: '#f97316',
            totalRooms: 6,
            floors: [
                {
                    name: 'الدور الأرضي',
                    num: 0,
                    rooms: [
                        { id: 'e-lec6', label: 'مدرج 6', type: 'مدرج' },
                    ]
                },
                {
                    name: 'الدور الأول',
                    num: 1,
                    rooms: [
                        { id: 'e-lec7', label: 'مدرج 7',  type: 'مدرج' },
                        { id: 'e-hall2', label: 'قاعة 2', type: 'قاعة' },
                    ]
                },
                {
                    name: 'الدور الثاني',
                    num: 2,
                    rooms: [
                        { id: 'e-lec8', label: 'مدرج 8',  type: 'مدرج' },
                        { id: 'e-hall3', label: 'قاعة 3', type: 'قاعة' },
                    ]
                }
            ]
        }
    ];

    /* ── State ── */
    let activeBuildingId = 'arabi';
    let activeFloorIdx   = 0;
    let searchQuery      = '';
    let eventListeners   = [];

    function on(el, ev, fn, opts) {
        if (!el) return;
        el.addEventListener(ev, fn, opts);
        eventListeners.push({ el, ev, fn, opts });
    }
    function cleanup() {
        eventListeners.forEach(({ el, ev, fn, opts }) => el?.removeEventListener(ev, fn, opts));
        eventListeners = [];
    }
    function activeBuilding() { return BUILDINGS.find(b => b.id === activeBuildingId); }

    const TYPE_ICON = {
        'مدرج': 'fa-person-chalkboard',
        'قاعة': 'fa-door-open',
        'حجرة': 'fa-door-closed',
    };

    /* ══════════════════ ENTRY ══════════════════ */
    App.Pages.buildings = function() {
        cleanup();
        const container = document.getElementById('app-content');
        if (!container) return;
        renderPage(container);
        attachEvents();
        if (App.Effects?.refresh) App.Effects.refresh();
        App.Router.registerCleanup(cleanup);
    };

    /* ══════════════════ PAGE ══════════════════ */
    function renderPage(container) {
        container.innerHTML = `
<style>
/* ════ Buildings Page ════ */
#bp-root { font-family: 'Cairo', sans-serif; }

/* ── Search ── */
.bp-search-shell { position: relative; max-width: 100%; }
.bp-search {
    width: 100%; padding: .65rem 1rem .65rem 2.6rem;
    border-radius: .9rem; font-family: inherit; font-size: .82rem;
    outline: none; transition: border .2s, box-shadow .2s;
    background: rgba(255,255,255,.045);
    border: 1px solid rgba(255,255,255,.08);
    color: inherit; direction: rtl;
}
.bp-search:focus {
    background: rgba(255,255,255,.07);
    border-color: rgba(99,102,241,.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.bp-search::placeholder { color: rgba(156,163,175,.45); }
.bp-search-ico {
    position: absolute; left: .85rem; top: 50%;
    transform: translateY(-50%);
    color: rgba(156,163,175,.45); font-size: .78rem; pointer-events: none;
}
.bp-search-clear {
    position: absolute; right: .8rem; top: 50%;
    transform: translateY(-50%);
    color: rgba(156,163,175,.4); font-size: .72rem;
    background: none; border: none; cursor: pointer;
    display: none; padding: 0; transition: color .15s;
}
.bp-search-clear:hover { color: #ef4444; }

/* ── Info bar ── */
.bp-infobar {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: .5rem 1.2rem;
    padding: .7rem 1rem;
    border-radius: .9rem;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
}
.bp-chip {
    display: flex; align-items: center; gap: .4rem;
    font-size: .68rem; color: rgba(156,163,175,.5); font-weight: 600;
}
.bp-chip i { font-size: .66rem; }
.bp-chip b { color: rgba(156,163,175,.8); }
.bp-chip-sep { width: 1px; height: .85rem; background: rgba(255,255,255,.07); }

/* ── Building Selector ── */
.bp-buildings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .5rem;
}
@media(min-width:540px) { .bp-buildings { grid-template-columns: repeat(4,1fr); } }

.bp-bld-btn {
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    gap: .4rem; padding: .8rem .5rem;
    border-radius: .9rem; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03);
    cursor: pointer; transition: all .22s cubic-bezier(.34,1.4,.64,1);
    font-family: inherit; overflow: hidden; text-align: center;
}
.bp-bld-btn::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit;
    background: radial-gradient(circle at 50% 100%, var(--bc) 0%, transparent 65%);
    opacity: 0; transition: opacity .22s;
}
.bp-bld-btn.bp-active {
    background: var(--bc-bg); border-color: var(--bc-border);
    box-shadow: 0 4px 20px rgba(0,0,0,.15);
}
.bp-bld-btn.bp-active::before { opacity: .1; }
.bp-bld-btn:hover:not(.bp-active) { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.12); }

.bp-bld-icon {
    width: 2.4rem; height: 2.4rem; border-radius: .7rem;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; justify-content: center;
    transition: all .22s cubic-bezier(.34,1.4,.64,1);
    position: relative; z-index: 1;
}
.bp-bld-btn.bp-active .bp-bld-icon {
    background: var(--bc-bg); border-color: var(--bc-border);
    transform: scale(1.1); box-shadow: 0 0 14px var(--bc-glow);
}
.bp-bld-icon i { font-size: .9rem; color: rgba(156,163,175,.55); transition: color .22s; }
.bp-bld-btn.bp-active .bp-bld-icon i { color: var(--bc); }

.bp-bld-name {
    font-size: .75rem; font-weight: 800; letter-spacing: -.01em;
    color: rgba(156,163,175,.55); transition: color .22s;
    position: relative; z-index: 1; line-height: 1.2;
}
.bp-bld-btn.bp-active .bp-bld-name { color: var(--bc); }
.bp-bld-rooms {
    font-size: .58rem; color: rgba(156,163,175,.3);
    position: relative; z-index: 1;
    transition: color .22s;
}
.bp-bld-btn.bp-active .bp-bld-rooms { color: rgba(156,163,175,.5); }
.bp-bld-dot {
    position: absolute; bottom: .45rem; left: 50%; transform: translateX(-50%);
    width: .3rem; height: .3rem; border-radius: 50%;
    background: var(--bc); opacity: 0;
    box-shadow: 0 0 6px var(--bc); transition: opacity .22s;
}
.bp-bld-btn.bp-active .bp-bld-dot { opacity: 1; }

/* ── Floor Tabs ── */
.bp-floors {
    display: flex; gap: .4rem; overflow-x: auto;
    scrollbar-width: none; padding-bottom: .05rem;
}
.bp-floors::-webkit-scrollbar { display: none; }
.bp-floor-tab {
    flex-shrink: 0; display: flex; align-items: center; gap: .35rem;
    padding: .38rem .85rem;
    border-radius: .6rem; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.03);
    font-family: inherit; font-size: .74rem; font-weight: 700;
    cursor: pointer; transition: all .18s; color: rgba(156,163,175,.5);
    white-space: nowrap;
}
.bp-floor-tab:hover { background: rgba(255,255,255,.07); color: rgba(156,163,175,.85); }
.bp-floor-tab.bp-active {
    background: var(--ft-bg); border-color: var(--ft-border); color: var(--ft-color);
}
.bp-floor-num {
    width: 1.4rem; height: 1.4rem; border-radius: .35rem;
    background: rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: center;
    font-size: .65rem; font-weight: 900; transition: background .18s;
}
.bp-floor-tab.bp-active .bp-floor-num { background: rgba(255,255,255,.15); }

/* ── Rooms Grid ── */
.bp-rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px,1fr));
    gap: .5rem;
}
.bp-room-card {
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    gap: .5rem; padding: .85rem .6rem;
    border-radius: .85rem; border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.025);
    cursor: default; overflow: hidden;
    transition: transform .2s cubic-bezier(.34,1.4,.64,1), border-color .18s, background .18s;
}
.bp-room-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, var(--rc) 0%, transparent 60%);
    opacity: 0; transition: opacity .2s;
}
.bp-room-card:hover {
    transform: translateY(-2px); border-color: var(--rc-border);
    background: rgba(255,255,255,.045);
}
.bp-room-card:hover::before { opacity: .07; }

/* highlight from search */
.bp-room-card.bp-highlight {
    border-color: var(--rc-border);
    background: var(--rc-bg);
    box-shadow: 0 0 0 2px var(--rc-border), 0 4px 20px rgba(0,0,0,.15);
}
.bp-room-card.bp-dim { opacity: .28; }

.bp-room-icon {
    width: 2.2rem; height: 2.2rem; border-radius: .6rem;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; transition: all .18s;
}
.bp-room-card:hover .bp-room-icon,
.bp-room-card.bp-highlight .bp-room-icon {
    background: var(--rc-bg); border-color: var(--rc-border);
}
.bp-room-icon i { font-size: .82rem; color: rgba(156,163,175,.55); transition: color .18s; }
.bp-room-card:hover .bp-room-icon i,
.bp-room-card.bp-highlight .bp-room-icon i { color: var(--rc); }

.bp-room-name {
    font-size: .78rem; font-weight: 800; text-align: center;
    position: relative; z-index: 1; transition: color .18s;
    letter-spacing: -.01em;
}
.bp-room-card:hover .bp-room-name,
.bp-room-card.bp-highlight .bp-room-name { color: var(--rc); }

.bp-room-type {
    font-size: .6rem; color: rgba(156,163,175,.4);
    position: relative; z-index: 1;
}

/* ── Search results mode — cross-building ── */
.bp-search-results { display: flex; flex-direction: column; gap: .85rem; }
.bp-result-group {}
.bp-result-group-title {
    display: flex; align-items: center; gap: .5rem;
    font-size: .62rem; font-weight: 800; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(156,163,175,.35);
    margin-bottom: .5rem;
}
.bp-result-group-title::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.05); }
.bp-result-row {
    display: flex; align-items: center; gap: .7rem;
    padding: .55rem .8rem;
    border-radius: .7rem; border: 1px solid rgba(255,255,255,.06);
    background: rgba(255,255,255,.025);
    transition: background .16s, border-color .16s;
}
.bp-result-row:hover { background: rgba(255,255,255,.05); border-color: var(--rc-border); }
.bp-result-icon {
    width: 1.9rem; height: 1.9rem; border-radius: .45rem;
    background: var(--rc-bg); border: 1px solid var(--rc-border);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bp-result-icon i { font-size: .72rem; color: var(--rc); }
.bp-result-body { flex: 1; min-width: 0; }
.bp-result-name { font-size: .8rem; font-weight: 700; }
.bp-result-meta { font-size: .62rem; color: rgba(156,163,175,.45); margin-top: .05rem; }
.bp-result-bld {
    font-size: .62rem; font-weight: 700; padding: .15rem .45rem;
    border-radius: 999px; background: var(--rc-bg);
    border: 1px solid var(--rc-border); color: var(--rc);
    white-space: nowrap; flex-shrink: 0;
}

/* ── Section label ── */
.bp-label {
    display: flex; align-items: center; gap: .45rem;
    font-size: .62rem; font-weight: 800; letter-spacing: .07em;
    text-transform: uppercase; color: rgba(156,163,175,.35);
}
.bp-label::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.05); }

/* Empty state */
.bp-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: .6rem; padding: 2.5rem 1rem;
    color: rgba(156,163,175,.3); font-size: .8rem; grid-column: 1/-1;
}
.bp-empty i { font-size: 1.8rem; }

/* entry anim */
@keyframes bp-in { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
.bp-room-card, .bp-result-row { animation: bp-in .25s both; }

/* light mode */
html:not(.dark) .bp-search { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.09); color:#111; }
html:not(.dark) .bp-bld-btn { background:rgba(255,255,255,.7); border-color:rgba(0,0,0,.07); }
html:not(.dark) .bp-bld-btn:hover:not(.bp-active) { background:#fff; }
html:not(.dark) .bp-floor-tab { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.07); }
html:not(.dark) .bp-room-card { background:rgba(255,255,255,.75); border-color:rgba(0,0,0,.07); }
html:not(.dark) .bp-room-card:hover { background:#fff; }
html:not(.dark) .bp-result-row { background:rgba(255,255,255,.75); border-color:rgba(0,0,0,.07); }
html:not(.dark) .bp-infobar { background:rgba(0,0,0,.025); border-color:rgba(0,0,0,.07); }
html:not(.dark) .bp-label::after, html:not(.dark) .bp-result-group-title::after { background:rgba(0,0,0,.07); }
</style>

<div id="bp-root" class="container mx-auto max-w-4xl pb-24 space-y-4">

    <!-- Info bar (بدل الهيدر) -->
    <div class="bp-infobar" id="bp-infobar">${renderInfoBar()}</div>

    <!-- Search -->
    <div class="bp-search-shell">
        <i class="fa-solid fa-magnifying-glass bp-search-ico"></i>
        <input id="bp-search" class="bp-search" type="search"
               placeholder="ابحث عن حجرة، مدرج، قاعة..." autocomplete="off" />
        <button id="bp-search-clear" class="bp-search-clear"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <!-- Normal view (hidden during search) -->
    <div id="bp-normal-view">

        <!-- Building Selector -->
        <div class="bp-label mb-2"><i class="fa-solid fa-building text-[9px]"></i> اختر المبنى</div>
        <div class="bp-buildings mb-4" id="bp-buildings">${renderBuildingBtns()}</div>

        <!-- Floor Tabs -->
        <div class="bp-label mb-2"><i class="fa-solid fa-layer-group text-[9px]"></i> اختر الدور — <span id="bp-floor-title" style="font-weight:400;text-transform:none;letter-spacing:0">${activeBuilding().floors[0].name}</span></div>
        <div class="bp-floors mb-3" id="bp-floors">${renderFloorTabs()}</div>

        <!-- Rooms -->
        <div class="bp-rooms-grid" id="bp-rooms">${renderRooms()}</div>

    </div>

    <!-- Search results view (shown during search) -->
    <div id="bp-search-view" style="display:none">
        <div class="bp-label mb-3" id="bp-search-label">
            <i class="fa-solid fa-magnifying-glass text-[9px]"></i> نتائج البحث
        </div>
        <div id="bp-search-results"></div>
    </div>

</div>`;
    }

    /* ══════════════════ RENDERS ══════════════════ */

    function renderInfoBar() {
        const b = activeBuilding();
        const totalRooms    = BUILDINGS.reduce((a, x) => a + x.floors.reduce((c, f) => c + f.rooms.length, 0), 0);
        const totalBuildings = BUILDINGS.length;
        const color = b.color;
        const bg    = hexA(color, .12);
        const bdr   = hexA(color, .3);
        return `
        <span class="bp-chip"><i class="fa-solid fa-city"></i> <b>${totalBuildings}</b> مباني</span>
        <span class="bp-chip-sep"></span>
        <span class="bp-chip"><i class="fa-solid fa-door-open"></i> <b>${totalRooms}</b> قاعة وحجرة</span>
        <span class="bp-chip-sep"></span>
        <span class="bp-chip"><i class="fa-solid fa-layer-group"></i> <b>${b.floors.length}</b> ${b.floors.length === 1 ? 'دور' : 'أدوار'} في ${b.name}</span>
        <span class="bp-chip" style="margin-right:auto;padding:.15rem .55rem;border-radius:999px;background:${bg};border:1px solid ${bdr};color:${color}">
            <i class="fa-solid ${b.icon}"></i> ${b.fullName || b.name}
        </span>`;
    }

    function renderBuildingBtns() {
        return BUILDINGS.map(b => {
            const isActive = b.id === activeBuildingId;
            const color = b.color;
            const bg    = hexA(color, .12);
            const bdr   = hexA(color, .28);
            const glow  = hexA(color, .2);
            const roomCount = b.floors.reduce((a, f) => a + f.rooms.length, 0);
            return `
            <button class="bp-bld-btn ${isActive ? 'bp-active' : ''}" data-building="${b.id}"
                    style="--bc:${color};--bc-bg:${bg};--bc-border:${bdr};--bc-glow:${glow}">
                <div class="bp-bld-icon"><i class="fa-solid ${b.icon}"></i></div>
                <span class="bp-bld-name">${b.name}</span>
                <span class="bp-bld-rooms">${roomCount} قاعة</span>
                <span class="bp-bld-dot"></span>
            </button>`;
        }).join('');
    }

    function renderFloorTabs() {
        const b     = activeBuilding();
        const color = b.color;
        const bg    = hexA(color, .12);
        const bdr   = hexA(color, .3);
        return b.floors.map((floor, i) => `
        <button class="bp-floor-tab ${i === activeFloorIdx ? 'bp-active' : ''}" data-floor="${i}"
                style="--ft-bg:${bg};--ft-border:${bdr};--ft-color:${color}">
            <span class="bp-floor-num">${floor.num}</span>
            ${floor.name}
        </button>`).join('');
    }

    function renderRooms() {
        const b     = activeBuilding();
        const floor = b.floors[activeFloorIdx];
        if (!floor?.rooms?.length) return `<div class="bp-empty"><i class="fa-solid fa-wind"></i><p>لا توجد قاعات</p></div>`;
        const color = b.color;
        const bg    = hexA(color, .12);
        const bdr   = hexA(color, .3);
        return floor.rooms.map((room, i) => `
        <div class="bp-room-card" style="--rc:${color};--rc-bg:${bg};--rc-border:${bdr};animation-delay:${(i*.04).toFixed(2)}s">
            <div class="bp-room-icon"><i class="fa-solid ${TYPE_ICON[room.type] || 'fa-door-closed'}"></i></div>
            <span class="bp-room-name">${room.label}</span>
            <span class="bp-room-type">${room.type}</span>
        </div>`).join('');
    }

    /* ── Search across all buildings ── */
    function runSearch(q) {
        const ql = q.toLowerCase().trim();
        const resultsEl  = document.getElementById('bp-search-results');
        const labelEl    = document.getElementById('bp-search-label');
        const normalView = document.getElementById('bp-normal-view');
        const searchView = document.getElementById('bp-search-view');

        if (!ql) {
            normalView.style.display = '';
            searchView.style.display = 'none';
            return;
        }

        normalView.style.display = 'none';
        searchView.style.display = '';

        // Collect matches
        const groups = [];
        BUILDINGS.forEach(b => {
            const matches = [];
            b.floors.forEach(floor => {
                floor.rooms.forEach(room => {
                    if (room.label.toLowerCase().includes(ql) ||
                        room.type.toLowerCase().includes(ql) ||
                        b.name.toLowerCase().includes(ql) ||
                        floor.name.toLowerCase().includes(ql)) {
                        matches.push({ room, floor, building: b });
                    }
                });
            });
            if (matches.length) groups.push({ building: b, matches });
        });

        const total = groups.reduce((a, g) => a + g.matches.length, 0);
        labelEl.innerHTML = `<i class="fa-solid fa-magnifying-glass text-[9px]"></i> نتائج البحث <span style="color:rgba(156,163,175,.4);font-weight:400">(${total})</span>`;

        if (!total) {
            resultsEl.innerHTML = `<div class="bp-empty" style="grid-column:1/-1"><i class="fa-solid fa-magnifying-glass-minus"></i><p>لا توجد نتائج لـ "${q}"</p></div>`;
            return;
        }

        resultsEl.innerHTML = `<div class="bp-search-results">
            ${groups.map(g => {
                const color = g.building.color;
                const bg    = hexA(color, .12);
                const bdr   = hexA(color, .28);
                return `
                <div class="bp-result-group">
                    <div class="bp-result-group-title">
                        <i class="fa-solid ${g.building.icon}" style="color:${color};font-size:.7rem"></i>
                        ${g.building.name}
                        <span style="color:rgba(156,163,175,.3);font-weight:400;text-transform:none;letter-spacing:0">(${g.matches.length})</span>
                    </div>
                    ${g.matches.map((m, i) => `
                    <div class="bp-result-row" style="--rc:${color};--rc-bg:${bg};--rc-border:${bdr};animation-delay:${(i*.035).toFixed(2)}s">
                        <div class="bp-result-icon"><i class="fa-solid ${TYPE_ICON[m.room.type] || 'fa-door-closed'}"></i></div>
                        <div class="bp-result-body">
                            <div class="bp-result-name">${highlightMatch(m.room.label, ql)}</div>
                            <div class="bp-result-meta">${m.floor.name} · ${m.room.type}</div>
                        </div>
                        <span class="bp-result-bld">${g.building.name}</span>
                    </div>`).join('')}
                </div>`;
            }).join('')}
        </div>`;
    }

    function highlightMatch(text, q) {
        if (!q) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        return text.slice(0, idx) +
            `<mark style="background:rgba(99,102,241,.25);color:inherit;border-radius:.2rem;padding:0 .15rem">${text.slice(idx, idx + q.length)}</mark>` +
            text.slice(idx + q.length);
    }

    /* ══════════════════ EVENTS ══════════════════ */
    function attachEvents() {
        /* Building selector */
        on(document.getElementById('bp-buildings'), 'click', e => {
            const btn = e.target.closest('.bp-bld-btn');
            if (!btn) return;
            const id = btn.dataset.building;
            if (id === activeBuildingId) return;
            activeBuildingId = id;
            activeFloorIdx   = 0;
            refresh();
        });

        /* Floor tabs */
        on(document.getElementById('bp-floors'), 'click', e => {
            const tab = e.target.closest('.bp-floor-tab');
            if (!tab) return;
            const idx = parseInt(tab.dataset.floor, 10);
            if (idx === activeFloorIdx) return;
            activeFloorIdx = idx;
            refreshFloorTabs();
            refreshRooms();
            refreshFloorTitle();
        });

        /* Search */
        const search = document.getElementById('bp-search');
        const clear  = document.getElementById('bp-search-clear');
        on(search, 'input', () => {
            searchQuery = search.value;
            clear.style.display = searchQuery ? 'block' : 'none';
            runSearch(searchQuery);
        });
        on(clear, 'click', () => {
            search.value = ''; searchQuery = '';
            clear.style.display = 'none';
            search.focus();
            runSearch('');
        });
    }

    /* ══════════════════ REFRESH ══════════════════ */
    function refresh() {
        refreshBuildingBtns();
        refreshFloorTabs();
        refreshRooms();
        refreshInfoBar();
        refreshFloorTitle();
    }
    function refreshBuildingBtns() {
        const el = document.getElementById('bp-buildings');
        if (el) el.innerHTML = renderBuildingBtns();
    }
    function refreshFloorTabs() {
        const el = document.getElementById('bp-floors');
        if (el) el.innerHTML = renderFloorTabs();
    }
    function refreshRooms() {
        const el = document.getElementById('bp-rooms');
        if (el) el.innerHTML = renderRooms();
    }
    function refreshInfoBar() {
        const el = document.getElementById('bp-infobar');
        if (el) el.innerHTML = renderInfoBar();
    }
    function refreshFloorTitle() {
        const el = document.getElementById('bp-floor-title');
        if (el) el.textContent = activeBuilding().floors[activeFloorIdx]?.name || '';
    }

    /* ══════════════════ UTIL ══════════════════ */
    function hexA(hex, a) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }

})(window.App);
