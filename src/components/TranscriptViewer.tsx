import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, FileText, Sparkles } from 'lucide-react';
import { cleanTranscript, timestampToSeconds } from '../utils/parser.ts';

interface TranscriptViewerProps {
  rawTranscript: string;
  onSeek: (seconds: number) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  rawTranscript,
  onSeek,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCleaned, setShowCleaned] = useState(true);

  const displayTranscript = useMemo(() => {
    return showCleaned ? cleanTranscript(rawTranscript) : rawTranscript;
  }, [rawTranscript, showCleaned]);

  const lines = useMemo(() => {
    return displayTranscript.split(/\r?\n/).filter((l) => l.trim().length > 0);
  }, [displayTranscript]);

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines;
    const query = searchQuery.toLowerCase();
    return lines.filter((line) => line.toLowerCase().includes(query));
  }, [lines, searchQuery]);

  const wordCount = useMemo(() => {
    return displayTranscript.split(/\s+/).filter(Boolean).length;
  }, [displayTranscript]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract leading timestamp if present (e.g., "04:15 text...")
  const parseLineTimestamp = (line: string): { time: string | null; text: string } => {
    const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)$/);
    if (match) {
      return { time: match[1], text: match[2] };
    }
    return { time: null, text: line };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-full max-h-[500px]">
      {/* Transcript Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Video Transcript
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            ({wordCount.toLocaleString()} words)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCleaned(!showCleaned)}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              showCleaned
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Toggle between cleaned and raw transcript"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{showCleaned ? 'Cleaned' : 'Raw'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Copy full transcript"
            aria-label="Copy transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words in transcript..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Transcript Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs text-slate-700 leading-relaxed font-normal">
        {filteredLines.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No lines match "{searchQuery}"
          </div>
        ) : (
          filteredLines.map((line, idx) => {
            const { time, text } = parseLineTimestamp(line);
            return (
              <div
                key={idx}
                className="flex items-start gap-2 hover:bg-slate-50 p-1 rounded-md transition-colors group"
              >
                {time ? (
                  <button
                    onClick={() => onSeek(timestampToSeconds(time))}
                    className="font-mono text-[11px] text-red-600 hover:text-red-700 hover:underline bg-red-50/60 px-1 py-0.5 rounded shrink-0 cursor-pointer"
                    title={`Jump to ${time}`}
                  >
                    {time}
                  </button>
                ) : (
                  <span className="w-2" />
                )}
                <p className="flex-1 text-slate-700 group-hover:text-slate-900">{text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
