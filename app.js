// ==========================================================================
// ya924 GitHub Agentic Portfolio - Core Engine (app.js)
// Features: Supabase REST Integration, Three-Tier Graceful Degradation,
//           Debounced Filters, Terminal Typing Logs & Local Cache.
// ==========================================================================

// 1. 靜態預載資料（提供 0 延遲與防限流降級備援，具備高質感繁體中文描述）
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
        description: "🛠 精選 PHP 工具庫與實戰專案演練。包含資料庫連線池、全域異常監控與輕量級緩存模組，旨在加速中大型專案的佈局與開發流程。",
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
const repoGrid = document.getElementById('repo-grid');
const searchInput = document.getElementById('search-input');
const langFilters = document.getElementById('lang-filters');
const sortSelect = document.getElementById('sort-select');
const statRepos = document.getElementById('stat-repos');
const statStars = document.getElementById('stat-stars');
const typingTextEl = document.getElementById('typing-text');
const dbStatusBadge = document.getElementById('db-status-badge');

// 3. 初始化載入
document.addEventListener('DOMContentLoaded', () => {
    // A. 優先加載 LocalStorage 緩存以達成 0 延遲的 WOW 開屏體驗
    const cachedRepos = localStorage.getItem('ya924_repos_premium');
    if (cachedRepos) {
        try {
            allRepos = JSON.parse(cachedRepos);
        } catch (e) {
            console.error("解析快取失敗", e);
            allRepos = [...PRELOADED_REPOS];
        }
    }
    
    // B. 即時初次渲染
    renderRepos();
    updateStats();
    
    // C. 啟動賽博終端日誌動畫 (非同步)
    startTerminalLogging();
    
    // D. 核心任務：Supabase 整合與三層優雅降級資料拉取
    initializeDataFetch();
    
    // E. 綁定事件監聽
    setupEventListeners();
});

// 4. 打字機日誌特效 (Typing logs)
function startTerminalLogging() {
    const phrases = [
        "accessing_neural_network_nodes...",
        "initializing_supabase_handshake.go",
        "syncing_github_repos_table.sql",
        "checking_gravitational_pull: 0G",
        "deploying_autonomous_agent.exe",
        "system_status: OPTIMAL"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingTextEl.innerText = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingTextEl.innerText = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 25 : 50;
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 1600; // 句子輸入完畢停留長一點
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 300;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// 5. 事件監聽器設定 (搜尋、篩選、排序)
function setupEventListeners() {
    // 搜尋輸入 (Debounce 防抖優化)
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderRepos();
        }, 150);
    });

    // 語言膠囊過濾
    langFilters.addEventListener('click', (e) => {
        const capsule = e.target.closest('.capsule');
        if (!capsule) return;
        
        document.querySelectorAll('.capsule').forEach(c => c.classList.remove('active'));
        capsule.classList.add('active');
        
        currentFilter = capsule.dataset.lang;
        renderRepos();
    });

    // 排序下拉選單
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderRepos();
    });
}

