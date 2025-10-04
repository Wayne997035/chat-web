import { useState, useEffect } from 'react';
import './App.css';
import ChatList from './components/chat/ChatList';
import ChatRoom from './components/chat/ChatRoom';
import UserSelector from './components/common/UserSelector';
import CreateRoomModal from './components/chat/CreateRoomModal';
import { useChatStore } from './store/chatStore';

function App() {
  const { currentRoom } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 檢測是否為手機版
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 手機版：有選擇聊天室時顯示聊天區，否則顯示側邊欄
  const showSidebar = !isMobile || !currentRoom;
  const showChatArea = !isMobile || currentRoom;

  return (
    <div className="app-container">
      <div className={`sidebar ${showSidebar ? 'mobile-visible' : ''}`}>
        <UserSelector />
        <ChatList onCreateRoom={() => setShowCreateModal(true)} />
      </div>

      <div className={`chat-area ${showChatArea ? 'mobile-visible' : ''}`}>
        {currentRoom ? (
          <ChatRoom />
        ) : (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <div className="empty-title">選擇聊天室開始對話</div>
            <div className="empty-subtitle">
              點擊左側聯絡人開始一對一對話，或創建群組聊天
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default App;
