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
  const initialUnreadIndex = useRef<number>(-1);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const prevRoomIdRef = useRef<string | null>(null);

  // 載入更多訊息
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!hasMoreMessages[roomId]) return;

    isLoadingRef.current = true;
    try {
      const cursor = messagesCursor[roomId] || '';
      const response = await chatApi.getMessages(roomId, currentUser, 30, cursor);

      if (response.success && response.data) {
        const messages = [...response.data].reverse();
        prependMessages(roomId, messages);
        setMessagesCursor(roomId, response.next_cursor || '');
        setHasMoreMessages(roomId, response.has_more || false);
      }
    } catch (error) {
      console.error('載入更多訊息失敗:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [roomId, currentUser, messagesCursor, hasMoreMessages, prependMessages, setMessagesCursor, setHasMoreMessages]);

  // 初始載入訊息 - 核心邏輯
  useEffect(() => {
    // 更新 prevRoomIdRef
    prevRoomIdRef.current = roomId;

    // 臨時聊天室不載入訊息
    if (!roomId || roomId.startsWith('temp_')) {
      setStatus('empty');
      setErrorMsg(null);
      return;
    }

    // 重置狀態
    isLoadingRef.current = false;
    initialUnreadIndex.current = -1;
    setErrorMsg(null);
    
    // 檢查是否已有快取訊息
    const { messageHistory: latestHistory } = useChatStore.getState();
    const cachedMessages = latestHistory[roomId];
    const hasCache = cachedMessages && cachedMessages.length > 0;
    
    if (hasCache) {
      // 有快取，直接顯示（可能是剛創建的聊天室帶有臨時訊息）
      setStatus('loaded');
      
      // 滾動到底部
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
      
      // 如果快取中只有臨時訊息（temp_ 開頭），不需要從後端載入
      const onlyTempMessages = cachedMessages.every(msg => msg.id.startsWith('temp_'));
      if (onlyTempMessages) {
        return;
      }
      
      // 有真實訊息，不需要重新載入
      return;
    }
    
    // 沒有快取，開始載入
    setStatus('loading');
    
    const loadInitialMessages = async () => {
      isLoadingRef.current = true;
      
      try {
        const response = await chatApi.getMessages(roomId, currentUser, 30, '');

        // 確保 roomId 沒有改變
        if (prevRoomIdRef.current !== roomId) {
          return;
        }

        if (response.success && response.data) {
          const messagesFromServer = [...response.data].reverse();
          
          // 獲取當前可能存在的臨時訊息
          const { messageHistory: currentHistory } = useChatStore.getState();
          const existingMessages = currentHistory[roomId] || [];
          const tempMessages = existingMessages.filter(msg => msg.id.startsWith('temp_'));
          
          // 合併：後端訊息 + 臨時訊息（如果有的話）
          const mergedMessages = [...messagesFromServer];
          tempMessages.forEach(tempMsg => {
            // 只加入不存在的臨時訊息
            if (!mergedMessages.some(m => m.content === tempMsg.content && m.sender_id === tempMsg.sender_id)) {
              mergedMessages.push(tempMsg);
            }
          });
          
          setMessages(roomId, mergedMessages);
          setMessagesCursor(roomId, response.next_cursor || '');
          setHasMoreMessages(roomId, response.has_more || false);
          
          if (mergedMessages.length === 0) {
            setStatus('empty');
          } else {
            setStatus('loaded');
          }
          
          // 滾動到底部
          setTimeout(() => {
            const container = messagesContainerRef.current;
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 50);
        } else {
          setErrorMsg('服務暫時無法使用，請稍後再試');
          setStatus('error');
        }
      } catch (err) {
        // 確保 roomId 沒有改變
        if (prevRoomIdRef.current !== roomId) {
          return;
        }
        console.error('載入訊息失敗:', err);
        setErrorMsg('服務暫時無法使用，請稍後再試');
        setStatus('error');
      } finally {
        isLoadingRef.current = false;
      }
    };
    
    loadInitialMessages();
  }, [roomId, currentUser, setMessages, setMessagesCursor, setHasMoreMessages]);

  const messages = messageHistory[roomId] || [];
  const firstUnreadIndex = initialUnreadIndex.current;

  // 滾動載入更多
  const handleScroll = useCallback(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    if (element.scrollTop <= 50 && hasMoreMessages[roomId] && !isLoadingRef.current) {
      const previousHeight = element.scrollHeight;
      loadMoreMessages().then(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            const newHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newHeight - previousHeight;
          }
        });
      });
    }
  }, [roomId, hasMoreMessages, loadMoreMessages]);

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

  // 檢查是否需要顯示日期
  const shouldShowDate = (index: number): string | null => {
    if (messages.length === 0) return null;
    if (index === 0) return formatDate(messages[0].created_at);
    
    const currentDate = new Date(messages[index].created_at * 1000);
    const previousDate = new Date(messages[index - 1].created_at * 1000);
    
    if (currentDate.toDateString() !== previousDate.toDateString()) {
      return formatDate(messages[index].created_at);
    }
    
    return null;
  };

  // 重試載入
  const handleRetry = () => {
    setErrorMsg(null);
    setStatus('loading');
    
    const retryLoad = async () => {
      isLoadingRef.current = true;
      try {
        const response = await chatApi.getMessages(roomId, currentUser, 30, '');
        if (response.success && response.data) {
          const msgs = [...response.data].reverse();
          setMessages(roomId, msgs);
          setMessagesCursor(roomId, response.next_cursor || '');
          setHasMoreMessages(roomId, response.has_more || false);
          setStatus(msgs.length === 0 ? 'empty' : 'loaded');
          setTimeout(() => {
            const container = messagesContainerRef.current;
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 50);
        } else {
          setErrorMsg('服務暫時無法使用，請稍後再試');
          setStatus('error');
        }
      } catch {
        setErrorMsg('服務暫時無法使用，請稍後再試');
        setStatus('error');
      } finally {
        isLoadingRef.current = false;
      }
    };
    retryLoad();
  };

  // 顯示錯誤訊息
  if (status === 'error') {
    return (
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="error-messages">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{errorMsg}</div>
          <button className="retry-btn" onClick={handleRetry}>
            重試
          </button>
        </div>
      </div>
    );
  }

  // 載入中
  if (status === 'loading') {
    return (
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="loading-messages">載入中...</div>
      </div>
    );
  }

  // 沒有訊息
  if (status === 'empty' || messages.length === 0) {
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
