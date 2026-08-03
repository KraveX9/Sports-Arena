// ============================================
//  SPORTS ARENA – FIRESTORE + IMGBB (COMPRESSED)
// ============================================

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

// 🔑 SECRET KEY
const SECRET_KEY = 'MySuperSecret2026!';

// ============================================
//  CATEGORIES (HARDCODED)
// ============================================
const CATEGORIES = ['Football','Basketball','Cricket','Tennis','Motorsport','Golf'];
async function getCategories() {
    return CATEGORIES.map(name => ({ id: name, name }));
}

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,50);
}

// ============================================
//  🔥 IMAGE UPLOAD – COMPRESSES BEFORE UPLOADING TO IMGBB
// ============================================
async function uploadImage(file) {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image too large. Max 5MB.');
    }

    // Compress the image before uploading
    const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8
    };
    const compressed = await imageCompression(file, options);

    // Upload compressed file to ImgBB
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.readAsDataURL(compressed);
        reader.onload = async () => {
            try {
                const base64Image = reader.result.split(',')[1];
                const formData = new FormData();
                formData.append('key', IMGBB_API_KEY);
                formData.append('image', base64Image);
                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(new Error(data.error?.message || 'ImgBB upload failed'));
                }
            } catch (e) { reject(e); }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

// ============================================
//  ARTICLE FUNCTIONS
// ============================================
async function getArticles() {
    try {
        const snapshot = await db.collection('articles').orderBy('date','desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){ 
        console.error(e);
        return []; 
    }
}

async function getArticleBySlug(slug) {
    try {
        const snapshot = await db.collection('articles').where('slug','==',slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch(e){ return null; }
}

async function incrementViewsAndLog(articleId, slug, country) {
    try {
        await db.collection('articles').doc(articleId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
        await db.collection('views').add({
            articleSlug: slug,
            articleId: articleId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString().split('T')[0],
            country: country || 'Unknown'
        });
        return { success: true };
    } catch(e){ return { success: false }; }
}

async function addArticle(article) {
    try {
        const slug = generateSlug(article.title);
        const docRef = await db.collection('articles').add({
            title: article.title,
            summary: article.summary,
            content: article.content || article.summary,
            category: article.category,
            author: article.author,
            image: article.image || 'https://picsum.photos/seed/sports/600/400',
            date: article.date || new Date().toISOString().split('T')[0],
            slug: slug,
            views: 0,
            tags: article.tags || [],
            secretKey: SECRET_KEY,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch(e) { return { success: false, error: e.message }; }
}

async function updateArticle(id, article) {
    try {
        const slug = generateSlug(article.title);
        await db.collection('articles').doc(id).update({
            title: article.title,
            summary: article.summary,
            content: article.content || article.summary,
            category: article.category,
            author: article.author,
            image: article.image || 'https://picsum.photos/seed/sports/600/400',
            date: article.date || new Date().toISOString().split('T')[0],
            slug: slug,
            tags: article.tags || [],
            secretKey: SECRET_KEY
        });
        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
}

async function deleteArticleById(id) {
    try {
        await db.collection('articles').doc(id).delete();
        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
}

// ============================================
//  COMMENTS
// ============================================
async function getComments(slug) {
    try {
        const snapshot = await db.collection('comments').where('articleSlug','==',slug).orderBy('createdAt','asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){ return []; }
}
async function addComment(slug, name, comment, email='') {
    try {
        await db.collection('comments').add({
            articleSlug: slug,
            name: name.trim(),
            comment: comment.trim(),
            email: email.trim() || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch(e){ return { success: false, error: e.message }; }
}

// ============================================
//  ANALYTICS
// ============================================
async function getViewStats(period) {
    try {
        const now = new Date();
        let startDate;
        if (period === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'weekly') {
            const day = now.getDay();
            startDate = new Date(now.get
