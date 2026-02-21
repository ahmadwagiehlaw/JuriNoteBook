/* ============================================
   LexiNote — IndexedDB Database Layer
   ============================================ */

const LexiDB = (() => {
    const DB_NAME = 'LexiNoteDB';
    const DB_VERSION = 1;
    let db = null;

    // ── Initialize Database ──
    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // Notes store
                if (!database.objectStoreNames.contains('notes')) {
                    const notesStore = database.createObjectStore('notes', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    notesStore.createIndex('specialization', 'specialization', { unique: false });
                    notesStore.createIndex('category', 'category', { unique: false });
                    notesStore.createIndex('subCategory', 'subCategory', { unique: false });
                    notesStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // User preferences store
                if (!database.objectStoreNames.contains('user_preferences')) {
                    database.createObjectStore('user_preferences', { keyPath: 'key' });
                }

                // Sub-specialties store (auto-suggest)
                if (!database.objectStoreNames.contains('sub_specialties')) {
                    const subStore = database.createObjectStore('sub_specialties', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    subStore.createIndex('specialization', 'specialization', { unique: false });
                    subStore.createIndex('name', 'name', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // ── Helper: get transaction + store ──
    function getStore(storeName, mode = 'readonly') {
        const tx = db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    // ── Promisify IDB request ──
    function reqToPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ══════════════════════════════
    //   NOTES CRUD
    // ══════════════════════════════

    async function addNote(note) {
        const store = getStore('notes', 'readwrite');
        const now = new Date();
        const record = {
            ...note,
            createdAt: now,
            updatedAt: now
        };
        const id = await reqToPromise(store.add(record));
        // Also save the sub-category for auto-suggest if it's new
        if (note.subCategory && note.subCategory.trim()) {
            await addSubSpecialty(note.specialization, note.subCategory.trim());
        }
        return id;
    }

    async function getAllNotes() {
        const store = getStore('notes');
        return reqToPromise(store.getAll());
    }

    async function getNotesBySpecialization(spec) {
        const store = getStore('notes');
        const index = store.index('specialization');
        return reqToPromise(index.getAll(spec));
    }

    async function getNote(id) {
        const store = getStore('notes');
        return reqToPromise(store.get(id));
    }

    async function updateNote(id, updates) {
        const store = getStore('notes', 'readwrite');
        const existing = await reqToPromise(store.get(id));
        if (!existing) throw new Error('Note not found');
        const updated = {
            ...existing,
            ...updates,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date()
        };
        await reqToPromise(store.put(updated));
        return updated;
    }

    async function deleteNote(id) {
        const store = getStore('notes', 'readwrite');
        return reqToPromise(store.delete(id));
    }

    async function searchNotes(query) {
        const all = await getAllNotes();
        if (!query || !query.trim()) return all;
        const q = query.trim().toLowerCase();
        return all.filter(note =>
            (note.principle && note.principle.toLowerCase().includes(q)) ||
            (note.fullText && note.fullText.toLowerCase().includes(q)) ||
            (note.citation && note.citation.toLowerCase().includes(q)) ||
            (note.category && note.category.toLowerCase().includes(q)) ||
            (note.subCategory && note.subCategory.toLowerCase().includes(q)) ||
            (note.lawReference && note.lawReference.toLowerCase().includes(q))
        );
    }

    async function getNotesCount() {
        const store = getStore('notes');
        return reqToPromise(store.count());
    }

    async function getCountBySpecialization(spec) {
        const store = getStore('notes');
        const index = store.index('specialization');
        return reqToPromise(index.count(spec));
    }

    // ══════════════════════════════
    //   USER PREFERENCES
    // ══════════════════════════════

    async function getPreference(key) {
        const store = getStore('user_preferences');
        const result = await reqToPromise(store.get(key));
        return result ? result.value : null;
    }

    async function setPreference(key, value) {
        const store = getStore('user_preferences', 'readwrite');
        return reqToPromise(store.put({ key, value }));
    }

    // ══════════════════════════════
    //   SUB-SPECIALTIES (auto-suggest)
    // ══════════════════════════════

    async function addSubSpecialty(specialization, name) {
        const existing = await getSubSpecialties(specialization);
        const alreadyExists = existing.some(
            s => s.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        if (alreadyExists) return;
        const store = getStore('sub_specialties', 'readwrite');
        return reqToPromise(store.add({ specialization, name: name.trim() }));
    }

    async function getSubSpecialties(specialization) {
        const store = getStore('sub_specialties');
        if (specialization) {
            const index = store.index('specialization');
            return reqToPromise(index.getAll(specialization));
        }
        return reqToPromise(store.getAll());
    }

    async function deleteSubSpecialty(id) {
        const store = getStore('sub_specialties', 'readwrite');
        return reqToPromise(store.delete(id));
    }

    // ══════════════════════════════
    //   DATA EXPORT / IMPORT
    // ══════════════════════════════

    async function exportAll() {
        const notes = await getAllNotes();
        const prefs = await reqToPromise(getStore('user_preferences').getAll());
        const subs = await reqToPromise(getStore('sub_specialties').getAll());
        return {
            version: DB_VERSION,
            exportDate: new Date().toISOString(),
            notes,
            preferences: prefs,
            subSpecialties: subs
        };
    }

    async function importAll(data) {
        if (!data || !data.notes) throw new Error('Invalid import data');

        // Clear existing
        const noteStore = getStore('notes', 'readwrite');
        await reqToPromise(noteStore.clear());
        for (const note of data.notes) {
            const clean = { ...note };
            delete clean.id;
            clean.createdAt = new Date(clean.createdAt);
            clean.updatedAt = new Date(clean.updatedAt);
            await reqToPromise(getStore('notes', 'readwrite').add(clean));
        }

        if (data.preferences) {
            const prefStore = getStore('user_preferences', 'readwrite');
            await reqToPromise(prefStore.clear());
            for (const pref of data.preferences) {
                await reqToPromise(getStore('user_preferences', 'readwrite').put(pref));
            }
        }

        if (data.subSpecialties) {
            const subStore = getStore('sub_specialties', 'readwrite');
            await reqToPromise(subStore.clear());
            for (const sub of data.subSpecialties) {
                const clean = { ...sub };
                delete clean.id;
                await reqToPromise(getStore('sub_specialties', 'readwrite').add(clean));
            }
        }
    }

    // ── Public API ──
    return {
        init,
        // Notes
        addNote,
        getAllNotes,
        getNotesBySpecialization,
        getNote,
        updateNote,
        deleteNote,
        searchNotes,
        getNotesCount,
        getCountBySpecialization,
        // Preferences
        getPreference,
        setPreference,
        // Sub-specialties
        addSubSpecialty,
        getSubSpecialties,
        deleteSubSpecialty,
        // Import/Export
        exportAll,
        importAll
    };
})();
