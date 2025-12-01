import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useChatStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('請輸入用戶名稱');
      return;
    }

    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }

    setIsLoading(true);
    setError('');

    // 模擬登入請求
    setTimeout(() => {
      // TODO: 實際應該呼叫後端 API 驗證
      // 這裡先簡單驗證
      if (password.length >= 4) {
        // 登入成功
        setCurrentUser(username);
        localStorage.setItem('chatapp_user', username);
        localStorage.setItem('chatapp_token', 'mock_token_' + Date.now());
        navigate('/');
      } else {
        setError('密碼至少需要 4 個字元');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-content">
            <div className="brand-logo">COVER ONES</div>
            <h1 className="brand-title">連結你我</h1>
            <p className="brand-description">
              簡單、安全、即時的通訊體驗
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <h2 className="login-title">登入</h2>
            <p className="login-subtitle">歡迎回來，請登入您的帳號</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  用戶名稱
                </label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="請輸入用戶名稱"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  密碼
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? '登入中...' : '登入'}
              </button>
            </form>

            <div className="register-link">
              還沒有帳號？
              <Link to="/register" className="link-btn">
                立即註冊
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