// ==========================================================================
// 核心架構：Supabase 整合與三層優雅降級載入機制
// ==========================================================================
async function initializeDataFetch() {
    console.log("[INIT] 啟動多層容錯資料拉取...");
    
    try {
        // 第一步：試圖讀取本地 .env 檔案
        const envResponse = await fetch('.env');
        if (!envResponse.ok) throw new Error("無本地 .env 配置");
        
        const envText = await envResponse.text();
        const env = parseEnv(envText);
        
        if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
            console.log("[SUPABASE] 成功載入憑證，嘗試連線 Supabase...");
            
            // 呼叫 Supabase REST API 拉取資料表
            const reposResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/github_repos?select=*`, {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            
            if (!reposResponse.ok) throw new Error(`Supabase 查詢錯誤 (代碼 ${reposResponse.status})`);
            
            const dbData = await reposResponse.json();
            
            if (Array.isArray(dbData) && dbData.length > 0) {
                // 優化：如果資料庫裡沒有 custom_class，從 Preloaded 匹配補上，保證特殊樣式
                allRepos = dbData.map(dbRepo => {
                    const match = PRELOADED_REPOS.find(p => p.id === dbRepo.id);
                    return {
                        ...dbRepo,
                        custom_class: dbRepo.custom_class || (match ? match.custom_class : '')
                    };
                });
                
                // 快取至 LocalStorage
                localStorage.setItem('ya924_repos_premium', JSON.stringify(allRepos));
                
                // 更新 UI
                dbStatusBadge.innerText = "DATABASE: SUPABASE";
                dbStatusBadge.style.color = "#10B981";
                dbStatusBadge.style.borderColor = "rgba(16, 185, 129, 0.2)";
                dbStatusBadge.style.background = "rgba(16, 185, 129, 0.1)";
                
                renderRepos();
                updateStats();
                console.log("[SUCCESS] 成功從 Supabase 動態同步儲存庫！");
                return; // 任務圓滿達成，提早退出
            } else {
                throw new Error("Supabase 資料表為空");
            }
        } else {
            throw new Error("憑證解析無效");
        }
    } catch (supabaseError) {
        console.warn("[WARN] Supabase 載入失敗（正常降級中）：", supabaseError.message);
        
        // 進入降級第一層：Fetch GitHub API 最新資料
        fetchGitHubApiData();
    }
}

// 解析 .env 文字
function parseEnv(text) {
    const lines = text.split('\n');
    const env = {};
    lines.forEach(line => {
        const clean = line.trim();
        if (clean && !clean.startsWith('#')) {
            const match = clean.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let val = match[2].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                env[key] = val;
            }
        }
    });
    return env;
}

// 降級第一層：直接呼叫 GitHub API
async function fetchGitHubApiData() {
    console.log("[GITHUB] 啟動降級方案 A：Fetch GitHub API...");
    
    try {
        const response = await fetch('https://api.github.com/users/ya924/repos');
        if (!response.ok) throw new Error(`HTTP ${response.status} (可能遭遇限流)`);
        
        const apiData = await response.json();
        
        if (Array.isArray(apiData) && apiData.length > 0) {
            // 合併 API 最新數據與我們的高質感自訂中文描述
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
            
            // 寫入 LocalStorage 快取
            localStorage.setItem('ya924_repos_premium', JSON.stringify(allRepos));
            
            // 更新 UI 狀態
            dbStatusBadge.innerText = "DATABASE: GITHUB API";
            dbStatusBadge.style.color = "#2563EB";
            dbStatusBadge.style.borderColor = "rgba(37, 99, 235, 0.2)";
            dbStatusBadge.style.background = "rgba(37, 99, 235, 0.05)";
            
            renderRepos();
            updateStats();
            console.log("[SUCCESS] 成功從 GitHub API 背景更新！");
        }
    } catch (apiError) {
        console.warn("[WARN] GitHub API 拉取失敗（降級第二層）：", apiError.message);
        
        // 進入降級第二層：採用本地 Cache 與預載資料
        dbStatusBadge.innerText = "DATABASE: LOCAL CACHE";
        dbStatusBadge.style.color = "#64748B";
        dbStatusBadge.style.borderColor = "rgba(100, 116, 139, 0.2)";
        dbStatusBadge.style.background = "rgba(100, 116, 139, 0.05)";
        
        renderRepos();
        updateStats();
    }
}

// 6. 更新數據統計大字型
function updateStats() {
    statRepos.innerText = String(allRepos.length).padStart(2, '0');
    const totalStars = allRepos.reduce((acc, cur) => acc + (cur.stargazers_count || 0), 0);
    statStars.innerText = String(totalStars).padStart(2, '0');
}

// 7. 渲染 Bento Grid 儲存庫卡片
function renderRepos() {
    // A. 條件篩選過濾
    let filtered = allRepos.filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(currentSearch) || 
                              (repo.description && repo.description.toLowerCase().includes(currentSearch)) ||
                              (repo.language && repo.language.toLowerCase().includes(currentSearch));
        
        let matchesLang = true;
        if (currentFilter !== 'all') {
            if (currentFilter === 'other') {
                matchesLang = repo.language !== 'PHP' && repo.language !== 'JavaScript' && repo.language !== 'HTML';
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
        } else { // 預設 pushed 最近更新
            return new Date(b.pushed_at) - new Date(a.pushed_at);
        }
    });

    // C. 寫入 DOM 渲染 HTML
    if (filtered.length === 0) {
        repoGrid.innerHTML = `
            <div class="no-records fade-in">
                <i class="fa-regular fa-folder-open"></i>
                <p style="color: var(--text-secondary); font-size: 1rem; font-weight: 500;">未找到符合條件的儲存庫資料</p>
            </div>
        `;
        return;
    }

    repoGrid.innerHTML = filtered.map((repo, index) => {
        const lang = repo.language || 'HTML';
        const langClass = (lang === 'PHP') ? 'php' : ((lang === 'JavaScript') ? 'js' : ((lang === 'HTML') ? 'html' : 'other'));
        const formattedDate = formatDate(repo.pushed_at);
        
        return `
            <article class="bento-card repo-card ${repo.custom_class || ''} fade-in" style="animation-delay: ${index * 0.08}s;">
                <div class="repo-card-top">
                    <div class="repo-title-row">
                        <a href="${repo.html_url}" target="_blank" class="repo-title-link">${repo.name}</a>
                        <span class="badge-pub">Public</span>
                    </div>
                    <p class="repo-desc">${repo.description || '這個專案很棒，但開發者尚未為它填寫描述。'}</p>
                </div>
                
                <div class="repo-card-meta">
                    <div class="repo-metrics">
                        <span class="metric-item-group lang-indicator">
                            <span class="indicator-dot ${langClass}"></span>
                            <span style="color: var(--text-primary); font-size: 0.8rem;">${lang}</span>
                        </span>
                        
                        <span class="metric-item-group" title="GitHub Stars">
                            <i class="fa-regular fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        
                        <span class="metric-item-group" title="GitHub Forks">
                            <i class="fa-code-branch"></i> ${repo.forks_count || 0}
                        </span>
                    </div>
                    
                    <span class="date-text">
                        更新於 ${formattedDate}
                    </span>
                </div>
            </article>
        `;
    }).join('');
}

// 8. 格式化時間輔助函數
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}
