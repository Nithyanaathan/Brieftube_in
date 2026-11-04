import { ComprehensionLevel, SummaryDensity, VideoSegment, VideoSummaryResult } from '../types/index.ts';

export interface SummarizeParams {
  videoId?: string;
  videoTitle: string;
  transcript: string;
  segments: VideoSegment[];
  comprehensionLevel: ComprehensionLevel;
  density: SummaryDensity;
  durationSeconds?: number;
}

export async function fetchSummary(params: SummarizeParams): Promise<VideoSummaryResult> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || `Failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchClarification(params: {
  videoTitle: string;
  question: string;
  transcript?: string;
  currentSummary?: any;
  segmentTitle?: string;
}): Promise<string> {
  const response = await fetch('/api/clarify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || `Failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.answer || '';
}
