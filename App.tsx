
import React, { useState, useEffect } from 'react';
import { 
  MeetingRecord, 
  PlanningTerm, 
  ViewType, 
  CompletionStatus,
  ReminderConfig,
  CalendarRange,
  Language
} from './types';
import { INITIAL_PLANNING_TERMS, INITIAL_RECORDS } from './constants';
import Dashboard from './components/Dashboard';
import Planning from './components/Planning';
import MeetingMinutes from './components/MeetingMinutes';
import MeetingStructure from './components/MeetingStructure';
import { Home, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [lang, setLang] = useState<Language>('zh');
  const [executorFilter, setExecutorFilter] = useState<string | null>(null);

  const [records, setRecords] = useState<MeetingRecord[]>(() => {
    const saved = localStorage.getItem('meeting_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });
  const [terms, setTerms] = useState<PlanningTerm[]>(() => {
    const saved = localStorage.getItem('meeting_terms');
    return saved ? JSON.parse(saved) : INITIAL_PLANNING_TERMS;
  });
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    startTime: '14:00',
    endTime: '15:00',
    reminderOffset: 10,
    message: '会议即将结束，请尽快总结！'
  });
  const [calendarRange, setCalendarRange] = useState<CalendarRange>('month');

  // Translations
  const t = {
    zh: {
      title: '会议记录管理系统',
      planning: '会议规划',
      records: '会议记录',
      alarm: '会议闹钟',
      back: '返回主页',
      urgentNotify: (count: number) => `发现 ${count} 个任务计划明天完成。请今天处理完成，谢谢！`
    },
    en: {
      title: 'Meeting Record Mgmt System',
      planning: 'Planning',
      records: 'Records',
      alarm: 'Alarm',
      back: 'Back Home',
      urgentNotify: (count: number) => `Found ${count} tasks due tomorrow. Please handle them today. Thank you!`
    }
  }[lang];

  useEffect(() => {
    localStorage.setItem('meeting_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('meeting_terms', JSON.stringify(terms));
  }, [terms]);

  useEffect(() => {
    const checkTasks = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const urgentTasks = records.filter(r => 
        r.plannedCompletionDate === tomorrowStr && 
        r.status !== CompletionStatus.DONE
      );
      if (urgentTasks.length > 0) {
        alert(t.urgentNotify(urgentTasks.length));
      }
    };
    checkTasks();
  }, [records, lang]);

  const handleNavigateToFilteredRecords = (executor: string) => {
    setExecutorFilter(executor);
    setView('records');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            records={records} 
            range={calendarRange} 
            onRangeChange={setCalendarRange}
            onNavigate={setView}
            onNavigateWithFilter={handleNavigateToFilteredRecords}
            lang={lang}
          />
        );
      case 'planning':
        return <Planning terms={terms} setTerms={setTerms} lang={lang} />;
      case 'records':
        return (
          <MeetingMinutes 
            records={records} 
            setRecords={setRecords} 
            executorFilter={executorFilter} 
            clearFilter={() => setExecutorFilter(null)}
            lang={lang}
          />
        );
      case 'structure':
        return <MeetingStructure config={reminderConfig} setConfig={setReminderConfig} lang={lang} />;
      default:
        return <Dashboard records={records} range={calendarRange} onRangeChange={setCalendarRange} onNavigate={setView} lang={lang} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Brand Logo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col items-start opacity-80 pointer-events-none">
        <span className="text-xl md:text-2xl font-black text-blue-900 tracking-tighter leading-none">Live For</span>
        <span className="text-xl md:text-2xl font-black text-blue-900 tracking-tighter leading-none -mt-1">Problem</span>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2">
        <button 
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-blue-200 rounded-full hover:bg-white transition-all shadow-sm text-xs font-bold text-blue-800"
        >
          <Languages className="w-4 h-4" />
          {lang === 'zh' ? 'EN' : '中文'}
        </button>
      </div>

      <header className="flex flex-col items-center gap-6 mb-8 pt-10 md:pt-4">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">{t.title}</h1>
        
        {view === 'dashboard' ? (
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => { setView('planning'); setExecutorFilter(null); }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all font-semibold"
            >
              {t.planning}
            </button>
            <button 
              onClick={() => { setView('records'); setExecutorFilter(null); }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all font-semibold"
            >
              {t.records}
            </button>
            <button 
              onClick={() => { setView('structure'); setExecutorFilter(null); }}
              className="px-6 py-2 bg-orange-400 text-white rounded-lg shadow-lg hover:bg-orange-500 transition-all font-semibold"
            >
              {t.alarm}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setView('dashboard'); setExecutorFilter(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-blue-200 rounded-full hover:bg-white transition-all shadow-sm"
          >
            <Home className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-600">{t.back}</span>
          </button>
        )}
      </header>

      <main className="glass-panel p-6 rounded-3xl min-h-[600px] shadow-2xl relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
