# Chat Web - React 前端

這是 Chat Gateway 的現代化 React 前端，使用最新技術棧重構。

## 🚀 技術棧

- **React 18** - 最新的 React 版本
- **TypeScript** - 類型安全
- **Vite** - 極速的建置工具
- **Zustand** - 輕量級狀態管理
- **Axios** - HTTP 客戶端
- **DOMPurify** - XSS 防護
- **date-fns** - 日期處理

## 📁 專案結構

```
src/
├── api/              # API 客戶端
│   ├── http.ts       # HTTP 配置
│   └── chat.ts       # 聊天 API
├── components/       # React 組件
│   ├── chat/         # 聊天相關組件
│   └── common/       # 共用組件
├── hooks/            # 自定義 Hooks
│   └── useSSE.ts     # SSE 連接 Hook
├── store/            # 狀態管理
│   └── chatStore.ts  # 聊天狀態
├── types/            # TypeScript 類型
│   └── index.ts      # 類型定義
├── utils/            # 工具函數
│   ├── sanitize.ts   # XSS 防護
│   ├── validation.ts # 輸入驗證
│   └── formatters.ts # 格式化工具
└── App.tsx           # 主應用組件
```

## 🔧 開發

### 安裝依賴
```bash
npm install
```

### 啟動開發服務器
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

## 🔒 安全特性

- ✅ XSS 防護 (DOMPurify)
- ✅ 輸入驗證和清理
- ✅ CSRF 保護 (未來整合)
- ✅ 類型安全 (TypeScript)
- ✅ 環境變數配置
- ✅ HTTP 攔截器 (認證和錯誤處理)

## 📝 下一步

還需要創建以下組件：

1. **ChatList.tsx** - 聊天室列表
2. **ChatRoom.tsx** - 聊天室主界面
3. **MessageList.tsx** - 訊息列表
4. **MessageInput.tsx** - 訊息輸入框
5. **RoomItem.tsx** - 聊天室項目
6. **MessageBubble.tsx** - 訊息氣泡

## 🔗 API 端點

開發環境：`http://localhost:8080/api/v1`
生產環境：配置在 `.env.production`

## 📦 環境變數

創建 `.env.development` 文件：
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080
```

## 🤝 與 Chat Gateway 整合

確保 Chat Gateway 後端正在運行：
```bash
cd ../chat-gateway
go run cmd/api/main.go
```

## 📄 授權

MIT License
