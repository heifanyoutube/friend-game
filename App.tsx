
import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, Submission, TaskType, QuestionType, Reward } from './types';
import { INITIAL_TASKS, MOCK_REWARDS } from './constants';
import { createUGCTaskLogic, submitAnswerLogic } from './services/gameLogic';
import { TaskCard } from './components/TaskCard';
import { UGCForm } from './components/UGCForm';
import { AuthScreen } from './components/AuthScreen';

const App: React.FC = () => {
  // 狀態初始化 - 初始設為 null 表示未登入
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([
    { id: 'u-1', name: '冒險者一號', points: 1000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', cooldownUntil: null },
    { id: 'u-2', name: '遊戲管理員', points: 99999, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GM', cooldownUntil: null },
    { id: 'u-3', name: '小明', points: 450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ming', cooldownUntil: null },
    { id: 'u-4', name: '老王', points: 800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang', cooldownUntil: null },
  ]);

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard' | 'shop'>('quests');
  const [showUGCModal, setShowUGCModal] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // 模擬檢查 LocalStorage 的登入狀態
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: User) => {
    // 如果是新用戶，加入用戶列表
    if (!users.find(u => u.id === user.id)) {
      setUsers(prev => [...prev, user]);
    }
    setCurrentUser(user);
    setNotification({ msg: `歡迎回來，${user.name}！`, type: 'success' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotification({ msg: '已成功登出星域', type: 'success' });
  };

  // 自動清除通知
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateTask = (params: any) => {
    if (!currentUser) return;
    const result = createUGCTaskLogic(currentUser, params);
    if (result.success && result.newTask && result.updatedUser) {
      setTasks(prev => [result.newTask!, ...prev]);
      setCurrentUser(result.updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? result.updatedUser! : u));
      setShowUGCModal(false);
      setNotification({ msg: '任務發布成功！', type: 'success' });
    } else {
      setNotification({ msg: result.error || '建立任務失敗', type: 'error' });
    }
  };

  const handleSubmitQuest = (taskId: string, answer: string) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const result = submitAnswerLogic(currentUser, task, answer, submissions);
    if (result.success) {
      if (result.isCorrect) {
        setNotification({ msg: `回答正確！你獲得了 ${result.pointsEarned} 積分！`, type: 'success' });
      } else {
        setNotification({ msg: '回答錯誤！請在冷卻結束後重試。', type: 'error' });
      }

      const newSubmission: Submission = {
        id: `s-${Date.now()}`,
        taskId,
        userId: currentUser.id,
        answer,
        isCorrect: result.isCorrect,
        pointsEarned: result.pointsEarned,
        timestamp: Date.now()
      };
      setSubmissions(prev => [...prev, newSubmission]);

      if (result.updatedUser) {
        setCurrentUser(result.updatedUser);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? result.updatedUser! : u));
      }
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, currentParticipants: t.currentParticipants + 1 } : t));
    } else {
      setNotification({ msg: result.error || '提交失敗', type: 'error' });
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (!currentUser) return;
    if (currentUser.points < reward.pointsCost) {
      setNotification({ msg: '積分不足，快去解任務吧！', type: 'error' });
      return;
    }
    const updatedUser = { ...currentUser, points: currentUser.points - reward.pointsCost };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setNotification({ msg: `成功兌換 ${reward.name}！`, type: 'success' });
  };

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold animate-pulse">正在開啟星域傳送門...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} mockUsers={users.slice(0, 4)} />;
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0 animate-in fade-in duration-700">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic">QS</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tighter">任務星域</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-yellow-400 font-bold">★</span>
              <span className="text-sm font-bold text-white">{currentUser.points}</span>
            </div>
            <button onClick={handleLogout} title="登出">
              <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-blue-500 bg-gray-800 hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 移動端標籤切換 */}
        <div className="flex bg-gray-900 p-1 rounded-2xl mb-8 border border-gray-800 lg:hidden">
          <button onClick={() => setActiveTab('quests')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'quests' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>冒險任務</button>
          <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>英雄榜</button>
          <button onClick={() => setActiveTab('shop')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'shop' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>福利社</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 桌面端側邊欄 */}
          <aside className="hidden lg:block lg:col-span-3 space-y-2">
             <button onClick={() => setActiveTab('quests')} className={`w-full text-left px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 ${activeTab === 'quests' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                <div className={`w-2 h-2 rounded-full ${activeTab === 'quests' ? 'bg-white' : 'bg-transparent'}`} /> 冒險任務
             </button>
             <button onClick={() => setActiveTab('leaderboard')} className={`w-full text-left px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                <div className={`w-2 h-2 rounded-full ${activeTab === 'leaderboard' ? 'bg-white' : 'bg-transparent'}`} /> 英雄榜
             </button>
             <button onClick={() => setActiveTab('shop')} className={`w-full text-left px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 ${activeTab === 'shop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                <div className={`w-2 h-2 rounded-full ${activeTab === 'shop' ? 'bg-white' : 'bg-transparent'}`} /> 福利社
             </button>
            <div className="pt-8 px-6">
               <button 
                  onClick={() => setShowUGCModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl transform active:scale-95 transition-all"
                >
                  發布新任務
                </button>
            </div>
          </aside>

          {/* 內容顯示區 */}
          <div className="lg:col-span-9">
            {activeTab === 'quests' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-white">活躍中的冒險</h2>
                  <button onClick={() => setShowUGCModal(true)} className="lg:hidden px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl">發布任務</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onSubmit={handleSubmitQuest} 
                      disabled={currentUser.cooldownUntil !== null && Date.now() < currentUser.cooldownUntil}
                      hasSubmitted={submissions.some(s => s.taskId === task.id && s.userId === currentUser.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                  <h2 className="text-2xl font-bold text-white">英雄積分榜</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {users.sort((a, b) => b.points - a.points).map((user, idx) => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center font-black rounded-lg ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                          {idx + 1}
                        </span>
                        <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800" alt={user.name} />
                        <div>
                          <div className="font-bold text-white">{user.name} {user.id === currentUser.id && <span className="text-xs text-blue-400 ml-1">(你自己)</span>}</div>
                          <div className="text-xs text-gray-500">成就稱號：冒險見習生</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-white">{user.points}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">總積分</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">福利商店</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {MOCK_REWARDS.map(reward => (
                    <div key={reward.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
                      <img src={reward.image} alt={reward.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                      <div className="p-6">
                        <h3 className="font-bold text-white text-lg mb-1">{reward.name}</h3>
                        <p className="text-sm text-gray-400 mb-6 h-10 overflow-hidden leading-snug">{reward.description}</p>
                        <button 
                          onClick={() => handlePurchase(reward)}
                          disabled={currentUser.points < reward.pointsCost}
                          className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl font-bold flex justify-between px-4 items-center hover:bg-blue-600 hover:border-blue-500 transition-all disabled:opacity-30"
                        >
                          <span>立即兌換</span>
                          <span className="text-sm font-black text-emerald-400">{reward.pointsCost} 積分</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 移動端底部選單 */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-6 py-4 z-40 flex justify-between items-center backdrop-blur-md">
        <button onClick={() => setActiveTab('quests')} className={`flex flex-col items-center gap-1 ${activeTab === 'quests' ? 'text-blue-500' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span className="text-[10px] font-bold">任務</span>
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'leaderboard' ? 'text-blue-500' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          <span className="text-[10px] font-bold">排行</span>
        </button>
        <button onClick={() => setShowUGCModal(true)} className="w-12 h-12 bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center -translate-y-6 border-4 border-gray-950 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center gap-1 ${activeTab === 'shop' ? 'text-blue-500' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span className="text-[10px] font-bold">商店</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-gray-500">
           <img src={currentUser.avatar} className="w-6 h-6 rounded-full grayscale bg-gray-800" alt="Me" />
           <span className="text-[10px] font-bold">我的</span>
        </div>
      </footer>

      {/* 通知元件 */}
      {notification && (
        <div className={`fixed bottom-24 lg:bottom-10 right-10 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce ${notification.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">
            {notification.type === 'success' ? '✓' : '!'}
          </div>
          <p className="font-bold text-sm">{notification.msg}</p>
        </div>
      )}

      {/* 彈出表單 */}
      {showUGCModal && (
        <UGCForm 
          onClose={() => setShowUGCModal(false)} 
          onCreate={handleCreateTask} 
          userPoints={currentUser.points}
        />
      )}
    </div>
  );
};

export default App;
