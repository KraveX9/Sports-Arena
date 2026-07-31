// ============================================
//  PUBLIC BLOG ENGINE (WITH SEARCH + SOCIAL SHARE)
// ============================================

let currentCategory = 'All';
let currentSearch = '';
let displayedCount = 6;
let allArticles = [];

async function loadAndRender() {
    try {
        allArticles = await getArticles();
        renderCategories();
        applyFilters();
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
                applyFilters();
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

function getFilteredArticles() {
    let filtered = allArticles;
    if (currentCategory !== 'All') {
        filtered = filtered.filter(a => a.category === currentCategory);
    }
    if (currentSearch.trim() !== '') {
        const searchLower = currentSearch.toLowerCase().trim();
        filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(searchLower) ||
            a.category.toLowerCase().includes(searchLower) ||
            a.author.toLowerCase().includes(searchLower)
        );
    }
    return filtered;
}

function applyFilters() {
    const filtered = getFilteredArticles();
    renderArticles(filtered);
}

// 🔥 NEW: Generate share buttons HTML
function getShareButtons(article) {
    const url = window.location.href;
    const title = encodeURIComponent(article.title);
    const shareUrl = encodeURIComponent(url);
    
    return `
        <div class="article-share">
            <span class="share-label"><i class="fas fa-share-alt"></i> Share:</span>
            <a href="https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}" target="_blank" rel="noopener" class="share-btn twitter" title="Share on Twitter">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" class="share-btn facebook" title="Share on Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://api.whatsapp.com/send?text=${title}%20${shareUrl}" target="_blank" rel="noopener" class="share-btn whatsapp" title="Share on WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </a>
            <button onclick="copyLink('${shareUrl}')" class="share-btn copy" title="Copy link">
                <i class="fas fa-link"></i>
            </button>
        </div>
    `;
}

// 🔥 NEW: Copy link function
window.copyLink = function(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
            alert('✅ Link copied to clipboard!');
        }).catch(() => {
            fallbackCopy(decodeURIComponent(url));
        });
    } else {
        fallbackCopy(decodeURIComponent(url));
    }
};

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('✅ Link copied to clipboard!');
    } catch (err) {
        alert('❌ Failed to copy. Please copy the URL manually.');
    }
    document.body.removeChild(textArea);
}

function renderArticles(filteredArticles) {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    const total = filteredArticles.length;
    const sliced = filteredArticles.slice(0, displayedCount);
    const loadBtn = document.getElementById('loadMoreBtn');

    if (displayedCount >= total) {
        loadBtn.style.display = 'none';
    } else {
        loadBtn.style.display = 'inline-flex';
    }

    if (sliced.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 0; color:#64748b;">No articles found. Try a different search or category.</div>`;
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
                    ${getShareButtons(a)}
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

// Search input listener
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value;
            displayedCount = 6;
            applyFilters();
        });
    }

    loadAndRender();

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            displayedCount += 6;
            applyFilters();
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
