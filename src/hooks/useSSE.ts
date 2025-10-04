import { useEffect, useRef, useState } from 'react';
import type { Message } from '../types';

interface UseSSEOptions {
  roomId: string;
  userId: string;
  onMessage?: (message: Message) => void;
  onError?: (error: Event) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chat-gateway-1.onrender.com/api/v1';

/**
 * SSE (Server-Sent Events) Hook
 * 用於接收即時訊息
 */
export const useSSE = ({ roomId, userId, onMessage, onError }: UseSSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 使用 ref 保存回調函數，避免依賴變化導致重連
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onMessage, onError]);

  useEffect(() => {
    // 不連接臨時聊天室或空 roomId
    if (!roomId || !userId || roomId.startsWith('temp_')) {
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      // 清除舊的連接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // 清除重試計時器
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // 建立新的 SSE 連接
      const url = `${API_BASE_URL}/messages/stream?room_id=${roomId}&user_id=${userId}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // 連接打開
      eventSource.onopen = () => {
        if (isMounted) {
          setIsConnected(true);
          retryCountRef.current = 0;
        }
      };

      // 監聽連接確認事件
      eventSource.addEventListener('connected', () => {
        if (isMounted) {
          setIsConnected(true);
        }
      });

      // 監聽心跳事件
      eventSource.addEventListener('ping', () => {
        // 保持連接活躍
      });

      // 監聽訊息事件
      eventSource.addEventListener('message', (e) => {
        try {
          const message: Message = JSON.parse(e.data);
          if (message.room_id === roomId && isMounted) {
            onMessageRef.current?.(message);
          }
        } catch (error) {
          console.error('解析 SSE 訊息失敗:', error);
        }
      });

      // 錯誤處理
      eventSource.onerror = (error) => {
        if (!isMounted) return;
        
        setIsConnected(false);
        onErrorRef.current?.(error);
        
        // 關閉舊連接
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // 不要自動重試了，減少請求
        // 如果需要重連，讓用戶重新進入聊天室
      };
    };

    connect();

    // 清理函數
    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setIsConnected(false);
    };
  }, [roomId, userId]);

  return { isConnected };
};

export default useSSE;

