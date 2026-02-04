
export enum TaskType {
  OFFICIAL = 'OFFICIAL',
  UGC = 'UGC'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface User {
  id: string;
  name: string;
  points: number;
  avatar: string;
  cooldownUntil: number | null;
}

export interface Task {
  id: string;
  creatorId: string | null; // null for official
  type: TaskType;
  questionType: QuestionType;
  title: string;
  description: string;
  options?: string[]; // For MULTIPLE_CHOICE
  answer: string;
  rewardPerPerson: number;
  maxParticipants: number;
  currentParticipants: number;
  totalCost: number;
  createdAt: number;
}

export interface Submission {
  id: string;
  taskId: string;
  userId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timestamp: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  image: string;
}

export interface GameState {
  currentUser: User;
  users: User[];
  tasks: Task[];
  submissions: Submission[];
  rewards: Reward[];
}
