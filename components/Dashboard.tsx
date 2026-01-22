
import React, { useMemo, useState, useEffect } from 'react';
import { MeetingRecord, CalendarRange, CompletionStatus, ViewType, Language } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import MeetingCalendar from './MeetingCalendar';
import { GoogleGenAI } from "@google/genai";
import { AlertCircle } from 'lucide-react';

interface DashboardProps {
  records: MeetingRecord[];
  range: CalendarRange;
  onRangeChange: (r: CalendarRange) => void;
  onNavigate: (v: ViewType) => void;
  onNavigateWithFilter?: (executor: string) => void;
  lang: Language;
}

const AestheticGauge: React.FC<{ value: number; title: string; bgImage?: string }> = ({ value, title, bgImage }) => {
  const percent = Math.min(Math.max(value, 0), 1);
  const strokeWidth = 14;
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center relative p-2 group">
      {bgImage && (
        <img 
          src={bgImage} 
          alt="decoration" 
          className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-full blur-xl scale-125 transition-all group-hover:opacity-20"
        />
      )}
      <h3 className="text-blue-900 font-bold mb-4 text-sm tracking-wide">{title}</h3>
      <div className="relative w-44 h-24 overflow-hidden">
        <svg className="w-44 h-44 -rotate-180" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} strokeDasharray={`${circumference} ${circumference}`} className="opacity-40" />
          <circle cx="80" cy="80" r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth={strokeWidth} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 text-center">
          <span className="text-3xl font-black text-blue-900">{Math.round(percent * 100)}</span>
          <span className="text-sm font-bold text-blue-400 ml-0.5">%</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ records, range, onRangeChange, onNavigateWithFilter, lang }) => {
  const [gaugeBg, setGaugeBg] = useState<string>('');
  const now = useMemo(() => new Date(), []);

  const t = {
    zh: {
      dashTitle: '概览仪表盘',
      overdue: '逾期未决事项',
      rate1: '会议决议执行率',
      rate2: '上次会议执行率',
      todoTitle: '待办统计 (Top 5)',
      notStarted: '未开始',
      inProgress: '进行中',
      calendar: '会议日历',
      trendTitle: '会议决议执行率趋势',
      rateLabel: '执行率',
      week: '周', month: '月', year: '年'
    },
    en: {
      dashTitle: 'Overview Dashboard',
      overdue: 'Overdue Items',
      rate1: 'Resolution Execution Rate',
      rate2: 'Last Meeting Execution Rate',
      todoTitle: 'Todo Statistics (Top 5)',
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      calendar: 'Calendar',
      trendTitle: 'Execution Rate Trend',
      rateLabel: 'Rate',
      week: 'W', month: 'M', year: 'Y'
    }
  }[lang];

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: 'abstract minimalist business dashboard decoration, soft pink and deep blue gradients, glassmorphism, high quality, 512x512' }] }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) setGaugeBg(`data:image/png;base64,${part.inlineData.data}`);
        }
      } catch (err) { console.error("AI fail", err); }
    };
    fetchAsset();
  }, []);

  const totalExecRate = useMemo(() => {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    const relevant = records.filter(r => new Date(r.meetingTime) >= start && new Date(r.meetingTime) <= now);
    return relevant.length ? (relevant.filter(r => r.status === CompletionStatus.DONE).length / relevant.length) : 0;
  }, [records, now]);

  const lastMeetingExecRate = useMemo(() => {
    const past = records.filter(r => new Date(r.meetingTime) <= now).sort((a,b) => new Date(b.meetingTime).getTime() - new Date(a.meetingTime).getTime());
    if (!past.length) return 0;
    const sameDay = records.filter(r => r.meetingTime === past[0].meetingTime);
    return sameDay.filter(r => r.status === CompletionStatus.DONE).length / sameDay.length;
  }, [records, now]);

  const overdueCount = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    return records.filter(r => new Date(r.plannedCompletionDate) < today && r.status !== CompletionStatus.DONE).length;
  }, [records]);

  const trendData = useMemo(() => {
    const start = new Date(now);
    if (range === 'week') start.setDate(now.getDate() - 6);
    else if (range === 'month') start.setDate(now.getDate() - 29);
    else start.setFullYear(now.getFullYear() - 1);
    const dayMap: Record<string, { total: number; done: number }> = {};
    records.forEach(r => {
      if (new Date(r.meetingTime) >= start && new Date(r.meetingTime) <= now) {
        if (!dayMap[r.meetingTime]) dayMap[r.meetingTime] = { total: 0, done: 0 };
        dayMap[r.meetingTime].total++;
        if (r.status === CompletionStatus.DONE) dayMap[r.meetingTime].done++;
      }
    });
    return Object.keys(dayMap).sort().map(date => ({ date, rate: Math.round((dayMap[date].done / dayMap[date].total) * 100) }));
  }, [records, range, now]);

  const executorChartData = useMemo(() => {
    const map: Record<string, { executor: string; notStarted: number; inProgress: number; total: number }> = {};
    records.forEach(r => {
      if (!map[r.executor]) map[r.executor] = { executor: r.executor, notStarted: 0, inProgress: 0, total: 0 };
      if (r.status === CompletionStatus.NOT_STARTED) { map[r.executor].notStarted++; map[r.executor].total++; }
      if (r.status === CompletionStatus.IN_PROGRESS) { map[r.executor].inProgress++; map[r.executor].total++; }
    });
    return Object.values(map).filter(item => item.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [records]);

  const handleBarClick = (data: any) => {
    if (onNavigateWithFilter && data && data.executor) {
      onNavigateWithFilter(data.executor);
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-b border-blue-200 pb-4 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-blue-800">{t.dashTitle}</h2>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-pink-100 px-4 py-1.5 rounded-full border border-pink-200 animate-pulse">
            <AlertCircle className="w-4 h-4 text-pink-600" />
            <span className="text-xs font-black text-pink-700">{t.overdue}：{overdueCount}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-6 items-center justify-center bg-blue-50/40 p-6 rounded-3xl border border-blue-100 shadow-inner">
          <AestheticGauge value={totalExecRate} title={t.rate1} bgImage={gaugeBg} />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2" />
          <AestheticGauge value={lastMeetingExecRate} title={t.rate2} bgImage={gaugeBg} />
        </div>

        <div className="bg-white/50 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-blue-800 font-bold">{t.todoTitle}</h3>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400"></div> {t.notStarted}</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> {t.inProgress}</span>
            </div>
          </div>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executorChartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="notStarted" stackId="a" fill="#f472b6" name={t.notStarted} barSize={24} onClick={handleBarClick} cursor="pointer" />
                <Bar dataKey="inProgress" stackId="a" fill="#60a5fa" name={t.inProgress} barSize={24} radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer" />
                <XAxis dataKey="executor" axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#3b82f6', fontWeight: 600, cursor: 'pointer' }} onClick={(tickProps: any) => tickProps && tickProps.value && handleBarClick({executor: tickProps.value})} />
                <YAxis hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-blue-800 font-bold text-sm">{t.calendar}</h3>
            <div className="flex gap-1">
              {(['week', 'month', 'year'] as CalendarRange[]).map(r => (
                <button key={r} onClick={() => onRangeChange(r)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${range === r ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>{t[r as keyof typeof t] as string}</button>
              ))}
            </div>
          </div>
          <MeetingCalendar records={records} />
        </div>
      </div>

      <div className="bg-white/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
        <h3 className="text-blue-800 font-bold mb-8 text-sm md:text-base">{t.trendTitle}</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
              <defs><linearGradient id="trendBarGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/><stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.6}/></linearGradient></defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6366f1', fontWeight: 600 }} angle={-45} textAnchor="end" interval={0} />
              <YAxis hide domain={[0, 110]} />
              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: number) => [`${value}%`, t.rateLabel]} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="rate" fill="url(#trendBarGradient)" radius={[6, 6, 0, 0]} barSize={40}>
                <LabelList dataKey="rate" position="top" formatter={(val: number) => `${val}%`} style={{ fontSize: '10px', fill: '#6366f1', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
