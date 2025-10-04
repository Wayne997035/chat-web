import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import MessageBubble from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  roomId: string;
}

const MessageList = ({ roomId }: MessageListProps) => {
  const {
    currentUser,
    currentRoom,
    messageHistory,
    setMessages,
    prependMessages,
    messagesCursor,
    setMessagesCursor,
    hasMoreMessages,
    setHasMoreMessages,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unreadMarkerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasScrolledToUnread = useRef(false);
  const initialUnreadIndex = useRef<number>(-1); // 記錄進入聊天室時的未讀位置
  const [isInitializing, setIsInitializing] = useState(true); // 初始化狀態

  // 載入訊息
  const loadMessages = useCallback(async (loadMore = false) => {
    if (isLoadingRef.current) return;
    if (loadMore && !hasMoreMessages[roomId]) return;

    isLoadingRef.current = true;
    try {
      const cursor = loadMore ? (messagesCursor[roomId] || '') : '';
      const response = await chatApi.getMessages(roomId, currentUser, 30, cursor);

      if (response.success && response.data) {
        const messages = [...response.data].reverse();
        
        if (loadMore) {
          prependMessages(roomId, messages);
        } else {
          setMessages(roomId, messages);
        }

        setMessagesCursor(roomId, response.next_cursor || '');
        setHasMoreMessages(roomId, response.has_more || false);
      }
    } catch (error) {
      console.error('載入訊息失敗:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [roomId, currentUser, messagesCursor, hasMoreMessages, prependMessages, setMessages, setMessagesCursor, setHasMoreMessages]);

  // 初始載入訊息 - 只在 roomId 改變時觸發
  useEffect(() => {
    // 臨時聊天室不載入訊息
    if (!roomId || roomId.startsWith('temp_')) {
      setIsInitializing(false);
      return;
    }
    
    // 檢查是否已有快取訊息（在 effect 內部讀取，不加入依賴）
    const messages = messageHistory[roomId];
    const hasCache = messages && messages.length > 0;
    
    // 只在沒有快取時顯示載入狀態
    if (!hasCache) {
      setIsInitializing(true);
    } else {
      // 如果有快取，立即顯示
      setIsInitializing(false);
      
      // 在背景中滾動到正確位置
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
      
      // 有快取就不需要載入，直接返回
      return;
    }
    
    // 直接在這裡載入，不依賴 loadMessages（有快取時在背景執行）
    const initialLoad = async () => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      
      try {
        const response = await chatApi.getMessages(roomId, currentUser, 30, '');

        if (response.success && response.data) {
          const messages = [...response.data].reverse();
          setMessages(roomId, messages);
          setMessagesCursor(roomId, response.next_cursor || '');
          setHasMoreMessages(roomId, response.has_more || false);
          
          // 計算並記錄初始未讀位置（只在進入聊天室時計算一次）
          const room = currentRoom;
          if (room && room.id === roomId && room.unread_count && room.unread_count > 0) {
            const unreadCount = room.unread_count;
            const totalMessages = messages.length;
            
            if (unreadCount >= totalMessages) {
              initialUnreadIndex.current = 0;
            } else {
              initialUnreadIndex.current = totalMessages - unreadCount;
            }
          } else {
            initialUnreadIndex.current = -1;
          }
          
          // 訊息載入後根據未讀狀態決定滾動位置
          requestAnimationFrame(() => {
            const container = messagesContainerRef.current;
            
            if (!container) {
              setIsInitializing(false);
              return;
            }
            
            if (initialUnreadIndex.current >= 0) {
              // 有未讀，滾動到未讀標記（如果存在）
              const unreadMarker = document.querySelector('.unread-divider');
              
              if (unreadMarker) {
                const markerTop = (unreadMarker as HTMLElement).offsetTop;
                const containerHeight = container.clientHeight;
                container.scrollTop = markerTop - (containerHeight * 0.3);
              } else {
                container.scrollTop = container.scrollHeight;
              }
            } else {
              // 沒有未讀，立即滾動到底部
              container.scrollTop = container.scrollHeight;
            }
            
            // 滾動完成後才顯示
            setIsInitializing(false);
          });
        }
      } catch (error) {
        console.error('載入訊息失敗:', error);
        setIsInitializing(false);
      } finally {
        isLoadingRef.current = false;
      }
    };
    
    initialLoad();
  }, [roomId, currentUser, setMessages, setMessagesCursor, setHasMoreMessages, currentRoom]);
  // 注意：不要把 messageHistory 加入依賴，會造成無限循環

  const messages = messageHistory[roomId] || [];
  
  // 使用固定的初始未讀位置，不會因為 unread_count 清除而改變
  const firstUnreadIndex = initialUnreadIndex.current;

  // 滾動邏輯已經移到 initialLoad 裡面處理

  // 當 roomId 改變時，重置滾動狀態和未讀位置
  useEffect(() => {
    hasScrolledToUnread.current = false;
    initialUnreadIndex.current = -1; // 離開聊天室時重置
  }, [roomId]);

  // 滾動載入更多
  const handleScroll = useCallback(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    if (element.scrollTop <= 50 && hasMoreMessages[roomId] && !isLoadingRef.current) {
      const previousHeight = element.scrollHeight;
      loadMessages(true).then(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            const newHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newHeight - previousHeight;
          }
        });
      });
    }
  }, [roomId, hasMoreMessages, loadMessages]);

  // 檢查是否需要顯示日期
  const shouldShowDate = (index: number): string | null => {
    if (index === 0) return formatDate(messages[0].created_at);
    
    const currentDate = new Date(messages[index].created_at * 1000);
    const previousDate = new Date(messages[index - 1].created_at * 1000);
    
    // 跨日才顯示
    if (currentDate.toDateString() !== previousDate.toDateString()) {
      return formatDate(messages[index].created_at);
    }
    
    return null;
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  if (messages.length === 0 && !isInitializing) {
    return (
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="empty-messages">還沒有訊息</div>
      </div>
    );
  }

  return (
    <div 
      className="messages-container" 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      style={{ visibility: isInitializing ? 'hidden' : 'visible' }}
    >
      {hasMoreMessages[roomId] && (
        <div className="load-more-indicator">
          {isLoadingRef.current ? '載入中...' : '往上滾動載入更多'}
        </div>
      )}
      
      {messages.map((message, index) => {
        const dateLabel = shouldShowDate(index);
        const showUnreadMarker = index === firstUnreadIndex && firstUnreadIndex >= 0;
        
        return (
          <div key={message.id}>
            {dateLabel && (
              <div className="date-divider">
                <span>{dateLabel}</span>
              </div>
            )}
            
            {showUnreadMarker && (
              <div className="unread-divider" ref={unreadMarkerRef}>
                <span>以下為尚未閱讀的訊息</span>
              </div>
            )}
            
            <MessageBubble
              message={message}
              room={currentRoom}
            />
          </div>
        );
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

