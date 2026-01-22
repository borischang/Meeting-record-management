
export enum CompletionStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  DONE = '已完成'
}

export interface MeetingRecord {
  id: string;
  index: number;
  module: string;
  meetingTime: string;
  resolution: string;
  executor: string;
  plannedCompletionDate: string;
  status: CompletionStatus;
  attendees: string; // Comma separated list or single string
  remarks: string;
}

export interface PlanningTerm {
  id: string;
  content: string;
}

export interface ReminderConfig {
  startTime: string;
  endTime: string;
  reminderOffset: number; // minutes before end
  message: string;
}

export type ViewType = 'dashboard' | 'planning' | 'records' | 'structure';
export type CalendarRange = 'week' | 'month' | 'year';
export type Language = 'zh' | 'en';
