// ==========================================
// ya924 GitHub Portfolio - 核心腳本
// ==========================================

// 1. 靜態預載資料（提供 0 延遲載入與 API Rate Limit 備援）
// 針對 null 描述進行繁體中文高質感客製
const PRELOADED_REPOS = [
    {
        id: 1247552729,
        name: "AgentCoding",
        full_name: "ya924/AgentCoding",
        html_url: "https://github.com/ya924/AgentCoding",
        description: "🚀 自動化 AI 協作開發的旗艦級實踐。利用先進的 AI 代理進行代碼自主編寫、除錯與持續部署。本個人介紹網頁即是此專案的經典首發實作！",
        language: "HTML",
        stargazers_count: 0,
        forks_count: 0,
        pushed_at: "2026-05-23T13:21:15Z",
        custom_class: "agent-coding"
    },
    {
        id: 1218108294,
        name: "Agentic-Coding",
        full_name: "ya924/Agentic-Coding",
        html_url: "https://github.com/ya924/Agentic-Coding",
        description: "🤖 探索基於 AI Agent 的自主編程框架。結合大語言模型與強大工具鏈，實現自動化分析需求、修復 Bug 及全自動代碼生成的尖端架構。",
        language: "JavaScript",
        stargazers_count: 0,
        forks_count: 0,
        pushed_at: "2026-04-24T06:21:08Z",
        custom_class: "agent-coding"
    },
    {
        id: 966092049,
        name: "php",
        full_name: "ya924/php",
        html_url: "https://github.com/ya924/php",
        description: "🐘 PHP 後端開發核心模組與高可用架構實踐。包含 OOP 封裝、MVC 設計模式應用、Restful API 開發模組與安全性防禦機制。",
        language: "PHP",
        stargazers_count: 0,
        forks_count: 0,
        pushed_at: "2025-04-14T12:07:40Z",
        custom_class: ""
    },
    {
        id: 995194973,
        name: "PHP_-",
        full_name: "ya924/PHP_-",
        html_url: "https://github.com/ya924/PHP_-",
        description: "🛠 精選 PHP 工具庫與實戰專案演練。整合資料庫連線池、全域異常監控與輕量級緩存模組，旨在加速中大型專案的佈局與開發流程。",
        language: "PHP",
        stargazers_count: 0,
        forks_count: 0,
        pushed_at: "2025-06-03T11:51:03Z",
        custom_class: ""
    }
];

let allRepos = [...PRELOADED_REPOS];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'pushed';

// 2. DOM 元素獲取
const repoGrid = document.getElementById('repo-grid');
const searchInput = document.getElementById('search-input');
const langFilters = document.getElementById('lang-filters');
const sortSelect = document.getElementById('sort-select');
const statRepos = document.getElementById('stat-repos');
const statStars = document.getElementById('stat-stars');

// 3. 初始化載入
document.addEventListener('DOMContentLoaded', () => {
    // A. 優先從 LocalStorage 載入快取資料，若無則使用靜態預載資料
    const cachedRepos = localStorage.getItem('ya924_repos');
    if (cachedRepos) {
        try {
            allRepos = JSON.parse(cachedRepos);
        } catch (e) {
            console.error("解析 LocalStorage 快取失敗，回退到預載資料", e);
            allRepos = [...PRELOADED_REPOS];
        }
    }
    
    // B. 即刻渲染首屏（達成 0 延遲 WOW 體驗）
    renderRepos();
    updateStats();
    
    // C. 背景非同步向 GitHub API 獲取最新狀態
    fetchLatestGitHubData();
    
    // D. 綁定事件監聽器
    setupEventListeners();
});

// 4. 事件監聽器設定
function setupEventListeners() {
    // 搜尋輸入監聽（防抖優化）
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderRepos();
        }, 150);
    });

    // 語言篩選按鈕監聽
    langFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        
        // 切換 Active 狀態
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.lang;
        renderRepos();
    });

    // 排序選擇監聽
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderRepos();
    });
}

