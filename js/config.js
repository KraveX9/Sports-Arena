// ============================================
//  SPORTS ARENA – CONFIGURATION & MOCK DATA
// ============================================

// ----- APPWRITE SETTINGS (replace when ready) -----
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';

// Set to FALSE when you connect Appwrite
const USE_MOCK = true;


// ============================================
//  MOCK CATEGORIES
// ============================================
const mockCategories = [
    { id: 'cat1', name: 'Football', icon: 'fa-futbol' },
    { id: 'cat2', name: 'Basketball', icon: 'fa-basketball-ball' },
    { id: 'cat3', name: 'Cricket', icon: 'fa-baseball-ball' },
    { id: 'cat4', name: 'Tennis', icon: 'fa-table-tennis' },
    { id: 'cat5', name: 'Motorsport', icon: 'fa-car' },
    { id: 'cat6', name: 'Golf', icon: 'fa-golf-ball' }
];


// ============================================
//  MOCK ARTICLES (6 sample stories)
// ============================================
const mockArticles = [
    {
        id: 'a1',
        title: 'Champions League Final: Epic Comeback Stuns Europe',
        summary: 'In a night of high drama, the underdogs overturned a 2-goal deficit to lift the trophy in extra time.',
        category: 'Football',
        author: 'James Rodriguez',
        date: '2026-07-28',
        image: 'https://picsum.photos/seed/football/600/400'
    },
    {
        id: 'a2',
        title: 'NBA Finals MVP Delivers Historic Triple-Double',
        summary: 'The superstar put on a clinic with 40 points, 18 rebounds, and 12 assists in the series clincher.',
        category: 'Basketball',
        author: 'Sarah Thompson',
        date: '2026-07-27',
        image: 'https://picsum.photos/seed/basketball/600/400'
    },
    {
        id: 'a3',
        title: 'Ashes Thriller: England Snatch Victory in Final Over',
        summary: 'A sensational last-wicket partnership turned the tables on Australia in a nerve-shredding finish.',
        category: 'Cricket',
        author: 'Ravi Shastri',
        date: '2026-07-26',
        image: 'https://picsum.photos/seed/cricket/600/400'
    },
    {
        id: 'a4',
        title: 'Wimbledon Upset: Unseeded Star Reaches Semis',
        summary: 'The 22-year-old wildcard continues her fairy-tale run, defeating the world No.2 in straight sets.',
        category: 'Tennis',
        author: 'Martina Navratilova',
        date: '2026-07-25',
        image: 'https://picsum.photos/seed/tennis/600/400'
    },
    {
        id: 'a5',
        title: 'F1 Chaos: Late Crash Hands Victory to Local Hero',
        summary: 'A dramatic multi-car collision in the final laps allowed the hometown driver to claim his first win.',
        category: 'Motorsport',
        author: 'Lewis Hamilton',
        date: '2026-07-24',
        image: 'https://picsum.photos/seed/f1/600/400'
    },
    {
        id: 'a6',
        title: 'PGA Championship: Record-Breaking 62 Takes Lead',
        summary: 'The young gun fired a flawless round with 10 birdies to shatter the course record by two shots.',
        category: 'Golf',
        author: 'Tiger Woods',
        date: '2026-07-23',
        image: 'https://picsum.photos/seed/golf/600/400'
    }
];


// ============================================
//  EXPOSE FUNCTIONS (used by app.js & dashboard)
// ============================================

// Get all articles (mock or from Appwrite in future)
function getArticles() {
    if (USE_MOCK) {
        return mockArticles;
    }
    // TODO: Fetch from Appwrite database
    return mockArticles;
}

// Get all categories
function getCategories() {
    if (USE_MOCK) {
        return mockCategories;
    }
    // TODO: Fetch from Appwrite database
    return mockCategories;
}

// Helper to add a new article (used in dashboard)
function addArticle(article) {
    // In mock mode, push to the array
    if (USE_MOCK) {
        mockArticles.unshift({
            id: 'a' + Date.now(),
            ...article,
            date: new Date().toISOString().split('T')[0]
        });
        return true;
    }
    // TODO: Save to Appwrite
    return false;
}

// Helper to delete an article (used in dashboard)
function deleteArticleById(id) {
    if (USE_MOCK) {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index !== -1) {
            mockArticles.splice(index, 1);
            return true;
        }
        return false;
    }
    // TODO: Delete from Appwrite
    return false;
  }
