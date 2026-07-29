// ============================================
//  APP.JS – PUBLIC BLOG RENDER ENGINE
// ============================================

// ----- STATE -----
let currentCategory = 'All';
let displayedCount = 6;

// ----- DOM REFERENCES -----
const categoriesGrid = document.getElementById('categoriesGrid');
const articlesGrid = document.getElementById('articlesGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const newsletterForm = document.getElementById('newsletterForm');

// ----- RENDER CATEGORIES -----
function renderCategories() {
    if (!categoriesGrid) return;

    const cats = getCategories(); // from config.js
    let html = `<div class="category-card active" data-category="All"><i class="fas fa-th-large"></i> All</div>`;

    cats.forEach(c => {
        html += `<div class="category-card" data-category="${c.name}"><i class="fas ${c.icon}"></i> ${c.name}</div>`;
    });

    categoriesGrid.innerHTML = html;

    // Category click event – filter articles
    categoriesGrid.querySelectorAll('.category-card').forEach(el => {
        el.addEventListener('click', function() {
            categoriesGrid.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            displayedCount = 6;
            renderArticles();
        });
    });

    // Update footer categories
    const footerCat = document.getElementById('footerCategories');
    if (footerCat) {
        footerCat.innerHTML = cats.map(c =>
            `<li><a href="#" data-cat="${c.name}">${c.name}</a></li>`
        ).join('');

        footerCat.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const name = a.dataset.cat;
                const categoryCard = document.querySelector(`.category-card[data-category="${name}"]`);
                if (categoryCard) categoryCard.click();
            });
        });
    }
}

// ----- RENDER ARTICLES -----
function renderArticles() {
    if (!articlesGrid) return;

    let articles = getArticles(); // from config.js

    // Filter by category
    if (currentCategory !== 'All') {
        articles = articles.filter(a => a.category === currentCategory);
    }

    const total = articles.length;
    const sliced = articles.slice(0, displayedCount);

    // Show/hide "Load More" button
    if (loadMoreBtn) {
        if (displayedCount >= total) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }

    // No articles message
    if (sliced.length === 0) {
        articlesGrid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 0; color:#64748b;">
                <i class="fas fa-newspaper" style="font-size:3rem; display:block; margin-bottom:16px; opacity:0.3;"></i>
                No articles found in this category.
            </div>
        `;
        updateStats(articles);
        return;
    }

    // Build article cards
    let html = '';
    sliced.forEach(a => {
        html += `
            <div class="article-card">
                <div class="article-img" style="background-image:url('${a.image || 'https://picsum.photos/seed/sports/600/400'}');">
                    <span class="article-category">${a.category}</span>
                </div>
                <div class="article-body">
                    <h3>${a.title}</h3>
                    <p>${a.summary}</p>
                    <div class="article-meta">
                        <span class="author"><i class="fas fa-user-edit"></i> ${a.author}</span>
                        <span><i class="far fa-calendar-alt"></i> ${a.date}</span>
                    </div>
                    <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    });

    articlesGrid.innerHTML = html;
    updateStats(articles);
}

// ----- UPDATE STATS (hero section) -----
function updateStats(articles) {
    const statArticles = document.getElementById('statArticles');
    const statCategories = document.getElementById('statCategories');
    const statAuthors = document.getElementById('statAuthors');

    if (statArticles) statArticles.textContent = articles.length;
    if (statCategories) statCategories.textContent = getCategories().length;
    if (statAuthors) {
        const uniqueAuthors = new Set(articles.map(a => a.author));
        statAuthors.textContent = uniqueAuthors.size;
    }
}

// ----- LOAD MORE -----
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
        displayedCount += 6;
        renderArticles();
    });
}

// ----- HAMBURGER MENU (mobile toggle) -----
if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('open');
    });
}

// ----- NEWSLETTER FORM -----
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input[type="email"]');
        if (input && input.value) {
            alert(`📩 Thanks for subscribing, ${input.value}! You'll get the latest sports news.`);
            input.value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });
}

// ----- REMOVE PRELOADER -----
function removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

// ----- INIT ON PAGE LOAD -----
document.addEventListener('DOMContentLoaded', function() {
    renderCategories();
    renderArticles();

    // Remove preloader with a slight delay for smooth transition
    setTimeout(removePreloader, 600);
});
