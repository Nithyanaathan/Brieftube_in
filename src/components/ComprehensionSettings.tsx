import React from 'react';
import { Sparkles, Sliders, CheckCircle2, Lightbulb, GraduationCap, Briefcase, Zap } from 'lucide-react';
import { ComprehensionLevel, SummaryDensity } from '../types/index.ts';

interface ComprehensionSettingsProps {
  level: ComprehensionLevel;
  density: SummaryDensity;
  onChangeLevel: (level: ComprehensionLevel) => void;
  onChangeDensity: (density: SummaryDensity) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ComprehensionSettings: React.FC<ComprehensionSettingsProps> = ({
  level,
  density,
  onChangeLevel,
  onChangeDensity,
  onGenerate,
  isLoading,
}) => {
  const levels: {
    id: ComprehensionLevel;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'student',
      label: 'Study Notes',
      description: 'Pedagogical structure, core mechanisms & bold concepts',
      icon: GraduationCap,
    },
    {
      id: 'eli5',
      label: 'Plain English (ELI5)',
      description: 'Zero jargon, relatable everyday analogies',
      icon: Lightbulb,
    },
    {
      id: 'actionable',
      label: 'Actionable Checklist',
      description: 'Immediate tactical takeaways & implementations',
      icon: Zap,
    },
    {
      id: 'executive',
      label: 'Executive Brief',
      description: 'High-level strategic impact & decisions',
      icon: Briefcase,
    },
  ];

  const densities: { id: SummaryDensity; label: string; desc: string }[] = [
    { id: 'concise', label: 'Ultra-Concise', desc: '1-2 punchy bullets' },
    { id: 'balanced', label: 'Balanced', desc: '3-4 clear bullets' },
    { id: 'comprehensive', label: 'In-Depth', desc: '4-5 rich points' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-red-600" />
          <span>Comprehension Architecture</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Powered by Gemini 3.8 Flash
        </span>
      </div>

      {/* Comprehension Level Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {levels.map((item) => {
          const isSelected = level === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeLevel(item.id)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                isSelected
                  ? 'border-red-500 bg-red-50/40 text-slate-900 ring-1 ring-red-500 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
              </div>
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Density & Generate Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {densities.map((d) => (
            <button
              key={d.id}
              onClick={() => onChangeDensity(d.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                density === d.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
            isLoading ? 'animate-pulse cursor-not-allowed' : ''
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{isLoading ? 'Synthesizing Understandable Bullets...' : 'Generate Bullet Summary'}</span>
        </button>
      </div>
    </div>
  );
};
