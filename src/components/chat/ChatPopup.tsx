import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import { useSSE } from '../../hooks/useSSE';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { getDisplayName, getInitials } from '../../utils/formatters';
import type { Room } from '../../types';
import './ChatPopup.css';

interface ChatPopupProps {
  room: Room;
  index: number;
}

const ChatPopup = ({ room, index }: ChatPopupProps) => {
  const { 
    currentUser, 
    addMessage, 
    addRoom, 
    closeChatPopup, 
    minimizeChatPopup,
    minimizedPopups,
    rooms
  } = useChatStore();
  
  // 使用 ref 來追蹤實際的 roomId（處理臨時房間轉真實房間的情況）
  const actualRoomIdRef = useRef(room.id);
  const [actualRoom, setActualRoom] = useState<Room>(room);
  const [connectionError, setConnectionError] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const isMinimized = minimizedPopups[room.id] || false;
  
  // 當臨時房間轉換成真實房間時更新
  if (room.id !== actualRoomIdRef.current && !room.id.startsWith('temp_')) {
    actualRoomIdRef.current = room.id;
    setActualRoom(room);
  }

  // 監聽 rooms 變化 - 當後端數據載入後，自動更新臨時房間為真實房間
  useEffect(() => {
    // 只有當目前是臨時房間時才需要檢查
    if (!room.id.startsWith('temp_')) {
      setConnectionError(false);
      return;
    }

    // 如果 rooms 有數據，嘗試匹配
    if (rooms.length > 0) {
      // 從臨時房間 ID 獲取聯絡人 ID（格式：temp_user_xxx）
      const contactId = room.targetContactId || room.id.replace('temp_', '');

      // 在 rooms 中尋找匹配的真實聊天室
      const matchingRoom = rooms.find(r => {
        if (r.type !== 'direct') return false;
        
        // 方法1: 通過 members 匹配
        if (r.members && r.members.length > 0) {
          const hasContact = r.members.some(m => m.user_id === contactId);
          const hasCurrentUser = r.members.some(m => m.user_id === currentUser);
          if (hasContact && hasCurrentUser) return true;
        }
        
        // 方法2: 通過 room.name 匹配
        if (r.name) {
          const nameIncludesContact = r.name.includes(contactId);
          const nameIncludesCurrentUser = r.name.includes(currentUser);
          if (nameIncludesContact && nameIncludesCurrentUser) return true;
        }
        
        return false;
      });

      if (matchingRoom) {
        // 找到真實房間，更新 popup
        const contactId = room.targetContactId || room.id.replace('temp_', '');
        const roomWithMembers: Room = {
          ...matchingRoom,
          members: matchingRoom.members || [
            { user_id: currentUser, role: 'admin' },
            { user_id: contactId, role: 'member' },
          ],
        };
        
        actualRoomIdRef.current = matchingRoom.id;
        setActualRoom(roomWithMembers);
        setConnectionError(false);
        
        // 更新 openPopups 中的 room
        const { openPopups: currentPopups } = useChatStore.getState();
        useChatStore.setState({
          openPopups: currentPopups.map(r => r.id === room.id ? roomWithMembers : r)
        });
        return;
      }
    }
  }, [rooms, room.id, room.targetContactId, currentUser]);

  // 如果 room 標記為連線超時，直接顯示錯誤
  useEffect(() => {
    if (room.connectionTimeout) {
      setConnectionError(true);
    }
  }, [room.connectionTimeout]);

  // 使用 room prop 或 actualRoom（處理臨時轉真實的情況）
  const currentRoom = actualRoom.id.startsWith('temp_') ? room : actualRoom;
  const roomIdForMessages = currentRoom.id;

  // SSE 連接（只在非臨時房間時啟動）
  useSSE({
    roomId: roomIdForMessages,
    userId: currentUser,
    onMessage: (message) => {
      if (message.room_id === roomIdForMessages) {
        addMessage(roomIdForMessages, message);
        
        // 自動標記為已讀
        if (!currentRoom.isTemporary) {
          chatApi.markAsRead(roomIdForMessages, currentUser).catch(console.error);
        }
      }
    },
    onError: (error) => {
      console.error('SSE 連接錯誤:', error);
    },
  });

  // 獲取顯示名稱
  const getRoomDisplayName = (): string => {
    if (!currentRoom) return '';
    
    if (currentRoom.type === 'group') {
      return currentRoom.name;
    } else if (currentRoom.type === 'direct' && currentRoom.members && currentRoom.members.length > 0) {
      const otherMember = currentRoom.members.find(m => m.user_id !== currentUser);
      if (otherMember) {
        return getDisplayName(otherMember.user_id);
      }
    }
    
    // 如果找不到 members，嘗試從 room.name 中解析
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
  };

  // 獲取頭像
  const getAvatarName = (): string => {
    if (currentRoom.type === 'group') {
      return currentRoom.name;
    }
    const otherMember = currentRoom.members?.find(m => m.user_id !== currentUser);
    return otherMember ? otherMember.user_id : currentRoom.name;
  };

  // 發送訊息
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentRoom) return;
    
    try {
      let roomId = currentRoom.id;
      let newRoom = currentRoom;
      
      // 如果是臨時聊天室，先創建聊天室
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
        newRoom = { 
          ...createResponse.data,
          members: createResponse.data.members || currentRoom.members
        };
        
        addRoom(newRoom);
        
        // 不要在這裡清空訊息，讓 MessageList 自己處理
        // 直接先把臨時訊息加入（使用新的 roomId）
        const tempMessage = {
          id: `temp_${Date.now()}`,
          room_id: roomId,
          sender_id: currentUser,
          content: content,
          type: 'text' as const,
          created_at: Math.floor(Date.now() / 1000),
          read_by: [currentUser],
        };
        
        // 先設置訊息（包含臨時訊息）
        const { setMessages: initMessages } = useChatStore.getState();
        initMessages(roomId, [tempMessage]);
        
        // 更新本地狀態
        actualRoomIdRef.current = roomId;
        setActualRoom(newRoom);
        
        // 更新 openPopups 中的 room
        const { openPopups: currentPopups } = useChatStore.getState();
        useChatStore.setState({
          openPopups: currentPopups.map(r => r.id === room.id ? newRoom : r)
        });

        // 發送訊息到後端
        const sendResponse = await chatApi.sendMessage({
          room_id: roomId,
          sender_id: currentUser,
          content,
          type: 'text',
        });

        if (sendResponse.success && sendResponse.data) {
          const { messageHistory, setMessages } = useChatStore.getState();
          const messages = messageHistory[roomId] || [];
          
          const withoutTemp = messages.filter(msg => msg.id !== tempMessage.id);
          const realMessageExists = withoutTemp.some(msg => msg.id === sendResponse.data!.id);
          
          const updatedMessages = realMessageExists 
            ? withoutTemp 
            : [...withoutTemp, sendResponse.data];
          
          setMessages(roomId, updatedMessages);
        }
        
        // 滾動到底部
        requestAnimationFrame(() => {
          if (popupRef.current) {
            const container = popupRef.current.querySelector('.messages-container');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }
        });
        
        return; // 新房間的訊息處理完成，直接返回
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
      
      addMessage(roomId, tempMessage);
      
      // 立即滾動到底部
      requestAnimationFrame(() => {
        if (popupRef.current) {
          const container = popupRef.current.querySelector('.messages-container');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
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
  }, [currentRoom, currentUser, addRoom, addMessage, room.id]);

  const displayName = getRoomDisplayName();
  const avatarName = getAvatarName();

  return (
    <div 
      ref={popupRef}
      className={`chat-popup ${isMinimized ? 'minimized' : ''}`}
      style={{ right: `${20 + index * 340}px` }}
    >
      {/* Header */}
      <div className="popup-header" onClick={() => isMinimized && minimizeChatPopup(room.id, false)}>
        <div className="popup-user">
          <div className="popup-avatar">
            {getInitials(avatarName)}
          </div>
          <div className="popup-info">
            <span className="popup-name">{displayName}</span>
            <span className="popup-status">
              {currentRoom.type === 'direct' ? '在線' : `${currentRoom.members?.length || 0} 位成員`}
            </span>
          </div>
        </div>
        <div className="popup-actions">
          <button 
            className="popup-btn" 
            onClick={(e) => {
              e.stopPropagation();
              minimizeChatPopup(room.id, !isMinimized);
            }}
            title={isMinimized ? '展開' : '最小化'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            className="popup-btn popup-close" 
            onClick={(e) => {
              e.stopPropagation();
              closeChatPopup(room.id);
            }}
            title="關閉"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body - 只在非最小化時顯示 */}
      {!isMinimized && (
        <>
          <div className="popup-messages">
            {connectionError ? (
              <div className="connection-error">
                <div className="error-icon">⚠️</div>
                <div className="error-title">無法連接伺服器</div>
                <div className="error-desc">服務暫時無法使用，請稍後再試</div>
                <button 
                  className="retry-btn"
                  onClick={() => {
                    setConnectionError(false);
                    // 重新觸發 timeout
                    setTimeout(() => {
                      if (actualRoomIdRef.current.startsWith('temp_')) {
                        setConnectionError(true);
                      }
                    }, 5000);
                  }}
                >
                  重試
                </button>
              </div>
            ) : (
              <MessageList roomId={roomIdForMessages} />
            )}
          </div>
          <div className="popup-input">
            <MessageInput onSend={handleSendMessage} disabled={connectionError} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPopup;

