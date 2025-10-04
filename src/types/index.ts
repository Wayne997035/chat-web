// 用戶類型
export interface User {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

// 成員類型
export interface Member {
  user_id: string;
  role: 'admin' | 'member';
}

// 聊天室類型
export interface Room {
  id: string;
  name: string;
  type: 'direct' | 'group';
  owner_id: string;
  members: Member[];
  created_at: number;
  updated_at?: number;
  last_message?: string;
  last_message_time?: number;
  unread_count?: number;
  isTemporary?: boolean;
  targetContactId?: string;
}

// 消息類型
export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'system';
  created_at: number;
  updated_at?: number;
  read_by?: string[];
}

// API 回應類型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  cursor?: string;
  next_cursor?: string;
  has_more?: boolean;
}

// SSE 事件類型
export interface SSEMessage {
  type: 'connected' | 'ping' | 'message' | 'error';
  data?: any;
}

