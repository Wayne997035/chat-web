import { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import { useSSE } from '../../hooks/useSSE';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MembersPanel from './MembersPanel';
import RoomSettingsModal from './RoomSettingsModal';
import { getDisplayName } from '../../utils/formatters';
import './ChatRoom.css';

const ChatRoom = () => {
  const { currentUser, currentRoom, addMessage, addRoom, setCurrentRoom } = useChatStore();
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  if (!currentRoom) return null;

  // 檢測手機版
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 手機版返回按鈕
  const handleBack = () => {
    setCurrentRoom(null);
  };

  // SSE 連接（只在非臨時聊天室時啟動）
  useSSE({
    roomId: currentRoom.id,
    userId: currentUser,
    onMessage: (message) => {
      if (message.room_id === currentRoom.id) {
        addMessage(currentRoom.id, message);
        
        // 收到新訊息後立即滾動到底部，使用 RAF 確保無感
        requestAnimationFrame(() => {
          const messagesEnd = document.querySelector('.messages-container');
          if (messagesEnd) {
            messagesEnd.scrollTop = messagesEnd.scrollHeight;
          }
        });
        
        // 自動標記為已讀（臨時聊天室不標記）
        if (!currentRoom.isTemporary) {
          chatApi.markAsRead(currentRoom.id, currentUser).catch(console.error);
        }
      }
    },
    onError: (error) => {
      console.error('SSE 連接錯誤:', error);
    },
  });

  // 不需要在這裡標記已讀，ChatList 已經處理了

  // 獲取顯示名稱
  const getRoomDisplayName = (): string => {
    if (!currentRoom) return '';
    
    if (currentRoom.type === 'group') {
      return currentRoom.name;
    } else if (currentRoom.type === 'direct' && currentRoom.members) {
      const otherMember = currentRoom.members.find(m => m.user_id !== currentUser);
      if (otherMember) {
        // 使用 formatters 的 getDisplayName 確保顯示正確名稱
        return getDisplayName(otherMember.user_id);
      }
    }
    return currentRoom.name;
  };

  // 發送訊息
  const handleSendMessage = async (content: string) => {
    try {
      let roomId = currentRoom.id;
      
      // 如果是臨時聊天室，先創建聊天室
      if (currentRoom.isTemporary) {
        const createResponse = await chatApi.createRoom({
          name: currentRoom.name,
          type: 'direct',
          owner_id: currentUser,
          members: currentRoom.members,
        });

        if (!createResponse.success || !createResponse.data) {
          alert('創建聊天室失敗');
          return;
        }

        // 更新當前聊天室為真實聊天室
        roomId = createResponse.data.id;
        const newRoom = { ...createResponse.data };
        addRoom(newRoom);
        setCurrentRoom(newRoom);
      }

      // 發送訊息
      const response = await chatApi.sendMessage({
        room_id: roomId,
        sender_id: currentUser,
        content,
        type: 'text',
      });

      if (response.success && response.data) {
        addMessage(roomId, response.data);
        
        // 發送訊息後立即滾動到底部，使用 RAF 確保無感
        requestAnimationFrame(() => {
          const messagesEnd = document.querySelector('.messages-container');
          if (messagesEnd) {
            messagesEnd.scrollTop = messagesEnd.scrollHeight;
          }
        });
      }
    } catch (error) {
      console.error('發送訊息失敗:', error);
      alert('發送訊息失敗，請稍後再試');
    }
  };

  const memberCount = currentRoom.members?.length || 0;

  return (
    <div className="chat-room">
      <div className="chat-header">
        {isMobile && (
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
        )}
        <div>
          <div className="chat-title">
            {getRoomDisplayName()}
            {currentRoom.type === 'group' && ` (${memberCount}人)`}
          </div>
          <div className="chat-type">
            {currentRoom.type === 'direct' ? '一對一聊天' : '群組聊天'}
          </div>
        </div>
        {currentRoom.type === 'group' && !currentRoom.isTemporary && (
          <div className="chat-actions">
            <button className="btn-action" onClick={() => setShowMembers(!showMembers)}>
              👥 成員
            </button>
            <button className="btn-action" onClick={() => setShowSettings(true)}>
              ⚙️ 設置
            </button>
          </div>
        )}
      </div>

      <div className="chat-content">
        <MessageList roomId={currentRoom.id} />
        {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
      </div>

      <MessageInput onSend={handleSendMessage} />

      {showSettings && (
        <RoomSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default ChatRoom;

