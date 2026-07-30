// ============================================
//  SPORTS ARENA – FIREBASE FIRESTORE CONFIG
// ============================================

// ----- YOUR FIREBASE CONFIG (copied from Firebase Console) -----
const firebaseConfig = {
  apiKey: "AIzaSyBNYN6fBKqKXQEztVrdsVYqeZJO6q4LCx8",
  authDomain: "sportsarenablog-776bf.firebaseapp.com",
  projectId: "sportsarenablog-776bf",
  storageBucket: "sportsarenablog-776bf.firebasestorage.app",
  messagingSenderId: "1056924791232",
  appId: "1:1056924791232:web:46ac3b010b86bc3c439825",
  measurementId: "G-JGJ2N4KH0F"
};

// ----- INITIALIZE FIREBASE (compat mode) -----
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ----- MOCK CATEGORIES (used for the UI) -----
const mockCategories = [
    { id: 'cat1', name: 'Football', icon: 'fa-futbol' },
    { id: 'cat2', name: 'Basketball', icon: 'fa-basketball-ball' },
    { id: 'cat3', name: 'Cricket', icon: 'fa-baseball-ball' },
    { id: 'cat4', name: 'Tennis', icon: 'fa-table-tennis' },
    { id: 'cat5', name: 'Motorsport', icon: 'fa-car' },
    { id: 'cat6', name: 'Golf', icon: 'fa-golf-ball' }
];

// ============================================
//  FIRESTORE FUNCTIONS (for your blog)
// ============================================

// GET all articles (ordered by date, newest first)
async function getArticles() {
    try {
        const snapshot = await db.collection('articles')
            .orderBy('date', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// GET categories (static)
async function getCategories() {
    return mockCategories;
}

// ADD a new article to Firestore
async function addArticle(article) {
    try {
        const docRef = await db.collection('articles').add({
            title: article.title,
            summary: article.summary,
            category: article.category,
            author: article.author,
            image: article.image || 'https://picsum.photos/seed/sports/600/400',
            date: new Date().toISOString().split('T')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding article:', error);
        return { success: false, error: error.message };
    }
}

// DELETE an article from Firestore
async function deleteArticleById(id) {
    try {
        await db.collection('articles').doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting article:', error);
        return { success: false, error: error.message };
    }
}
