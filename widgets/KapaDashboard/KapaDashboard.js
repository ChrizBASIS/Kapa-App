(function() {
    let template = document.createElement("template");
    
    // No @import needed — CSS is loaded via fetch() in initWidget()
    
    const iconDashboard = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
    const iconTeam = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
    const iconCall = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    const iconSync = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
    const iconSun = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const iconMoon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const iconFilter = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;
    const iconFilterReset = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon><line x1="16" y1="16" x2="22" y2="22"></line><line x1="22" y1="16" x2="16" y2="22"></line></svg>`;
    const iconFilterSave = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`;
    const iconFilterLoad = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    const iconClose = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    template.innerHTML = `
        <style>
            /* === THEME VARIABLES (inline for instant application) === */
            :host {
                display: block; width: 100%; height: 100%;
                --bg-base: #FAFAFA; --bg-surface: #FFFFFF; --bg-surface-hover: #F4F4F5;
                --bg-panel: #FFFFFF; --bg-header: rgba(255,255,255,0.85);
                --accent-primary: #4F46E5; --accent-primary-hover: #4338CA;
                --accent-success: #16A34A; --accent-success-bg: rgba(22,163,74,0.08);
                --accent-warning: #D97706; --accent-warning-bg: rgba(217,119,6,0.08);
                --accent-danger: #DC2626; --accent-danger-bg: rgba(220,38,38,0.08);
                --text-primary: #18181B; --text-secondary: #52525B; --text-muted: #A1A1AA;
                --border-subtle: #E4E4E7; --border-highlight: #D4D4D8;
                --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
                --shadow-pop: 0 1px 3px rgba(0,0,0,0.08); --shadow-card: 0 1px 2px rgba(0,0,0,0.05);
                --font-ui: 'Inter', -apple-system, sans-serif;
                --font-mono: 'JetBrains Mono', 'Roboto Mono', monospace;
                --grid-line-color: rgba(0,0,0,0.04);
                --nav-active-bg: rgba(79,70,229,0.08); --nav-active-color: #4F46E5;
                --badge-glow: none;
            }
            :host(.dark) {
                --bg-base: #09090B; --bg-surface: #0A0A0A; --bg-surface-hover: #18181B;
                --bg-panel: #111113; --bg-header: rgba(9,9,11,0.85);
                --accent-primary: #818CF8; --accent-primary-hover: #6366F1;
                --accent-success: #34D399; --accent-success-bg: rgba(52,211,153,0.12);
                --accent-warning: #FBBF24; --accent-warning-bg: rgba(251,191,36,0.12);
                --accent-danger: #F87171; --accent-danger-bg: rgba(248,113,113,0.12);
                --text-primary: #FAFAFA; --text-secondary: #A1A1AA; --text-muted: #71717A;
                --border-subtle: #27272A; --border-highlight: #3F3F46;
                --shadow-pop: 0 4px 12px rgba(0,0,0,0.5); --shadow-card: 0 2px 8px rgba(0,0,0,0.4);
                --grid-line-color: rgba(255,255,255,0.03);
                --nav-active-bg: rgba(129,140,248,0.12); --nav-active-color: #818CF8;
                --badge-glow: 0 0 6px currentColor;
            }

            /* === INLINE COMPONENT STYLES === */
            .filter-bar { display:flex; flex-wrap:wrap; gap:14px; padding:14px 32px; background:var(--bg-surface); border-bottom:1px solid var(--border-subtle); z-index:5; align-items:flex-end; }
            .filter-group { display:flex; flex-direction:column; gap:5px; min-width:130px; }
            .filter-group label { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; }
            .filter-group select, .filter-group input[type='text'] { background:var(--bg-base); color:var(--text-primary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:7px 10px; font-family:var(--font-ui); font-size:12px; outline:none; transition:all 0.2s; }
            .filter-group select:focus, .filter-group input[type='text']:focus { border-color:var(--accent-primary); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
            .week-toggle { display:flex; background:var(--bg-base); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); overflow:hidden; }
            .week-toggle button { background:transparent; border:none; color:var(--text-secondary); padding:8px 16px; cursor:pointer; font-size:13px; font-weight:600; border-right:1px solid var(--border-subtle); font-family:var(--font-mono); transition:all 0.15s; }
            .week-toggle button:last-child { border-right:none; }
            .week-toggle button.active { background:linear-gradient(135deg,var(--accent-primary),#7C3AED); color:#fff; box-shadow:none; }
            .week-toggle button:hover:not(.active) { background:var(--bg-surface-hover); color:var(--text-primary); }
            /* Modal Overlay */
            .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(8px) saturate(1.5); -webkit-backdrop-filter:blur(8px) saturate(1.5); animation:modalFadeIn 0.25s ease; }
            @keyframes modalFadeIn { from{opacity:0;} to{opacity:1;} }
            @keyframes modalSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
            .modal { background:var(--bg-panel); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:32px; min-width:440px; max-width:600px; max-height:80vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.05); animation:modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); position:relative; }
            .modal::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#6366F1,#8B5CF6,#A78BFA); border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
            .modal h3 { margin:0 0 8px; font-size:20px; font-weight:800; color:var(--text-primary); letter-spacing:-0.02em; }
            .modal p { margin:0 0 24px; font-size:13px; color:var(--text-secondary); line-height:1.6; }
            .modal label { display:block; font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
            .modal select, .modal input[type='text'], .modal input[type='date'] { width:100%; background:var(--bg-base); color:var(--text-primary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px 14px; font-family:var(--font-ui); font-size:13px; outline:none; margin-bottom:16px; box-sizing:border-box; transition:all 0.2s; }
            .modal select:focus, .modal input:focus { border-color:var(--accent-primary); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
            .modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:24px; padding-top:16px; border-top:1px solid var(--border-subtle); }
            .role-card { padding:16px 18px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); cursor:pointer; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); margin-bottom:8px; position:relative; overflow:hidden; }
            .role-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:transparent; transition:background 0.2s; }
            .role-card:hover { border-color:var(--accent-primary); background:var(--bg-surface-hover); transform:translateX(2px); }
            .role-card:hover::before { background:var(--accent-primary); }
            .role-card.selected { border-color:var(--accent-primary); background:var(--nav-active-bg); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
            .role-card.selected::before { background:linear-gradient(180deg,#6366F1,#8B5CF6); }
            .role-card strong { display:block; font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:4px; }
            .role-card span { font-size:12px; color:var(--text-muted); }
            /* Nav Badge */
            .nav-badge { background:linear-gradient(135deg,var(--accent-primary),#7C3AED); color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:10px; margin-left:auto; line-height:1.4; box-shadow:0 1px 4px rgba(99,102,241,0.3); }
            /* Header Toolbar */
            .header-toolbar { display:flex; gap:6px; align-items:center; }
            .icon-btn { background:transparent; border:1px solid var(--border-subtle); color:var(--text-secondary); padding:7px 10px; border-radius:var(--radius-sm); cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; font-family:var(--font-ui); font-weight:500; transition:all 0.2s; }
            .icon-btn:hover { background:var(--bg-surface-hover); color:var(--text-primary); border-color:var(--accent-primary); box-shadow:0 0 0 3px rgba(99,102,241,0.08); }
            .icon-btn svg { width:14px; height:14px; }
            .role-indicator { display:flex; align-items:center; gap:6px; padding:6px 14px; border:1px solid transparent; border-radius:var(--radius-sm); font-size:12px; font-weight:700; color:#fff; background:linear-gradient(135deg,var(--accent-primary),#7C3AED); cursor:pointer; font-family:var(--font-ui); letter-spacing:0.02em; box-shadow:0 2px 8px rgba(99,102,241,0.3); transition:all 0.2s; }
            .role-indicator:hover { box-shadow:0 4px 16px rgba(99,102,241,0.45); transform:translateY(-1px); }
            /* Comment Input */
            .comment-input { background:var(--bg-base); color:var(--text-primary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:6px 10px; font-family:var(--font-ui); font-size:12px; width:140px; outline:none; transition:all 0.2s; }
            .comment-input:focus { border-color:var(--accent-primary); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
            .comment-input::placeholder { color:var(--text-muted); }
            /* Holiday List Item */
            .holiday-item { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-subtle); transition:background 0.15s; }
            .holiday-item:hover { background:var(--bg-surface-hover); }
            .holiday-item:last-child { border-bottom:none; }
            .holiday-delete { background:var(--accent-danger-bg); border:1px solid rgba(220,38,38,0.15); color:var(--accent-danger); cursor:pointer; font-size:14px; padding:4px 8px; border-radius:var(--radius-sm); transition:all 0.15s; }
            .holiday-delete:hover { background:var(--accent-danger); color:#fff; }
            /* Info strip */
            .info-strip { background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.12); border-radius:var(--radius-sm); padding:10px 14px; font-size:12px; color:var(--text-secondary); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
            .info-strip svg { width:14px; height:14px; color:var(--accent-primary); flex-shrink:0; }
            /* Threshold input */
            .threshold-row { display:flex; gap:12px; align-items:center; margin-bottom:12px; }
            .threshold-row label { min-width:50px; margin-bottom:0; font-weight:700; }
            .threshold-row input[type='number'] { width:80px; background:var(--bg-base); color:var(--text-primary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px; font-family:var(--font-mono); font-size:13px; outline:none; transition:all 0.2s; }
            .threshold-row input[type='number']:focus { border-color:var(--accent-primary); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        </style>
        <div class="kapa-container">
            <div class="bg-gradient"></div>
            <div class="layout">
                <nav class="sidebar">
                    <div class="sidebar-brand">
                        <div class="brand-logo"></div>
                        <h2>KAPA-APP</h2>
                    </div>
                    <ul class="nav-links">
                        <li class="nav-item" data-view="dashboard">${iconDashboard}<span>Dashboard</span></li>
                        <li class="nav-item active" data-view="team">${iconTeam}<span>Team Viewer</span><span class="nav-badge" id="badge-team">20</span></li>
                        <li class="nav-item" data-view="call">${iconCall}<span>KAPA-Call</span><span class="nav-badge" id="badge-call">20</span></li>
                    </ul>
                    <div class="sidebar-footer">
                        <div id="role-display" style="font-size:11px; color:var(--text-muted); margin-bottom:8px; text-align:center;"></div>
                        <button class="theme-toggle-btn" id="theme-toggle">
                            ${iconMoon}
                            <span>Dark Mode</span>
                        </button>
                    </div>
                </nav>
                <main class="main-content">
                    <header class="top-header">
                        <div>
                            <h1 id="page-title">Dashboard Overview</h1>
                            <p class="text-muted" id="page-subtitle">Capacity utilization analytics.</p>
                        </div>
                        <div class="header-toolbar">
                            <div class="week-toggle" id="week-toggle-container" style="display:none;">
                                <button data-weeks="3">3W</button>
                                <button data-weeks="6">6W</button>
                                <button data-weeks="9" class="active">9W</button>
                            </div>
                            <div id="filter-chips-container" class="filter-chips"></div>
                            <button class="icon-btn" id="btn-filter" title="Filter Settings">${iconFilter}</button>
                            <button class="icon-btn" id="btn-filter-reset" title="Reset Filters">${iconFilterReset}</button>
                            <div style="width:1px;height:24px;background:var(--border-subtle);margin:0 4px;"></div>
                            <button class="icon-btn" id="btn-filter-save" title="Save Filter Variant">${iconFilterSave}</button>
                            <button class="icon-btn" id="btn-filter-load" title="Load Filter Variant">${iconFilterLoad}</button>
                            <button class="icon-btn" id="btn-kapa-vision" style="display:none;" title="Kapa Vision"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>Kapa Vision</span></button>
                            <button class="icon-btn" id="btn-save" style="display:none;" title="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg><span>Save</span></button>
                            <button class="icon-btn" id="btn-export" style="display:none;" title="Export"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Export</span></button>
                            <button class="icon-btn" id="btn-settings" title="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
                            <button class="icon-btn" id="btn-calendar" title="Holiday Calendar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>
                            <button class="primary-btn" id="refresh-btn">${iconSync}<span>Sync</span></button>
                            <div class="role-indicator" id="role-indicator" title="Click to change role">Admin</div>
                        </div>
                    </header>
                    <div id="filter-bar-container" class="filter-bar" style="display:none;"></div>
                    <div class="view-container">
                        <div id="main-grid"></div>
                    </div>
                </main>
            </div>
        </div>
    `;

    class KapaDashboard extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: "open"});
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._initialized = false;
            this._currentView = 'team';
            this._currentRole = localStorage.getItem('kapa_current_role') || null;
            this._comments = JSON.parse(localStorage.getItem('kapa_comments') || '{}');
            this._filters = { area: 'All', team: 'All', role: 'All', location: 'All', country: 'All', skill: 'All', name: '', trafficLight: 'All' };
            this._planningWeeks = 9;
            this._startWeek = 10;
        }

        onCustomWidgetAfterUpdate() {
            if (!this._initialized) {
                this.initWidget();
                this._initialized = true;
            }
            setTimeout(() => this.renderView(), 50);
        }

        hasRealData() { return window.KAPAStorage && window.KAPACalculations; }

        getEmployees() {
            if(this.hasRealData()) {
                const emps = window.KAPAStorage.get(window.KAPAStorage.KEYS.EMPLOYEES);
                if(emps && emps.length > 0) return emps;
            }
            return [
                { id: '00001196', firstName: 'Viktor', lastName: 'Adler', area: 'SAP FI/CO', team: 'Team Alpha', role: 'Lead Consultant', location: 'München', country: 'DE', skills: ['SAP S/4HANA', 'SD', 'PP'] },
                { id: '00001197', firstName: 'Nora', lastName: 'Brandt', area: 'SAP FI/CO', team: 'Team Beta', role: 'Lead Consultant', location: 'München', country: 'DE', skills: ['SAP S/4HANA', 'MM'] },
                { id: '00001198', firstName: 'Theo', lastName: 'Conrad', area: 'SAP FI/CO', team: 'Team Alpha', role: 'Senior Consultant', location: 'Hamburg', country: 'DE', skills: ['Ariba', 'Analytics', 'BTP'] },
                { id: '00001199', firstName: 'Ida', lastName: 'Dorn', area: 'SAP SD', team: 'Team Gamma', role: 'Consultant', location: 'Zürich', country: 'CH', skills: ['SuccessFactors', 'HR'] },
                { id: '00001200', firstName: 'Moritz', lastName: 'Ebert', area: 'SAP MM', team: 'Team Gamma', role: 'Lead Consultant', location: 'Mainz', country: 'DE', skills: ['SAP ECC', 'FI/CO', 'Procurement'] },
                { id: '00001201', firstName: 'Frieda', lastName: 'Graf', area: 'SAP FI/CO', team: 'Team Gamma', role: 'Young Professional', location: 'München', country: 'DE', skills: ['SAPUI5', 'Fiori', 'JavaScript'] },
                { id: '00001202', firstName: 'Henrik', lastName: 'Jahn', area: 'SAP PP', team: 'Team Delta', role: 'Senior Consultant', location: 'Düsseldorf', country: 'DE', skills: ['SAP S/4HANA', 'PP', 'PM'] },
                { id: '00001203', firstName: 'Greta', lastName: 'Keller', area: 'SAP CRM', team: 'Team Delta', role: 'Principal', location: 'Wien', country: 'AT', skills: ['Change Management'] },
                { id: '00001204', firstName: 'Adrian', lastName: 'Lorenz', area: 'SAP FI/CO', team: 'Team Beta', role: 'Consultant', location: 'Hamburg', country: 'DE', skills: ['Ariba', 'Procurement'] },
                { id: '00001205', firstName: 'Marlene', lastName: 'Mohr', area: 'SAP FI/CO', team: 'Team Beta', role: 'Lead Consultant', location: 'München', country: 'DE', skills: ['SAP S/4HANA', 'SD'] },
                { id: '00001206', firstName: 'Valentin', lastName: 'Nagel', area: 'SAP FI/CO', team: 'Team Beta', role: 'Senior Consultant', location: 'München', country: 'DE', skills: ['Analytics Cloud', 'Python'] },
                { id: '00001207', firstName: 'Emilia', lastName: 'Pohl', area: 'SAP SD', team: 'Team Epsilon', role: 'Consultant', location: 'Barcelona', country: 'ES', skills: ['Concur', 'Fieldglass', 'Cloud'] },
                { id: '00001208', firstName: 'Julius', lastName: 'Ritter', area: 'SAP FI/CO', team: 'Team Epsilon', role: 'Young Professional', location: 'München', country: 'DE', skills: ['ABAP', 'BTP', 'HANA'] },
                { id: '00001209', firstName: 'Clara', lastName: 'Scholz', area: 'SAP MM', team: 'Team Alpha', role: 'Senior Consultant', location: 'Frankfurt', country: 'DE', skills: ['SAP S/4HANA', 'MM', 'WM'] },
                { id: '00001210', firstName: 'Felix', lastName: 'Tauber', area: 'SAP PP', team: 'Team Delta', role: 'Consultant', location: 'Berlin', country: 'DE', skills: ['SAP ECC', 'PP'] },
                { id: '00001211', firstName: 'Lina', lastName: 'Unger', area: 'SAP FI/CO', team: 'Team Alpha', role: 'Lead Consultant', location: 'Hamburg', country: 'DE', skills: ['SAP S/4HANA', 'FI/CO'] },
                { id: '00001212', firstName: 'Anton', lastName: 'Vogt', area: 'SAP CRM', team: 'Team Epsilon', role: 'Consultant', location: 'Amsterdam', country: 'NL', skills: ['SAP CRM', 'C4C'] },
                { id: '00001213', firstName: 'Mia', lastName: 'Weber', area: 'SAP SD', team: 'Team Gamma', role: 'Senior Consultant', location: 'München', country: 'DE', skills: ['SAP S/4HANA', 'SD', 'LE'] },
                { id: '00001214', firstName: 'Otto', lastName: 'Xander', area: 'SAP FI/CO', team: 'Team Beta', role: 'Consultant', location: 'Wien', country: 'AT', skills: ['SAP S/4HANA', 'FI'] },
                { id: '00001215', firstName: 'Sophie', lastName: 'Ziegler', area: 'SAP MM', team: 'Team Alpha', role: 'Young Professional', location: 'München', country: 'DE', skills: ['SAP S/4HANA', 'MM'] },
            ];
        }

        // ========== ROLE MANAGEMENT ==========
        canEdit() { return this._currentRole === 'admin' || this._currentRole === 'manager'; }
        canAdmin() { return this._currentRole === 'admin'; }

        showRoleDialog() {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <h3>KAPA-App — Select Role</h3>
                    <p>Please select your role to continue. Your permissions will be set accordingly.</p>
                    <div class="role-card" data-role="admin"><strong>Admin</strong><span>Full access: edit data, manage settings, export</span></div>
                    <div class="role-card" data-role="manager"><strong>Manager</strong><span>Edit comments, view settings, export</span></div>
                    <div class="role-card" data-role="viewer"><strong>Viewer</strong><span>Read-only access to all views</span></div>
                    <div class="modal-actions"><button class="primary-btn" id="role-confirm-btn" disabled>Continue</button></div>
                </div>
            `;
            this._shadowRoot.appendChild(overlay);
            let selected = null;
            overlay.querySelectorAll('.role-card').forEach(card => {
                card.addEventListener('click', () => {
                    overlay.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selected = card.getAttribute('data-role');
                    overlay.querySelector('#role-confirm-btn').removeAttribute('disabled');
                });
            });
            overlay.querySelector('#role-confirm-btn').addEventListener('click', () => {
                if(selected) {
                    this._currentRole = selected;
                    localStorage.setItem('kapa_current_role', selected);
                    overlay.remove();
                    this.updateRoleUI();
                    this.renderView();
                }
            });
        }

        updateRoleUI() {
            const label = { admin: 'Admin', manager: 'Manager', viewer: 'Viewer' }[this._currentRole] || 'Unknown';
            const indicator = this._shadowRoot.getElementById('role-indicator');
            if(indicator) indicator.textContent = label;
            const display = this._shadowRoot.getElementById('role-display');
            if(display) display.textContent = `Logged in as ${label}`;
            // Show/hide admin-only buttons
            const settingsBtn = this._shadowRoot.getElementById('btn-settings');
            const calendarBtn = this._shadowRoot.getElementById('btn-calendar');
            if(settingsBtn) settingsBtn.style.display = this.canAdmin() ? 'flex' : 'none';
            if(calendarBtn) calendarBtn.style.display = this.canAdmin() ? 'flex' : 'none';
        }

        // ========== SETTINGS DIALOG ==========
        showSettingsDialog() {
            const settings = this.hasRealData() ? (window.KAPAStorage.get(window.KAPAStorage.KEYS.SETTINGS) || {}) : {};
            const thresholds = settings.thresholds || { '3W': { red: 30, yellow: 51 }, '6W': { red: 30, yellow: 51 }, '9W': { red: 30, yellow: 51 } };
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <h3>Traffic Light Thresholds</h3>
                    <p>Configure the utilization thresholds for traffic light indicators per planning horizon.</p>
                    <div class="info-strip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>Red ≤ threshold → Yellow ≤ threshold → else Green</span></div>
                    ${['3W','6W','9W'].map(k => `
                        <div style="margin-bottom:16px;">
                            <label style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">${k}</label>
                            <div class="threshold-row"><label style="color:var(--accent-danger);">Red ≤</label><input type="number" id="th-${k}-red" value="${thresholds[k].red}" min="0" max="100"></div>
                            <div class="threshold-row"><label style="color:var(--accent-warning);">Yellow ≤</label><input type="number" id="th-${k}-yellow" value="${thresholds[k].yellow}" min="0" max="100"></div>
                        </div>
                    `).join('')}
                    <div class="modal-actions">
                        <button class="secondary-btn" id="settings-cancel">Cancel</button>
                        <button class="primary-btn" id="settings-save">Save</button>
                    </div>
                </div>
            `;
            this._shadowRoot.appendChild(overlay);
            overlay.querySelector('#settings-cancel').addEventListener('click', () => overlay.remove());
            overlay.querySelector('#settings-save').addEventListener('click', () => {
                ['3W','6W','9W'].forEach(k => {
                    thresholds[k].red = parseInt(overlay.querySelector(`#th-${k}-red`).value) || 30;
                    thresholds[k].yellow = parseInt(overlay.querySelector(`#th-${k}-yellow`).value) || 51;
                });
                if(this.hasRealData()) {
                    settings.thresholds = thresholds;
                    window.KAPAStorage.set(window.KAPAStorage.KEYS.SETTINGS, settings);
                }
                overlay.remove();
                this.renderView();
            });
        }

        // ========== HOLIDAY CALENDAR DIALOG ==========
        showHolidayDialog() {
            const hc = window.KAPAHolidayCalendar;
            const countries = hc ? hc.getSupportedCountries() : ['DE','AT','CH','IT','US','NL','BE','ES','MX'];
            const labels = hc ? hc.COUNTRY_LABELS : { DE:'Deutschland', AT:'Österreich', CH:'Schweiz', IT:'Italia', US:'United States', NL:'Nederland', BE:'België', ES:'España', MX:'México' };
            let currentCountry = countries[0];
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            const renderList = () => {
                const holidays = hc ? hc.getCountryHolidays(currentCountry) : [];
                const year = new Date().getFullYear();
                const filtered = holidays.filter(h => h.date.startsWith(String(year)) || h.date.startsWith(String(year+1)));
                let listHtml = filtered.map(h => {
                    const d = new Date(h.date + 'T00:00:00');
                    const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                    const dateStr = days[d.getDay()] + ', ' + String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
                    return `<div class="holiday-item"><div><strong style="color:var(--text-primary); display:block;">${h.name}</strong><span style="font-size:11px; color:var(--text-muted);">${dateStr}</span></div><button class="holiday-delete" data-date="${h.date}">🗑</button></div>`;
                }).join('');
                if(!listHtml) listHtml = '<div style="padding:16px; color:var(--text-muted); text-align:center;">No holidays configured</div>';
                overlay.querySelector('#holiday-list').innerHTML = listHtml;
                overlay.querySelectorAll('.holiday-delete').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if(hc) hc.removeHoliday(currentCountry, btn.getAttribute('data-date'));
                        renderList();
                    });
                });
            };
            overlay.innerHTML = `
                <div class="modal" style="min-width:500px;">
                    <h3>Holiday Calendar Management</h3>
                    <div class="info-strip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>Manage public holidays per country. These are used to calculate the correct working days for utilization.</span></div>
                    <label>Country</label>
                    <select id="holiday-country">${countries.map(c => `<option value="${c}">${c} — ${labels[c] || c}</option>`).join('')}</select>
                    <div id="holiday-list" style="max-height:300px; overflow-y:auto; margin-bottom:16px;"></div>
                    <div style="display:flex; gap:8px; align-items:flex-end;">
                        <input type="date" id="holiday-add-date" style="width:160px; margin-bottom:0;">
                        <input type="text" id="holiday-add-name" placeholder="Holiday name..." style="flex:1; margin-bottom:0;">
                        <button class="primary-btn" id="holiday-add-btn">Add</button>
                    </div>
                    <div class="modal-actions"><button class="secondary-btn" id="holiday-close">Close</button></div>
                </div>
            `;
            this._shadowRoot.appendChild(overlay);
            renderList();
            overlay.querySelector('#holiday-country').addEventListener('change', (e) => { currentCountry = e.target.value; renderList(); });
            overlay.querySelector('#holiday-add-btn').addEventListener('click', () => {
                const date = overlay.querySelector('#holiday-add-date').value;
                const name = overlay.querySelector('#holiday-add-name').value.trim();
                if(!date || !name) return;
                if(hc) hc.addHoliday(currentCountry, date, name);
                overlay.querySelector('#holiday-add-date').value = '';
                overlay.querySelector('#holiday-add-name').value = '';
                renderList();
            });
            overlay.querySelector('#holiday-close').addEventListener('click', () => overlay.remove());
        }

        // ========== EXPORT ==========
        exportCSV() {
            const emps = this.getFilteredEmployees();
            const weeks = this._planningWeeks;
            let csv = 'Area,Team,Employee,ID,Country,Utilization,WorkDays,Role,Skills,Location,FreeCapa,Comments\n';
            emps.forEach(emp => {
                const ai = this.getAmpelInfo(emp);
                const free = this.getFreeCapa(emp);
                const wd = this.getWorkDaysLabel(emp);
                const comment = this._comments[emp.id] || '';
                const skills = (emp.skills || []).join('; ');
                csv += `"${emp.area}","${emp.team}","${emp.lastName}, ${emp.firstName}","${emp.id}","${emp.country}","${ai.utilization}%","${wd}","${emp.role}","${skills}","${emp.location}","${free}","${comment}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `kapa-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
        }

        // ========== INIT ==========
        initWidget() {
            // Check role on load
            if (!this._currentRole) {
                setTimeout(() => this.showRoleDialog(), 200);
            } else {
                this.updateRoleUI();
            }

            // Nav
            const navItems = this._shadowRoot.querySelectorAll(".nav-item");
            navItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    navItems.forEach(n => n.classList.remove("active"));
                    e.currentTarget.classList.add("active");
                    this._currentView = e.currentTarget.getAttribute("data-view");
                    this.renderView();
                });
            });

            // Refresh
            const refreshBtn = this._shadowRoot.getElementById("refresh-btn");
            if(refreshBtn) refreshBtn.addEventListener("click", () => this.renderView());
            
            // Week toggle
            const weekBtns = this._shadowRoot.querySelectorAll(".week-toggle button");
            weekBtns.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    weekBtns.forEach(b => b.classList.remove("active"));
                    e.currentTarget.classList.add("active");
                    this._planningWeeks = parseInt(e.currentTarget.getAttribute("data-weeks"));
                    this.renderView();
                });
            });

            // Theme Toggle
            const themeBtn = this._shadowRoot.getElementById('theme-toggle');
            const savedTheme = localStorage.getItem('kapa_theme');
            if (savedTheme === 'dark') {
                this.classList.add('dark');
                if (themeBtn) themeBtn.innerHTML = iconSun + '<span>Light Mode</span>';
            }
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    const isDark = this.classList.toggle('dark');
                    localStorage.setItem('kapa_theme', isDark ? 'dark' : 'light');
                    themeBtn.innerHTML = isDark ? (iconSun + '<span>Light Mode</span>') : (iconMoon + '<span>Dark Mode</span>');
                });
            }

            // Header buttons
            const roleInd = this._shadowRoot.getElementById('role-indicator');
            if(roleInd) roleInd.addEventListener('click', () => this.showRoleDialog());

            const filterBtn = this._shadowRoot.getElementById('btn-filter');
            if(filterBtn) filterBtn.addEventListener('click', () => this.showFilterDialog());

            const filterResetBtn = this._shadowRoot.getElementById('btn-filter-reset');
            if(filterResetBtn) filterResetBtn.addEventListener('click', () => {
                this._filters = { area:'All', team:'All', role:'All', location:'All', country:'All', skill:'All', name:'', trafficLight:'All' };
                this.renderView();
                this.showToast('Filters reset.');
            });

            const filterSaveBtn = this._shadowRoot.getElementById('btn-filter-save');
            if(filterSaveBtn) filterSaveBtn.addEventListener('click', () => this.showSaveVariantDialog());

            const filterLoadBtn = this._shadowRoot.getElementById('btn-filter-load');
            if(filterLoadBtn) filterLoadBtn.addEventListener('click', () => this.showLoadVariantDialog());

            const settingsBtn = this._shadowRoot.getElementById('btn-settings');
            if(settingsBtn) settingsBtn.addEventListener('click', () => this.showSettingsDialog());

            const calendarBtn = this._shadowRoot.getElementById('btn-calendar');
            if(calendarBtn) calendarBtn.addEventListener('click', () => this.showHolidayDialog());

            const saveBtn = this._shadowRoot.getElementById('btn-save');
            if(saveBtn) saveBtn.addEventListener('click', () => {
                localStorage.setItem('kapa_comments', JSON.stringify(this._comments));
                this.showToast('Comments saved successfully');
            });

            const exportBtn = this._shadowRoot.getElementById('btn-export');
            if(exportBtn) exportBtn.addEventListener('click', () => this.exportCSV());

            const kapaVisionBtn = this._shadowRoot.getElementById('btn-kapa-vision');
            if(kapaVisionBtn) kapaVisionBtn.addEventListener('click', () => this.showToast('Kapa Vision — Feature coming soon'));

            // Update badge counts
            this.updateBadges();

            // Load external CSS
            fetch('KapaDashboard.css').then(r => r.text()).then(css => {
                const style = document.createElement('style');
                style.textContent = css;
                this._shadowRoot.prepend(style);
            }).catch(() => {});
        }

        showToast(msg) {
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-panel);color:var(--text-primary);border:1px solid var(--border-subtle);padding:10px 20px;border-radius:var(--radius-md);font-size:13px;font-family:var(--font-ui);z-index:2000;box-shadow:var(--shadow-pop);animation:fadeUp 0.3s ease;';
            toast.textContent = msg;
            this._shadowRoot.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        updateBadges() {
            const count = this.getEmployees().length;
            const b1 = this._shadowRoot.getElementById('badge-team');
            const b2 = this._shadowRoot.getElementById('badge-call');
            if(b1) b1.textContent = count;
            if(b2) b2.textContent = count;
        }

        // ========== FILTER BAR ==========
        buildFilterBar() {
            const container = this._shadowRoot.getElementById('filter-bar-container');
            const employees = this.getEmployees();
            const unique = (key) => ['All', ...new Set(employees.map(e => e[key]).filter(Boolean))].sort();
            let allSkills = ['All'];
            employees.forEach(e => { if(e.skills) e.skills.forEach(s => { if(!allSkills.includes(s)) allSkills.push(s); }); });
            allSkills.sort();

            const sel = (id, label, opts, val) => `<div class="filter-group"><label>${label}</label><select id="filter-${id}">${opts.map(o => `<option value="${o}" ${o===val?'selected':''}>${o}</option>`).join('')}</select></div>`;

            container.innerHTML = `
                ${sel('area','Area',unique('area'),this._filters.area)}
                ${sel('team','Team',unique('team'),this._filters.team)}
                ${sel('role','Role',unique('role'),this._filters.role)}
                ${sel('location','Location',unique('location'),this._filters.location)}
                ${sel('country','Country',unique('country'),this._filters.country)}
                ${sel('skill','Skill',allSkills,this._filters.skill)}
                ${sel('trafficLight','Traffic Light',['All','green','yellow','red'],this._filters.trafficLight)}
                <div class="filter-group"><label>Name</label><input type="text" id="filter-name" placeholder="Search..." value="${this._filters.name}"></div>
                <div style="display:flex;align-items:flex-end;padding-bottom:2px;"><button class="secondary-btn" id="filter-reset-btn">Reset</button></div>
            `;

            ['area','team','role','location','country','skill','trafficLight'].forEach(id => {
                const el = this._shadowRoot.getElementById(`filter-${id}`);
                if(el) el.addEventListener('change', (e) => { this._filters[id] = e.target.value; this.renderView(); });
            });
            const ni = this._shadowRoot.getElementById('filter-name');
            if(ni) ni.addEventListener('input', (e) => { this._filters.name = e.target.value.toLowerCase(); this.renderView(); });
            const rb = this._shadowRoot.getElementById('filter-reset-btn');
            if(rb) rb.addEventListener('click', () => { this._filters = { area:'All', team:'All', role:'All', location:'All', country:'All', skill:'All', name:'', trafficLight:'All' }; this.renderView(); });
        }

        getFilteredEmployees() {
            let emps = this.getEmployees();
            const f = this._filters;
            if(f.area !== 'All') emps = emps.filter(e => e.area === f.area);
            if(f.team !== 'All') emps = emps.filter(e => e.team === f.team);
            if(f.role !== 'All') emps = emps.filter(e => e.role === f.role);
            if(f.location !== 'All') emps = emps.filter(e => e.location === f.location);
            if(f.country !== 'All') emps = emps.filter(e => e.country === f.country);
            if(f.skill !== 'All') emps = emps.filter(e => e.skills && e.skills.includes(f.skill));
            if(f.name) emps = emps.filter(e => (e.firstName+' '+e.lastName+' '+e.id).toLowerCase().includes(f.name));
            if(f.trafficLight !== 'All') {
                emps = emps.filter(e => {
                    if(!this.hasRealData()) return true;
                    const st = window.KAPACalculations.calculateAmpelStatus(e.id, this._planningWeeks).status;
                    return st === f.trafficLight;
                });
            }
            return emps;
        }

        // ========== WORKING DAYS HELPERS ==========
        _getWorkingDaysInfo(emp) {
            const weeks = this._planningWeeks;
            const startWeek = this._startWeek;
            const country = emp.country || 'DE';
            let totalWeekdays = weeks * 5;
            let holidays = 0;

            // Try using real holiday calendar
            if (typeof window.KAPAHolidayCalendar !== 'undefined') {
                try {
                    holidays = window.KAPAHolidayCalendar.getHolidaysInWeekRange(
                        country, startWeek, weeks, new Date().getFullYear()
                    ) || 0;
                } catch(e) { holidays = 0; }
            }
            // Fallback: estimate holidays based on country for the selected period
            if (holidays === 0) {
                const holidaysPerCountry = { DE: 3, AT: 3, CH: 2, ES: 2, NL: 2 };
                const yearlyHolidays = holidaysPerCountry[country] || 2;
                // Scale to the planning period (approx: yearlyHolidays per 9 weeks = ~1/6 of year)
                holidays = Math.round(yearlyHolidays * (weeks / 9));
            }

            const workingDays = Math.max(totalWeekdays - holidays, 0);
            return { workingDays, holidays, weekdays: totalWeekdays };
        }

        // Deterministic pseudo-random utilization per employee (consistent across renders)
        _getMockUtilization(empId) {
            let hash = 0;
            for (let i = 0; i < empId.length; i++) {
                hash = ((hash << 5) - hash) + empId.charCodeAt(i);
                hash |= 0;
            }
            // Generate utilization between 25% and 95%
            const normalized = (Math.abs(hash) % 700) / 10; // 0.0 to 70.0
            return Math.round((25 + normalized) * 10) / 10;
        }

        getAmpelInfo(emp) {
            if(this.hasRealData()) return window.KAPACalculations.calculateAmpelStatus(emp.id, this._planningWeeks);
            
            const utilization = this._getMockUtilization(emp.id);
            const thresholds = { red: 30, yellow: 51 };
            let status, text;
            if (utilization <= thresholds.red) { status = 'red'; text = 'Low'; }
            else if (utilization <= thresholds.yellow) { status = 'yellow'; text = 'Medium'; }
            else { status = 'green'; text = 'High'; }
            return { utilization, status, text };
        }

        getFreeCapa(emp) {
            if(this.hasRealData()) return window.KAPACalculations.getFreeCapacityForWeeks(emp.id, this._planningWeeks);
            
            const wd = this._getWorkingDaysInfo(emp);
            const utilization = this._getMockUtilization(emp.id);
            const bookedDays = (utilization / 100) * wd.workingDays;
            return Math.max(0, Math.round((wd.workingDays - bookedDays) * 10) / 10);
        }

        getWorkDaysLabel(emp) {
            if(this.hasRealData() && window.KAPACalculations.getEmployeeWorkingDays) {
                const wd = window.KAPACalculations.getEmployeeWorkingDays(emp.id, this._planningWeeks);
                return `${wd.workingDays}d (${wd.holidays}h)`;
            }
            const wd = this._getWorkingDaysInfo(emp);
            return `${wd.workingDays}d (${wd.holidays}h)`;
        }

        // ========== RENDER VIEW ==========
        renderView() {
            const grid = this._shadowRoot.getElementById('main-grid');
            const pageTitle = this._shadowRoot.getElementById('page-title');
            const pageSub = this._shadowRoot.getElementById('page-subtitle');
            const filterBar = this._shadowRoot.getElementById('filter-bar-container');
            const weekToggle = this._shadowRoot.getElementById('week-toggle-container');
            const kapaV = this._shadowRoot.getElementById('btn-kapa-vision');
            const saveB = this._shadowRoot.getElementById('btn-save');
            const exportB = this._shadowRoot.getElementById('btn-export');
            if(!grid) return;

            const showActions = this._currentView === 'team' || this._currentView === 'call';
            if(kapaV) kapaV.style.display = showActions ? 'flex' : 'none';
            if(saveB) saveB.style.display = (showActions && this.canEdit()) ? 'flex' : 'none';
            if(exportB) exportB.style.display = (showActions && this.canEdit()) ? 'flex' : 'none';

            if (this._currentView === 'dashboard') {
                pageTitle.textContent = "Dashboard Overview";
                pageSub.textContent = "High-level capacity utilization analytics.";
                grid.className = "bento-grid";
                filterBar.style.display = "none";
                weekToggle.style.display = "none";
                this.renderDashboard(grid);
            } else if (this._currentView === 'team') {
                pageTitle.textContent = "Team Viewer";
                pageSub.textContent = "Capacity Planning (Week by Week).";
                grid.className = "";
                filterBar.style.display = "flex";
                weekToggle.style.display = "flex";
                this.buildFilterBar();
                this.renderTeamData(grid);
            } else if (this._currentView === 'call') {
                pageTitle.textContent = "KAPA-Call Table";
                pageSub.textContent = "Detailed global capacity database.";
                grid.className = "";
                filterBar.style.display = "flex";
                weekToggle.style.display = "flex";
                this.buildFilterBar();
                this.renderCallData(grid);
            }
        }

        // ========== DASHBOARD ==========
        renderDashboard(grid) {
            const emps = this.getEmployees();
            let utilSummary = { '2M': 0, 'YTD': 0, '12M': 0 };
            if(this.hasRealData()) {
                utilSummary = window.KAPACalculations.getUtilizationSummary();
            } else {
                utilSummary = { '2M': '72.4', 'YTD': '68.1', '12M': '71.8' };
            }
            // Aggregations
            let areaAgg = [], regionAgg = [], skillAgg = [];
            if(this.hasRealData()) {
                areaAgg = window.KAPACalculations.aggregateByArea();
                regionAgg = window.KAPACalculations.aggregateByRegion();
                skillAgg = window.KAPACalculations.aggregateBySkills();
            } else {
                const areas = {}; const regions = {};
                emps.forEach(e => {
                    areas[e.area] = (areas[e.area]||0)+1;
                    regions[e.location] = (regions[e.location]||0)+1;
                });
                areaAgg = Object.entries(areas).map(([n,c]) => ({name:n,count:c,freeDays:0}));
                regionAgg = Object.entries(regions).map(([n,c]) => ({name:n,count:c,freeDays:0}));
                const sk = {};
                emps.forEach(e => { if(e.skills) e.skills.forEach(s => { sk[s]=(sk[s]||0)+1; }); });
                skillAgg = Object.entries(sk).sort((a,b) => b[1]-a[1]).slice(0,10).map(([n,c]) => ({name:n,count:c,freeDays:0}));
            }

            const getColor = (val) => {
                const v = parseFloat(val);
                if (v >= 75) return 'success';
                if (v >= 50) return 'warning';
                return 'danger';
            };

            const card = (title, value, icon, delay) => {
                const col = getColor(value);
                const barColors = { success:'#16A34A,#34D399', warning:'#D97706,#FBBF24', danger:'#DC2626,#F87171' };
                return `<div class="bento-cell col-span-1 animate-in delay-${delay}" style="padding:0;overflow:hidden;">
                    <div style="height:3px;background:linear-gradient(90deg,${barColors[col]});"></div>
                    <div style="padding:20px 24px;">
                        <div class="kpi-title">${icon} ${title}</div>
                        <div class="kpi-val" style="color:var(--accent-${col})">${value}%</div>
                        <div style="margin-top:12px;">
                            <div class="progress-container" style="width:100%;">
                                <div class="progress-bar ${col}" style="width:${Math.min(parseFloat(value),100)}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            };

            const empCard = () => `<div class="bento-cell col-span-1 animate-in delay-3" style="padding:0;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,#6366F1,#A78BFA);"></div>
                <div style="padding:20px 24px;">
                    <div class="kpi-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg> Total Employees</div>
                    <div class="kpi-val">${emps.length}</div>
                    <div class="kpi-trend" style="margin-top:8px;"><span style="color:var(--accent-primary);font-family:var(--font-mono);font-size:11px;">Active resources</span></div>
                </div>
            </div>`;

            const aggCard = (title, items, delay, icon) => {
                const rows = items.slice(0,6).map((i,idx) => {
                    const pct = items.length > 0 ? Math.round((i.count / emps.length)*100) : 0;
                    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12px;transition:background 0.15s;">
                        <span style="color:var(--text-muted);font-family:var(--font-mono);font-size:10px;width:16px;text-align:right;">${idx+1}.</span>
                        <span style="color:var(--text-primary);flex:1;font-weight:500;">${i.name}</span>
                        <span style="background:var(--bg-surface-hover);padding:2px 8px;border-radius:4px;font-family:var(--font-mono);color:var(--text-secondary);font-size:11px;font-weight:600;">${i.count}</span>
                    </div>`;
                }).join('');
                return `<div class="bento-cell col-span-1 animate-in delay-${delay}" style="padding:0;overflow:hidden;">
                    <div style="height:3px;background:linear-gradient(90deg,#6366F1,#8B5CF6);opacity:0.5;"></div>
                    <div style="padding:20px 24px;display:flex;flex-direction:column;height:100%;">
                        <div class="kpi-title">${icon} ${title}</div>
                        <div style="flex:1;overflow-y:auto;">${rows || '<span style="color:var(--text-muted)">No data</span>'}</div>
                    </div>
                </div>`;
            };

            const iconArea = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>';
            const iconRegion = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
            const iconSkills = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
            const iconChart = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

            grid.innerHTML = `
                ${card('UTIL 2M', utilSummary['2M'], iconChart, 1)}
                ${card('UTIL YTD', utilSummary['YTD'], iconChart, 2)}
                ${card('UTIL 12M', utilSummary['12M'], iconChart, 3)}
                ${empCard()}
                ${aggCard('KAPA-Call by Area', areaAgg, 1, iconArea)}
                ${aggCard('KAPA-Call by Region', regionAgg, 2, iconRegion)}
                ${aggCard('KAPA-Call by Skills', skillAgg, 3, iconSkills)}
                <div class="bento-cell col-span-1 animate-in delay-3" style="padding:0;overflow:hidden;">
                    <div style="height:3px;background:linear-gradient(90deg,#6366F1,#A78BFA);opacity:0.5;"></div>
                    <div style="padding:20px 24px;">
                        <div class="kpi-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Planning Horizon</div>
                        <div class="kpi-val">${this._planningWeeks}W</div>
                        <div class="kpi-trend" style="margin-top:8px;"><span style="color:var(--accent-primary);font-family:var(--font-mono);font-size:11px;">Start: Week ${this._startWeek}</span></div>
                    </div>
                </div>
            `;
        }

        // ========== TEAM VIEWER ==========
        renderTeamData(grid) {
            const employees = this.getFilteredEmployees();
            const weeks = this._planningWeeks;
            const startWeek = this._startWeek;

            const getBadge = (util, status) => `<span class="status-badge ${status}">${util}%</span>`;

            const getWeekHtml = (emp, w) => {
                if (this.hasRealData()) {
                    const weekData = window.KAPACalculations.getWeekData(emp.id, w);
                    if (!weekData || weekData.length === 0) return '<span style="color:var(--text-muted);font-family:var(--font-mono);font-size:12px;">—</span>';
                    return weekData.map(cp => {
                        const proj = window.KAPAStorage.getProjectById(cp.projectId);
                        const pn = proj ? proj.name : 'Internal';
                        const col = cp.days > 5 ? 'var(--accent-danger)' : 'var(--text-primary)';
                        return `<div class="cell-detail" style="margin-bottom:6px;"><span style="color:${col};font-weight:500;font-size:11px;white-space:normal;line-height:1.3;">${pn}</span><span class="cell-subtitle monospaced">${cp.days}d</span></div>`;
                    }).join('');
                }
                return '<span style="color:var(--text-muted);font-family:var(--font-mono);font-size:12px;">—</span>';
            };

            let headers = '';
            for(let i=0;i<weeks;i++) headers += `<th>W${startWeek+i}</th>`;

            let html = `<div class="premium-table-container animate-in delay-1">
                <div style="padding:16px 20px;font-weight:600;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
                    <span>Capacity Planning (${employees.length} Employees)</span>
                </div>
                <table class="premium-table"><thead><tr>
                    <th style="width:30px;"><input type="checkbox"></th>
                    <th>Employee</th><th>Country</th><th>${weeks}W Util</th>${headers}
                </tr></thead><tbody>`;

            employees.forEach(emp => {
                const ai = this.getAmpelInfo(emp);
                let cells = '';
                for(let i=0;i<weeks;i++) cells += `<td style="vertical-align:top;min-width:120px;">${getWeekHtml(emp,startWeek+i)}</td>`;
                html += `<tr>
                    <td style="vertical-align:middle;"><input type="checkbox"></td>
                    <td style="vertical-align:top;"><div class="cell-detail"><span style="font-weight:500;color:var(--text-primary);">${emp.lastName}, ${emp.firstName}</span><span class="cell-subtitle">${emp.team}</span></div></td>
                    <td style="vertical-align:top;">${emp.country}</td>
                    <td style="vertical-align:top;">${getBadge(ai.utilization, ai.status)}</td>
                    ${cells}
                </tr>`;
            });
            html += `</tbody></table></div>`;
            grid.innerHTML = html;
        }

        // ========== KAPA-CALL ==========
        renderCallData(grid) {
            const employees = this.getFilteredEmployees();
            const canEdit = this.canEdit();

            let html = `<div class="premium-table-container animate-in delay-1">
                <div style="padding:16px 20px;font-weight:600;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
                    <span>Free Capacity Overview (${employees.length} Employees)</span>
                </div>
                <table class="premium-table"><thead><tr>
                    <th style="width:30px;"><input type="checkbox"></th>
                    <th>Area</th><th>Team</th><th>Employee</th><th>Name</th><th>Coun.</th>
                    <th>Utilization</th><th>Work Days</th><th>Role</th><th>Skills</th><th>Location</th><th>Free Capa</th><th>Comments</th>
                </tr></thead><tbody>`;

            employees.forEach(emp => {
                const ai = this.getAmpelInfo(emp);
                const free = this.getFreeCapa(emp);
                const wd = this.getWorkDaysLabel(emp);
                const freeText = free <= 0 ? 'Fully Allocated' : `${free} Days`;
                const freeClass = free <= 0 ? 'color:var(--text-muted)' : 'color:var(--accent-success);font-weight:600';
                const comment = this._comments[emp.id] || '';
                const commentCell = canEdit
                    ? `<input class="comment-input" type="text" placeholder="Enter comment..." value="${comment}" data-emp-id="${emp.id}">`
                    : `<span style="font-size:12px;color:var(--text-muted);">${comment || '—'}</span>`;

                html += `<tr>
                    <td><input type="checkbox"></td>
                    <td>${emp.area}</td>
                    <td>${emp.team}</td>
                    <td class="monospaced">${emp.id}</td>
                    <td><span style="font-weight:500;color:var(--text-primary);">${emp.lastName}, ${emp.firstName}</span></td>
                    <td>${emp.country}</td>
                    <td><span class="status-badge ${ai.status}">${ai.utilization}%</span></td>
                    <td class="monospaced">${wd}</td>
                    <td>${emp.role}</td>
                    <td><span class="status-badge blue" style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${emp.skills ? emp.skills.join(', ') : 'None'}</span></td>
                    <td>${emp.location}</td>
                    <td style="${freeClass}">${freeText}</td>
                    <td>${commentCell}</td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            grid.innerHTML = html;

            // Bind comment inputs
            if(canEdit) {
                grid.querySelectorAll('.comment-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        this._comments[e.target.getAttribute('data-emp-id')] = e.target.value;
                    });
                });
            }
        }
    }

    customElements.define("kapa-dashboard", KapaDashboard);
})();
