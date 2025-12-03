import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ChatPopup from '../chat/ChatPopup';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const { currentUser, setRooms, openPopups } = useChatStore();
  const loadingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  // 只在初次載入時載入聊天室列表（用於首頁顯示未讀通知）
  useEffect(() => {
    if (!currentUser || loadingRef.current || hasInitialLoadRef.current) return;

    const loadRooms = async () => {
      loadingRef.current = true;
      try {
        const response = await chatApi.getRooms(currentUser, 50, '');
        if (response.success && response.data) {
          setRooms(response.data);
          hasInitialLoadRef.current = true;
        }
      } catch (error) {
        console.error('載入聊天室列表失敗:', error);
      } finally {
        loadingRef.current = false;
      }
    };

    loadRooms();
  }, [currentUser, setRooms]);

  // 當離開訊息頁面時，刷新一次聊天室列表（獲取最新未讀數）
  useEffect(() => {
    const isMessagesPage = location.pathname.startsWith('/messages');
    
    if (!isMessagesPage && hasInitialLoadRef.current && !loadingRef.current) {
      // 離開訊息頁面，刷新聊天室列表
      const refreshRooms = async () => {
        loadingRef.current = true;
        try {
          const response = await chatApi.getRooms(currentUser, 50, '');
          if (response.success && response.data) {
            // 智能合併：優先使用 ChatList 中已清除的未讀狀態
            setRooms((prevRooms) => {
              const newRooms = response.data!;
              
              // 如果前端沒有數據，直接使用後端數據
              if (prevRooms.length === 0) {
                return newRooms;
              }
              
              // 合併：如果前端的未讀數是 0，保持為 0（用戶剛標記為已讀）
              return newRooms.map(newRoom => {
                const prevRoom = prevRooms.find(r => r.id === newRoom.id);
                if (prevRoom && prevRoom.unread_count === 0 && (newRoom.unread_count || 0) > 0) {
                  // 前端已清除，保持為 0
                  return { ...newRoom, unread_count: 0 };
                }
                return newRoom;
              });
            });
          }
        } catch (error) {
          console.error('刷新聊天室列表失敗:', error);
        } finally {
          loadingRef.current = false;
        }
      };

      refreshRooms();
    }
  }, [location.pathname, currentUser, setRooms]);

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      
      {/* 彈跳聊天視窗 - 像 Facebook Messenger */}
      {openPopups.map((room, index) => (
        <ChatPopup key={room.id} room={room} index={index} />
      ))}
    </div>
  );
};

export default Layout;

