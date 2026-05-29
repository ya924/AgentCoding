# 🪐 ya924 GitHub Agentic Portfolio

> **基於 Bento Grid 與 Aurora UI 的極致奢華個人儲存庫介紹網頁。**  
> 專為探索 AI Agent、後端微服務與自動化架構的開發者量身打造，具備三層降級容錯加載機制與 Supabase 即時資料庫同步控制台。

---

## 📸 專案亮點

*   **🌌 奢華亮色調美學 (Aurora UI Glow)**：精美的背景流光動畫搭配高透明磨砂玻璃卡片 (Glassmorphism)，懸停處具備微漸層動態邊框。
*   **🍱 Bento Grid 模組化佈局**：
    *   **個人品牌卡 (Profile Card)**：即時連線呈現頭像、狀態、個性化簡介與快速動作按鈕。
    *   **賽博終端日誌 (Terminal Widget)**：非同步迴圈打字特效，模擬 AI Agent 初始化與資料庫交握狀態。
    *   **數據效能看板 (Stats Card)**：動態統計公開儲存庫總數與累積星數。
*   **🛡️ 三階智能容錯加載系統**：
    *   *第一層*：連線讀取 **Supabase REST API** 獲取動態儲存庫資料。
    *   *第二層 (降級 A)*：若無資料庫，直接呼叫 **GitHub API** 即時拉取 `ya924` 的最新公開儲存庫資料，並同步大頭貼與暱稱。
    *   *第三層 (降級 B)*：若遭遇網路限流，自動回退至 **LocalStorage 本地快取**與內建的高質感繁體中文靜態預載資料。
*   **⚡ 高性能資料過濾**：
    *   防抖動優化 (Debounced) 的即時關鍵字搜尋。
    *   程式語言膠囊篩選器（PHP 核心、JS 代理、HTML、其他技術）。
    *   多元排序機制（最近推送、最多星數、字母排序）。
*   **🔌 一鍵同步控制台 (`sync.html`)**：內建 Supabase 連線憑證自動偵測、一鍵 Upsert 儲存庫資料，並提供專屬建表 SQL Schema。

---

## 📁 專案目錄結構

```text
c:\Users\administrtor\Desktop\Github_web\
├── .agents/                 # AI 代理相關配置檔
├── ui-ux-pro-max-skill/      # UI-UX 進階設計資源
├── index.html                # 核心入口網頁 (Bento Portfolio)
├── style.css                 # 頂級 Aurora UI 樣式系統 (HSL 設計系統)
├── app.js                    # 核心加載引擎 (包含三層容錯與動態過濾)
├── sync.html                 # Supabase 資料庫一鍵同步主控台
├── .env.example              # Supabase 憑證範本檔
├── .gitignore                # Git 忽略檔案設定
└── README.md                 # 專案繁體中文說明文件 (本檔案)
```

---

## 🚀 本地開發與快速部署

### 1. 本地直接執行 (0 延遲體驗)
由於本專案完全基於純 HTML、CSS 與 JavaScript 構建，您不需要安裝任何複雜的開發依賴。
*   直接雙擊 **`index.html`** 即可在瀏覽器中開啟並開始體驗。
*   頁面會自動呼叫 GitHub API 拉取最新資料並呈現精美的骨架屏 (Skeleton Screen) 載入動畫。

### 2. 同步您的 Supabase 資料庫
1. 前往您的 Supabase 後台，點擊 **SQL Editor**。
2. 貼上並執行 `sync.html` 中為您產生的 SQL 語法建立 `github_repos` 資料表與 RLS 權限。
3. 開啟 **`sync.html`**，若本地存在 `.env` 檔案將會自動偵測；您亦可手動輸入您的 **Project URL** 與 **Anon Key**。
4. 點擊 **「開始同步儲存庫資料」**，系統將在數秒內將您的儲存庫元數據 Upsert 至資料庫中。
5. 成功後，首頁的連接狀態將會轉為閃爍綠燈的 `DATABASE: SUPABASE`！

### 3. 部署至 GitHub Pages
1. 將本專案推送至 GitHub 的 `AgentCoding` 儲存庫。
2. 開啟儲存庫的 **Settings** -> **Pages**。
3. 在 **Branch** 選擇 **`main`**，路徑選擇 **`/ (root)`**，點擊 **Save**。
4. 稍等數分鐘，即可透過 `https://ya924.github.io/AgentCoding/` 訪問您的奢華首頁！

---

## 🛠 系統技術棧
*   **Markup**: HTML5 Semantic Layout
*   **Styling**: Vanilla CSS3 + HSL Design Tokens + Custom CSS Keyframe Animations
*   **Interactions**: Vanilla Modern ES6+ JavaScript
*   **Icons & Fonts**: FontAwesome v6.4.0, Google Fonts (Outfit, Inter, Fira Code)
*   **Database**: Supabase PostgREST API

---

*🪐 Developed with passion by ya924 & Antigravity AI Agent in 2026.*
