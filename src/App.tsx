import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Messages from './pages/Messages';
import ChatRoomPage from './pages/ChatRoomPage';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  // 在 App 層級初始化主題，確保全局生效
  useTheme();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:roomId" element={<ChatRoomPage />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="groups" element={<div className="placeholder-page">群組頁面（開發中）</div>} />
          <Route path="starred" element={<div className="placeholder-page">重要訊息（開發中）</div>} />
          <Route path="archived" element={<div className="placeholder-page">封存對話（開發中）</div>} />
          <Route path="profile" element={<div className="placeholder-page">個人資料頁面（開發中）</div>} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
