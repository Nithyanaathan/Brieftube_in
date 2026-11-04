import React, { useState } from 'react';
import { X, Video, Sparkles, Wand2, FileText, Bookmark, AlertCircle } from 'lucide-react';
import { VideoData, VideoSegment } from '../types/index.ts';
import {
  extractYouTubeId,
  cleanTranscript,
  parseChapters,
  secondsToTimestamp,
} from '../utils/parser.ts';

interface CustomVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (videoData: VideoData) => void;
}

export const CustomVideoModal: React.FC<CustomVideoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [urlOrId, setUrlOrId] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [rawSegments, setRawSegments] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAutoCleanTranscript = () => {
    if (!rawTranscript.trim()) return;
    const cleaned = cleanTranscript(rawTranscript);
    setRawTranscript(cleaned);
  };

  const handleAutoDetectChapters = () => {
    if (!rawTranscript.trim()) {
      setError('Paste the transcript first to auto-detect chapters.');
      return;
    }
    const detected = parseChapters(rawTranscript);
    if (detected.length === 0) {
      setError('No timestamped lines (e.g. "04:15 Title") found in the transcript.');
      return;
    }
    const formatted = detected
      .map((s) => `${s.timestamp} ${s.title}`)
      .join('\n');
    setRawSegments(formatted);
    setError(null);
  };

  const handleLoadSample = () => {
    setUrlOrId('https://www.youtube.com/watch?v=sal78ACtGTc');
    setTitle('AI System Architecture & Scalable Agent Loops');
    setChannel('Deep Learning Systems Lab');
    setRawSegments(`00:00 Introduction to Multi-Turn Prompting
06:30 Failure Modes of Single-Pass Generations
15:45 Implementing Reflection and Unit Test Loops
28:20 Tool Integration and Real-World Grounding`);
    setRawTranscript(`00:00 In today's session, we are analyzing modern architectural approaches for multi-turn AI reasoning systems.
01:10 Most developers still make the mistake of using single-pass prompt engineering.
06:30 When an LLM fails, 90% of the time it is due to lack of iterative feedback.
15:45 In a reflection loop, the model inspects its own code against automated tests.
28:20 Finally, by giving the model external tools like search and calculators, we eliminate factual hallucinations.`);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rawTranscript.trim()) {
      setError('Please provide a video transcript to summarize.');
      return;
    }

    const youtubeId = extractYouTubeId(urlOrId) || 'dQw4w9WgXcQ';
    const parsedSegments = parseChapters(rawSegments);

    // If no segments were parsed, create a default first segment
    const finalSegments: VideoSegment[] =
      parsedSegments.length > 0
        ? parsedSegments
        : [
            {
              id: 'seg-default-1',
              startTime: 0,
              timestamp: '00:00',
              title: 'Full Video / Overview',
            },
          ];

    // Estimate duration from highest segment time or word count
    const lastSeg = finalSegments[finalSegments.length - 1];
    const durationSeconds = lastSeg?.startTime ? lastSeg.startTime + 600 : 1800;

    const newVideo: VideoData = {
      id: `custom-${Date.now()}`,
      youtubeId,
      title: title.trim() || 'Custom Video Study',
      channel: channel.trim() || 'User Video',
      durationSeconds,
      durationFormatted: secondsToTimestamp(durationSeconds),
      segments: finalSegments,
      transcript: rawTranscript.trim(),
    };

    onSubmit(newVideo);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 id="custom-modal-title" className="text-sm font-bold text-slate-900">
                Summarize Custom YouTube Video
              </h2>
              <p className="text-xs text-slate-500">
                Provide your video transcript & key segments to generate bullet points.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Sample Button */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Want to test with sample data?</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-fill Sample Custom Video</span>
            </button>
          </div>

          {/* YouTube URL & Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                YouTube URL or Video ID
              </label>
              <input
                type="text"
                value={urlOrId}
                onChange={(e) => setUrlOrId(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stanford AI Lecture 01"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Channel / Speaker Name (Optional)
            </label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="e.g. Stanford Online"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Key Segments / Chapters */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                Key Segments / Chapters
              </label>
              <button
                type="button"
                onClick={handleAutoDetectChapters}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                Auto-detect from transcript timestamps
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-1.5">
              One segment per line: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">00:00 Intro</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">14:30 Core Mechanism</code>
            </p>
            <textarea
              rows={3}
              value={rawSegments}
              onChange={(e) => setRawSegments(e.target.value)}
              placeholder={`00:00 Introduction\n05:30 Primary Methodology\n18:20 Experimental Results\n32:00 Conclusions`}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
            />
          </div>

          {/* Transcript Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Video Transcript (Required)
              </label>
              <button
                type="button"
                onClick={handleAutoCleanTranscript}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                title="Strip [Music], duplicate lines, and VTT cue tags"
              >
                <Sparkles className="w-3 h-3" />
                <span>Clean VTT / Captions</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Paste auto-generated captions, WebVTT, SRT, or plain transcript text.
            </p>
            <textarea
              rows={7}
              required
              value={rawTranscript}
              onChange={(e) => setRawTranscript(e.target.value)}
              placeholder="Paste the transcript here... You can include timestamps like '00:00 Welcome to today...' or plain text paragraphs."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load & Synthesize Bullets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
