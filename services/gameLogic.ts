
import { User, Task, Submission, TaskType, QuestionType, GameState } from '../types';
import { SYSTEM_FEE_PERCENTAGE, SUBMISSION_COOLDOWN_MS } from '../constants';

/**
 * Handles logic for a player creating a UGC task.
 * Implements economy balance: S_cost = (Sum of rewards) * (1 + System Fee)
 */
export const createUGCTaskLogic = (
  creator: User,
  params: {
    title: string;
    description: string;
    questionType: QuestionType;
    options?: string[];
    answer: string;
    rewardPerPerson: number;
    maxParticipants: number;
  }
): { success: boolean; error?: string; updatedUser?: User; newTask?: Task } => {
  const totalRewardPool = params.rewardPerPerson * params.maxParticipants;
  const systemFee = totalRewardPool * SYSTEM_FEE_PERCENTAGE;
  const totalCost = totalRewardPool + systemFee;

  if (creator.points < totalCost) {
    return { success: false, error: 'Insufficient points. You need ' + totalCost + ' points.' };
  }

  const newTask: Task = {
    id: `t-ugc-${Date.now()}`,
    creatorId: creator.id,
    type: TaskType.UGC,
    questionType: params.questionType,
    title: params.title,
    description: params.description,
    options: params.options,
    answer: params.answer,
    rewardPerPerson: params.rewardPerPerson,
    maxParticipants: params.maxParticipants,
    currentParticipants: 0,
    totalCost: totalCost,
    createdAt: Date.now()
  };

  const updatedUser = {
    ...creator,
    points: creator.points - totalCost
  };

  return { success: true, updatedUser, newTask };
};

/**
 * Handles task submission validation.
 */
export const submitAnswerLogic = (
  user: User,
  task: Task,
  answer: string,
  existingSubmissions: Submission[]
): { success: boolean; isCorrect: boolean; error?: string; pointsEarned: number; updatedUser?: User } => {
  // 1. Anti-cheat: Check if user already submitted
  const alreadySubmitted = existingSubmissions.some(s => s.taskId === task.id && s.userId === user.id);
  if (alreadySubmitted) {
    return { success: false, isCorrect: false, error: 'You have already attempted this task.', pointsEarned: 0 };
  }

  // 2. Anti-cheat: Check Cooldown
  if (user.cooldownUntil && Date.now() < user.cooldownUntil) {
    const remainingSeconds = Math.ceil((user.cooldownUntil - Date.now()) / 1000);
    return { success: false, isCorrect: false, error: `Cooldown active. Please wait ${remainingSeconds}s.`, pointsEarned: 0 };
  }

  // 3. Check Capacity
  if (task.currentParticipants >= task.maxParticipants) {
    return { success: false, isCorrect: false, error: 'Task is already full.', pointsEarned: 0 };
  }

  // 4. Validate Answer
  const isCorrect = task.answer.trim().toLowerCase() === answer.trim().toLowerCase();
  const pointsEarned = isCorrect ? task.rewardPerPerson : 0;

  const updatedUser: User = {
    ...user,
    points: user.points + pointsEarned,
    cooldownUntil: Date.now() + SUBMISSION_COOLDOWN_MS
  };

  return { success: true, isCorrect, pointsEarned, updatedUser };
};
