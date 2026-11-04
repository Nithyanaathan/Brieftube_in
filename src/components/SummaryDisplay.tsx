import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  Copy,
  Download,
  Volume2,
  VolumeX,
  Play,
  Lightbulb,
  CheckSquare,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { VideoSummaryResult, VideoSegment } from '../types/index.ts';
import { formatSummaryToMarkdown, timestampToSeconds } from '../utils/parser.ts';

interface SummaryDisplayProps {
  summary: VideoSummaryResult | null;
  isLoading: boolean;
  onSeek: (seconds: number) => void;
  onAskAboutSegment: (segmentTitle: string) => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  isLoading,
  onSeek,
  onAskAboutSegment,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Stop speech when component unmounts or summary changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [summary]);

  const handleCopy = () => {
    if (!summary) return;
    const md = formatSummaryToMarkdown(summary);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const md = formatSummaryToMarkdown(summary);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!summary) return;

    // Compose concise speech text
    const speechLines: string[] = [];
    speechLines.push(`Summary for ${summary.videoTitle}.`);
    speechLines.push('Executive summary:');
    summary.executiveSummary.forEach((b) => speechLines.push(b));

    speechLines.push('Key segments:');
    summary.segmentSummaries.forEach((seg) => {
      speechLines.push(`At ${seg.timestamp}, ${seg.title}.`);
      seg.bullets.forEach((b) => speechLines.push(b));
    });

    const utterance = new SpeechSynthesisUtterance(speechLines.join(' '));
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-8 bg-slate-100 rounded w-28" />
        </div>

        {/* TLDR skeleton */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-4/6" />
        </div>

        {/* Segments skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded w-12" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="space-y-1.5 pl-4">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-11/12" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Summary Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Click "Generate Bullet Summary" above to transform the video transcript and key segments into clear, concise takeaways.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-6">
      {/* Top Metrics & Action Utility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tabular-nums">~{summary.timeSavedMinutes} min</span> saved
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="tabular-nums">{summary.readingTimeMinutes} min</span> read
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="capitalize text-slate-500">
            {summary.comprehensionLevel} mode
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isSpeaking ? 'Stop audio playback' : 'Listen to concise audio summary'}
            aria-label="Listen to summary"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen Aloud</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Copy Markdown Summary"
            aria-label="Copy markdown summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Download Markdown file"
            aria-label="Download markdown summary"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Executive Summary (The 30-Second Mental Anchor) */}
      <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Executive Summary · 30-Second Digest
          </h3>
        </div>
        <ul className="space-y-2.5">
          {summary.executiveSummary.map((bullet, idx) => (
            <li
              key={idx}
              className="text-xs sm:text-sm text-slate-800 flex items-start gap-2.5 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Key Concepts Decoded (Glossary for Maximum Understanding) */}
      {summary.keyConcepts && summary.keyConcepts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Key Concepts Decoded (Plain Language)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {summary.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col gap-1.5"
              >
                <span className="text-xs font-bold text-slate-900">
                  {concept.term}
                </span>
                <p className="text-xs text-slate-600 leading-snug">
                  {concept.definition}
                </p>
                {concept.simpleAnalogy && (
                  <div className="mt-auto pt-2 border-t border-slate-100 text-[11px] text-amber-800 bg-amber-50/60 p-1.5 rounded-md">
                    <span className="font-semibold">Analogy: </span>
                    {concept.simpleAnalogy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Segment-by-Segment Granular Bullet Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Segment-by-Segment Bullet Breakdown
          </h3>
          <span className="text-[11px] text-slate-400">
            Click timestamp to seek video
          </span>
        </div>

        <div className="space-y-3.5">
          {summary.segmentSummaries.map((seg, idx) => (
            <div
              key={seg.segmentId || idx}
              className="border border-slate-200 rounded-xl p-4.5 bg-white hover:border-slate-300 transition-all flex flex-col gap-3"
            >
              {/* Segment Heading */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onSeek(timestampToSeconds(seg.timestamp))}
                    className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`Jump video to ${seg.timestamp}`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{seg.timestamp}</span>
                  </button>
                  <h4 className="text-sm font-bold text-slate-900">
                    {seg.title}
                  </h4>
                </div>

                <button
                  onClick={() => onAskAboutSegment(seg.title)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Ask a follow-up question about this segment"
                >
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>Clarify</span>
                </button>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2 pl-2">
                {seg.bullets.map((b, bIdx) => (
                  <li
                    key={bIdx}
                    className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Plain English Translation */}
              {seg.plainEnglishExplanation && (
                <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">In Plain English: </span>
                  <span>{seg.plainEnglishExplanation}</span>
                </div>
              )}

              {/* Key Takeaway Banner */}
              {seg.keyTakeaway && (
                <div className="text-xs font-medium text-slate-900 flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                    Core Takeaway:
                  </span>
                  <span className="text-slate-800">{seg.keyTakeaway}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Actionable Takeaways Checklist */}
      {summary.actionableChecklist && summary.actionableChecklist.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Actionable Implementation Checklist
            </h3>
          </div>

          <div className="space-y-2">
            {summary.actionableChecklist.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <label
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm ${
                    isChecked
                      ? 'bg-white text-slate-400 line-through'
                      : 'hover:bg-white text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                  />
                  <span className="leading-relaxed">{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
