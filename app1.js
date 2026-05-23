// ==========================================
// ya924 // Terminal Portfolio - 核心腳本 (app1.js)
// Theme: Cyberpunk & Retro-Futurism Pro Max
// ==========================================

// 1. 靜態預載資料（提供 0 延遲與防限流降級備援）
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
        custom_class: "cyber-agent" // 特殊專案類名
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
        custom_class: "cyber-agent"
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

// 2. DOM 元素
const cyberGrid = document.getElementById('cyber-grid');
const cyberSearch = document.getElementById('cyber-search');
const cyberFilters = document.getElementById('cyber-filters');
const cyberSortSelect = document.getElementById('cyber-sort-select');
const statRepos = document.getElementById('stat-repos');
const statStars = document.getElementById('stat-stars');
const typingTextEl = document.getElementById('typing-text');

// 3. 初始化載入
document.addEventListener('DOMContentLoaded', () => {
    // A. 讀取 LocalStorage 快取
    const cachedRepos = localStorage.getItem('ya924_repos');
    if (cachedRepos) {
        try {
            allRepos = JSON.parse(cachedRepos);
        } catch (e) {
            console.error("解析 LocalStorage 快取失敗，回退到預載資料", e);
            allRepos = [...PRELOADED_REPOS];
        }
    }
    
    // B. 即時渲染
    renderRepos();
    updateStats();
    
    // C. 啟動賽博終端打字特效
    startTerminalTyping();
    
    // D. 背景 Fetch 最新 API 數據
    fetchLatestGitHubData();
    
    // E. 監聽器設定
    setupEventListeners();
});

// 4. 打字機動畫 (Typing Effect)
function startTerminalTyping() {
    const phrases = [
        "initializing_agentic_protocols.sh",
        "accessing_neural_network_nodes...",
        "compiling backend_service_framework.php",
        "deploying autonomous_coding_agent.exe",
        "gravitational_limits: DISABLED."
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            // 刪除字元
            typingTextEl.innerText = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // 輸入字元
            typingTextEl.innerText = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 30 : 60;
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            // 輸入完畢，停留片刻後開始刪除
            typeSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // 刪除完畢，進入下一句
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// 5. 事件監聽
function setupEventListeners() {
    // 搜尋功能
    let debounceTimer;
    cyberSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderRepos();
        }, 150);
    });

    // 語言篩選
    cyberFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.cyber-filter-btn');
        if (!btn) return;
        
        document.querySelectorAll('.cyber-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.lang;
        renderRepos();
    });

    // 排序
    cyberSortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderRepos();
    });
}

// 6. 異步獲取 GitHub 數據
async function fetchLatestGitHubData() {
    try {
        const response = await fetch('https://api.github.com/users/ya924/repos');
        if (!response.ok) throw new Error(`狀態碼: ${response.status}`);
        const apiData = await response.json();
        
        if (Array.isArray(apiData) && apiData.length > 0) {
            allRepos = PRELOADED_REPOS.map(preloaded => {
                const apiRepo = apiData.find(r => r.id === preloaded.id);
                if (apiRepo) {
                    return {
                        ...preloaded,
                        stargazers_count: apiRepo.stargazers_count,
                        forks_count: apiRepo.forks_count,
                        pushed_at: apiRepo.pushed_at,
                        description: apiRepo.description || preloaded.description,
                        language: apiRepo.language || preloaded.language
                    };
                }
                return preloaded;
            });
            
            // 快取
            localStorage.setItem('ya924_repos', JSON.stringify(allRepos));
            
            renderRepos();
            updateStats();
        }
    } catch (error) {
        console.warn("GitHub API 取得失敗，優雅降級展示快取資料:", error.message);
    }
}

// 7. 更新統計數據
function updateStats() {
    statRepos.innerText = String(allRepos.length).padStart(2, '0');
    const totalStars = allRepos.reduce((acc, cur) => acc + (cur.stargazers_count || 0), 0);
    statStars.innerText = String(totalStars).padStart(2, '0');
}

// 8. 渲染函數
function renderRepos() {
    let filtered = allRepos.filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(currentSearch) || 
                              repo.description.toLowerCase().includes(currentSearch);
        
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

    filtered.sort((a, b) => {
        if (currentSort === 'stars') {
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        } else if (currentSort === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return new Date(b.pushed_at) - new Date(a.pushed_at);
        }
    });

    if (filtered.length === 0) {
        cyberGrid.innerHTML = `
            <div class="terminal-loading fade-in-cyber">
                <span class="loading-prompt" style="color: var(--neon-pink);">[ ERR_NO_RECORDS_FOUND ]</span>
            </div>
        `;
        return;
    }

    cyberGrid.innerHTML = filtered.map((repo, index) => {
        const langClass = (repo.language === 'PHP') ? 'php' : ((repo.language === 'JavaScript') ? 'js' : 'other');
        const formattedDate = formatDate(repo.pushed_at);
        
        return `
            <article class="terminal-card ${repo.custom_class || ''} fade-in-cyber" style="animation-delay: ${index * 0.08}s;">
                <div class="card-header">
                    <span class="sys-prompt">root@ya924:~/${repo.name}$</span>
                    <span>STABLE_BUILD</span>
                </div>
                
                <div class="card-body">
                    <div class="card-title-row">
                        <a href="${repo.html_url}" target="_blank" class="cyber-card-title">${repo.name}</a>
                        <span class="cyber-lang-tag">${repo.language || 'HTML'}</span>
                    </div>
                    <p class="cyber-card-desc">${repo.description}</p>
                </div>
                
                <div class="card-footer">
                    <div class="card-metrics">
                        <span class="card-metric-item lang-item ${langClass}">
                            <i class="fa-solid fa-square-rss"></i> ${repo.language || 'HTML'}
                        </span>
                        <span class="card-metric-item" title="Stars count">
                            <i class="fa-solid fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span class="card-metric-item" title="Forks count">
                            <i class="fa-solid fa-code-branch"></i> ${repo.forks_count || 0}
                        </span>
                    </div>
                    
                    <a href="${repo.html_url}" target="_blank" class="card-link" title="Open repository">
                        <i class="fa-solid fa-terminal"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
