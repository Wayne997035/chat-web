import { useState, useEffect, useCallback } from 'react';
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

  // 檢測手機版 — hooks 必須在 early return 之前
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SSE 連接（roomId 為空字串時不啟動）
  useSSE({
    roomId: currentRoom?.id ?? '',
    userId: currentUser,
    onMessage: (message) => {
      if (!currentRoom) return;
      if (message.room_id === currentRoom.id) {
        addMessage(currentRoom.id, message);

        requestAnimationFrame(() => {
          const messagesEnd = document.querySelector('.messages-container');
          if (messagesEnd) {
            messagesEnd.scrollTop = messagesEnd.scrollHeight;
          }
        });

        if (!currentRoom.isTemporary) {
          chatApi.markAsRead(currentRoom.id, currentUser).catch(console.error);
        }
      }
    },
    onError: (error) => {
      console.error('SSE 連接錯誤:', error);
    },
  });

  // 獲取顯示名稱
  const getRoomDisplayName = useCallback((): string => {
    if (!currentRoom) return '';

    if (currentRoom.type === 'group') {
      return currentRoom.name;
    } else if (currentRoom.type === 'direct' && currentRoom.members && currentRoom.members.length > 0) {
      const otherMember = currentRoom.members.find(m => m.user_id !== currentUser);
      if (otherMember) {
        return getDisplayName(otherMember.user_id);
      }
    }

    if (currentRoom.type === 'direct' && currentRoom.name) {
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
  }, [currentRoom, currentUser]);

  // 發送訊息
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentRoom) return;

    try {
      let roomId = currentRoom.id;
      let actualRoom = currentRoom;

      if (currentRoom.isTemporary) {
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

        roomId = createResponse.data.id;
        actualRoom = {
          ...createResponse.data,
          members: createResponse.data.members || currentRoom.members
        };

        addRoom(actualRoom);

        const { setMessages: initMessages } = useChatStore.getState();
        initMessages(roomId, []);

        setCurrentRoom(actualRoom);
      }

      const tempMessage = {
        id: `temp_${Date.now()}`,
        room_id: roomId,
        sender_id: currentUser,
        content: content,
        type: 'text' as const,
        created_at: Math.floor(Date.now() / 1000),
        read_by: [currentUser],
      };

      addMessage(roomId, tempMessage);

      requestAnimationFrame(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });

      const response = await chatApi.sendMessage({
        room_id: roomId,
        sender_id: currentUser,
        content,
        type: 'text',
      });

      if (response.success && response.data) {
        const { messageHistory, setMessages } = useChatStore.getState();
        const messages = messageHistory[roomId] || [];

        const withoutTemp = messages.filter(msg => msg.id !== tempMessage.id);
        const realMessageExists = withoutTemp.some(msg => msg.id === response.data!.id);

        const updatedMessages = realMessageExists
          ? withoutTemp
          : [...withoutTemp, response.data];

        setMessages(roomId, updatedMessages);
      } else {
        const { messageHistory, setMessages } = useChatStore.getState();
        const messages = messageHistory[roomId] || [];
        const updatedMessages = messages.filter(msg => msg.id !== tempMessage.id);
        setMessages(roomId, updatedMessages);
      }
    } catch (error) {
      console.error('發送訊息失敗:', error);
      alert('發送訊息失敗，請稍後再試');
    }
  }, [currentRoom, currentUser, addRoom, setCurrentRoom, addMessage]);

  if (!currentRoom) return null;

  const memberCount = currentRoom.members?.length || 0;

  return (
    <div className="chat-room">
      <div className="chat-header">
        {isMobile && (
          <button className="btn-back" onClick={() => setCurrentRoom(null)}>
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
