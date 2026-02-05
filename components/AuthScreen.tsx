// components/AuthScreen.tsx - 簡化版（無需電郵認證）  
import React, { useState, useEffect } from 'react';  
import { User } from '../types';  
interface AuthScreenProps {  
  onLogin: (user: User) => void;  
  mockUsers: User[];  
}  
export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, mockUsers }) => {  
  const [isSignUp, setIsSignUp] = useState(false);  
  const [username, setUsername] = useState('');  
  const [password, setPassword] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');  
  // 從 localStorage 加載已註冊用戶  
  const [registeredUsers, setRegisteredUsers] = useState<Array<{username: string, password: string, name: string}>>([]);  
  useEffect(() => {  
    const saved = localStorage.getItem('registeredUsers');  
    if (saved) {  
      setRegisteredUsers(JSON.parse(saved));  
    }  
  }, []);  
  const handleAuth = (e: React.FormEvent) => {  
    e.preventDefault();  
    setError('');  
      
    if (!username || !password) {  
      setError('請填寫所有欄位');  
      return;  
    }  
    setLoading(true);  
    setTimeout(() => {  
      if (isSignUp) {  
        // 註冊邏輯  
        if (registeredUsers.some(u => u.username === username)) {  
          setError('此用戶名已被使用');  
          setLoading(false);  
          return;  
        }  
        const newRegisteredUser = {  
          username,  
          password,  
          name: username  
        };  
        const updatedUsers = [...registeredUsers, newRegisteredUser];  
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));  
        setRegisteredUsers(updatedUsers);  
        // 自動登入  
        const newUser: User = {  
          id: `u-${Date.now()}`,  
          name: username,  
          points: 1000,  
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,  
          cooldownUntil: null  
        };  
        onLogin(newUser);  
      } else {  
        // 登入邏輯  
        const registeredUser = registeredUsers.find(u => u.username === username && u.password === password);  
          
        if (registeredUser) {  
          const user: User = {  
            id: `u-${username}`,  
            name: registeredUser.name,  
            points: 1000,  
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,  
            cooldownUntil: null  
          };  
          onLogin(user);  
        } else {  
          setError('用戶名或密碼錯誤');  
        }  
      }  
      setLoading(false);  
    }, 800);  
  };  
  return (  
    <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-4 overflow-hidden">  
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>  
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>  
        
      <div className="w-full max-w-md relative">  
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">  
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50"></div>  
            
          <div className="text-center mb-8">  
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl italic mx-auto mb-4 shadow-lg shadow-blue-500/20">  
              QS  
            </div>  
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">任務星域</h1>  
            <p className="text-gray-400 text-sm">  
              {isSignUp ? '建立你的冒險者帳號' : '登入以繼續你的旅程'}  
            </p>  
          </div>  
          <form onSubmit={handleAuth} className={`space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>  
            {error && (  
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 text-xs font-bold text-center">  
                {error}  
              </div>  
            )}  
            <div>  
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">用戶名</label>  
              <input  
                required  
                disabled={loading}  
                type="text"  
                placeholder="輸入用戶名"  
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"  
                value={username}  
                onChange={(e) => setUsername(e.target.value)}  
              />  
            </div>  
            <div>  
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">密碼</label>  
              <input  
                required  
                disabled={loading}  
                type="password"  
                placeholder="••••••••"  
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"  
                value={password}  
                onChange={(e) => setPassword(e.target.value)}  
              />  
            </div>  
            <button  
              disabled={loading}  
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"  
            >  
              {loading ? (  
                <>  
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>  
                  <span>處理中...</span>  
                </>  
              ) : (  
                isSignUp ? '建立帳號' : '登入星域'  
              )}  
            </button>  
            <div className="text-center pt-2">  
              <button  
                type="button"  
                disabled={loading}  
                onClick={() => {  
                  setIsSignUp(!isSignUp);  
                  setError('');  
                  setUsername('');  
                  setPassword('');  
                }}  
                className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30"  
              >  
                {isSignUp ? (  
                  <>已經有帳號了？ <span className="text-blue-400 font-bold ml-1">返回登入</span></>  
                ) : (  
                  <>還沒有帳號？ <span className="text-purple-400 font-bold ml-1">立即註冊</span></>  
                )}  
              </button>  
            </div>  
          </form>  
          {/* 測試帳號提示 */}  
          {!isSignUp && (  
            <div className="mt-6 pt-6 border-t border-gray-800">  
              <p className="text-xs text-gray-500 text-center mb-3">測試帳號：</p>  
              <div className="space-y-2">  
                {mockUsers.slice(0, 2).map(user => (  
                  <button  
                    key={user.id}  
                    type="button"  
                    disabled={loading}  
                    onClick={() => {  
                      setUsername(user.name);  
                      setPassword('test');  
                    }}  
                    className="w-full text-xs py-2 px-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300 transition-all disabled:opacity-30"  
                  >  
                    {user.name}  
                  </button>  
                ))}  
              </div>  
            </div>  
          )}  
        </div>  
      </div>  
    </div>  
  );  
};  
