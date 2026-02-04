
import React, { useState } from 'react';
import { Task, TaskType, QuestionType } from '../types';

interface TaskCardProps {
  task: Task;
  onSubmit: (taskId: string, answer: string) => void;
  disabled: boolean;
  hasSubmitted: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSubmit, disabled, hasSubmitted }) => {
  const [userAnswer, setUserAnswer] = useState('');

  const handleLocalSubmit = () => {
    if (!userAnswer.trim()) return;
    onSubmit(task.id, userAnswer);
    setUserAnswer('');
  };

  return (
    <div className={`p-6 rounded-2xl border ${task.type === TaskType.OFFICIAL ? 'border-purple-500/30 bg-purple-900/10' : 'border-blue-500/30 bg-blue-900/10'} shadow-lg transition-all hover:scale-[1.01]`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${task.type === TaskType.OFFICIAL ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
            {task.type === TaskType.OFFICIAL ? '官方任務' : '玩家任務'}
          </span>
          <h3 className="mt-2 text-xl font-bold text-white">{task.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold">+{task.rewardPerPerson} 積分</div>
          <div className="text-xs text-gray-400">{task.currentParticipants}/{task.maxParticipants} 人已參與</div>
        </div>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">{task.description}</p>

      {hasSubmitted ? (
        <div className="bg-gray-800/50 p-3 rounded-lg text-center text-gray-400 text-sm italic">
          你已經參與過此任務了。
        </div>
      ) : (
        <div className="space-y-4">
          {task.questionType === QuestionType.MULTIPLE_CHOICE && task.options ? (
            <div className="grid grid-cols-1 gap-2">
              {task.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => setUserAnswer(opt)}
                  className={`p-3 text-left rounded-xl border transition-colors ${
                    userAnswer === opt 
                    ? 'bg-blue-600 border-blue-400 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  } disabled:opacity-50`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              placeholder="請輸入你的答案..."
              disabled={disabled}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          )}

          <button
            onClick={handleLocalSubmit}
            disabled={disabled || !userAnswer}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            提交挑戰
          </button>
        </div>
      )}
    </div>
  );
};
