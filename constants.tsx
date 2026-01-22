
import { MeetingRecord, CompletionStatus, PlanningTerm } from './types';

export const INITIAL_PLANNING_TERMS: PlanningTerm[] = [
  { id: '1', content: '会议开始前必须分发议程。' },
  { id: '2', content: '每项议题讨论时间不得超过15分钟。' },
  { id: '3', content: '会议决议需在24小时内发送给所有相关方。' },
];

export const INITIAL_RECORDS: MeetingRecord[] = [
  {
    id: '1',
    index: 1,
    module: '项目A',
    meetingTime: '2024-05-20',
    resolution: '确定UI设计稿',
    executor: 'Boris',
    plannedCompletionDate: '2024-05-25',
    status: CompletionStatus.IN_PROGRESS,
    attendees: 'Boris, Jane, Mark',
    remarks: '需要尽快确认主色调'
  },
  {
    id: '2',
    index: 2,
    module: '质量管理',
    meetingTime: '2024-05-20',
    resolution: '完成接口测试',
    executor: '卢质恒',
    plannedCompletionDate: '2024-05-22',
    status: CompletionStatus.IN_PROGRESS,
    attendees: '卢质恒, Boris',
    remarks: '后端接口需先行部署'
  },
  {
    id: '3',
    index: 3,
    module: '市场部',
    meetingTime: '2024-05-21',
    resolution: '发布新产品公告',
    executor: 'Hancel',
    plannedCompletionDate: '2024-05-26',
    status: CompletionStatus.DONE,
    attendees: 'Hancel, Lisa',
    remarks: '已联系媒体侧'
  }
];
