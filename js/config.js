// ============================================
//  SPORTS ARENA – APPWRITE CONFIGURATION
// ============================================

// ----- APPWRITE SETTINGS (ALL FILLED FOR YOU) -----
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a6a72e60007802abee3';        
const APPWRITE_DATABASE_ID = '6a6a7525002ccbf4d666';      
const APPWRITE_COLLECTION_ID = 'articles_';                
const APPWRITE_API_KEY = 'standard_e3fa7862f1f2ddf8f9493917810fd0f2d37b066830d0eb60b5ffeb9310ee3f3d7afd5563b3a0173298f05da8749dfd5191a640d75ea2b774158d4b94f6c97e82a2bda1d43b41fa3ad13eb61b0dcc960f220633ca364581220f8127e119ce616a660fdd0b3ec484bbef4d3f89f9fb284fde4fedc7d23c2a1e70e7bd43e403cc56';

// Set to TRUE only if you want to fallback to mock data
const USE_MOCK = false;

// ----- INITIALIZE APPWRITE SDK -----
const client = new Appwrite.Client();
const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// ----- MOCK DATA (FALLBACK) -----
const mockCategories = [
    { id: 'cat1', name: 'Football', icon: 'fa-futbol' },
    { id: 'cat2', name: 'Basketball', icon: 'fa-basketball-ball' },
    { id: 'cat3', name: 'Cricket', icon: 'fa-baseball-ball' },
    { id: 'cat4', name: 'Tennis', icon: 'fa-table-tennis' },
    { id: 'cat5', name: 'Motorsport', icon: 'fa-car' },
    { id: 'cat6', name: 'Golf', icon: 'fa-golf-ball' }
];

// ----- FUNCTIONS (REAL APPWRITE) -----

// Get all articles from Appwrite
async function getArticles() {
    if (USE_MOCK) {
        return mockArticles;
    }
    try {
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID
        );
        return response.documents.map(doc => ({
            id: doc.$id,
            title: doc.title,
            summary: doc.summary,
            category: doc.category,
            author: doc.author,
            date: doc.date,
            image: doc.image
        }));
    } catch (error) {
        console.error('Error fetching articles:', error);
        alert('❌ Failed to load articles. Check Appwrite connection.');
        return [];
    }
}

// Get all categories (static for now)
async function getCategories() {
    return mockCategories;
}

// Add a new article to Appwrite
async function addArticle(article) {
    if (USE_MOCK) {
        mockArticles.unshift({
            id: 'a' + Date.now(),
            ...article,
            date: new Date().toISOString().split('T')[0]
        });
        return true;
    }
    try {
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            'unique()',
            {
                title: article.title,
                summary: article.summary,
                category: article.category,
                author: article.author,
                image: article.image || 'https://picsum.photos/seed/sports/600/400',
                date: new Date().toISOString().split('T')[0]
            }
        );
        return true;
    } catch (error) {
        console.error('Error adding article:', error);
        alert('❌ Failed to publish article. Check Appwrite permissions.');
        return false;
    }
}

// Delete an article from Appwrite
async function deleteArticleById(id) {
    if (USE_MOCK) {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index !== -1) {
            mockArticles.splice(index, 1);
            return true;
        }
        return false;
    }
    try {
        await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            id
        );
        return true;
    } catch (error) {
        console.error('Error deleting article:', error);
        alert('❌ Failed to delete article. Check Appwrite permissions.');
        return false;
    }
}

// Mock articles fallback
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
