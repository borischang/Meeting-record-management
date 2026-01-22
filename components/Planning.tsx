
import React, { useState } from 'react';
import { PlanningTerm } from '../types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface PlanningProps {
  terms: PlanningTerm[];
  setTerms: React.Dispatch<React.SetStateAction<PlanningTerm[]>>;
}

const Planning: React.FC<PlanningProps> = ({ terms, setTerms }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTerm, setNewTerm] = useState('');

  const addTerm = () => {
    if (!newTerm.trim()) return;
    setTerms([...terms, { id: Date.now().toString(), content: newTerm.trim() }]);
    setNewTerm('');
  };

  const deleteTerm = (id: string) => {
    setTerms(terms.filter(t => t.id !== id));
  };

  const startEdit = (term: PlanningTerm) => {
    setEditingId(term.id);
    setEditValue(term.content);
  };

  const saveEdit = () => {
    setTerms(terms.map(t => t.id === editingId ? { ...t, content: editValue } : t));
    setEditingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">会议规划条款</h2>
        <p className="text-blue-600">维护并完善您的会议管理标准</p>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          placeholder="输入新条款..."
          className="flex-1 px-4 py-2 rounded-xl border border-blue-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={addTerm}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {terms.map((term, index) => (
          <div key={term.id} className="blue-glass p-4 rounded-2xl flex items-center justify-between group">
            {editingId === term.id ? (
              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-blue-400 bg-white"
                />
                <button onClick={saveEdit} className="text-green-600"><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingId(null)} className="text-red-600"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-blue-400 font-bold">{index + 1}.</span>
                  <p className="text-gray-700">{term.content}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(term)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTerm(term.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Planning;
