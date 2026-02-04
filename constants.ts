
import { TaskType, QuestionType, Reward } from './types';

export const SYSTEM_FEE_PERCENTAGE = 0.20;
export const SUBMISSION_COOLDOWN_MS = 30000; // 30 秒防刷冷卻時間

export const MOCK_REWARDS: Reward[] = [
  {
    id: 'r1',
    name: '7-11 咖啡兌換券',
    description: '全台門市皆可兌換大杯拿鐵一杯。',
    pointsCost: 500,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'r2',
    name: '傳奇冒險家勳章',
    description: '專屬個人檔案標章，彰顯你的資深地位。',
    pointsCost: 200,
    stock: 999,
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'r3',
    name: 'Steam 300元 點數卡',
    description: '可用於購買遊戲或軟體的虛擬禮物卡。',
    pointsCost: 1500,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=400&h=300'
  }
];

export const INITIAL_TASKS = [
  {
    id: 't-official-1',
    creatorId: null,
    type: TaskType.OFFICIAL,
    questionType: QuestionType.MULTIPLE_CHOICE,
    title: '每日百科：地理篇',
    description: '請問太陽系中，哪一顆行星被稱為「紅色星球」？',
    options: ['金星', '火星', '木星', '土星'],
    answer: '火星',
    rewardPerPerson: 50,
    maxParticipants: 1000,
    currentParticipants: 128,
    totalCost: 0,
    createdAt: Date.now()
  },
  {
    id: 't-official-2',
    creatorId: null,
    type: TaskType.OFFICIAL,
    questionType: QuestionType.SHORT_ANSWER,
    title: '成語填空',
    description: '請填出正確成語：「破釜○舟」',
    answer: '沉',
    rewardPerPerson: 30,
    maxParticipants: 500,
    currentParticipants: 89,
    totalCost: 0,
    createdAt: Date.now()
  }
];
