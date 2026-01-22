
import React, { useState } from 'react';
import { MeetingRecord, CompletionStatus } from '../types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CalendarProps {
  records: MeetingRecord[];
}

const MeetingCalendar: React.FC<CalendarProps> = ({ records }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecords, setSelectedDayRecords] = useState<MeetingRecord[] | null>(null);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getDayRecords = (day: number) => {
    const dStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return records.filter(r => r.meetingTime.startsWith(dStr));
  };

  const handleDayClick = (day: number) => {
    const dayRecords = getDayRecords(day);
    setSelectedDayRecords(dayRecords);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const changeYear = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + offset);
    setCurrentDate(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          <button 
            onClick={() => changeYear(-1)}
            className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
            title="上一年"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
            title="上一月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        <div className="font-bold text-blue-800 text-sm md:text-base cursor-default select-none">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
            title="下一月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => changeYear(1)}
            className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
            title="下一年"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(d => (
          <div key={d} className="bg-blue-600 text-white text-[10px] text-center py-1 font-bold rounded-t-sm">{d}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="bg-blue-50/30 aspect-square rounded-sm" />;
          
          const dayRecords = getDayRecords(day);
          const hasMeeting = dayRecords.length > 0;
          const isAllDone = hasMeeting && dayRecords.every(r => r.status === CompletionStatus.DONE);
          
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`aspect-square text-[10px] md:text-xs rounded-sm transition-all border ${
                hasMeeting 
                  ? isAllDone ? 'bg-green-200 border-green-300 text-green-800' : 'bg-orange-100 border-orange-200 text-orange-800'
                  : 'bg-blue-50 border-blue-100 text-gray-500 hover:bg-blue-100'
              } flex items-center justify-center font-semibold relative`}
            >
              {day}
              {hasMeeting && <div className="absolute bottom-1 w-1 h-1 bg-current rounded-full" />}
            </button>
          );
        })}
      </div>

      {selectedDayRecords !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-900">当日任务详情</h3>
              <button onClick={() => setSelectedDayRecords(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            {selectedDayRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">当天没有会议记录</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {selectedDayRecords.map(r => (
                  <div key={r.id} className="p-3 border border-blue-100 rounded-xl bg-blue-50/50">
                    <div className="flex justify-between font-bold text-blue-800">
                      <span>{r.module}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        r.status === CompletionStatus.DONE ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.resolution}</p>
                    <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                      <span>执行人: {r.executor}</span>
                      <span>期限: {r.plannedCompletionDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar;
