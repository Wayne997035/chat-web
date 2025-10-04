import { useChatStore } from '../../store/chatStore';
import './UserSelector.css';

const users = [
  { id: 'user_alice', name: 'Alice' },
  { id: 'user_bob', name: 'Bob' },
  { id: 'user_charlie', name: 'Charlie' },
  { id: 'user_david', name: 'David' },
];

const UserSelector = () => {
  const { currentUser, setCurrentUser, clearChat } = useChatStore();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = e.target.value;
    
    // 立即更新 UI，不等待清理完成
    setCurrentUser(newUser);
    
    // 使用 setTimeout 讓 UI 先更新
    setTimeout(() => {
      clearChat();
    }, 0);
  };

  return (
    <div className="user-info">
      <h3>聊天室測試</h3>
      <select
        className="user-select"
        value={currentUser}
        onChange={handleUserChange}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSelector;

