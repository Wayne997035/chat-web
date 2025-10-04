import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import type { Room } from '../../types';
import RoomItem from './RoomItem';
import ContactList from './ContactList';
import './ChatList.css';

interface ChatListProps {
  onCreateRoom: () => void;
}

const ChatList = ({ onCreateRoom }: ChatListProps) => {
  const { currentUser, rooms, setRooms, setCurrentRoom } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // 載入聊天室列表
  const loadRooms = useCallback(async (loadMore = false) => {
    if (loadingRef.current) return;
    if (loadMore && !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);
    try {
      const currentCursor = loadMore ? cursor : '';
      const response = await chatApi.getRooms(currentUser, 20, currentCursor);
      
      if (response.success && response.data) {
        if (loadMore) {
          setRooms((prevRooms: Room[]) => [...prevRooms, ...response.data!]);
        } else {
          setRooms(response.data);
        }
        setCursor(response.cursor || '');
        setHasMore(response.has_more || false);
      }
    } catch (error) {
      console.error('載入聊天室失敗:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser, cursor, hasMore, setRooms]);

  // 初始載入 - 只在 currentUser 改變時觸發
  useEffect(() => {
    setCursor('');
    setHasMore(true);
    
    // 直接在這裡載入，不依賴 loadRooms
    const initialLoad = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setIsLoading(true);
      try {
        const response = await chatApi.getRooms(currentUser, 20, '');
        
        if (response.success && response.data) {
          setRooms(response.data);
          setCursor(response.cursor || '');
          setHasMore(response.has_more || false);
        }
      } catch (error) {
        console.error('載入聊天室失敗:', error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };
    
    initialLoad();
  }, [currentUser, setRooms]);

  // 滾動載入更多（使用節流優化）
  const handleScroll = useCallback(() => {
    const element = listRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (hasMore && !loadingRef.current) {
        loadRooms(true);
      }
    }
  }, [hasMore, loadRooms]);

  // 節流處理滾動事件
  const throttledScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    scrollTimeoutRef.current = setTimeout(() => {
      handleScroll();
      scrollTimeoutRef.current = null;
    }, 200);
  }, [handleScroll]);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 選擇聊天室
  const handleSelectRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      // 立即設置當前聊天室（保留未讀數，讓 MessageList 記錄初始位置）
      setCurrentRoom(room);
      
      // 使用 requestAnimationFrame 在下一幀清除未讀數（更快，不阻塞）
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const updatedRoom = { ...room, unread_count: 0 };
          setCurrentRoom(updatedRoom);
          
          setRooms((prevRooms) => 
            prevRooms.map(r => r.id === roomId ? updatedRoom : r)
          );
          
          // 異步發送已讀請求，不阻塞 UI
          chatApi.markAsRead(roomId, currentUser).catch(console.error);
        });
      });
    }
  }, [rooms, setCurrentRoom, setRooms, currentUser]);

  // 排序聊天室（使用 useMemo 優化）
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const timeA = a.last_message_time || a.created_at;
      const timeB = b.last_message_time || b.created_at;
      return timeB - timeA;
    });
  }, [rooms]);

  return (
    <div className="chat-list-container">
      <div className="sidebar-content">
        <ContactList />
        
        <div className="rooms-section">
          <h4>聊天室</h4>
        <div 
          className="room-list" 
          ref={listRef}
          onScroll={throttledScroll}
        >
            {sortedRooms.length === 0 && !isLoading ? (
              <div className="empty-list">點擊聯絡人開始對話</div>
            ) : (
              sortedRooms.map(room => (
                <RoomItem
                  key={room.id}
                  room={room}
                  onClick={() => handleSelectRoom(room.id)}
                />
              ))
            )}
            {isLoading && (
              <div className="loading-indicator">載入中...</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="create-room-section">
        <button className="create-room-btn" onClick={onCreateRoom}>
          + 創建群組
        </button>
      </div>
    </div>
  );
};

export default ChatList;

