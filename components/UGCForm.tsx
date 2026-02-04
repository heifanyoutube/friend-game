
import React, { useState } from 'react';
import { QuestionType } from '../types';
import { SYSTEM_FEE_PERCENTAGE } from '../constants';

interface UGCFormProps {
  onClose: () => void;
  onCreate: (params: any) => void;
  userPoints: number;
}

export const UGCForm: React.FC<UGCFormProps> = ({ onClose, onCreate, userPoints }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SHORT_ANSWER);
  const [answer, setAnswer] = useState('');
  const [reward, setReward] = useState(10);
  const [participants, setParticipants] = useState(5);
  const [optionsStr, setOptionsStr] = useState('');

  const pool = reward * participants;
  const fee = pool * SYSTEM_FEE_PERCENTAGE;
  const totalCost = pool + fee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = questionType === QuestionType.MULTIPLE_CHOICE ? optionsStr.split(',').map(s => s.trim()) : undefined;
    onCreate({
      title,
      description,
      questionType,
      answer,
      rewardPerPerson: reward,
      maxParticipants: participants,
      options
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">發布新挑戰</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">任務標題</label>
            <input 
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：電影知識挑戰"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">任務問題</label>
            <textarea 
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
              value={description} onChange={e => setDescription(e.target.value)} placeholder="問問大家一個有趣的問題..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">答案類型</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={questionType} onChange={e => setQuestionType(e.target.value as QuestionType)}
              >
                <option value={QuestionType.SHORT_ANSWER}>簡答題</option>
                <option value={QuestionType.MULTIPLE_CHOICE}>選擇題</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">標準答案</label>
              <input 
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={answer} onChange={e => setAnswer(e.target.value)} placeholder="請輸入正確解答"
              />
            </div>
          </div>

          {questionType === QuestionType.MULTIPLE_CHOICE && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">選項 (請用半型逗號隔開)</label>
              <input 
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={optionsStr} onChange={e => setOptionsStr(e.target.value)} placeholder="選項A, 選項B, 選項C"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">單人獎勵</label>
              <input 
                type="number" min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={reward} onChange={e => setReward(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">人數上限</label>
              <input 
                type="number" min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={participants} onChange={e => setParticipants(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700">
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">獎勵池總額：</span>
                <span className="text-white font-bold">{pool} 積分</span>
             </div>
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">系統手續費 (20%)：</span>
                <span className="text-red-400 font-bold">+{fee} 積分</span>
             </div>
             <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
                <span className="text-white font-bold">總支出：</span>
                <span className={`text-xl font-extrabold ${userPoints >= totalCost ? 'text-blue-400' : 'text-red-500'}`}>
                  {totalCost} 積分
                </span>
             </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-800">
          <button 
            disabled={userPoints < totalCost}
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
          >
            {userPoints >= totalCost ? '確定發布任務' : '積分不足'}
          </button>
        </div>
      </div>
    </div>
  );
};
