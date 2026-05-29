// ==========================================================================
// ya924 // Terminal Portfolio - Core Engine (app1.js)
// Theme: Cyberpunk & Retro-Futurism Pro Max V3.0
// Features: Canvas Matrix Rain, Memory CRT Toggle, GitHub API Dynamic Sync,
//           Progressive Skill Bar Animation, Debounced Filters, Terminal Typing.
// ==========================================================================

// 1. 靜態預載資料 (提供 0 延遲與防限流降級備援，具備代碼行數貢獻比例)
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
        custom_class: "cyber-agent",
        progress: 95 // 模擬技術貢獻比例 (%)
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
        custom_class: "cyber-agent",
        progress: 88
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
        custom_class: "",
        progress: 80
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
        custom_class: "",
        progress: 75
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
const crtToggleBtn = document.getElementById('crt-toggle-btn');
const coreLoadEl = document.getElementById('core-load');

// 3. 初始化載入
document.addEventListener('DOMContentLoaded', () => {
    // A. 初始化 CRT 濾鏡記憶狀態
    initCrtFilterState();

    // B. 啟動 Canvas Matrix 數碼雨
    initMatrixCanvas();
    
    // C. 讀取 LocalStorage 快取以達成閃電開屏
    const cachedRepos = localStorage.getItem('ya924_repos_cyber');
    if (cachedRepos) {
        try {
            allRepos = JSON.parse(cachedRepos);
        } catch (e) {
            console.error("解析快取失敗", e);
            allRepos = [...PRELOADED_REPOS];
        }
    }
    
    // D. 即時初次渲染
    renderRepos();
    updateStats();
    
    // E. 啟動終端打字特效
    startTerminalTyping();
    
    // F. 異步獲取最新的 GitHub 資料進行動態同步與更新
    fetchLatestGitHubData();
    
    // G. 綁定事件監聽
    setupEventListeners();
});

// ==========================================================================
// 4. HTML5 Canvas Matrix 數碼雨渲染邏輯
// ==========================================================================
function initMatrixCanvas() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 設定寬高適應視窗
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 數碼字元集
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabet = katakana.split('');
    
    const fontSize = 16;
    let columns = canvas.width / fontSize;
    
    // 滴落雨滴陣列
    let rainDrops = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }
    
    // 定時 resize columns 確保響應式
    window.addEventListener('resize', () => {
        columns = canvas.width / fontSize;
        for (let x = rainDrops.length; x < columns; x++) {
            rainDrops[x] = 1;
        }
    });

    // 繪製動畫
    function draw() {
        // 設定半透明背景以產生拖尾效果
        ctx.fillStyle = 'rgba(6, 7, 10, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
            // 隨機獲取字元
            const text = alphabet[Math.floor(Math.random() * alphabet.length)];
            
            // 隨機霓虹青綠色系
            const randomVal = Math.random();
            if (randomVal > 0.95) {
                ctx.fillStyle = '#ffffff'; // 白色亮點
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ffffff';
            } else if (randomVal > 0.4) {
                ctx.fillStyle = '#00f0ff'; // 青色
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#00f0ff';
            } else {
                ctx.fillStyle = '#39ff14'; // 賽博綠
                ctx.shadowBlur = 2;
                ctx.shadowColor = '#39ff14';
            }
            
            const x = i * fontSize;
            const y = rainDrops[i] * fontSize;
            
            ctx.fillText(text, x, y);
            
            // 關閉陰影以提升繪圖效能
            ctx.shadowBlur = 0;
            
            // 雨滴落到螢幕底部或隨機重設位置
            if (y > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }
    
    setInterval(draw, 33); // 穩定的 ~30fps 節能渲染，不霸占系統 CPU
}

// ==========================================================================
// 5. CRT 濾鏡互動式記憶切換
// ==========================================================================
function initCrtFilterState() {
    const isCrtDisabled = localStorage.getItem('ya924_crt_disabled') === 'true';
    if (isCrtDisabled) {
        document.body.classList.add('crt-disabled');
        crtToggleBtn.innerHTML = '<span class="btn-glow-dot"></span> [ CRT_FILTER: DISABLED ]';
    } else {
        document.body.classList.remove('crt-disabled');
        crtToggleBtn.innerHTML = '<span class="btn-glow-dot"></span> [ CRT_FILTER: ACTIVE ]';
    }
    
    crtToggleBtn.addEventListener('click', () => {
        const currentlyDisabled = document.body.classList.toggle('crt-disabled');
        localStorage.setItem('ya924_crt_disabled', currentlyDisabled ? 'true' : 'false');
        
        if (currentlyDisabled) {
            crtToggleBtn.innerHTML = '<span class="btn-glow-dot"></span> [ CRT_FILTER: DISABLED ]';
        } else {
            crtToggleBtn.innerHTML = '<span class="btn-glow-dot"></span> [ CRT_FILTER: ACTIVE ]';
        }
    });
}