// 5. 異步獲取 GitHub 最新數據
async function fetchLatestGitHubData() {
    try {
        const response = await fetch('https://api.github.com/users/ya924/repos');
        if (!response.ok) throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        
        const apiData = await response.json();
        
        if (Array.isArray(apiData) && apiData.length > 0) {
            // 合併 API 最新數據與我們的高質感繁體中文描述
            allRepos = PRELOADED_REPOS.map(preloaded => {
                const apiRepo = apiData.find(r => r.id === preloaded.id);
                if (apiRepo) {
                    return {
                        ...preloaded,
                        stargazers_count: apiRepo.stargazers_count,
                        forks_count: apiRepo.forks_count,
                        pushed_at: apiRepo.pushed_at,
                        // 如果 API 有了新描述就用 API 的，否則維持高質感的自訂中文描述
                        description: apiRepo.description || preloaded.description,
                        language: apiRepo.language || preloaded.language
                    };
                }
                return preloaded;
            });
            
            // 寫入 LocalStorage 快取，便於下次即時載入
            localStorage.setItem('ya924_repos', JSON.stringify(allRepos));
            
            // 重新渲染與更新統計
            renderRepos();
            updateStats();
            console.log("GitHub API 資料背景更新成功！");
        }
    } catch (error) {
        console.warn("無法取得 GitHub 最新數據（可能遭遇 Rate Limit 或離線）：", error.message);
        // 優雅降級：由於我們已經展示了預載/快取資料，使用者體驗完全不受影響
    }
}

// 6. 更新統計數字
function updateStats() {
    statRepos.innerText = allRepos.length;
    const totalStars = allRepos.reduce((acc, cur) => acc + (cur.stargazers_count || 0), 0);
    statStars.innerText = totalStars;
}

// 7. 渲染儲存庫清單
function renderRepos() {
    // A. 過濾邏輯
    let filtered = allRepos.filter(repo => {
        // 搜尋匹配 (名稱或描述)
        const matchesSearch = repo.name.toLowerCase().includes(currentSearch) || 
                              repo.description.toLowerCase().includes(currentSearch);
        
        // 語言篩選
        let matchesLang = true;
        if (currentFilter !== 'all') {
            if (currentFilter === 'other') {
                matchesLang = repo.language !== 'PHP' && repo.language !== 'JavaScript';
            } else {
                matchesLang = repo.language === currentFilter;
            }
        }
        
        return matchesSearch && matchesLang;
    });

    // B. 排序邏輯
    filtered.sort((a, b) => {
        if (currentSort === 'stars') {
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        } else if (currentSort === 'name') {
            return a.name.localeCompare(b.name);
        } else { // default: pushed 最近更新
            return new Date(b.pushed_at) - new Date(a.pushed_at);
        }
    });

    // C. 渲染 HTML
    if (filtered.length === 0) {
        repoGrid.innerHTML = `
            <div class="no-results fade-in">
                <i class="fa-regular fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">沒有找到符合篩選條件的儲存庫</p>
            </div>
        `;
        return;
    }

    repoGrid.innerHTML = filtered.map((repo, index) => {
        const langClass = (repo.language === 'PHP') ? 'php' : ((repo.language === 'JavaScript') ? 'js' : 'other');
        const formattedDate = formatDate(repo.pushed_at);
        
        return `
            <article class="repo-card ${repo.custom_class || ''} fade-in" style="animation-delay: ${index * 0.1}s;">
                <div class="repo-card-top">
                    <div class="repo-title-wrapper">
                        <a href="${repo.html_url}" target="_blank" class="repo-title">${repo.name}</a>
                        <span class="repo-badge">Public</span>
                    </div>
                    <p class="repo-desc">${repo.description}</p>
                </div>
                
                <div class="repo-meta">
                    <div class="repo-metrics">
                        <span class="lang-indicator">
                            <span class="lang-dot ${langClass}"></span>
                            <span style="color: var(--text-primary); font-size: 0.85rem;">${repo.language || 'HTML'}</span>
                        </span>
                        
                        <span class="metric-item" title="Stars">
                            <i class="fa-regular fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        
                        <span class="metric-item" title="Forks">
                            <i class="fa-code-branch"></i> ${repo.forks_count || 0}
                        </span>
                    </div>
                    
                    <span style="font-size: 0.8rem; color: var(--text-muted);">
                        更新於 ${formattedDate}
                    </span>
                </div>
            </article>
        `;
    }).join('');
}

// 8. 格式化時間
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
