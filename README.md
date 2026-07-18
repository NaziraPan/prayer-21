<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# prayer-21

一個網站、兩個個人小工具，資料都存在同一個 Firebase 專案（`prayer-21`）的 Firestore：

- `/` — 21天禁食禱告打卡（原本的三人同步打卡）
- `/#/revelations` — **啟示追蹤器**：記錄啟示、分類、標記狀態、搜尋、編輯、刪除

## 本機執行

**Prerequisites:** Node.js 18+

1. 安裝套件：`npm install`
2. 啟動開發伺服器：`npm run dev`（預設 http://localhost:3000）

Firebase 連線設定已寫在 `services/firebaseApp.ts`，兩個工具共用同一個 Firebase 專案、不同的 Firestore collection（`prayer_challenge_2025` 與 `revelations`）。

## 部署到固定網址（Firebase Hosting）

專案已經有 `firebase.json` / `.firebaserc`，指向既有的 `prayer-21` Firebase 專案。第一次部署或之後要更新，只要在你自己的電腦上執行：

```bash
npm install -g firebase-tools   # 只需安裝一次
firebase login                  # 用你的 Google 帳號登入（要跟 Firebase 主控台同一個帳號）
npm install
npm run build
firebase deploy --only hosting,firestore:rules
```

部署完成後，終端機會印出一個固定網址，格式大約是：

```
https://prayer-21.web.app
```

用手機瀏覽器打開這個網址（啟示追蹤器建議直接開 `https://prayer-21.web.app/#/revelations`），點選「加入主畫面」／「Add to Home Screen」，就會變成手機桌面上的一個 App 圖示，之後每次點開都是最新資料，跨裝置、重開機都不會遺失。

之後如果我（Claude）又更新了程式碼，你只需要重複最後三行（`npm install` 可省略，除非有新增套件）：

```bash
npm run build
firebase deploy --only hosting
```

### 關於 Firestore 資料權限

`firestore.rules` 目前設定為「任何持有這組 Firebase 設定的人都可以讀寫」（沒有登入機制），跟原本打卡功能的資料庫權限一致，方便個人使用、不用額外設帳號。因為 `services/firebaseApp.ts` 裡的設定會被打包進公開的網頁程式碼，理論上知道這組設定的人都能存取資料。如果之後想加上密碼或登入保護，可以再告訴我。

第一次執行 `firebase deploy --only firestore:rules` 時，會把這個規則正式部署上去，取代 Firebase 主控台裡「測試模式」預設的 30 天到期規則（到期後所有讀寫會被鎖住），建議一定要跑這一步。
