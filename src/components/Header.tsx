import React from 'react';
import { Plus, Video, Sparkles, BookOpen } from 'lucide-react';
import { VideoData } from '../types/index.ts';

interface HeaderProps {
  presetVideos: VideoData[];
  currentVideoId: string;
  onSelectVideo: (video: VideoData) => void;
  onOpenCustomModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  presetVideos,
  currentVideoId,
  onSelectVideo,
  onOpenCustomModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
            <Video className="w-4 h-4" />
          </div>
          <span>BriefTube</span>
        </a>
      </div>

      {/* Zone 2: Preset Navigation Links */}
      <nav
        aria-label="Preset Long Videos"
        className="hidden lg:flex items-center gap-2 text-sm font-medium"
      >
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mr-1">
          Sample Videos:
        </span>
        {presetVideos.map((video) => {
          const isSelected = video.id === currentVideoId;
          const shortTitle =
            video.id === 'agentic-ai-andrew-ng'
              ? 'Agentic AI Workflows'
              : video.id === 'neural-networks-karpathy'
              ? 'Neural Networks Math'
              : video.id === 'focus-protocols-huberman'
              ? 'Focus & Neuroplasticity'
              : video.title.split(':')[0];
          return (
            <button
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={video.title}
            >
              <BookOpen className="w-3.5 h-3.5 opacity-70" />
              <span className="max-w-[160px] truncate">{shortTitle}</span>
              <span className="text-[11px] opacity-75 font-mono">({video.durationFormatted})</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action Button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenCustomModal}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
          aria-label="Add or paste custom video"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Summarize Custom Video</span>
          <span className="sm:hidden">Custom Video</span>
        </button>
      </div>
    </header>
  );
};
