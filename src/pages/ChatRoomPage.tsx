import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ChatRoom from '../components/chat/ChatRoom';
import { useChatStore } from '../store/chatStore';
import { chatApi } from '../api/chat';
import './ChatRoomPage.css';

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { rooms, setCurrentRoom, currentRoom, setRooms, currentUser } = useChatStore();

  useEffect(() => {
    if (!roomId) return;

    // 先檢查是否已經設置了 currentRoom（可能是臨時聊天室）
    if (currentRoom && currentRoom.id === roomId) {
      // 已經設置好了，只清除 rooms 列表中的未讀數，保留 currentRoom 的未讀數
      if (currentRoom.unread_count && currentRoom.unread_count > 0) {
        setTimeout(() => {
          // 只更新 rooms 列表，不更新 currentRoom
          setRooms((prevRooms) => 
            prevRooms.map(r => r.id === roomId ? { ...r, unread_count: 0 } : r)
          );
          // 異步發送已讀請求
          chatApi.markAsRead(roomId, currentUser).catch(console.error);
        }, 2000); // 延遲 2 秒，確保用戶有足夠時間看到未讀訊息
      }
      return;
    }
    
    // 嘗試從 rooms 列表中找
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      // 延遲清除 rooms 列表中的未讀數，保留 currentRoom 的未讀數
      if (room.unread_count && room.unread_count > 0) {
        setTimeout(() => {
          // 只更新 rooms 列表，不更新 currentRoom
          setRooms((prevRooms) => 
            prevRooms.map(r => r.id === roomId ? { ...r, unread_count: 0 } : r)
          );
          // 異步發送已讀請求
          chatApi.markAsRead(roomId, currentUser).catch(console.error);
        }, 2000); // 延遲 2 秒
      }
    } else if (roomId.startsWith('temp_')) {
      // 這是臨時聊天室，但 currentRoom 還沒設置
      // 等待 ContactList 設置 currentRoom
      console.log('等待臨時聊天室設置...', roomId);
    } else if (rooms.length > 0) {
      // 如果已經載入了聊天室列表但找不到，返回訊息列表
      console.log('找不到聊天室，返回訊息列表');
      navigate('/messages');
    }
  }, [roomId, rooms, currentRoom, setCurrentRoom, setRooms, currentUser, navigate]);

  // 只在組件卸載時清除 currentRoom
  useEffect(() => {
    return () => {
      setCurrentRoom(null);
    };
  }, [setCurrentRoom]);

  if (!roomId) {
    navigate('/messages');
    return null;
  }

  // 等待 currentRoom 設置完成
  if (!currentRoom || currentRoom.id !== roomId) {
    return (
      <div className="chatroom-page">
        <div className="chatroom-container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            fontSize: '16px'
          }}>
            載入中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatroom-page">
      <div className="chatroom-container">
        <ChatRoom />
      </div>
    </div>
  );
};

export default ChatRoomPage;

