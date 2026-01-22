
import React from 'react';
import { ReminderConfig } from '../types';
import { Bell, Clock } from 'lucide-react';

interface StructureProps {
  config: ReminderConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReminderConfig>>;
}

const MeetingStructure: React.FC<StructureProps> = ({ config, setConfig }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3 mb-4">
          <Bell className="w-8 h-8 text-orange-400" />
          会议过程提醒
        </h2>
        <p className="text-blue-600">设置会议持续时间，获取自动提醒，确保会议不拖堂。</p>
      </div>

      <div className="bg-white/60 p-8 rounded-3xl border border-blue-100 shadow-xl space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 开始时间
            </label>
            <input 
              type="time" 
              value={config.startTime}
              onChange={e => setConfig({...config, startTime: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 结束时间
            </label>
            <input 
              type="time" 
              value={config.endTime}
              onChange={e => setConfig({...config, endTime: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
            提醒提前量 (分钟)
          </label>
          <input 
            type="number" 
            min="0"
            max="59"
            value={config.reminderOffset}
            onChange={e => setConfig({...config, reminderOffset: parseInt(e.target.value) || 0})}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
            提醒消息
          </label>
          <textarea 
            rows={3}
            value={config.message}
            onChange={e => setConfig({...config, message: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg resize-none"
            placeholder="例如：会议即将结束，请尽快总结！"
          />
        </div>

        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm">
          <strong>工作原理：</strong> 系统会在会议结束前的设定时间内弹出提醒。确保浏览器窗口保持开启且标签页未进入睡眠模式。
        </div>
      </div>
    </div>
  );
};

export default MeetingStructure;
