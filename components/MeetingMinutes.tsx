
import React, { useState, useMemo, useRef } from 'react';
import { MeetingRecord, CompletionStatus, Language } from '../types';
import { Plus, Trash2, Edit, ArrowUpDown, Users, MessageSquare, FileUp, AlertTriangle, XCircle, Filter } from 'lucide-react';

interface MinutesProps {
  records: MeetingRecord[];
  setRecords: React.Dispatch<React.SetStateAction<MeetingRecord[]>>;
  executorFilter: string | null;
  clearFilter: () => void;
  lang: Language;
}

type SortConfig = { key: keyof MeetingRecord; direction: 'asc' | 'desc' } | null;

const MeetingMinutes: React.FC<MinutesProps> = ({ records, setRecords, executorFilter, clearFilter, lang }) => {
  const [sort, setSort] = useState<SortConfig>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MeetingRecord>>({
    status: CompletionStatus.NOT_STARTED,
    attendees: '',
    remarks: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    zh: {
      title: '会议决议记录',
      import: '导入决议',
      add: '添加记录',
      editTitle: '编辑记录',
      newTitle: '新记录',
      cancel: '取消',
      save: '保存',
      thIdx: '序号', thMod: '模块', thDate: '会议日期', thAtt: '参会人员', thRes: '决议事项', thExe: '执行人', thPlan: '计划完成', thStatus: '完成情况', thRem: '备注', thOp: '操作',
      filteringMsg: (name: string) => `正在查看执行人 ${name} 的待办事项`,
      clearFilter: '清除过滤',
      overdue: '已逾期',
      delConfirm: '确定删除这条记录吗？',
      importOk: (count: number) => `成功导入 ${count} 条记录`,
      importErr: '导入失败：解析文件时出错。请确保文件格式正确。'
    },
    en: {
      title: 'Resolution Records',
      import: 'Import',
      add: 'Add Record',
      editTitle: 'Edit Record',
      newTitle: 'New Record',
      cancel: 'Cancel',
      save: 'Save',
      thIdx: 'No.', thMod: 'Module', thDate: 'Date', thAtt: 'Attendees', thRes: 'Resolution', thExe: 'Executor', thPlan: 'Due Date', thStatus: 'Status', thRem: 'Remarks', thOp: 'Action',
      filteringMsg: (name: string) => `Filtering tasks for ${name}`,
      clearFilter: 'Clear Filter',
      overdue: 'Overdue',
      delConfirm: 'Are you sure to delete this?',
      importOk: (count: number) => `Imported ${count} records`,
      importErr: 'Import failed: Please check the JSON format.'
    }
  }[lang];

  const handleSort = (key: keyof MeetingRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sort?.key === key && sort.direction === 'asc') direction = 'desc';
    setSort({ key, direction });
  };

  const sortedRecords = useMemo(() => {
    let base = [...records];
    if (executorFilter) {
      base = base.filter(r => 
        r.executor === executorFilter && 
        (r.status === CompletionStatus.NOT_STARTED || r.status === CompletionStatus.IN_PROGRESS)
      );
    }
    if (!sort) return base;
    return base.sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sort, executorFilter]);

  const saveRecord = () => {
    if (!formData.module || !formData.meetingTime || !formData.resolution || !formData.executor || !formData.plannedCompletionDate) {
      alert("Please fill all required fields"); return;
    }
    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } as MeetingRecord : r));
      setEditingId(null);
    } else {
      const newRec: MeetingRecord = { id: Date.now().toString(), index: records.length + 1, ...(formData as Omit<MeetingRecord, 'id' | 'index'>) } as MeetingRecord;
      setRecords(prev => [...prev, newRec]);
    }
    setFormData({ status: CompletionStatus.NOT_STARTED, attendees: '', remarks: '' });
    setIsAdding(false);
  };

  const deleteRecord = (id: string) => { if (confirm(t.delConfirm)) setRecords(records.filter(r => r.id !== id)); };
  const startEdit = (rec: MeetingRecord) => { setEditingId(rec.id); setFormData(rec); setIsAdding(true); };
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const baseTimestamp = Date.now();
          const newRecs = json.map((item, i) => ({ ...item, id: (baseTimestamp + i).toString(), index: records.length + i + 1, status: Object.values(CompletionStatus).includes(item.status) ? item.status : CompletionStatus.NOT_STARTED })) as MeetingRecord[];
          setRecords(prev => [...prev, ...newRecs]);
          alert(t.importOk(newRecs.length));
        }
      } catch (err) { alert(t.importErr); }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-blue-900">{t.title}</h2>
          {executorFilter && (
            <div className="flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full w-fit border border-pink-100">
              <Filter className="w-3 h-3" />
              {t.filteringMsg(executorFilter)}
              <button onClick={clearFilter} className="ml-2 hover:text-pink-800"><XCircle className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl shadow-sm hover:bg-blue-50 transition-all font-semibold">
            <FileUp className="w-5 h-5" /> <span>{t.import}</span>
          </button>
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ status: CompletionStatus.NOT_STARTED, attendees: '', remarks: '' }); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all font-semibold">
            <Plus className="w-5 h-5" /> <span>{t.add}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white/60 p-6 rounded-2xl border border-blue-200 shadow-lg space-y-4 animate-in fade-in zoom-in duration-200">
          <h3 className="font-bold text-blue-800">{editingId ? t.editTitle : t.newTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="px-3 py-2 rounded-lg border border-blue-200 bg-white" placeholder={t.thMod} value={formData.module || ''} onChange={e => setFormData({...formData, module: e.target.value})} />
            <input type="date" className="px-3 py-2 rounded-lg border border-blue-200 bg-white" value={formData.meetingTime || ''} onChange={e => setFormData({...formData, meetingTime: e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-blue-200 bg-white" placeholder={t.thRes} value={formData.resolution || ''} onChange={e => setFormData({...formData, resolution: e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-blue-200 bg-white" placeholder={t.thExe} value={formData.executor || ''} onChange={e => setFormData({...formData, executor: e.target.value})} />
            <input type="date" className="px-3 py-2 rounded-lg border border-blue-200 bg-white" value={formData.plannedCompletionDate || ''} onChange={e => setFormData({...formData, plannedCompletionDate: e.target.value})} />
            <select className="px-3 py-2 rounded-lg border border-blue-200 bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as CompletionStatus})}>
              {Object.values(CompletionStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-3 py-2 rounded-lg border border-blue-200 bg-white" placeholder={t.thAtt} value={formData.attendees || ''} onChange={e => setFormData({...formData, attendees: e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-blue-200 bg-white" placeholder={t.thRem} value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t.cancel}</button>
            <button onClick={saveRecord} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t.save}</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-blue-200">
        <table className="w-full text-left bg-white/40 border-collapse table-fixed min-w-[1100px]">
          <thead>
            <tr className="bg-blue-600 text-white text-xs uppercase tracking-wider">
              <th className="px-4 py-4 font-semibold w-12 text-center">{t.thIdx}</th>
              <th onClick={() => handleSort('module')} className="px-4 py-4 font-semibold cursor-pointer hover:bg-blue-700 w-24">{t.thMod} <ArrowUpDown className="inline w-3 h-3" /></th>
              <th onClick={() => handleSort('meetingTime')} className="px-4 py-4 font-semibold cursor-pointer hover:bg-blue-700 w-28">{t.thDate} <ArrowUpDown className="inline w-3 h-3" /></th>
              <th className="px-4 py-4 font-semibold w-36">{t.thAtt}</th>
              <th className="px-4 py-4 font-semibold w-48">{t.thRes}</th>
              <th onClick={() => handleSort('executor')} className="px-4 py-4 font-semibold cursor-pointer hover:bg-blue-700 w-24">{t.thExe} <ArrowUpDown className="inline w-3 h-3" /></th>
              <th onClick={() => handleSort('plannedCompletionDate')} className="px-4 py-4 font-semibold cursor-pointer hover:bg-blue-700 w-28">{t.thPlan} <ArrowUpDown className="inline w-3 h-3" /></th>
              <th onClick={() => handleSort('status')} className="px-4 py-4 font-semibold cursor-pointer hover:bg-blue-700 w-24">{t.thStatus} <ArrowUpDown className="inline w-3 h-3" /></th>
              <th className="px-4 py-4 font-semibold w-40">{t.thRem}</th>
              <th className="px-4 py-4 font-semibold text-center w-24">{t.thOp}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {sortedRecords.map((rec) => {
              const pDate = new Date(rec.plannedCompletionDate);
              const isOverdue = pDate < today && rec.status !== CompletionStatus.DONE;
              return (
                <tr key={rec.id} className={`hover:bg-blue-50/50 transition-colors text-xs ${isOverdue ? 'bg-pink-50/70' : ''}`}>
                  <td className="px-4 py-4 text-gray-500 text-center">{rec.index}</td>
                  <td className="px-4 py-4 font-medium text-gray-800 truncate" title={rec.module}>{rec.module}</td>
                  <td className="px-4 py-4 text-gray-600">{rec.meetingTime}</td>
                  <td className="px-4 py-4 text-gray-600 truncate" title={rec.attendees}>{rec.attendees}</td>
                  <td className="px-4 py-4 text-gray-700 break-words leading-relaxed">{rec.resolution}</td>
                  <td className="px-4 py-4 font-semibold text-blue-800">{rec.executor}</td>
                  <td className={`px-4 py-4 font-semibold ${isOverdue ? 'text-pink-600' : 'text-gray-600'}`}>{rec.plannedCompletionDate} {isOverdue && <AlertTriangle className="inline w-3 h-3 ml-1" />}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-center ${rec.status === CompletionStatus.DONE ? 'bg-green-100 text-green-700' : rec.status === CompletionStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{rec.status}</span>
                      {isOverdue && <span className="text-[9px] font-black text-pink-600 text-center uppercase tracking-tighter">{t.overdue}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 italic break-words leading-relaxed">{rec.remarks || '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(rec)} className="text-blue-600 hover:text-blue-800"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteRecord(rec.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingMinutes;
