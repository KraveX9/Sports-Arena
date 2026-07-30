// ============================================
//  PUBLIC BLOG ENGINE (FIREBASE)
// ============================================

let currentCategory = 'All';
let displayedCount = 6;
let allArticles = [];

async function loadAndRender() {
    try {
        allArticles = await getArticles();
        renderCategories();
        renderArticles();
        updateStats();
    } catch (error) {
        const grid = document.getElementById('articlesGrid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#dc2626; background:#fef2f2; border-radius:16px;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem; display:block; margin-bottom:12px;"></i>
                <strong>Failed to load articles</strong><br>
                <span style="font-size:0.9rem; color:#991b1b;">${error.message}</span>
                <br><small style="color:#6b7280;">Check Firebase connection and Firestore permissions.</small>
            </div>`;
        }
    }
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    getCategories().then(categories => {
        let html = `<div class="category-card active" data-category="All"><i class="fas fa-th-large"></i> All</div>`;
        categories.forEach(c => {
            html += `<div class="category-card" data-category="${c.name}"><i class="fas ${c.icon}"></i> ${c.name}</div>`;
        });
        grid.innerHTML = html;

        grid.querySelectorAll('.category-card').forEach(el => {
            el.addEventListener('click', function() {
                grid.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                displayedCount = 6;
                renderArticles();
            });
        });

        const footerCat = document.getElementById('footerCategories');
        if (footerCat) {
            footerCat.innerHTML = categories.map(c => `<li><a href="#" data-cat="${c.name}">${c.name}</a></li>`).join('');
            footerCat.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const name = a.dataset.cat;
                    document.querySelector(`.category-card[data-category="${name}"]`)?.click();
                });
            });
        }
    });
}

function renderArticles() {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    let articles = allArticles;
    if (currentCategory !== 'All') {
        articles = articles.filter(a => a.category === currentCategory);
    }
    const total = articles.length;
    const sliced = articles.slice(0, displayedCount);
    const loadBtn = document.getElementById('loadMoreBtn');

    if (displayedCount >= total) {
        loadBtn.style.display = 'none';
    } else {
        loadBtn.style.display = 'inline-flex';
    }

    if (sliced.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 0; color:#64748b;">No articles found. Create your first one in the dashboard!</div>`;
        return;
    }

    let html = '';
    sliced.forEach(a => {
        html += `
            <div class="article-card">
                <div class="article-img" style="background-image:url('${a.image || 'https://picsum.photos/seed/default/600/400'}');">
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
    grid.innerHTML = html;
}

function updateStats() {
    const total = allArticles.length;
    const statArticles = document.getElementById('statArticles');
    if (statArticles) statArticles.textContent = total;
    getCategories().then(cats => {
        const statCategories = document.getElementById('statCategories');
        if (statCategories) statCategories.textContent = cats.length;
    });
    const authors = new Set(allArticles.map(a => a.author));
    const statAuthors = document.getElementById('statAuthors');
    if (statAuthors) statAuthors.textContent = authors.size;
}

document.addEventListener('DOMContentLoaded', function() {
    loadAndRender();

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            displayedCount += 6;
            renderArticles();
        });
    }

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input');
            if (input.value) {
                alert(`📩 Thanks for subscribing, ${input.value}!`);
                input.value = '';
            }
        });
    }

    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.style.display = 'none';
    }, 600);
});
