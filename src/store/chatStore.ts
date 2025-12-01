import { create } from 'zustand';
import type { Room, Message } from '../types';

interface ChatState {
  // 認證狀態
  currentUser: string;
  isAuthenticated: boolean;
  setCurrentUser: (userId: string) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  logout: () => void;

  // 聊天室列表
  rooms: Room[];
  setRooms: (rooms: Room[] | ((prevRooms: Room[]) => Room[])) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;

  // 當前選中的聊天室
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;

  // 訊息歷史 (按房間 ID 分組)
  messageHistory: Record<string, Message[]>;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (roomId: string, message: Message) => void;
  prependMessages: (roomId: string, messages: Message[]) => void;

  // 訊息游標 (用於分頁)
  messagesCursor: Record<string, string>;
  setMessagesCursor: (roomId: string, cursor: string) => void;

  // 是否還有更多訊息
  hasMoreMessages: Record<string, boolean>;
  setHasMoreMessages: (roomId: string, hasMore: boolean) => void;

  // 清空狀態
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // 初始狀態
  currentUser: '',
  isAuthenticated: false,
  rooms: [],
  currentRoom: null,
  messageHistory: {},
  messagesCursor: {},
  hasMoreMessages: {},

  // Actions
  setCurrentUser: (userId) => set({ currentUser: userId, isAuthenticated: true }),
  
  setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
  
  logout: () => {
    localStorage.removeItem('chatapp_user');
    localStorage.removeItem('chatapp_token');
    set({
      currentUser: '',
      isAuthenticated: false,
      rooms: [],
      currentRoom: null,
      messageHistory: {},
      messagesCursor: {},
      hasMoreMessages: {}
    });
  },

  setRooms: (rooms) => set((state) => ({
    rooms: typeof rooms === 'function' ? rooms(state.rooms) : rooms
  })),

  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms, room],
  })),

  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map((room) =>
      room.id === roomId ? { ...room, ...updates } : room
    ),
  })),

  setCurrentRoom: (room) => set({ currentRoom: room }),

  setMessages: (roomId, messages) => set((state) => ({
    messageHistory: {
      ...state.messageHistory,
      [roomId]: messages,
    },
  })),

  addMessage: (roomId, message) => set((state) => {
    const existingMessages = state.messageHistory[roomId] || [];
    // 檢查是否已存在（避免重複）
    if (existingMessages.some((m) => m.id === message.id)) {
      return state;
    }
    return {
      messageHistory: {
        ...state.messageHistory,
        [roomId]: [...existingMessages, message],
      },
    };
  }),

  prependMessages: (roomId, messages) => set((state) => {
    const existingMessages = state.messageHistory[roomId] || [];
    return {
      messageHistory: {
        ...state.messageHistory,
        [roomId]: [...messages, ...existingMessages],
      },
    };
  }),

  setMessagesCursor: (roomId, cursor) => set((state) => ({
    messagesCursor: {
      ...state.messagesCursor,
      [roomId]: cursor,
    },
  })),

  setHasMoreMessages: (roomId, hasMore) => set((state) => ({
    hasMoreMessages: {
      ...state.hasMoreMessages,
      [roomId]: hasMore,
    },
  })),

  clearChat: () => set({
    rooms: [],
    currentRoom: null,
    messageHistory: {},
    messagesCursor: {},
    hasMoreMessages: {},
  }),
}));

export default useChatStore;
