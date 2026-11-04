export type ComprehensionLevel = 'eli5' | 'actionable' | 'student' | 'executive';

export type SummaryDensity = 'concise' | 'balanced' | 'comprehensive';

export interface VideoSegment {
  id: string;
  startTime: number; // in seconds
  endTime?: number;  // in seconds
  timestamp: string; // e.g. "04:15"
  title: string;
  description?: string;
}

export interface VideoData {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl?: string;
  segments: VideoSegment[];
  transcript: string;
}

export interface SegmentSummary {
  segmentId: string;
  timestamp: string;
  title: string;
  bullets: string[];
  plainEnglishExplanation: string;
  keyTakeaway: string;
  coreQuote?: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
  simpleAnalogy: string;
}

export interface VideoSummaryResult {
  videoId: string;
  videoTitle: string;
  executiveSummary: string[];
  readingTimeMinutes: number;
  timeSavedMinutes: number;
  keyConcepts: KeyConcept[];
  segmentSummaries: SegmentSummary[];
  actionableChecklist: string[];
  comprehensionLevel: ComprehensionLevel;
  generatedAt: string;
}

export interface ClarificationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
