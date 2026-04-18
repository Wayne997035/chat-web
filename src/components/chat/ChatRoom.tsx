import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import { useSSE } from '../../hooks/useSSE';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MembersPanel from './MembersPanel';
import RoomSettingsModal from './RoomSettingsModal';
import { getDisplayName } from '../../utils/formatters';

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChatRoom = () => {
  const { currentUser, currentRoom, addMessage, addRoom, setCurrentRoom } = useChatStore();
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const getRoomDisplayName = useCallback((): string => {
    if (!currentRoom) return '';

    if (currentRoom.type === 'group') {
      return currentRoom.name;
    } else if (currentRoom.type === 'direct' && currentRoom.members && currentRoom.members.length > 0) {
      const otherMember = currentRoom.members.find((m) => m.user_id !== currentUser);
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

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentRoom) return;

      try {
        let roomId = currentRoom.id;
        let actualRoom = currentRoom;

        if (currentRoom.isTemporary) {
          const otherMember = currentRoom.members?.find((m) => m.user_id !== currentUser);
          const roomName = otherMember
            ? `${currentUser}_${otherMember.user_id}`
            : `${currentUser}_chat`;

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
            members: createResponse.data.members || currentRoom.members,
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

          const withoutTemp = messages.filter((msg) => msg.id !== tempMessage.id);
          const realMessageExists = withoutTemp.some((msg) => msg.id === response.data!.id);

          const updatedMessages = realMessageExists ? withoutTemp : [...withoutTemp, response.data];

          setMessages(roomId, updatedMessages);
        } else {
          const { messageHistory, setMessages } = useChatStore.getState();
          const messages = messageHistory[roomId] || [];
          const updatedMessages = messages.filter((msg) => msg.id !== tempMessage.id);
          setMessages(roomId, updatedMessages);
        }
      } catch (error) {
        console.error('發送訊息失敗:', error);
        alert('發送訊息失敗，請稍後再試');
      }
    },
    [currentRoom, currentUser, addRoom, setCurrentRoom, addMessage]
  );

  if (!currentRoom) return null;

  const memberCount = currentRoom.members?.length ?? 0;
  const roomDisplayName = getRoomDisplayName();

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="
        flex items-center gap-3 px-4
        h-[60px] flex-none
        bg-white border-b border-neutral-200
        shadow-sm
      ">
        {isMobile && (
          <button
            aria-label="返回對話列表"
            onClick={() => setCurrentRoom(null)}
            className="
              flex items-center justify-center
              w-9 h-9 rounded-full
              text-neutral-500 hover:bg-neutral-100
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500
            "
          >
            <ChevronLeftIcon />
          </button>
        )}

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-neutral-900 truncate">
            {roomDisplayName}
          </h2>
          <p className="text-xs text-neutral-500">
            {currentRoom.type === 'group'
              ? `${memberCount} 位成員`
              : '一對一聊天'}
          </p>
        </div>

        {/* Action buttons */}
        {currentRoom.type === 'group' && !currentRoom.isTemporary && (
          <div className="flex items-center gap-1 flex-none">
            <button
              aria-label="成員列表"
              onClick={() => setShowMembers(!showMembers)}
              className="
                flex items-center justify-center
                w-9 h-9 rounded-full
                text-neutral-500 hover:text-primary-500 hover:bg-neutral-100
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500
              "
            >
              <UsersIcon />
            </button>
            <button
              aria-label="聊天室設定"
              onClick={() => setShowSettings(true)}
              className="
                flex items-center justify-center
                w-9 h-9 rounded-full
                text-neutral-500 hover:text-primary-500 hover:bg-neutral-100
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500
              "
            >
              <SettingsIcon />
            </button>
          </div>
        )}
      </header>

      {/* Chat Content */}
      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-50">
          <MessageList roomId={currentRoom.id} />
        </div>
        {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
      </div>

      <MessageInput onSend={handleSendMessage} />

      {showSettings && <RoomSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default ChatRoom;
