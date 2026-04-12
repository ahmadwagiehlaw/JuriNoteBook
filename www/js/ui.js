/* ============================================
   JuriNotebook — UI Rendering Module
   ============================================ */

const LexiUI = (() => {

  // ── SVG Icons ──
  const Icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    pin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    unlock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    bookmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    scale: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22V8"/><path d="M20 7l-8 5-8-5"/><circle cx="12" cy="8" r="2"/></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    share: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
    cloudOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    palette: `<svg style="width:24px;height:24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 1.6-1.3 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8z"/></svg>`,
    database: `<svg style="width:24px;height:24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  };

  const DEFAULT_CATEGORIES = [
    'مبدأ قانوني', 'حكم محكمة', 'نص تشريعي',
    'فتوى', 'رأي فقهي', 'تعليق', 'ملاحظة'
  ];

  function getAllCategories(customCategories) {
    if (customCategories && customCategories.length > 0) {
      return [...DEFAULT_CATEGORIES, ...customCategories];
    }
    return [...DEFAULT_CATEGORIES];
  }

  const DEFAULT_SPECIALIZATIONS = [
    { id: 'جنائي', label: 'جنائي', icon: '⚖️' },
    { id: 'مدني', label: 'مدني', icon: '📜' },
    { id: 'إداري', label: 'إداري', icon: '🏛️' },
    { id: 'تجاري', label: 'تجاري', icon: '💼' },
    { id: 'عمالي', label: 'عمالي', icon: '👷' },
    { id: 'أسرة', label: 'أسرة', icon: '👨‍👩‍👧' },
    { id: 'اقتصادي', label: 'اقتصادي', icon: '📊' }
  ];

  // Merge built-in + custom specs
  function getAllSpecs(customSpecs) {
    const merged = [...DEFAULT_SPECIALIZATIONS];
    if (customSpecs && customSpecs.length > 0) {
      customSpecs.forEach(cs => {
        const existing = merged.find(s => s.id === cs.id);
        if (existing) {
          existing.label = cs.label;
          if (cs.icon) existing.icon = cs.icon;
        } else {
          merged.push(cs);
        }
      });
    }
    return merged;
  }

  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ═══════ TOAST ═══════
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const iconSvg = type === 'success' ? Icons.check : type === 'error' ? Icons.x : Icons.bookmark;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  }

  // ═══════ CLIPBOARD ═══════
  async function copyToClipboard(text, btnElement) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    if (btnElement) {
      btnElement.classList.add('copied');
      setTimeout(() => btnElement.classList.remove('copied'), 1500);
    }
    return true;
  }

  // ═══════ SIDEBAR ═══════
  function renderSidebar(activeSpec, activeView, noteCounts, user, enabledSpecs, userName, customSpecs, activeCategory, customCategories, workplace, isAdmin = false) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const SPECIALIZATIONS = getAllSpecs(customSpecs);
    // Filter specs: only show enabled ones (default: all enabled)
    const visibleSpecs = enabledSpecs && enabledSpecs.length > 0
      ? SPECIALIZATIONS.filter(s => enabledSpecs.includes(s.id))
      : SPECIALIZATIONS;

    const userSection = user ? `
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          ${user.photoURL ? `<img src="${user.photoURL}" alt="">` : (user.displayName || 'م').charAt(0)}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${escapeHtml(user.displayName || 'مستخدم')}</div>
          <div class="sidebar-user-email">${escapeHtml(user.email || '')}</div>
        </div>
      </div>
    ` : '';

    // Personalized title (Gold Badge)
    const titleSection = userName ? `
      <div class="sidebar-welcome-badge">
        <div class="sidebar-welcome-name">المستشار ${escapeHtml(userName)}</div>
        ${workplace ? `<div class="sidebar-welcome-workplace">${escapeHtml(workplace)}</div>` : ''}
      </div>
    ` : '';

    // Category tabs
    const CATEGORIES = getAllCategories(customCategories);
    const categoryTabs = `
      <div class="sidebar-categories">
        <div class="context-switcher-label">تصفية حسب النوع</div>
        <div class="category-tabs">
          <button class="category-tab ${!activeCategory ? 'active' : ''}" onclick="LexiApp.setCategoryFilter('')">
            الكل
          </button>
          ${CATEGORIES.map(cat => `
            <button class="category-tab ${activeCategory === cat ? 'active' : ''}" onclick="LexiApp.setCategoryFilter('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    return `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="icons/icon-192.png" alt="JuriNotebook">
          <div>
            <h1>مفكرة القاضي</h1>
            <div class="subtitle">JuriNotebook</div>
          </div>
        </div>
        ${titleSection}
      </div>
      ${userSection}

      <div class="context-switcher">
        <div class="context-switcher-label">التخصص القضائي</div>
        <div class="spec-chips">
          ${visibleSpecs.map(spec => `
            <button class="spec-chip ${activeSpec === spec.id ? 'active' : ''}"
                    data-spec="${spec.id}" onclick="LexiApp.setSpecialization('${escapeHtml(spec.id)}')">
              <span class="chip-dot"></span>
              ${spec.label}
            </button>
          `).join('')}
        </div>
      </div>

      ${categoryTabs}

      <nav class="sidebar-nav">
        <button class="nav-item ${activeView === 'home' ? 'active' : ''}" onclick="LexiApp.navigate('home')">
          ${Icons.home}
          <span>المبادئ والملاحظات</span>
          <span class="nav-badge">${noteCounts.total || 0}</span>
        </button>
        <button class="nav-item ${activeView === 'add' ? 'active' : ''}" onclick="LexiApp.navigate('add')">
          ${Icons.plus}
          <span>إضافة مبدأ جديد</span>
        </button>
        ${user ? `
        <button class="nav-item" onclick="LexiApp.showShareModal()">
          ${Icons.share}
          <span>مشاركة المجموعة</span>
        </button>
        ` : ''}
        <button class="nav-item ${activeView === 'settings' ? 'active' : ''}" onclick="LexiApp.navigate('settings')">
          ${Icons.settings}
          <span>الإعدادات</span>
        </button>
        ${isAdmin ? `
        <button class="nav-item ${activeView === 'admin' ? 'active' : ''}" onclick="LexiApp.navigate('admin')">
          ${Icons.shield}
          <span>لوحة الإدارة</span>
        </button>
        ` : ''}
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" onclick="LexiApp.exportData()">
          ${Icons.download}
          <span>تصدير البيانات</span>
        </button>
        ${user ? `
          <button class="nav-item" onclick="LexiApp.handleSignOut()">
            ${Icons.logout}
            <span>تسجيل الخروج</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  // ═══════ HOME PAGE ═══════
  function renderHomePage(notes, activeSpec, stats, isReadOnly, activeCategory) {
    let filteredNotes = activeSpec === 'الكل' ? notes : notes.filter(n => n.specialization === activeSpec);
    if (activeCategory) filteredNotes = filteredNotes.filter(n => n.category === activeCategory);
    const sortedNotes = filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    return `
      <div class="header-bar">
        <div>
          <h2>${isReadOnly ? '📖 مجموعة مشتركة' : 'المبادئ والملاحظات'}</h2>
          <div class="header-subtitle">
            ${activeSpec !== 'الكل' ? `تخصص: ${activeSpec}` : 'جميع التخصصات'}
            ${activeCategory ? ` — ${activeCategory}` : ''}
            — ${sortedNotes.length} مبدأ
          </div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle" onclick="LexiApp.showAboutModal()" title="حول التطبيق">ℹ️</button>
          <button class="theme-toggle" onclick="LexiApp.toggleTheme()" title="تبديل المظهر">
            ${isDark ? '☀️' : '🌙'}
          </button>
          <button class="hamburger" onclick="LexiApp.toggleSidebar()">
            ${Icons.menu}
          </button>
          ${!isReadOnly ? `
          <button class="btn btn-primary" onclick="LexiApp.navigate('add')">
            ${Icons.plus}
            <span>إضافة</span>
          </button>
          ` : ''}
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card glass-card">
          <div class="stat-value">${stats.total || 0}</div>
          <div class="stat-label">إجمالي المبادئ</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">${stats.specCount || 0}</div>
          <div class="stat-label">في ${activeSpec !== 'الكل' ? activeSpec : 'الكل'}</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">${stats.todayCount || 0}</div>
          <div class="stat-label">أُضيفت اليوم</div>
        </div>
      </div>

      <div class="search-bar">
        <input type="text" id="search-input" placeholder="بحث في المبادئ والنصوص..."
               oninput="LexiApp.onSearch(this.value)">
        <div class="search-icon">${Icons.search}</div>
      </div>

      <div id="notes-list">
        ${sortedNotes.length === 0 ? renderEmptyState(isReadOnly) : sortedNotes.map(n => renderNoteCard(n, isReadOnly)).join('')}
      </div>
    `;
  }

  function renderNoteCard(note, isReadOnly) {
    return `
      <div class="note-card" data-spec="${note.specialization}" data-id="${note.id}">
        <div class="note-card-header">
          <div class="flex gap-sm" style="flex-wrap:wrap">
            <span class="note-category">${note.category || 'غير مصنف'}</span>
            ${note.subCategory ? `<span class="note-sub-category">${note.subCategory}</span>` : ''}
          </div>
          <span class="note-date">${formatDate(note.createdAt)}</span>
        </div>
        ${note.principle ? `<div class="note-principle">${escapeHtml(note.principle)}</div>` : ''}
        ${note.fullText ? `<div class="note-body">${escapeHtml(note.fullText)}</div>` : ''}
        ${note.citation ? `<div class="note-citation">${Icons.bookmark}<span>${escapeHtml(note.citation)}</span></div>` : ''}
        <div class="quick-copy-toolbar">
          <button class="copy-btn" onclick="LexiApp.copyBody(${note.id}, this)" title="نسخ النص">
            ${Icons.copy}<span>نص</span>
          </button>
          <button class="copy-btn" onclick="LexiApp.copyCitation(${note.id}, this)" title="نسخ المرجع">
            ${Icons.pin}<span>مرجع</span>
          </button>
          <button class="copy-btn" onclick="LexiApp.copyFormatted(${note.id}, this)" title="نسخ منسق">
            ${Icons.file}<span>منسق</span>
          </button>
          ${!isReadOnly ? `
          <div class="note-actions">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="LexiApp.editNote(${note.id})" title="تعديل">${Icons.edit}</button>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="LexiApp.confirmDeleteNote(${note.id})" title="حذف">${Icons.trash}</button>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderEmptyState(isReadOnly) {
    return `
      <div class="empty-state">
        ${Icons.scale}
        <h3>${isReadOnly ? 'لا توجد مبادئ في هذه المجموعة' : 'لا توجد مبادئ بعد'}</h3>
        <p>${isReadOnly ? 'هذه المجموعة فارغة حالياً' : 'ابدأ بإضافة أول مبدأ قانوني أو ملاحظة قضائية'}</p>
        ${!isReadOnly ? `
          <button class="btn btn-primary mt-lg" onclick="LexiApp.navigate('add')">
            ${Icons.plus}<span>إضافة مبدأ جديد</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  // ═══════ ADD / EDIT FORM ═══════
  function renderAddPage(activeSpec, stickyFields, editNote, customCategories) {
    const isEdit = !!editNote;
    const note = editNote || {};
    const lawRef = stickyFields.lawReference || note.lawReference || '';
    const isLocked = stickyFields.lawReferenceLocked || false;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const CATEGORIES = getAllCategories(customCategories);

    return `
      <div class="header-bar">
        <div>
          <h2>${isEdit ? 'تعديل المبدأ' : 'إضافة مبدأ جديد'}</h2>
          <div class="header-subtitle">التخصص: ${activeSpec}</div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle" onclick="LexiApp.showAboutModal()" title="حول التطبيق">ℹ️</button>
          <button class="theme-toggle" onclick="LexiApp.toggleTheme()">
            ${isDark ? '☀️' : '🌙'}
          </button>
          <button class="hamburger" onclick="LexiApp.toggleSidebar()">${Icons.menu}</button>
          <button class="btn btn-ghost" onclick="LexiApp.navigate('home')">رجوع</button>
        </div>
      </div>

      <div class="glass-card" style="max-width: 720px;">
        <form id="note-form" onsubmit="LexiApp.saveNote(event)">
          ${isEdit ? `<input type="hidden" name="noteId" value="${note.id}">` : ''}

          <div class="form-section">
            <div class="form-section-title">${Icons.bookmark}<span>التصنيف</span></div>
            <div class="form-group">
              <label class="form-label">التصنيف الرئيسي</label>
              <select class="form-select" name="category" required>
                <option value="">— اختر التصنيف —</option>
                ${CATEGORIES.map(cat => `<option value="${escapeHtml(cat)}" ${note.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="position:relative">
              <label class="form-label">
                <span>التصنيف الفرعي</span>
                <span class="label-badge">اختياري — مع اقتراحات</span>
              </label>
              <input class="form-input" type="text" name="subCategory"
                     placeholder="مثال: أحوال شخصية، جرائم مالية..."
                     value="${escapeHtml(note.subCategory || '')}"
                     autocomplete="off"
                     oninput="LexiApp.onSubCategoryInput(this.value)"
                     onfocus="LexiApp.onSubCategoryInput(this.value)">
              <div class="suggest-dropdown" id="sub-suggest"></div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">${Icons.file}<span>المحتوى</span></div>
            <div class="form-group">
              <label class="form-label">المبدأ القانوني / العنوان</label>
              <input class="form-input" type="text" name="principle"
                     placeholder="صياغة مختصرة للمبدأ أو القاعدة القانونية"
                     value="${escapeHtml(note.principle || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">النص الكامل</label>
              <textarea class="form-textarea" name="fullText"
                        placeholder="النص الكامل للحكم أو المبدأ أو الملاحظة..."
                        rows="6">${escapeHtml(note.fullText || '')}</textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">${Icons.pin}<span>المرجع والتوثيق</span></div>
            <div class="form-group">
              <label class="form-label">المرجع / رقم القضية / التاريخ</label>
              <input class="form-input" type="text" name="citation"
                     placeholder="مثال: طعن رقم 1234 لسنة 90 ق — جلسة 2024/03/15"
                     value="${escapeHtml(note.citation || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">
                <span>مرجع القانون</span>
                <button type="button" class="sticky-toggle ${isLocked ? 'active' : ''}"
                        onclick="LexiApp.toggleStickyField('lawReference')" id="sticky-law-btn">
                  ${isLocked ? Icons.lock : Icons.unlock}
                  <span>${isLocked ? 'مثبَّت' : 'تثبيت'}</span>
                </button>
              </label>
              <input class="form-input" type="text" name="lawReference" id="law-reference-input"
                     placeholder="مثال: القانون المدني — المادة 178"
                     value="${escapeHtml(lawRef)}">
            </div>
          </div>

          <div class="flex gap-sm mt-lg">
            <button type="submit" class="btn btn-primary" style="flex:1">
              ${Icons.save}<span>${isEdit ? 'حفظ التعديلات' : 'حفظ المبدأ'}</span>
            </button>
            ${isEdit ? `<button type="button" class="btn btn-ghost" onclick="LexiApp.navigate('home')">إلغاء</button>` : ''}
          </div>
        </form>
      </div>
    `;
  }

  // ═══════ SETTINGS ═══════
  function renderSettingsPage(activeTab = 'general', preferences, subSpecialties, user, enabledSpecs, userName, customSpecs, customCategories, workplace) {
    const activeSpec = preferences.activeSpecialization || 'مدني';
    
    return `
      <div class="header-bar">
        <h2>الإعدادات</h2>
        <button class="hamburger" onclick="LexiApp.toggleSidebar()">${Icons.menu}</button>
      </div>

      <div class="settings-tabs glass-card">
        <button class="tab-btn ${activeTab === 'general' ? 'active' : ''}" onclick="LexiApp.setSettingsTab('general')">
          ${Icons.user} <span>عام</span>
        </button>
        <button class="tab-btn ${activeTab === 'categories' ? 'active' : ''}" onclick="LexiApp.setSettingsTab('categories')">
          ${Icons.bookmark} <span>التصنيفات</span>
        </button>
        <button class="tab-btn ${activeTab === 'display' ? 'active' : ''}" onclick="LexiApp.setSettingsTab('display')">
          ${Icons.palette} <span>المظهر</span>
        </button>
        <button class="tab-btn ${activeTab === 'data' ? 'active' : ''}" onclick="LexiApp.setSettingsTab('data')">
          ${Icons.database} <span>البيانات</span>
        </button>
        <button class="tab-btn ${activeTab === 'security' ? 'active' : ''}" onclick="LexiApp.setSettingsTab('security')">
          ${Icons.lock} <span>الأمان</span>
        </button>
      </div>

      <div class="settings-content">
        ${renderActiveSettingsTab(activeTab, {activeSpec, preferences, subSpecialties, user, enabledSpecs, userName, customSpecs, customCategories, workplace})}
      </div>
    `;
  }

  function renderActiveSettingsTab(tab, data) {
    const SPECIALIZATIONS = getAllSpecs(data.customSpecs);
    const CATEGORIES = getAllCategories(data.customCategories);
    const allEnabled = !data.enabledSpecs || data.enabledSpecs.length === 0;

    switch(tab) {
      case 'general':
        return `
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.user}<span>الملف الشخصي</span></div>
            <p class="text-muted" style="font-size:0.82rem;margin-bottom:var(--space-md)">يظهر اسمك في الشريط الجانبي كتخصيص شخصي</p>
            <div class="form-group mb-md">
              <label>الاسم / اللقب</label>
              <input type="text" class="input form-input" id="settings-username" value="${escapeHtml(data.userName || '')}" placeholder="مثال: أحمد وجيه محمد">
            </div>
            <div class="form-group">
              <label>جهة العمل / المحكمة</label>
              <div class="flex gap-sm">
                <input type="text" class="input form-input" id="settings-workplace" value="${escapeHtml(data.workplace || '')}" placeholder="مثال: محكمة النقض">
                <button class="btn btn-primary btn-sm" onclick="LexiApp.saveProfile()">${Icons.save}<span>حفظ</span></button>
              </div>
            </div>
          </div>

          <!-- Default Specialization -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.scale}<span>التخصص الافتراضي</span></div>
            <div class="spec-chips">
              ${SPECIALIZATIONS.map(spec => `
                <button class="spec-chip ${data.activeSpec === spec.id ? 'active' : ''}" data-spec="${spec.id}" onclick="LexiApp.setDefaultSpecialization('${escapeHtml(spec.id)}')">
                  <span class="chip-dot"></span>${spec.label}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- About App (IP Attribution) -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">ℹ️<span>حول التطبيق</span></div>
            <p class="text-muted mb-md" style="font-size:0.85rem">معلومات التطبيق، حقوق الملكية الفكرية، والتواصل مع المطور</p>
            <button class="btn btn-ghost" onclick="LexiApp.showAboutModal()">ℹ️<span>عرض بيانات التطبيق والملكية الفكرية</span></button>
          </div>
        `;
      case 'categories':
        return `
          <!-- Specializations Management -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.scale}<span>إدارة التخصصات</span></div>
            <p class="text-muted" style="font-size:0.82rem;margin-bottom:var(--space-md)">اختر التخصصات المعروضة، أو أضف تخصصات جديدة</p>
            <div class="spec-toggle-list mb-md">
              ${SPECIALIZATIONS.map(spec => {
                const isEnabled = allEnabled || data.enabledSpecs.includes(spec.id);
                const isCustom = data.customSpecs && data.customSpecs.some(cs => cs.id === spec.id);
                return `
                <div class="spec-toggle-row">
                  <label class="spec-toggle-item" data-spec="${spec.id}">
                    <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="LexiApp.toggleSpecEnabled('${escapeHtml(spec.id)}', this.checked)">
                    <span class="spec-toggle-dot" style="background:var(--chip-color)"></span>
                    <span class="spec-toggle-label">${spec.icon} ${spec.label}</span>
                  </label>
                  ${isCustom ? `
                    <button class="btn-icon-mini btn-edit-mini" onclick="LexiApp.editCustomSpec('${escapeHtml(spec.id)}')" title="تعديل">✏️</button>
                    <button class="btn-icon-mini" onclick="LexiApp.deleteCustomSpec('${escapeHtml(spec.id)}')" title="حذف">×</button>
                  ` : ''}
                </div>`;
              }).join('')}
            </div>
            <div class="flex gap-sm">
              <input class="form-input" type="text" id="new-spec-name" placeholder="التخصص الجديد..." style="flex:1">
              <input class="form-input" type="text" id="new-spec-icon" placeholder="أيقونة" style="width:60px;text-align:center">
              <button class="btn btn-primary btn-sm" onclick="LexiApp.addCustomSpec()">${Icons.plus}<span>إضافة</span></button>
            </div>
          </div>

          <!-- Custom Categories -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.bookmark}<span>التصنيفات الرئيسية</span></div>
            <div class="spec-toggle-list mb-md" style="max-height: 200px; overflow-y: auto;">
              ${CATEGORIES.map(cat => {
                const isCustom = data.customCategories && data.customCategories.includes(cat);
                return `
                <div class="spec-toggle-row">
                  <label class="spec-toggle-item" style="padding:4px 8px;cursor:default;">
                    <span class="spec-toggle-dot" style="background:var(--accent-blue)"></span>
                    <span class="spec-toggle-label" style="margin-right:8px">${escapeHtml(cat)}</span>
                  </label>
                  ${isCustom ? `
                    <button class="btn-icon-mini btn-edit-mini" onclick="LexiApp.editCustomCategory('${escapeHtml(cat)}')" title="تعديل">✏️</button>
                    <button class="btn-icon-mini" onclick="LexiApp.deleteCustomCategory('${escapeHtml(cat)}')" title="حذف">×</button>
                  ` : ''}
                </div>`;
              }).join('')}
            </div>
            <div class="flex gap-sm">
              <input class="form-input" type="text" id="new-category-name" placeholder="التصنيف الجديد..." style="flex:1">
              <button class="btn btn-primary btn-sm" onclick="LexiApp.addCustomCategory()">${Icons.plus}<span>إضافة</span></button>
            </div>
          </div>

          <!-- Sub-Specialties -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.bookmark}<span>التصنيفات الفرعية</span></div>
            ${SPECIALIZATIONS.map(spec => {
              const subs = data.subSpecialties.filter(s => s.specialization === spec.id);
              if (subs.length === 0) return '';
              return `
                <div class="settings-item mb-md" style="flex-direction:column;align-items:stretch;gap:8px">
                  <h4 style="font-size:0.85rem;color:var(--text-secondary)">${spec.icon} ${spec.label}</h4>
                  <div class="flex gap-sm" style="flex-wrap:wrap">
                    ${subs.map(sub => `
                      <span class="note-sub-category" style="display:inline-flex;align-items:center;gap:4px">
                        ${escapeHtml(sub.name)}
                        <button onclick="LexiApp.deleteSubSpecialty(${sub.id})" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;padding:0;font-size:0.9rem">×</button>
                      </span>
                    `).join('')}
                  </div>
                </div>`;
            }).join('')}
            ${data.subSpecialties.length === 0 ? `<p class="text-muted" style="font-size:0.82rem;text-align:center;">لم تُضف تصنيفات فرعية بعد</p>` : ''}
          </div>
          
          <!-- About App (IP Attribution) -->
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">ℹ️<span>حول التطبيق</span></div>
            <p class="text-muted mb-md" style="font-size:0.85rem">معلومات التطبيق، حقوق الملكية الفكرية، والتواصل مع المطور</p>
            <button class="btn btn-ghost" onclick="LexiApp.showAboutModal()">ℹ️<span>عرض بيانات التطبيق والملكية الفكرية</span></button>
          </div>
        `;
      case 'display':
        return `
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.palette}<span>تخصيص المظهر</span></div>
            <div class="flex justify-between items-center">
              <span>الوضع الليلي</span>
              <button class="btn btn-ghost" onclick="LexiApp.toggleTheme()">
                ${document.documentElement.getAttribute('data-theme') === 'light' ? 'تفعيل' : 'إيقاف'}
              </button>
            </div>
          </div>
        `;
      case 'data':
        return `
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.download}<span>إدارة البيانات</span></div>
            <div class="flex gap-sm" style="flex-wrap:wrap">
              <button class="btn btn-primary" onclick="LexiApp.exportData()">${Icons.download}<span>تصدير نسخة</span></button>
              <button class="btn btn-ghost" onclick="document.getElementById('import-file').click()">${Icons.upload}<span>استيراد</span></button>
              <input type="file" id="import-file" style="display:none" onchange="LexiApp.importData(this)">
            </div>
          </div>
          
          ${data.user ? `
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.cloud}<span>المزامنة السحابية</span></div>
            <p class="text-muted mb-md" style="font-size:0.85rem">بياناتك متزامنة مع السحابة عبر حسابك</p>
            <div class="flex gap-sm" style="flex-wrap:wrap">
              <button class="btn btn-ghost" onclick="LexiApp.syncToCloud()">${Icons.upload}<span>رفع للسحابة</span></button>
              <button class="btn btn-ghost" onclick="LexiApp.syncFromCloud()">${Icons.download}<span>تنزيل من السحابة</span></button>
            </div>
          </div>
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.share}<span>مشاركة المدونة</span></div>
            <p class="text-muted mb-md" style="font-size:0.85rem">شارك مدونتك القضائية مع فريق العمل عبر رابط</p>
            <button class="btn btn-ghost" onclick="LexiApp.showShareModal()">${Icons.share}<span>إنشاء رابط مشاركة</span></button>
          </div>
          ` : `
          <div class="glass-card mb-md p-md">
            <div class="settings-group-title">${Icons.cloudOff}<span>الوضع المحلي</span></div>
            <p class="text-muted mb-md" style="font-size:0.85rem">أنت تعمل بدون حساب. سجل الدخول لتفعيل المزامنة والمشاركة.</p>
            <button class="btn btn-primary" onclick="LexiApp.goToLogin()">تسجيل الدخول</button>
          </div>
          `}
        `;
      case 'security':
        return `
          ${data.user ? `
          <div class="glass-card mb-md p-md" style="border: 1px solid var(--accent-red)">
            <div class="settings-group-title" style="color:var(--accent-red)">${Icons.lock}<span>الأمان والخصوصية</span></div>
            <p class="text-muted mb-md">يمكنك هنا مسح جميع بياناتك المرفوعة على السحابة وإغلاق حسابك.</p>
            <button class="btn btn-ghost" style="color:var(--accent-red); justify-content: flex-start" onclick="LexiApp.promptDeleteAccount()">
              ${Icons.trash}<span>حذف الحساب نهائياً</span>
            </button>
          </div>
          ` : `
          <div class="glass-card mb-md p-md">
            <p class="text-muted" style="text-align:center;">إعدادات الأمان متاحة فقط بعد تسجيل الدخول.</p>
          </div>
          `}
        `;
    }
  }

  // ═══════ ABOUT MODAL ═══════
  function renderAboutModal() {
    return `
      <div class="modal-header">
        <h3 class="modal-title">ℹ️ حول التطبيق</h3>
        <button class="btn-icon-mini" onclick="LexiApp.closeModal()">×</button>
      </div>
      <div class="modal-body" style="text-align:center; padding: var(--space-xl) var(--space-md);">
        <img src="icons/icon-192.png" alt="JuriNotebook Logo" style="width: 80px; height: 80px; margin-bottom: var(--space-md); border-radius: 20px;">
        <h2 style="color:var(--accent-gold); margin-bottom: var(--space-sm);">مفكرة القاضي — JuriNotebook</h2>
        <p class="text-muted" style="margin-bottom: var(--space-lg);">تطبيق ذكي لإدارة المبادئ القانونية والسوابق القضائية<br>الإصدار 1.0.0</p>
        
        <div style="background: rgba(30, 32, 44, 0.5); padding: var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--border-glass); margin-bottom: var(--space-lg);">
          <strong style="font-size: 1.1rem; color: var(--text-primary);">© المستشار / أحمد وجيه محمد</strong><br>
          <span style="color: var(--text-secondary); font-size: 0.9rem;">جميع حقوق الملكية الفكرية محفوظة</span>
        </div>

        <div style="display:flex; flex-direction:column; gap: var(--space-sm); align-items:center;">
          <a href="https://wa.me/201201102216" target="_blank" class="btn btn-ghost" style="width: 100%; max-width: 300px; display:flex; justify-content:center;">
            📱 التواصل عبر واتساب
          </a>
          <a href="mailto:ahmed.wagieh@live.com" target="_blank" class="btn btn-ghost" style="width: 100%; max-width: 300px; display:flex; justify-content:center;">
            📧 إرسال بريد إلكتروني
          </a>
        </div>
      </div>
    `;
  }

  // ═══════ MODALS ═══════
  function renderDeleteModal(noteId) {
    return `
      <div class="modal-header">
        <h3>تأكيد الحذف</h3>
        <button class="modal-close" onclick="LexiApp.closeModal()">${Icons.x}</button>
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:var(--space-lg)">
        هل أنت متأكد من حذف هذا المبدأ؟ لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div class="flex gap-sm">
        <button class="btn btn-primary" style="background:var(--accent-red);flex:1;box-shadow:none"
                onclick="LexiApp.deleteNote(${noteId})">
          ${Icons.trash}<span>حذف</span>
        </button>
        <button class="btn btn-ghost" onclick="LexiApp.closeModal()">إلغاء</button>
      </div>
    `;
  }

  function renderShareModal(shareLink) {
    return `
      <div class="modal-header">
        <h3>مشاركة المجموعة</h3>
        <button class="modal-close" onclick="LexiApp.closeModal()">${Icons.x}</button>
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:var(--space-md)">
        شارك مبادئك القانونية مع الآخرين. أي شخص لديه الرابط يمكنه الاطلاع على مجموعتك.
      </p>
      <div class="share-qr-container">
        <canvas id="share-qr-canvas"></canvas>
      </div>
      <div class="share-link-box">
        <input type="text" value="${shareLink}" id="share-link-input" readonly>
        <button class="btn btn-primary btn-sm" onclick="LexiApp.copyShareLink()">
          ${Icons.copy}<span>نسخ</span>
        </button>
      </div>
    `;
  }

  // ═══════ SHARED VIEW ═══════
  function renderSharedView(profile, notes) {
    return `
      <div style="max-width:800px;margin:0 auto;padding:var(--space-lg)">
        <div class="glass-card mb-md" style="text-align:center">
          <h2 style="font-family:var(--font-display)">📖 مجموعة مشتركة</h2>
          <p style="color:var(--text-secondary);margin-top:var(--space-sm)">
            بواسطة: <strong>${escapeHtml(profile.displayName || 'مستخدم')}</strong>
          </p>
          <p style="font-size:0.78rem;color:var(--text-tertiary);margin-top:var(--space-xs)">
            ${notes.length} مبدأ قانوني
          </p>
        </div>
        <div>
          ${notes.map(n => renderNoteCard(n, true)).join('')}
        </div>
        <div style="text-align:center;margin-top:var(--space-xl)">
          <p style="font-size:0.75rem;color:var(--text-tertiary)">
            © المستشار/ أحمد وجيه محمد — JuriNotebook
          </p>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══════ ADMIN DASHBOARD ═══════
  function renderAdminDashboard(users) {
    const totalUsers = users.length;
    const publicUsers = users.filter(u => u.isPublic).length;

    return `
      <div class="header-bar">
        <div>
          <h2>لوحة تحكم المشرف</h2>
          <div class="header-subtitle">إدارة النظام والمستخدمين</div>
        </div>
        <div class="header-actions">
          <button class="hamburger" onclick="LexiApp.toggleSidebar()">${Icons.menu}</button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card glass-card">
          <div class="stat-value">${totalUsers}</div>
          <div class="stat-label">إجمالي المستخدمين</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">${publicUsers}</div>
          <div class="stat-label">حسابات المشاركة العامة</div>
        </div>
        <div class="stat-card glass-card" style="border-bottom: 3px solid var(--accent-red)">
          <div class="stat-value" style="color: var(--accent-red)">${Icons.shield}</div>
          <div class="stat-label">صلاحيات المشرف العام</div>
        </div>
      </div>

      <div class="glass-card mt-md">
        <div class="settings-group" style="margin-bottom:0">
          <div class="settings-group-title">${Icons.user}<span>قائمة المستخدمين المسجلين</span></div>
          <div style="overflow-x: auto; margin-top: 15px;">
            <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.9rem;">
              <thead>
                <tr style="background: var(--bg-hover); border-bottom: 1px solid var(--border);">
                  <th style="padding: 12px 10px;">المستخدم</th>
                  <th style="padding: 12px 10px;">البريد الإلكتروني</th>
                  <th style="padding: 12px 10px;">آخر نشاط</th>
                  <th style="padding: 12px 10px;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 10px;">
                      <strong>${escapeHtml(u.displayName || 'غير محدد')}</strong><br>
                      <span style="font-size:0.8rem;color:var(--text-tertiary)">${u.isPublic ? 'عام 🟢' : 'خاص 🔴'}</span>
                    </td>
                    <td style="padding: 10px;" dir="ltr">${u.email || 'غير محدد'}</td>
                    <td style="padding: 10px;" dir="ltr">${u.updatedAt ? u.updatedAt.toLocaleDateString() : '—'}</td>
                    <td style="padding: 10px;">
                      <div class="flex gap-sm">
                        <button class="btn btn-ghost btn-sm" onclick="LexiUI.copyToClipboard('${u.email}', this)" title="نسخ البريد">
                          ${Icons.copy}
                        </button>
                        <button class="btn btn-ghost btn-sm" style="color:var(--accent-red)" onclick="LexiApp.deleteUserByAdmin('${u.uid}')" title="مسح بيانات المستخدم">
                          ${Icons.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return {
    Icons, DEFAULT_CATEGORIES, getAllCategories, DEFAULT_SPECIALIZATIONS, getAllSpecs,
    showToast, copyToClipboard,
    renderSidebar, renderHomePage, renderNoteCard, renderAddPage,
    renderSettingsPage, renderAboutModal, renderDeleteModal, renderShareModal, renderSharedView,
    renderAdminDashboard, formatDate, escapeHtml
  };
})();
