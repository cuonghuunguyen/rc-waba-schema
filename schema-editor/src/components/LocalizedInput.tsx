import { Globe } from 'lucide-react';
import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import type { LocalizedInputProps } from '../types';

export const LocalizedInput: React.FC<LocalizedInputProps> = ({ value, onChange, label, rows = 2 }) => {
  const [mode, setMode] = useState(typeof value === 'object' ? 'multi' : 'simple');

  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <button
          onClick={() => setMode(mode === 'simple' ? 'multi' : 'simple')}
          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
        >
          <Globe size={10} /> {mode === 'simple' ? 'Switch to Localized' : 'Switch to Simple'}
        </button>
      </div>

      {mode === 'simple' ? (
        <textarea
          className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
          rows={rows}
          value={typeof value === 'string' ? value : ((value as Record<string, string>)?.en || '')}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="space-y-2 bg-slate-50 p-2 rounded border">
          {LANGUAGES.map(lang => (
            <div key={lang} className="flex gap-2 items-center">
              <span className="text-xs uppercase w-6 text-slate-400 font-bold">{lang}</span>
              <input
                className="flex-1 text-sm border rounded px-2 py-1"
                value={typeof value === 'object' ? ((value as Record<string, string>)[lang] || '') : (lang === 'en' ? value : '')}
                onChange={(e) => {
                  const newVal: Record<string, string> = typeof value === 'object' ? { ...(value as Record<string, string>) } : { en: value as string };
                  newVal[lang] = e.target.value;
                  onChange(newVal);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
