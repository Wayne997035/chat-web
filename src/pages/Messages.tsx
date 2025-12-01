import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import { useChatStore } from '../store/chatStore';
import './Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 當選擇聊天室時，導航到聊天室頁面
  const handleRoomSelect = (roomId: string) => {
    navigate(`/messages/${roomId}`);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar-wrapper">
          <div className="messages-sidebar">
            <div className="messages-header">
              <h1 className="messages-title">聊天室</h1>
              <button 
                className="btn-new-message"
                onClick={() => setShowCreateModal(true)}
                title="建立新對話"
              >
                +
              </button>
            </div>
            
            <ChatList onCreateRoom={() => setShowCreateModal(true)} onSelectRoom={handleRoomSelect} />
          </div>
        </div>

        <div className="messages-content">
          <div className="messages-empty">
            <div className="empty-icon">訊息</div>
            <h2 className="empty-title">選擇訊息</h2>
            <p className="empty-text">
              從現有對話中選擇，或開始新的對話。
            </p>
            <button 
              className="btn-start-chat"
              onClick={() => setShowCreateModal(true)}
            >
              開始新對話
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Messages;

