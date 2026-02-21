/* ============================================
   JuriNotebook — Firebase Configuration
   Firebase Auth + Firestore (CDN-compatible)
   ============================================ */

const FirebaseService = (() => {
    let app = null;
    let auth = null;
    let db = null;
    let currentUser = null;

    // ── Initialize ──
    function init() {
        const firebaseConfig = {
            apiKey: "AIzaSyDjQZpuTp8tVUrIuiVzQtkav1KK-7qojAs",
            authDomain: "jurinotebook.firebaseapp.com",
            projectId: "jurinotebook",
            storageBucket: "jurinotebook.firebasestorage.app",
            messagingSenderId: "743237585544",
            appId: "1:743237585544:web:a02c7a45fe6ce24d03ad3d"
        };

        // Check if Firebase SDK loaded
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded — running in offline mode');
            return false;
        }

        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Enable offline persistence
        db.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code === 'failed-precondition') {
                console.warn('Firestore persistence: multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.warn('Firestore persistence: browser not supported');
            }
        });

        // Set Arabic language for auth UI
        auth.languageCode = 'ar';

        return true;
    }

    // ══════════════════════════════════════
    //   AUTH
    // ══════════════════════════════════════

    function onAuthStateChanged(callback) {
        if (!auth) return;
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            callback(user);
        });
    }

    async function signInWithGoogle() {
        if (!auth) throw new Error('Firebase not initialized');
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        return result.user;
    }

    async function signInWithEmail(email, password) {
        if (!auth) throw new Error('Firebase not initialized');
        const result = await auth.signInWithEmailAndPassword(email, password);
        return result.user;
    }

    async function registerWithEmail(email, password, displayName) {
        if (!auth) throw new Error('Firebase not initialized');
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (displayName) {
            await result.user.updateProfile({ displayName });
        }
        return result.user;
    }

    async function signOut() {
        if (!auth) return;
        await auth.signOut();
        currentUser = null;
    }

    function getUser() {
        return currentUser;
    }

    function isLoggedIn() {
        return !!currentUser;
    }

    // ══════════════════════════════════════
    //   FIRESTORE — Notes CRUD
    // ══════════════════════════════════════

    function userNotesRef() {
        if (!db || !currentUser) return null;
        return db.collection('users').doc(currentUser.uid).collection('notes');
    }

    function userPrefsRef() {
        if (!db || !currentUser) return null;
        return db.collection('users').doc(currentUser.uid).collection('preferences');
    }

    function userProfileRef() {
        if (!db || !currentUser) return null;
        return db.collection('users').doc(currentUser.uid);
    }

    // ── Sync notes TO cloud ──
    async function syncNotesToCloud(notes) {
        const ref = userNotesRef();
        if (!ref) return;

        const batch = db.batch();

        for (const note of notes) {
            const docRef = ref.doc(String(note.id));
            batch.set(docRef, {
                ...note,
                createdAt: note.createdAt instanceof Date ? firebase.firestore.Timestamp.fromDate(note.createdAt) : note.createdAt,
                updatedAt: note.updatedAt instanceof Date ? firebase.firestore.Timestamp.fromDate(note.updatedAt) : note.updatedAt,
                syncedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
    }

    // ── Sync notes FROM cloud ──
    async function syncNotesFromCloud() {
        const ref = userNotesRef();
        if (!ref) return [];

        const snapshot = await ref.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: Number(doc.id) || doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
            };
        });
    }

    // ── Save single note to cloud ──
    async function saveNoteToCloud(note) {
        const ref = userNotesRef();
        if (!ref) return;

        await ref.doc(String(note.id)).set({
            ...note,
            createdAt: note.createdAt instanceof Date ? firebase.firestore.Timestamp.fromDate(note.createdAt) : note.createdAt,
            updatedAt: note.updatedAt instanceof Date ? firebase.firestore.Timestamp.fromDate(note.updatedAt) : note.updatedAt,
            syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // ── Delete note from cloud ──
    async function deleteNoteFromCloud(noteId) {
        const ref = userNotesRef();
        if (!ref) return;
        await ref.doc(String(noteId)).delete();
    }

    // ── Save preferences ──
    async function savePreferencesToCloud(prefs) {
        const ref = userPrefsRef();
        if (!ref) return;

        for (const [key, value] of Object.entries(prefs)) {
            await ref.doc(key).set({ value });
        }
    }

    // ── Save user profile (for sharing) ──
    async function saveUserProfile() {
        const ref = userProfileRef();
        if (!ref || !currentUser) return;

        await ref.set({
            displayName: currentUser.displayName || 'مستخدم',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            isPublic: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    // ── Toggle sharing ──
    async function setPublicSharing(isPublic) {
        const ref = userProfileRef();
        if (!ref) return;
        await ref.set({ isPublic }, { merge: true });
    }

    // ── Get shared notes (public) ──
    async function getSharedNotes(uid) {
        if (!db) return null;

        // Check if user profile is public
        const profileDoc = await db.collection('users').doc(uid).get();
        if (!profileDoc.exists) return null;

        const profile = profileDoc.data();
        if (!profile.isPublic) return null;

        const snapshot = await db.collection('users').doc(uid)
            .collection('notes').orderBy('createdAt', 'desc').get();

        return {
            profile,
            notes: snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
                };
            })
        };
    }

    function getShareLink() {
        if (!currentUser) return '';
        const base = window.location.origin + window.location.pathname;
        return `${base}#/shared/${currentUser.uid}`;
    }

    // ── Public API ──
    return {
        init,
        onAuthStateChanged,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        signOut,
        getUser,
        isLoggedIn,
        syncNotesToCloud,
        syncNotesFromCloud,
        saveNoteToCloud,
        deleteNoteFromCloud,
        savePreferencesToCloud,
        saveUserProfile,
        setPublicSharing,
        getSharedNotes,
        getShareLink
    };
})();
