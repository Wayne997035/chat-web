import { useState } from 'react';
import ChatList from '../components/chat/ChatList';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import { useChatStore } from '../store/chatStore';
import './Messages.css';

const Messages = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { rooms, openChatPopup } = useChatStore();

  // 當選擇聊天室時，打開彈跳視窗
  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      openChatPopup(room);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar-wrapper messages-full-width">
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

        <div className="messages-info">
          <div className="messages-empty">
            <div className="empty-icon">💬</div>
            <h2 className="empty-title">聊天室列表</h2>
            <p className="empty-text">
              點擊左側對話即可在右下角開啟聊天視窗。<br />
              可同時開啟多個對話！
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

