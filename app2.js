const GITHUB_USERNAME = 'ya924';
const API_BASE = 'https://api.github.com/users';

const repoGrid = document.getElementById('repo-grid');
const searchInput = document.getElementById('search-input');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userBio = document.getElementById('user-bio');
const repoCount = document.getElementById('repo-count');
const followersCount = document.getElementById('followers-count');

let allRepos = [];

// 定義語言顏色
const languageColors = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'TypeScript': '#3178c6',
    'Java': '#b07219',
    'C#': '#178600',
    'C++': '#f34b7d',
    'PHP': '#4F5D95',
    'Vue': '#41b883',
    'React': '#61dafb'
};

function getLanguageColor(lang) {
    return languageColors[lang] || '#94a3b8'; // 預設淺灰色
}

// 初始化
async function init() {
    renderSkeletons();
    try {
        await Promise.all([fetchUserProfile(), fetchRepositories()]);
    } catch (error) {
        console.error('Data initialization failed:', error);
        repoGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p>Failed to load data. Please check your network connection or API limits.</p>
            </div>
        `;
    }
}

// 取得使用者資料
async function fetchUserProfile() {
    const res = await fetch(`${API_BASE}/${GITHUB_USERNAME}`);
    if (!res.ok) throw new Error('User fetch error');
    const user = await res.json();
    
    userAvatar.src = user.avatar_url;
    userName.textContent = user.name || user.login;
    userBio.textContent = user.bio || 'Software Developer & Open Source Enthusiast';
    repoCount.textContent = user.public_repos;
    followersCount.textContent = user.followers;
}

// 取得 Repo 資料
async function fetchRepositories() {
    const res = await fetch(`${API_BASE}/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error('Repos fetch error');
    const repos = await res.json();
    
    // 過濾掉 fork 的專案 (可依需求決定)
    allRepos = repos.filter(repo => !repo.fork);
    renderRepos(allRepos);
}

// 產生骨架屏
function renderSkeletons() {
    repoGrid.innerHTML = Array(6).fill('').map(() => `
        <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
            <div class="skeleton-desc short"></div>
        </div>
    `).join('');
}

// 渲染 Repo 卡片
function renderRepos(repos) {
    repoGrid.innerHTML = '';
    
    if (repos.length === 0) {
        repoGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">
                <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem; color: var(--border-color);"></i>
                <p>No repositories found.</p>
            </div>
        `;
        return;
    }

    repos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';
        
        const langColor = getLanguageColor(repo.language);
        const description = repo.description || 'No description provided for this repository.';
        
        // 處理 topics
        const topicsHtml = (repo.topics || []).slice(0, 3).map(topic => 
            `<span class="topic-tag">${topic}</span>`
        ).join('');

        card.innerHTML = `
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" class="repo-title">
                    <i class="fa-solid fa-book-bookmark text-primary"></i>
                    ${repo.name}
                </a>
                <span class="visibility-badge">${repo.visibility}</span>
            </div>
            <p class="repo-desc">${description}</p>
            
            <div class="repo-meta">
                ${repo.language ? `
                <div class="meta-item">
                    <span class="language-dot" style="background-color: ${langColor}"></span>
                    <span>${repo.language}</span>
                </div>` : ''}
                
                <div class="meta-item" title="Stars">
                    <i class="fa-regular fa-star"></i>
                    <span>${repo.stargazers_count}</span>
                </div>
                
                <div class="meta-item" title="Forks">
                    <i class="fa-solid fa-code-branch"></i>
                    <span>${repo.forks_count}</span>
                </div>
                
                <div class="meta-item" title="Last Updated">
                    <i class="fa-regular fa-clock"></i>
                    <span>${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
            
            ${topicsHtml ? `<div class="repo-topics">${topicsHtml}</div>` : ''}
        `;
        repoGrid.appendChild(card);
    });
}

// 搜尋功能
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allRepos.filter(repo => 
        repo.name.toLowerCase().includes(term) || 
        (repo.description && repo.description.toLowerCase().includes(term))
    );
    renderRepos(filtered);
});

// 啟動
document.addEventListener('DOMContentLoaded', init);