// ==========================================================================
// 6. 賽博終端打字特效
// ==========================================================================
function startTerminalTyping() {
    const phrases = [
        "initializing_agentic_protocols.sh",
        "accessing_neural_network_nodes...",
        "compiling_backend_service_framework.php",
        "deploying_autonomous_ai_agents.exe",
        "gravitational_limits: DISABLED."
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
        
        let typeSpeed = isDeleting ? 25 : 55;
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 1600; // 停留
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

// ==========================================================================
// 7. 異步獲取與更新 GitHub 數據
// ==========================================================================
async function fetchLatestGitHubData() {
    try {
        const response = await fetch('https://api.github.com/users/ya924/repos');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const apiData = await response.json();
        
        if (Array.isArray(apiData) && apiData.length > 0) {
            // 合併 API 最新數據與預載的代碼貢獻進度
            allRepos = PRELOADED_REPOS.map(preloaded => {
                const apiRepo = apiData.find(r => r.name.toLowerCase() === preloaded.name.toLowerCase());
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
            
            // 同步快取至 LocalStorage
            localStorage.setItem('ya924_repos_cyber', JSON.stringify(allRepos));
            
            renderRepos();
            updateStats();
        }
    } catch (error) {
        console.warn("[WARN] GitHub API 取得失敗，優雅降級展示快取資料:", error.message);
    }
}

// 8. 更新統計看板
function updateStats() {
    statRepos.innerText = String(allRepos.length).padStart(2, '0');
    const totalStars = allRepos.reduce((acc, cur) => acc + (cur.stargazers_count || 0), 0);
    statStars.innerText = String(totalStars).padStart(2, '0');
    
    // 依據星數動態計算 CPU 載荷 (G)
    const loadG = (0.02 + totalStars * 0.005).toFixed(3);
    coreLoadEl.innerText = `${loadG}G`;
}

// ==========================================================================
// 9. 事件監聽器 (搜尋、篩選、排序)
// ==========================================================================
function setupEventListeners() {
    // 搜尋功能 (Debounce 防抖)
    let debounceTimer;
    cyberSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderRepos();
        }, 150);
    });

    // 語言膠囊篩選
    cyberFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.cyber-filter-btn');
        if (!btn) return;
        
        document.querySelectorAll('.cyber-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.lang;
        renderRepos();
    });

    // 排序下拉選單
    cyberSortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderRepos();
    });
}

// ==========================================================================
// 10. 渲染 Bento Grid 儲存庫卡片
// ==========================================================================
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
        } else {
            return new Date(b.pushed_at) - new Date(a.pushed_at);
        }
    });

    // C. 寫入 DOM 渲染 HTML
    if (filtered.length === 0) {
        cyberGrid.innerHTML = `
            <div class="terminal-loading fade-in-cyber" style="grid-column: 1/-1;">
                <span class="loading-prompt" style="color: var(--neon-pink);"><i class="fa-solid fa-triangle-exclamation"></i> [ ERR_NO_RECORDS_FOUND_IN_SYSTEM ]</span>
            </div>
        `;
        return;
    }

    cyberGrid.innerHTML = filtered.map((repo, index) => {
        const lang = repo.language || 'HTML';
        const langClass = (lang === 'PHP') ? 'php' : ((lang === 'JavaScript') ? 'js' : 'other');
        const formattedDate = formatDate(repo.pushed_at);
        
        return `
            <article class="terminal-card ${repo.custom_class || ''} fade-in-cyber" style="animation-delay: ${index * 0.06}s;">
                <div class="card-header">
                    <span class="sys-prompt">root@ya924:~/${repo.name}$</span>
                    <span>STABLE_BUILD</span>
                </div>
                
                <div class="card-body">
                    <div class="card-title-row">
                        <a href="${repo.html_url}" target="_blank" class="cyber-card-title">${repo.name}</a>
                        <span class="cyber-lang-tag">${lang}</span>
                    </div>
                    <p class="cyber-card-desc">${repo.description || '這個專案很棒，但開發者尚未為它填寫描述。'}</p>
                    
                    <!-- 代碼儲存庫貢獻進度條 (ui-ux-pro-max 亮點) -->
                    <div class="repo-progress-container">
                        <div class="repo-progress-label">
                            <span>CODEBASE_RATIO</span>
                            <span>${repo.progress || 80}%</span>
                        </div>
                        <div class="repo-progress-bar">
                            <div class="repo-progress-fill" data-progress="${repo.progress || 80}"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="card-metrics">
                        <span class="card-metric-item lang-item ${langClass}">
                            <i class="fa-solid fa-code-branch"></i> ${lang}
                        </span>
                        <span class="card-metric-item" title="Stars count">
                            <i class="fa-solid fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span class="card-metric-item" title="Forks count">
                            <i class="fa-solid fa-circle-nodes"></i> ${repo.forks_count || 0}
                        </span>
                    </div>
                    
                    <a href="${repo.html_url}" target="_blank" class="card-link" title="Open repository in terminal">
                        <i class="fa-solid fa-terminal"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');

    // D. 觸發進度條寬度動態動畫 (0ms -> Target% 緩動)
    requestAnimationFrame(() => {
        setTimeout(() => {
            const fills = document.querySelectorAll('.repo-progress-fill');
            fills.forEach(fill => {
                const targetWidth = fill.dataset.progress;
                fill.style.width = `${targetWidth}%`;
            });
        }, 120);
    });
}

// 格式化日期輔助函數
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
