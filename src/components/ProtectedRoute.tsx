import { Navigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, setCurrentUser, setIsAuthenticated } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 檢查 localStorage 中是否有登入資訊
    const user = localStorage.getItem('chatapp_user');
    const token = localStorage.getItem('chatapp_token');

    if (user && token) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [setCurrentUser, setIsAuthenticated]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        color: 'white',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        載入中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

