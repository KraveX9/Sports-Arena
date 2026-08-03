// ============================================
//  SPORTS ARENA – FIRESTORE + IMGBB + SECRET KEY
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

// 🔑 SECRET KEY – MUST MATCH THE ONE IN YOUR FIRESTORE RULES
const SECRET_KEY = 'MySuperSecret2026!';

// ============================================
//  CATEGORIES (HARDCODED)
// ============================================
const CATEGORIES = ['Football','Basketball','Cricket','Tennis','Motorsport','Golf'];
async function getCategories() {
    return CATEGORIES.map(name => ({ id: name, name }));
}

// ============================================
//  SLUG GENERATOR
// ============================================
function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,50);
}

// ============================================
//  ARTICLE FUNCTIONS (WITH BETTER ERROR HANDLING)
// ============================================

// 🔥 FALLBACK MOCK DATA – used if Firestore fails
const FALLBACK_ARTICLES = [
    {
        id: 'fallback1',
        title: 'Welcome to Sports Arena!',
        summary: 'Your premier destination for sports news. Start writing your first article!',
        content: '<p>Welcome to Sports Arena! This is a fallback article because Firestore is not responding.</p><p>To fix this, check your Firebase configuration and Firestore rules.</p>',
        category: 'Football',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        slug: 'welcome-to-sports-arena',
        views: 0,
        tags: ['sports', 'blog']
    }
];

async function getArticles() {
    try {
        console.log('🔄 Fetching articles from Firestore...');
        const snapshot = await db.collection('articles').orderBy('date','desc').get();
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ Loaded ${articles.length} articles from Firestore.`);
        if (articles.length === 0) {
            console.warn('⚠️ No articles found in Firestore. Using fallback data.');
            return FALLBACK_ARTICLES;
        }
        return articles;
    } catch(e){ 
        console.error('❌ Firestore error:', e);
        console.warn('⚠️ Using fallback data.');
        return FALLBACK_ARTICLES;
    }
}

async function getArticleBySlug(slug) {
    try {
        // First try to find in Firestore
        const snapshot = await db.collection('articles').where('slug','==',slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        // If not found, check fallback
        const fallback = FALLBACK_ARTICLES.find(a => a.slug === slug);
        return fallback || null;
    } catch(e){ 
        console.error('Error fetching article by slug:', e);
        // Return fallback if available
        return FALLBACK_ARTICLES.find(a => a.slug === slug) || null;
    }
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
    } catch(e){ 
        console.error('View logging error:', e); 
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
            } catch(e) { reject(e); }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

// 🔥 ADD ARTICLE – includes the secret key
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
    } catch(e) { 
        console.error('Add article error:', e);
        return { success: false, error: e.message }; 
    }
}

// 🔥 UPDATE ARTICLE – includes the secret key
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
    } catch(e) { 
        console.error('Update article error:', e);
        return { success: false, error: e.message }; 
    }
}

async function deleteArticleById(id) {
    try {
        await db.collection('articles').doc(id).delete();
        return { success: true };
    } catch(e) { 
        console.error('Delete article error:', e);
        return { success: false, error: e.message }; 
    }
}

// ============================================
//  COMMENTS
// ============================================
async function getComments(slug) {
    try {
        const snapshot = await db.collection('comments').where('articleSlug','==',slug).orderBy('createdAt','asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e){ 
        console.error('Comments error:', e);
        return []; 
    }
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
    } catch(e){ 
        console.error('Comment error:', e);
        return { success: false, error: e.message }; 
    }
}

// ============================================
//  ANALYTICS FUNCTIONS
// ============================================
async function getViewStats(period) {
    try {
        const now = new Date();
        let startDate;
        if (period === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'weekly') {
            const day = now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const startStr = startDate.toISOString().split('T')[0];
        const snapshot = await db.collection('views').where('date','>=',startStr).get();
        return snapshot.docs.map(doc => doc.data());
    } catch(e) {
        console.error('View stats error:', e);
        return [];
    }
}

async function getCountryStats(period) {
    const views = await getViewStats(period);
    const countryCount = {};
    views.forEach(v => {
        const c = v.country || 'Unknown';
        countryCount[c] = (countryCount[c] || 0) + 1;
    });
    return Object.entries(countryCount).sort((a,b) => b[1] - a[1]);
}

async function getArticleStats(period) {
    const views = await getViewStats(period);
    const articleCount = {};
    views.forEach(v => {
        const slug = v.articleSlug || 'unknown';
        articleCount[slug] = (articleCount[slug] || 0) + 1;
    });
    return articleCount;
                    }
