/**
 * 驗證訊息內容
 */
export const validateMessage = (content: string): void => {
  if (!content || content.trim().length === 0) {
    throw new Error('訊息不能為空');
  }
  
  if (content.length > 10000) {
    throw new Error('訊息長度超過限制 (最多 10000 字符)');
  }
  
  if (content.includes('\x00')) {
    throw new Error('訊息包含非法字符');
  }
};

/**
 * 驗證聊天室名稱
 */
export const validateRoomName = (name: string): void => {
  if (!name || name.trim().length === 0) {
    throw new Error('聊天室名稱不能為空');
  }
  
  if (name.length > 100) {
    throw new Error('聊天室名稱超過限制 (最多 100 字符)');
  }
  
  if (name.includes('\x00')) {
    throw new Error('聊天室名稱包含非法字符');
  }
};

/**
 * 驗證用戶 ID
 */
export const validateUserId = (userId: string): void => {
  if (!userId || userId.trim().length === 0) {
    throw new Error('用戶 ID 不能為空');
  }
  
  if (userId.length > 100) {
    throw new Error('用戶 ID 格式錯誤');
  }
  
  if (/[\x00${}[\]]/.test(userId)) {
    throw new Error('用戶 ID 包含非法字符');
  }
};

/**
 * 驗證聊天室 ID (MongoDB ObjectID 格式)
 */
export const validateRoomId = (roomId: string): void => {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error('聊天室 ID 不能為空');
  }
  
  if (roomId.length !== 24) {
    throw new Error('聊天室 ID 格式錯誤');
  }
  
  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
    throw new Error('聊天室 ID 格式錯誤');
  }
};

