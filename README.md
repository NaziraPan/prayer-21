<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# prayer-21

一個 Firebase 專案，底下有**兩個完全獨立的網站**（各自有自己的固定網址，互相看不到對方的存在），資料都存在同一個 Firebase 專案的 Firestore，但用不同的 collection：

- **21天禁食禱告打卡**（原本的三人同步打卡）— 既有網址 `prayer-21.web.app`
- **啟示追蹤器**（記錄啟示、分類、標記狀態、搜尋、編輯、刪除）— 新建立的獨立網址，你自己取名字

## 本機執行

**Prerequisites:** Node.js 18+

1. 安裝套件：`npm install`
2. 啟動開發伺服器：`npm run dev`（預設 http://localhost:3000，打卡首頁在 `/`，啟示追蹤器在 `/revelations`，本機開發時兩者共用同一個 dev server 方便測試）

Firebase 連線設定已寫在 `services/firebaseApp.ts`，兩個工具共用同一個 Firebase 專案、不同的 Firestore collection（`prayer_challenge_2025` 與 `revelations`）。

## 部署到固定網址（Firebase Hosting，兩個獨立網站）

專案用 Firebase Hosting 的「一個專案、多個網站」功能：打卡工具維持原本的 `prayer-21.web.app`，啟示追蹤器另外建立一個全新、獨立的網址（不會出現「prayer-21」字樣，也完全看不到打卡工具的任何連結）。

### 第一次設定（只需做一次）

```bash
npm install -g firebase-tools   # 只需安裝一次
firebase login                  # 用你的 Google 帳號登入
```

建立啟示追蹤器專屬的 Hosting 網站，`<你想要的名稱>` 自己取一個喜歡的英文/數字名稱（例如 `nazira-revelations`），這會變成網址的一部分，且必須是全世界唯一（如果顯示已被使用，換一個名稱重試即可）：

```bash
firebase hosting:sites:create <你想要的名稱>
```

接著把這兩個網站分別綁定到 `firebase.json` 裡的兩個 target 名稱（`checkin` 是既有的打卡工具，`revelations` 是新的啟示追蹤器）：

```bash
firebase target:apply hosting checkin prayer-21
firebase target:apply hosting revelations <你剛剛取的名稱>
```

這兩行指令會把設定寫進 `.firebaserc`，之後可以考慮把這個檔案的變動也 commit 起來，這樣以後就不用重打這兩行。

### 之後每次部署（含第一次）

```bash
npm install
npm run build
firebase deploy --only hosting,firestore:rules
```

跑完後終端機會印出兩個網址，例如：

```
✔ Deploy complete!
Hosting URL (checkin): https://prayer-21.web.app
Hosting URL (revelations): https://<你取的名稱>.web.app
```

啟示追蹤器就是那個新網址，直接打開就是完整的追蹤器介面（不是打卡工具）。用手機瀏覽器打開後點「加入主畫面」／「Add to Home Screen」，就會變成手機桌面上一個獨立的 App 圖示，圖示是油燈、名稱是「啟示追蹤器」，跟打卡工具完全無關。

之後我（Claude）如果又更新了程式碼，你只需要重複最後三行：

```bash
npm run build
firebase deploy --only hosting
```

### 關於 Firestore 資料權限

`firestore.rules` 目前設定為「任何持有這組 Firebase 設定的人都可以讀寫」（沒有登入機制），方便個人使用、不用額外設帳號。因為 `services/firebaseApp.ts` 裡的設定會被打包進公開的網頁程式碼，理論上知道這組設定的人都能存取資料。如果之後想加上密碼或登入保護，可以再告訴我。

第一次執行 `firebase deploy --only firestore:rules` 時，會把這個規則正式部署上去，取代 Firebase 主控台裡「測試模式」預設的 30 天到期規則（到期後所有讀寫會被鎖住），建議一定要跑這一步。

### 為什麼一開始打開啟示追蹤器是空的？

啟示追蹤器接的是全新、真正的資料庫，第一次打開本來就是空的——這正是換掉舊版 Claude Artifact 工具的原因（那個版本資料只存在瀏覽器暫存裡，重開或清快取就會不見）。舊工具裡已經寫下的內容不會自動搬過來，需要手動用「新增啟示」重新輸入一次；輸入之後就會永久保存、跨裝置都看得到。
