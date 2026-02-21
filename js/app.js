/* ============================================
   JuriNotebook — Main Application Controller
   ============================================ */

const LexiApp = (() => {

    // ── State ──
    let state = {
        currentView: 'home',
        activeSpecialization: 'مدني',
        notes: [],
        subSpecialties: [],
        stickyFields: { lawReference: '', lawReferenceLocked: false },
        editingNote: null,
        searchQuery: '',
        searchTimeout: null,
        user: null,
        isOfflineMode: false,
        isSharedView: false,
        sharedUid: null,
        enabledSpecs: [], // empty = all shown
        userName: '',
        customSpecs: [], // user-added specializations
        activeCategory: '', // category filter (empty = all)
        customCategories: [], // user-added categories
        workplace: '' // court/workplace
    };

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ══════════════════════════════════════
    //   INITIALIZATION
    // ══════════════════════════════════════

    async function init() {
        try {
            await LexiDB.init();

            // Load theme
            const savedTheme = await LexiDB.getPreference('theme');
            if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

            // Load preferences
            const savedSpec = await LexiDB.getPreference('activeSpecialization');
            if (savedSpec) state.activeSpecialization = savedSpec;

            const savedSticky = await LexiDB.getPreference('stickyFields');
            if (savedSticky) state.stickyFields = savedSticky;

            // Load enabled specializations
            const savedEnabledSpecs = await LexiDB.getPreference('enabledSpecs');
            if (savedEnabledSpecs) state.enabledSpecs = savedEnabledSpecs;

            // Load user name
            const savedUserName = await LexiDB.getPreference('userName');
            if (savedUserName) state.userName = savedUserName;

            // Load custom specializations
            const savedCustomSpecs = await LexiDB.getPreference('customSpecs');
            if (savedCustomSpecs) state.customSpecs = savedCustomSpecs;

            // Load custom categories
            const savedCustomCategories = await LexiDB.getPreference('customCategories');
            if (savedCustomCategories) state.customCategories = savedCustomCategories;

            // Load workplace
            const savedWorkplace = await LexiDB.getPreference('workplace');
            if (savedWorkplace) state.workplace = savedWorkplace;

            // Check for shared view URL
            if (checkSharedRoute()) return;

            // Initialize Firebase
            const firebaseReady = FirebaseService.init();

            if (firebaseReady) {
                FirebaseService.onAuthStateChanged(async (user) => {
                    state.user = user;
                    if (user) {
                        hideAuthScreen();
                        await FirebaseService.saveUserProfile();
                        // Auto-sync from cloud on login
                        try {
                            const cloudNotes = await FirebaseService.syncNotesFromCloud();
                            if (cloudNotes && cloudNotes.length > 0) {
                                // Merge: cloud notes take priority
                                state.notes = cloudNotes;
                            } else {
                                await refreshData();
                            }
                        } catch (e) {
                            console.warn('Cloud sync failed, using local data:', e.message);
                            await refreshData();
                        }
                        render();
                    } else {
                        // Show auth screen
                        showAuthScreen();
                    }
                });
            } else {
                // No Firebase — offline mode
                state.isOfflineMode = true;
                showAuthScreen();
            }

            // Global event listeners
            document.addEventListener('click', (e) => {
                const suggest = $('#sub-suggest');
                if (suggest && !e.target.closest('.form-group')) suggest.classList.remove('show');
                if (e.target.classList.contains('sidebar-overlay')) toggleSidebar(false);
            });

            registerSW();
        } catch (err) {
            console.error('JuriNotebook init error:', err);
        }
    }

    async function registerSW() {
        if ('serviceWorker' in navigator) {
            try { await navigator.serviceWorker.register('./sw.js'); } catch (e) { /* skip */ }
        }
    }

    // ══════════════════════════════════════
    //   SHARED ROUTE CHECK
    // ══════════════════════════════════════

    function checkSharedRoute() {
        const hash = window.location.hash;
        const match = hash.match(/#\/shared\/(.+)/);
        if (match) {
            const uid = match[1];
            state.isSharedView = true;
            state.sharedUid = uid;
            loadSharedView(uid);
            return true;
        }
        return false;
    }

    async function loadSharedView(uid) {
        // Initialize Firebase if needed
        FirebaseService.init();

        const authScreen = $('#auth-screen');
        const appWrapper = $('#app-wrapper');
        if (authScreen) authScreen.classList.add('hidden');
        if (appWrapper) { appWrapper.classList.remove('hidden'); }

        // Hide bottom nav and FAB for shared view
        const bottomNav = $('#bottom-nav');
        const fab = $('#fab');
        if (bottomNav) bottomNav.style.display = 'none';
        if (fab) fab.style.display = 'none';

        const mainContent = $('#main-content');
        const sidebar = $('#sidebar');
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) {
            mainContent.style.marginRight = '0';
            mainContent.innerHTML = `<div class="empty-state"><p>جاري التحميل...</p></div>`;
        }

        try {
            const data = await FirebaseService.getSharedNotes(uid);
            if (!data) {
                mainContent.innerHTML = `<div class="empty-state"><h3>المجموعة غير متاحة</h3><p>هذه المجموعة خاصة أو غير موجودة</p></div>`;
                return;
            }
            state.notes = data.notes;
            mainContent.innerHTML = LexiUI.renderSharedView(data.profile, data.notes);
        } catch (e) {
            console.error('Shared view error:', e);
            mainContent.innerHTML = `<div class="empty-state"><h3>حدث خطأ</h3><p>تعذر تحميل المجموعة المشتركة</p></div>`;
        }
    }

    // ══════════════════════════════════════
    //   AUTH
    // ══════════════════════════════════════

    function showAuthScreen() {
        const authScreen = $('#auth-screen');
        const appWrapper = $('#app-wrapper');
        if (authScreen) authScreen.classList.remove('hidden');
        if (appWrapper) appWrapper.classList.add('hidden');
    }

    function hideAuthScreen() {
        const authScreen = $('#auth-screen');
        const appWrapper = $('#app-wrapper');
        if (authScreen) authScreen.classList.add('hidden');
        if (appWrapper) appWrapper.classList.remove('hidden');
    }

    async function signInWithGoogle() {
        try {
            await FirebaseService.signInWithGoogle();
            LexiUI.showToast('تم تسجيل الدخول بنجاح', 'success');
        } catch (err) {
            console.error('Google sign-in error:', err);
            LexiUI.showToast('فشل تسجيل الدخول: ' + (err.message || ''), 'error');
        }
    }

    async function handleEmailLogin(event) {
        event.preventDefault();
        const email = $('#auth-email').value;
        const password = $('#auth-password').value;
        try {
            await FirebaseService.signInWithEmail(email, password);
            LexiUI.showToast('تم تسجيل الدخول بنجاح', 'success');
        } catch (err) {
            const msg = err.code === 'auth/user-not-found' ? 'الحساب غير موجود' :
                err.code === 'auth/wrong-password' ? 'كلمة المرور خاطئة' :
                    err.code === 'auth/invalid-email' ? 'البريد الإلكتروني غير صالح' :
                        'فشل تسجيل الدخول';
            LexiUI.showToast(msg, 'error');
        }
    }

    async function handleEmailRegister(event) {
        event.preventDefault();
        const name = $('#reg-name').value;
        const email = $('#reg-email').value;
        const password = $('#reg-password').value;
        try {
            await FirebaseService.registerWithEmail(email, password, name);
            LexiUI.showToast('تم إنشاء الحساب بنجاح', 'success');
        } catch (err) {
            const msg = err.code === 'auth/email-already-in-use' ? 'البريد مستخدم بالفعل' :
                err.code === 'auth/weak-password' ? 'كلمة المرور ضعيفة' :
                    'فشل إنشاء الحساب';
            LexiUI.showToast(msg, 'error');
        }
    }

    function showRegister() {
        $('#auth-login-form').classList.add('hidden');
        $('#auth-register-form').classList.remove('hidden');
    }

    function showLogin() {
        $('#auth-register-form').classList.add('hidden');
        $('#auth-login-form').classList.remove('hidden');
    }

    async function skipAuth() {
        state.isOfflineMode = true;
        state.user = null;
        hideAuthScreen();
        await refreshData();
        render();
    }

    async function handleSignOut() {
        try {
            await FirebaseService.signOut();
            state.user = null;
            state.notes = [];
            LexiUI.showToast('تم تسجيل الخروج', 'success');
            showAuthScreen();
        } catch (err) {
            LexiUI.showToast('خطأ أثناء تسجيل الخروج', 'error');
        }
    }

    function goToLogin() {
        showAuthScreen();
    }

    // ══════════════════════════════════════
    //   THEME
    // ══════════════════════════════════════

    async function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }

    async function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        await LexiDB.setPreference('theme', theme);

        // Update theme-color meta
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#0a0e27' : '#f4f1ec';

        render();
    }

    // ══════════════════════════════════════
    //   DATA
    // ══════════════════════════════════════

    async function refreshData() {
        state.notes = await LexiDB.getAllNotes();
        state.subSpecialties = await LexiDB.getSubSpecialties();
    }

    function getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const spec = state.activeSpecialization;
        const specNotes = state.notes.filter(n => n.specialization === spec);
        const todayNotes = state.notes.filter(n => new Date(n.createdAt) >= today);
        return { total: state.notes.length, specCount: specNotes.length, todayCount: todayNotes.length };
    }

    async function getNoteCounts() {
        return { total: state.notes.length };
    }

    // ══════════════════════════════════════
    //   RENDERING
    // ══════════════════════════════════════

    async function render() {
        if (state.isSharedView) return;

        const sidebar = $('#sidebar');
        const mainContent = $('#main-content');
        const noteCounts = await getNoteCounts();

        sidebar.innerHTML = LexiUI.renderSidebar(
            state.activeSpecialization, state.currentView, noteCounts, state.user,
            state.enabledSpecs, state.userName, state.customSpecs, state.activeCategory,
            state.customCategories, state.workplace
        );

        let html = '';
        switch (state.currentView) {
            case 'home':
                const notesToShow = state.searchQuery ? await LexiDB.searchNotes(state.searchQuery) : state.notes;
                html = LexiUI.renderHomePage(notesToShow, state.activeSpecialization, getStats(), false, state.activeCategory);
                break;
            case 'add':
                html = LexiUI.renderAddPage(state.activeSpecialization, state.stickyFields, state.editingNote, state.customCategories);
                break;
            case 'settings':
                html = LexiUI.renderSettingsPage(
                    { activeSpecialization: state.activeSpecialization },
                    state.subSpecialties,
                    state.user,
                    state.enabledSpecs,
                    state.userName,
                    state.customSpecs,
                    state.customCategories,
                    state.workplace
                );
                break;
        }
        mainContent.innerHTML = html;

        // Update bottom nav active state
        $$('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === state.currentView);
        });

        // Hide FAB on add page
        const fab = $('#fab');
        if (fab) fab.style.display = state.currentView === 'add' ? 'none' : '';
    }

    // ══════════════════════════════════════
    //   NAVIGATION
    // ══════════════════════════════════════

    function navigate(view) {
        state.currentView = view;
        state.searchQuery = '';
        if (view !== 'add') state.editingNote = null;
        toggleSidebar(false);
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ══════════════════════════════════════
    //   SPECIALIZATION
    // ══════════════════════════════════════

    async function setSpecialization(spec) {
        state.activeSpecialization = spec;
        await LexiDB.setPreference('activeSpecialization', spec);
        render();
    }

    async function setDefaultSpecialization(spec) {
        state.activeSpecialization = spec;
        await LexiDB.setPreference('activeSpecialization', spec);
        LexiUI.showToast(`التخصص الافتراضي: ${spec}`, 'success');
        render();
    }

    // ══════════════════════════════════════
    //   SIDEBAR
    // ══════════════════════════════════════

    function toggleSidebar(force) {
        const sidebar = $('#sidebar');
        const overlay = $('#sidebar-overlay');
        const isOpen = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', isOpen);
        overlay.classList.toggle('show', isOpen);
    }

    // ══════════════════════════════════════
    //   NOTES CRUD
    // ══════════════════════════════════════

    async function saveNote(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const noteData = {
            specialization: state.activeSpecialization,
            category: formData.get('category'),
            subCategory: formData.get('subCategory') || '',
            principle: formData.get('principle'),
            fullText: formData.get('fullText') || '',
            citation: formData.get('citation') || '',
            lawReference: formData.get('lawReference') || ''
        };

        try {
            const noteId = formData.get('noteId');
            if (noteId) {
                await LexiDB.updateNote(Number(noteId), noteData);
                // Sync to cloud
                const updated = await LexiDB.getNote(Number(noteId));
                if (state.user && updated) {
                    FirebaseService.saveNoteToCloud(updated).catch(() => { });
                }
                LexiUI.showToast('تم تحديث المبدأ بنجاح', 'success');
            } else {
                const id = await LexiDB.addNote(noteData);
                // Sync to cloud
                const saved = await LexiDB.getNote(id);
                if (state.user && saved) {
                    FirebaseService.saveNoteToCloud(saved).catch(() => { });
                }
                LexiUI.showToast('تم حفظ المبدأ بنجاح', 'success');
            }

            if (state.stickyFields.lawReferenceLocked) {
                state.stickyFields.lawReference = noteData.lawReference;
                await LexiDB.setPreference('stickyFields', state.stickyFields);
            }

            await refreshData();
            state.editingNote = null;
            navigate('home');
        } catch (err) {
            console.error('Save error:', err);
            LexiUI.showToast('حدث خطأ أثناء الحفظ', 'error');
        }
    }

    async function editNote(id) {
        const note = state.notes.find(n => n.id === id) || await LexiDB.getNote(id);
        if (!note) return;
        state.editingNote = note;
        navigate('add');
    }

    function closeModal() {
        const overlay = $('#modal-overlay');
        overlay.classList.remove('show'); // Changed from 'active' to 'show' to match existing
        setTimeout(() => { $('#modal-content').innerHTML = ''; }, 300);
    }

    function showAboutModal() {
        const modal = $('#modal-content');
        const overlay = $('#modal-overlay');
        modal.innerHTML = LexiUI.renderAboutModal();
        overlay.classList.add('show'); // Changed from 'active' to 'show' to match existing
    }

    function confirmDeleteNote(id) {
        const overlay = $('#modal-overlay');
        const modal = $('#modal-content');
        modal.innerHTML = LexiUI.renderDeleteModal(id);
        overlay.classList.add('show');
    }

    async function deleteNote(id) {
        try {
            await LexiDB.deleteNote(id);
            if (state.user) FirebaseService.deleteNoteFromCloud(id).catch(() => { });
            LexiUI.showToast('تم الحذف بنجاح', 'success');
            closeModal();
            await refreshData();
            render();
        } catch (err) {
            LexiUI.showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }

    // ══════════════════════════════════════
    //   QUICK COPY
    // ══════════════════════════════════════

    async function copyBody(id, btnEl) {
        const note = state.notes.find(n => n.id == id);
        if (!note) return;
        await LexiUI.copyToClipboard(note.fullText || note.principle || '', btnEl);
        LexiUI.showToast('تم نسخ النص', 'success');
    }

    async function copyCitation(id, btnEl) {
        const note = state.notes.find(n => n.id == id);
        if (!note || !note.citation) { LexiUI.showToast('لا يوجد مرجع', 'info'); return; }
        await LexiUI.copyToClipboard(note.citation, btnEl);
        LexiUI.showToast('تم نسخ المرجع', 'success');
    }

    async function copyFormatted(id, btnEl) {
        const note = state.notes.find(n => n.id == id);
        if (!note) return;
        let parts = [];
        if (note.principle) parts.push(note.principle);
        if (note.fullText) parts.push(note.fullText);
        if (note.citation) parts.push(`— ${note.citation}`);
        await LexiUI.copyToClipboard(parts.join('\n\n'), btnEl);
        LexiUI.showToast('تم نسخ النص المنسق', 'success');
    }

    // ══════════════════════════════════════
    //   STICKY FIELDS
    // ══════════════════════════════════════

    async function toggleStickyField(fieldName) {
        if (fieldName === 'lawReference') {
            state.stickyFields.lawReferenceLocked = !state.stickyFields.lawReferenceLocked;
            if (state.stickyFields.lawReferenceLocked) {
                const input = $('#law-reference-input');
                if (input) state.stickyFields.lawReference = input.value;
                LexiUI.showToast('تم تثبيت مرجع القانون', 'success');
            } else {
                state.stickyFields.lawReference = '';
                LexiUI.showToast('تم إلغاء تثبيت المرجع', 'info');
            }
            await LexiDB.setPreference('stickyFields', state.stickyFields);
            const btn = $('#sticky-law-btn');
            if (btn) {
                btn.classList.toggle('active', state.stickyFields.lawReferenceLocked);
                btn.innerHTML = state.stickyFields.lawReferenceLocked
                    ? `${LexiUI.Icons.lock}<span>مثبَّت</span>` : `${LexiUI.Icons.unlock}<span>تثبيت</span>`;
            }
        }
    }

    // ══════════════════════════════════════
    //   AUTO-SUGGEST
    // ══════════════════════════════════════

    function onSubCategoryInput(value) {
        const dropdown = $('#sub-suggest');
        if (!dropdown) return;
        const filtered = state.subSpecialties
            .filter(s => s.specialization === state.activeSpecialization)
            .filter(s => !value || s.name.includes(value))
            .slice(0, 8);
        if (filtered.length === 0) { dropdown.classList.remove('show'); return; }
        dropdown.innerHTML = filtered.map(s => `
      <div class="suggest-item" onclick="LexiApp.selectSubCategory('${LexiUI.escapeHtml(s.name)}')">${LexiUI.escapeHtml(s.name)}</div>
    `).join('');
        dropdown.classList.add('show');
    }

    function selectSubCategory(name) {
        const input = document.querySelector('input[name="subCategory"]');
        if (input) input.value = name;
        const dropdown = $('#sub-suggest');
        if (dropdown) dropdown.classList.remove('show');
    }

    // ══════════════════════════════════════
    //   SEARCH
    // ══════════════════════════════════════

    function onSearch(query) {
        state.searchQuery = query;
        clearTimeout(state.searchTimeout);
        state.searchTimeout = setTimeout(async () => {
            const notes = query.trim() ? await LexiDB.searchNotes(query) : state.notes;
            const notesList = $('#notes-list');
            if (notesList) {
                const filtered = state.activeSpecialization === 'الكل' ? notes : notes.filter(n => n.specialization === state.activeSpecialization);
                const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                notesList.innerHTML = sorted.length === 0
                    ? `<div class="empty-state"><h3>لا توجد نتائج</h3><p>جرب كلمات مختلفة</p></div>`
                    : sorted.map(n => LexiUI.renderNoteCard(n, false)).join('');
            }
        }, 300);
    }

    // ══════════════════════════════════════
    //   CLOUD SYNC
    // ══════════════════════════════════════

    async function syncToCloud() {
        if (!state.user) { LexiUI.showToast('سجل الدخول أولاً', 'error'); return; }
        try {
            await FirebaseService.syncNotesToCloud(state.notes);
            LexiUI.showToast('تم رفع البيانات للسحابة بنجاح', 'success');
        } catch (err) {
            LexiUI.showToast('فشل الرفع: ' + err.message, 'error');
        }
    }

    async function syncFromCloud() {
        if (!state.user) { LexiUI.showToast('سجل الدخول أولاً', 'error'); return; }
        try {
            const cloudNotes = await FirebaseService.syncNotesFromCloud();
            if (cloudNotes && cloudNotes.length > 0) {
                state.notes = cloudNotes;
                render();
                LexiUI.showToast(`تم تنزيل ${cloudNotes.length} مبدأ من السحابة`, 'success');
            } else {
                LexiUI.showToast('لا توجد بيانات في السحابة', 'info');
            }
        } catch (err) {
            LexiUI.showToast('فشل التنزيل: ' + err.message, 'error');
        }
    }

    // ══════════════════════════════════════
    //   SHARING
    // ══════════════════════════════════════

    async function showShareModal() {
        if (!state.user) { LexiUI.showToast('سجل الدخول أولاً', 'info'); return; }

        // Ensure profile is public + notes synced
        try {
            await FirebaseService.setPublicSharing(true);
            await FirebaseService.syncNotesToCloud(state.notes);
        } catch (e) {
            console.warn('Share prep error:', e);
        }

        const shareLink = FirebaseService.getShareLink();
        const overlay = $('#modal-overlay');
        const modal = $('#modal-content');
        modal.innerHTML = LexiUI.renderShareModal(shareLink);
        overlay.classList.add('show');

        // Generate QR code
        setTimeout(() => {
            const canvas = $('#share-qr-canvas');
            if (canvas && typeof QRCode !== 'undefined') {
                QRCode.toCanvas(canvas, shareLink, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: document.documentElement.getAttribute('data-theme') === 'light' ? '#1a1a2e' : '#f0f0f5',
                        light: '#00000000'
                    }
                });
            }
        }, 100);
    }

    async function copyShareLink() {
        const input = $('#share-link-input');
        if (input) {
            await LexiUI.copyToClipboard(input.value);
            LexiUI.showToast('تم نسخ رابط المشاركة', 'success');
        }
    }

    // ══════════════════════════════════════
    //   IMPORT / EXPORT
    // ══════════════════════════════════════

    async function exportData() {
        try {
            const data = await LexiDB.exportAll();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jurinotebook-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            LexiUI.showToast('تم تصدير البيانات', 'success');
        } catch (err) {
            LexiUI.showToast('خطأ أثناء التصدير', 'error');
        }
    }

    async function importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await LexiDB.importAll(data);
            await refreshData();
            render();
            LexiUI.showToast(`تم استيراد ${data.notes.length} مبدأ`, 'success');
        } catch (err) {
            LexiUI.showToast('ملف غير صالح', 'error');
        }
        fileInput.value = '';
    }

    // ══════════════════════════════════════
    //   SUB-SPECIALTY
    // ══════════════════════════════════════

    async function deleteSubSpecialty(id) {
        try {
            await LexiDB.deleteSubSpecialty(id);
            await refreshData();
            render();
            LexiUI.showToast('تم حذف التصنيف الفرعي', 'success');
        } catch (err) { LexiUI.showToast('حدث خطأ', 'error'); }
    }

    // ══════════════════════════════════════
    //   USER PROFILE
    // ══════════════════════════════════════

    async function saveProfile() {
        const nameInput = $('#settings-username');
        const workplaceInput = $('#settings-workplace');
        if (nameInput) {
            state.userName = nameInput.value.trim();
            await LexiDB.setPreference('userName', state.userName);
        }
        if (workplaceInput) {
            state.workplace = workplaceInput.value.trim();
            await LexiDB.setPreference('workplace', state.workplace);
        }
        LexiUI.showToast('تم حفظ بيانات المستشار بنجاح', 'success');
        render();
    }

    async function saveUserName() {
        const input = $('#settings-username');
        if (!input) return;
        const name = input.value.trim();
        state.userName = name;
        await LexiDB.setPreference('userName', name);
        LexiUI.showToast(name ? `أهلاً بك، المستشار/ ${name}` : 'تم مسح الاسم', 'success');
        render();
    }

    async function toggleSpecEnabled(specId, isEnabled) {
        let specs = [...state.enabledSpecs];
        const allSpecs = LexiUI.getAllSpecs(state.customSpecs);
        if (specs.length === 0) {
            // First time: start from all enabled, then remove
            specs = allSpecs.map(s => s.id);
        }
        if (isEnabled) {
            if (!specs.includes(specId)) specs.push(specId);
        } else {
            specs = specs.filter(s => s !== specId);
            // Don't allow empty — keep at least one
            if (specs.length === 0) {
                LexiUI.showToast('يجب اختيار تخصص واحد على الأقل', 'info');
                render(); // re-render to reset checkbox
                return;
            }
        }
        state.enabledSpecs = specs;
        await LexiDB.setPreference('enabledSpecs', specs);
        // If active spec was disabled, switch to first enabled
        if (!specs.includes(state.activeSpecialization)) {
            state.activeSpecialization = specs[0];
            await LexiDB.setPreference('activeSpecialization', specs[0]);
        }
        render();
    }

    // ══════════════════════════════════════
    //   CATEGORY FILTER
    // ══════════════════════════════════════

    function setCategoryFilter(category) {
        state.activeCategory = category;
        render();
    }

    // ══════════════════════════════════════
    //   CUSTOM SPECIALIZATIONS
    // ══════════════════════════════════════

    async function addCustomSpec() {
        const nameInput = $('#new-spec-name');
        const iconInput = $('#new-spec-icon');
        if (!nameInput) return;
        const name = nameInput.value.trim();
        const icon = (iconInput && iconInput.value.trim()) || '⚖️';
        if (!name) {
            LexiUI.showToast('اكتب اسم التخصص', 'info');
            return;
        }
        // Check duplicates
        const allSpecs = LexiUI.getAllSpecs(state.customSpecs);
        if (allSpecs.some(s => s.id === name)) {
            LexiUI.showToast('هذا التخصص موجود بالفعل', 'info');
            return;
        }
        const newSpec = { id: name, label: name, icon };
        state.customSpecs.push(newSpec);
        await LexiDB.setPreference('customSpecs', state.customSpecs);
        // Auto-enable the new spec
        if (state.enabledSpecs.length > 0) {
            state.enabledSpecs.push(name);
            await LexiDB.setPreference('enabledSpecs', state.enabledSpecs);
        }
        LexiUI.showToast(`تم إضافة تخصص: ${name}`, 'success');
        render();
    }

    async function deleteCustomSpec(specId) {
        state.customSpecs = state.customSpecs.filter(s => s.id !== specId);
        await LexiDB.setPreference('customSpecs', state.customSpecs);
        // Remove from enabled if present
        if (state.enabledSpecs.includes(specId)) {
            state.enabledSpecs = state.enabledSpecs.filter(s => s !== specId);
            await LexiDB.setPreference('enabledSpecs', state.enabledSpecs);
        }
        // If active spec was deleted, switch
        if (state.activeSpecialization === specId) {
            state.activeSpecialization = 'مدني';
            await LexiDB.setPreference('activeSpecialization', 'مدني');
        }
        LexiUI.showToast(`تم حذف التخصص: ${specId}`, 'success');
        render();
    }

    // ══════════════════════════════════════
    //   CUSTOM CATEGORIES
    // ══════════════════════════════════════

    async function addCustomCategory() {
        const nameInput = $('#new-category-name');
        if (!nameInput) return;
        const name = nameInput.value.trim();
        if (!name) {
            LexiUI.showToast('اكتب اسم التصنيف', 'info');
            return;
        }
        // Check duplicates
        const allCategories = LexiUI.getAllCategories(state.customCategories);
        if (allCategories.includes(name)) {
            LexiUI.showToast('هذا التصنيف موجود بالفعل', 'info');
            return;
        }
        state.customCategories.push(name);
        await LexiDB.setPreference('customCategories', state.customCategories);

        LexiUI.showToast(`تم إضافة تصنيف: ${name}`, 'success');
        render();
    }

    async function deleteCustomCategory(categoryName) {
        state.customCategories = state.customCategories.filter(c => c !== categoryName);
        await LexiDB.setPreference('customCategories', state.customCategories);

        // If active category was deleted, clear it
        if (state.activeCategory === categoryName) {
            state.activeCategory = '';
        }
        LexiUI.showToast(`تم حذف التصنيف: ${categoryName}`, 'success');
        render();
    }

    async function editCustomCategory(oldName) {
        const newName = prompt('تعديل اسم التصنيف:', oldName);
        if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
        const name = newName.trim();

        // Check duplicates
        const allCategories = LexiUI.getAllCategories(state.customCategories);
        if (allCategories.includes(name)) {
            LexiUI.showToast('هذا التصنيف موجود بالفعل', 'info');
            return;
        }

        const index = state.customCategories.indexOf(oldName);
        if (index > -1) {
            state.customCategories[index] = name;
            await LexiDB.setPreference('customCategories', state.customCategories);
            if (state.activeCategory === oldName) {
                state.activeCategory = name;
            }
            LexiUI.showToast('تم تعديل التصنيف بنجاح', 'success');
            render();
        }
    }

    // ══════════════════════════════════════
    //   PUBLIC API
    // ══════════════════════════════════════

    return {
        init, navigate,
        // Auth
        signInWithGoogle, handleEmailLogin, handleEmailRegister,
        showRegister, showLogin, skipAuth, handleSignOut, goToLogin,
        // Theme
        toggleTheme, setTheme,
        // Specialization
        setSpecialization, setDefaultSpecialization,
        // Sidebar
        toggleSidebar,
        // Notes
        saveNote, editNote, confirmDeleteNote, deleteNote, closeModal,
        showAboutModal,
        // Quick Copy
        copyBody, copyCitation, copyFormatted,
        // Sticky
        toggleStickyField,
        // Auto-suggest
        onSubCategoryInput, selectSubCategory,
        // Search
        onSearch,
        // Cloud
        syncToCloud, syncFromCloud,
        // Sharing
        showShareModal, copyShareLink,
        // Import/Export
        exportData, importData,
        // User profile
        saveProfile, toggleSpecEnabled,
        // Category filter
        setCategoryFilter,
        // Custom specs
        addCustomSpec, deleteCustomSpec,
        // Custom categories
        addCustomCategory, deleteCustomCategory, editCustomCategory,
        deleteSubSpecialty
    };
})();

document.addEventListener('DOMContentLoaded', LexiApp.init);
