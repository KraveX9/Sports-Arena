// ============================================
//  SPORTS ARENA – FIRESTORE + IMGBB + SLUGS + ANALYTICS
// ============================================

// ----- FIREBASE CONFIG -----
const firebaseConfig = {
  apiKey: "AIzaSyBNYN6fBKqKXQEztVrdsVYqeZJO6q4LCx8",
  authDomain: "sportsarenablog-776bf.firebaseapp.com",
  projectId: "sportsarenablog-776bf",
  storageBucket: "sportsarenablog-776bf.firebasestorage.app",
  messagingSenderId: "1056924791232",
  appId: "1:1056924791232:web:46ac3b010b86bc3c439825",
  measurementId: "G-JGJ2N4KH0F"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ----- IMGBB API KEY -----
const IMGBB_API_KEY = '17e055fb3d68d047117985b03c255ba3';

// ============================================
//  CATEGORIES
// ============================================
const CATEGORIES = [
    'Football',
    'Basketball',
    'Cricket',
    'Tennis',
    'Motorsport',
    'Golf'
];

async function getCategories() {
    return CATEGORIES.map(name => ({ id: name, name }));
}

// ============================================
//  SLUG GENERATOR
// ============================================
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
}

// ============================================
//  ARTICLE FUNCTIONS
// ============================================

async function getArticles() {
    try {
        const snapshot = await db.collection('articles').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

async function getArticleBySlug(slug) {
    try {
        const snapshot = await db.collection('articles')
            .where('slug', '==', slug)
            .limit(1)
            .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error fetching article by slug:', error);
        return null;
    }
}

// 🔥 NEW: Increment view count
async function incrementViews(id) {
    try {
        await db.collection('articles').doc(id).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
        return { success: true };
    } catch (error) {
        console.error('Error incrementing views:', error);
        return { success: false };
    }
}

async function uploadImage(file) {
    if (!file) return null;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Image = reader.result.split(',')[1];
                const formData = new FormData();
                formData.append('key', IMGBB_API_KEY);
                formData.append('image', base64Image);
                const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
                const data = await response.json();
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(new Error(data.error?.message || 'ImgBB upload failed'));
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
    });
}

async function addArticle(article) {
    try {
        const slug = generateSlug(article.title);
        const docRef = await db.collection('articles').add({
            title: article.title,
            summary: article.summary,
            category: article.category,
            author: article.author,
            image: article.image || 'https://picsum.photos/seed/sports/600/400',
            date: article.date || new Date().toISOString().split('T')[0],
            slug: slug,
            views: 0, // 🔥 New articles start with 0 views
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateArticle(id, article) {
    try {
        const slug = generateSlug(article.title);
        await db.collection('articles').doc(id).update({
            title: article.title,
            summary: article.summary,
            category: article.category,
            author: article.author,
            image: article.image || 'https://picsum.photos/seed/sports/600/400',
            date: article.date || new Date().toISOString().split('T')[0],
            slug: slug
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteArticleById(id) {
    try {
        await db.collection('articles').doc(id).delete();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
  }
