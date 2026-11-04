import React, { useState } from 'react';
import {
  Play,
  Clock,
  Share2,
  ExternalLink,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tv,
} from 'lucide-react';
import { VideoData, VideoSegment } from '../types/index.ts';

interface VideoPlayerProps {
  video: VideoData;
  activeSegmentId?: string;
  onSelectSegment: (segment: VideoSegment) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  activeSegmentId,
  onSelectSegment,
}) => {
  const [currentStartSec, setCurrentStartSec] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Identify active segment
  const currentSegmentIndex = video.segments.findIndex((s) => s.id === activeSegmentId);
  const activeSegment =
    currentSegmentIndex >= 0 ? video.segments[currentSegmentIndex] : video.segments[0];

  const handleJumpToSegment = (seg: VideoSegment) => {
    setCurrentStartSec(seg.startTime);
    onSelectSegment(seg);
  };

  const handlePrevSegment = () => {
    if (currentSegmentIndex > 0) {
      handleJumpToSegment(video.segments[currentSegmentIndex - 1]);
    }
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < video.segments.length - 1) {
      handleJumpToSegment(video.segments[currentSegmentIndex + 1]);
    }
  };

  const handleCopyLink = () => {
    const url = `https://www.youtube.com/watch?v=${video.youtubeId}${
      currentStartSec > 0 ? `&t=${currentStartSec}s` : ''
    }`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?start=${currentStartSec}&autoplay=${
    currentStartSec > 0 ? '1' : '0'
  }&rel=0&modestbranding=1`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-md flex flex-col transition-shadow hover:shadow-lg">
      {/* Prominent High-Contrast Cinema Video Embed Stage */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
        <iframe
          key={`${video.youtubeId}-${currentStartSec}`}
          src={embedUrl}
          title={video.title}
          className="w-full h-full border-0 relative z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Ambient Top HUD Badge: Clearly indicates active topic / segment */}
        {activeSegment && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none transition-opacity duration-300">
            <div className="bg-slate-950/85 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 max-w-[90%]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="font-mono text-[11px] text-red-300 font-semibold shrink-0">
                {activeSegment.timestamp}
              </span>
              <span className="text-xs text-white font-medium truncate">
                {activeSegment.title}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Segment Timeline Bar */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 shrink-0">
            Chapter Navigation:
          </span>
          <span className="text-xs text-slate-100 font-medium truncate">
            {activeSegment?.title || video.title}
          </span>
        </div>

        {/* Previous / Next Segment Steppers */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrevSegment}
            disabled={currentSegmentIndex <= 0}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-0.5"
            title="Previous Segment"
            aria-label="Previous segment"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Prev</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {currentSegmentIndex >= 0 ? currentSegmentIndex + 1 : 1}/{video.segments.length}
          </span>
          <button
            onClick={handleNextSegment}
            disabled={currentSegmentIndex >= video.segments.length - 1}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-0.5"
            title="Next Segment"
            aria-label="Next segment"
          >
            <span className="hidden sm:inline text-[11px]">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Proportional Segment Bar Strip */}
      <div className="flex h-1.5 w-full bg-slate-800">
        {video.segments.map((seg, idx) => {
          const isSelected = seg.id === activeSegmentId;
          return (
            <button
              key={seg.id}
              onClick={() => handleJumpToSegment(seg)}
              className={`flex-1 h-full border-r border-slate-900 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-red-500'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={`${seg.timestamp} - ${seg.title}`}
              aria-label={`Jump to segment: ${seg.title}`}
            />
          );
        })}
      </div>

      {/* Video Details & Meta Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-2.5 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="text-slate-700 font-semibold">{video.channel}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {video.durationFormatted}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{video.segments.length} Key Segments</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Copy YouTube timestamp link"
              aria-label="Copy YouTube link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Open on YouTube"
              aria-label="Open on YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Key Segments List with High-Visibility Active States */}
        <div className="mt-2 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Bookmark className="w-3.5 h-3.5 text-red-600" />
              Key Segments
            </span>
            <span className="text-[11px] text-slate-400">
              Click to seek player & sync summary
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {video.segments.map((seg, idx) => {
              const isSelected = seg.id === activeSegmentId;
              return (
                <button
                  key={seg.id}
                  onClick={() => handleJumpToSegment(seg)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50/70 text-slate-900 ring-1 ring-red-400 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    <Play className={`w-2.5 h-2.5 ${isSelected ? 'fill-white' : 'fill-slate-400'}`} />
                    <span>{seg.timestamp}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${isSelected ? 'text-red-950 font-bold' : 'text-slate-900'}`}>
                      {seg.title}
                    </p>
                    {seg.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {seg.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
