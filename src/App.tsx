import { useState } from 'react';
import './App.css';
import ChatList from './components/chat/ChatList';
import ChatRoom from './components/chat/ChatRoom';
import UserSelector from './components/common/UserSelector';
import CreateRoomModal from './components/chat/CreateRoomModal';
import { useChatStore } from './store/chatStore';

function App() {
  const { currentRoom } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="app-container">
      <div className="sidebar">
        <UserSelector />
        <ChatList onCreateRoom={() => setShowCreateModal(true)} />
      </div>

      <div className="chat-area">
        {currentRoom ? (
          <ChatRoom />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
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
