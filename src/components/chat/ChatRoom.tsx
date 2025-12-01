import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    } else if (currentRoom.type === 'direct' && currentRoom.members && currentRoom.members.length > 0) {
      const otherMember = currentRoom.members.find(m => m.user_id !== currentUser);
      if (otherMember) {
        // 使用 formatters 的 getDisplayName 確保顯示正確名稱
        return getDisplayName(otherMember.user_id);
      }
    }
    
    // 如果找不到 members，嘗試從 room.name 中解析（針對 user_alice_user_grace 格式）
    if (currentRoom.type === 'direct' && currentRoom.name) {
      // 處理 user_alice_user_emma 這種格式
      const namePattern = /user_(\w+)_user_(\w+)/;
      const match = currentRoom.name.match(namePattern);
      
      if (match) {
        const user1 = `user_${match[1]}`;
        const user2 = `user_${match[2]}`;
        const otherUserId = user1 === currentUser ? user2 : user1;
        return getDisplayName(otherUserId);
      }
    }
    
    return currentRoom.name || '未知聊天室';
  };

  // 發送訊息
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentRoom) return;
    
    try {
      let roomId = currentRoom.id;
      let actualRoom = currentRoom;
      
      // 如果是臨時聊天室，先創建聊天室
      if (currentRoom.isTemporary) {
        // 從 members 中找到對方的 user_id 作為聊天室名稱
        const otherMember = currentRoom.members?.find(m => m.user_id !== currentUser);
        const roomName = otherMember ? `${currentUser}_${otherMember.user_id}` : `${currentUser}_chat`;
        
        const createResponse = await chatApi.createRoom({
          name: roomName,
          type: 'direct',
          owner_id: currentUser,
          members: currentRoom.members,
        });

        if (!createResponse.success || !createResponse.data) {
          alert('創建聊天室失敗');
          return;
        }

        // 獲取新的 roomId
        roomId = createResponse.data.id;
        
        // 創建新的房間對象，保留原有的 members
        actualRoom = { 
          ...createResponse.data,
          members: createResponse.data.members || currentRoom.members
        };
        
        // 立即更新 store
        addRoom(actualRoom);
        
        // 為新房間初始化空的訊息陣列
        const { setMessages: initMessages } = useChatStore.getState();
        initMessages(roomId, []);
        
        // 更新 currentRoom（這會觸發 ChatRoom 重新渲染）
        setCurrentRoom(actualRoom);
        
        // 更新 URL
        navigate(`/messages/${roomId}`, { replace: true });
      }

      // 創建臨時訊息對象（樂觀更新）
      const tempMessage = {
        id: `temp_${Date.now()}`,
        room_id: roomId,
        sender_id: currentUser,
        content: content,
        type: 'text' as const,
        created_at: Math.floor(Date.now() / 1000),
        read_by: [currentUser],
      };
      
      // 立即添加臨時訊息到 UI
      addMessage(roomId, tempMessage);
      
      // 立即滾動到底部
      requestAnimationFrame(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });

      // 發送訊息到後端
      const response = await chatApi.sendMessage({
        room_id: roomId,
        sender_id: currentUser,
        content,
        type: 'text',
      });

      if (response.success && response.data) {
        // 用真實的訊息替換臨時訊息
        const { messageHistory, setMessages } = useChatStore.getState();
        const messages = messageHistory[roomId] || [];
        
        // 先移除臨時訊息，然後檢查真實訊息是否已存在（可能通過 SSE 接收到）
        const withoutTemp = messages.filter(msg => msg.id !== tempMessage.id);
        const realMessageExists = withoutTemp.some(msg => msg.id === response.data!.id);
        
        // 只有真實訊息不存在時才添加
        const updatedMessages = realMessageExists 
          ? withoutTemp 
          : [...withoutTemp, response.data];
        
        setMessages(roomId, updatedMessages);
      } else {
        // 如果發送失敗，移除臨時訊息
        const { messageHistory, setMessages } = useChatStore.getState();
        const messages = messageHistory[roomId] || [];
        const updatedMessages = messages.filter(msg => msg.id !== tempMessage.id);
        setMessages(roomId, updatedMessages);
      }
    } catch (error) {
      console.error('發送訊息失敗:', error);
      alert('發送訊息失敗，請稍後再試');
    }
  }, [currentRoom, currentUser, navigate, addRoom, setCurrentRoom, addMessage]);

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
              成員
            </button>
            <button className="btn-action" onClick={() => setShowSettings(true)}>
              設置
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

