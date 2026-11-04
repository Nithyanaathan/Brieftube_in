import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { VideoPlayer } from './components/VideoPlayer.tsx';
import { TranscriptViewer } from './components/TranscriptViewer.tsx';
import { ComprehensionSettings } from './components/ComprehensionSettings.tsx';
import { SummaryDisplay } from './components/SummaryDisplay.tsx';
import { CustomVideoModal } from './components/CustomVideoModal.tsx';
import { InteractiveClarifier } from './components/InteractiveClarifier.tsx';
import { PRESET_VIDEOS, INITIAL_PRESET_SUMMARY } from './data/presets.ts';
import { ComprehensionLevel, SummaryDensity, VideoData, VideoSegment, VideoSummaryResult } from './types/index.ts';
import { fetchSummary } from './services/api.ts';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoData[]>(PRESET_VIDEOS);
  const [currentVideo, setCurrentVideo] = useState<VideoData>(PRESET_VIDEOS[0]);
  const [summary, setSummary] = useState<VideoSummaryResult | null>(INITIAL_PRESET_SUMMARY);
  const [comprehensionLevel, setComprehensionLevel] = useState<ComprehensionLevel>('student');
  const [density, setDensity] = useState<SummaryDensity>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>(
    PRESET_VIDEOS[0]?.segments[0]?.id
  );
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [focusedClarifySegment, setFocusedClarifySegment] = useState<string | undefined>();
  const [leftTab, setLeftTab] = useState<'video' | 'transcript'>('video');

  const handleSelectVideo = async (video: VideoData) => {
    setCurrentVideo(video);
    setActiveSegmentId(video.segments[0]?.id);
    setErrorMsg(null);
    setFocusedClarifySegment(undefined);

    // If it's the first preset, use the curated initial summary
    if (video.id === PRESET_VIDEOS[0].id) {
      setSummary(INITIAL_PRESET_SUMMARY);
      return;
    }

    // Otherwise generate fresh summary for this video
    await generateForVideo(video, comprehensionLevel, density);
  };

  const generateForVideo = async (
    targetVideo: VideoData,
    level: ComprehensionLevel,
    dens: SummaryDensity
  ) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await fetchSummary({
        videoId: targetVideo.id,
        videoTitle: targetVideo.title,
        transcript: targetVideo.transcript,
        segments: targetVideo.segments,
        comprehensionLevel: level,
        density: dens,
        durationSeconds: targetVideo.durationSeconds,
      });

      setSummary(result);
    } catch (err: any) {
      console.error('Failed to generate summary:', err);
      setErrorMsg(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    generateForVideo(currentVideo, comprehensionLevel, density);
  };

  const handleCustomVideoSubmit = (newVideo: VideoData) => {
    setVideos((prev) => [newVideo, ...prev]);
    setCurrentVideo(newVideo);
    setActiveSegmentId(newVideo.segments[0]?.id);
    generateForVideo(newVideo, comprehensionLevel, density);
  };

  const handleSeek = (seconds: number) => {
    // Find matching segment
    const matched = currentVideo.segments.find(
      (s) => s.startTime <= seconds && (s.endTime ? seconds < s.endTime : true)
    );
    if (matched) {
      setActiveSegmentId(matched.id);
    }
    // Switch to video tab on mobile if user was viewing transcript
    setLeftTab('video');
  };

  const handleAskAboutSegment = (segmentTitle: string) => {
    setFocusedClarifySegment(segmentTitle);
    // Smooth scroll down to clarifier
    const clarifierElem = document.getElementById('interactive-clarifier');
    if (clarifierElem) {
      clarifierElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {/* Header */}
      <Header
        presetVideos={videos.slice(0, 4)}
        currentVideoId={currentVideo.id}
        onSelectVideo={handleSelectVideo}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Video Player & Transcript (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* View Mode Toggle for Small/Medium screens */}
            <div className="flex lg:hidden items-center p-1 bg-white rounded-lg border border-slate-200">
              <button
                onClick={() => setLeftTab('video')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  leftTab === 'video'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Video & Segments
              </button>
              <button
                onClick={() => setLeftTab('transcript')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  leftTab === 'transcript'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transcript Search
              </button>
            </div>

            {/* Video Player */}
            <div className={leftTab === 'video' ? 'block' : 'hidden lg:block'}>
              <VideoPlayer
                video={currentVideo}
                activeSegmentId={activeSegmentId}
                onSelectSegment={(seg) => setActiveSegmentId(seg.id)}
              />
            </div>

            {/* Transcript Viewer */}
            <div className={leftTab === 'transcript' ? 'block' : 'hidden lg:block'}>
              <TranscriptViewer
                rawTranscript={currentVideo.transcript}
                onSeek={handleSeek}
              />
            </div>
          </div>

          {/* Right Column: Comprehension Settings, Bullet Summaries & Clarifier (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Comprehension Settings Bar */}
            <ComprehensionSettings
              level={comprehensionLevel}
              density={density}
              onChangeLevel={(lvl) => setComprehensionLevel(lvl)}
              onChangeDensity={(dns) => setDensity(dns)}
              onGenerate={handleGenerateClick}
              isLoading={isLoading}
            />

            {/* Structured Bullet Point Summary Display */}
            <SummaryDisplay
              summary={summary}
              isLoading={isLoading}
              onSeek={handleSeek}
              onAskAboutSegment={handleAskAboutSegment}
            />

            {/* Interactive Q&A Clarifier */}
            <div id="interactive-clarifier">
              <InteractiveClarifier
                videoTitle={currentVideo.title}
                transcript={currentVideo.transcript}
                currentSummary={summary}
                focusedSegmentTitle={focusedClarifySegment}
                onClearFocus={() => setFocusedClarifySegment(undefined)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>BriefTube · Educational Video Synthesis with Google Gemini 3.8 Flash</p>
      </footer>

      {/* Custom Video Input Modal */}
      <CustomVideoModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomVideoSubmit}
      />
    </div>
  );
}
