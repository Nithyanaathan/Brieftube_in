import { VideoSegment, VideoSummaryResult } from '../types/index.ts';

/**
 * Converts formatted timestamp strings (MM:SS or HH:MM:SS) to total seconds.
 */
export function timestampToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(/[\[\]\(\)]/g, '');
  const parts = cleaned.split(':').map((p) => parseInt(p, 10));

  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Converts total seconds into MM:SS or HH:MM:SS.
 */
export function secondsToTimestamp(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Extracts a standard YouTube 11-character video ID from a URL or raw ID.
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

/**
 * Cleans messy raw captions or auto-generated transcripts.
 * Removes [Music], [Applause], timestamp markers, and duplicate consecutive lines.
 */
export function cleanTranscript(raw: string): string {
  if (!raw) return '';

  const lines = raw.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (let line of lines) {
    let text = line.trim();

    // Skip WebVTT header or numeric cue indexes
    if (/^(WEBVTT|Kind:|Language:|NOTE|\d+$)/i.test(text)) {
      continue;
    }

    // Skip standalone timestamp lines like "00:00:15.000 --> 00:00:18.000"
    if (/^\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?\s*-->\s*\d{2}:\d{2}/.test(text)) {
      continue;
    }

    // Remove embedded sound indicators like [Music], (Applause), [Laughter]
    text = text.replace(/\[(?:Music|Applause|Laughter|Inaudible|Cheering|Silence)[^\]]*\]/gi, '');
    text = text.replace(/\((?:Music|Applause|Laughter|Inaudible|Cheering|Silence)[^\)]*\)/gi, '');

    // Normalize spacing
    text = text.trim();
    if (!text) continue;

    // Remove immediate duplicate consecutive lines (common in YouTube auto captions)
    if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === text) {
      continue;
    }

    cleanedLines.push(text);
  }

  return cleanedLines.join('\n');
}

/**
 * Parses user-provided chapters/segments from lines like:
 * "00:00 Introduction"
 * "04:30 The Attention Mechanism"
 * "1:15:00 Final Takeaways"
 */
export function parseChapters(text: string): VideoSegment[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const segments: VideoSegment[] = [];

  const timeRegex = /(?:^|\s)(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\s*[-–—:]\s*|\s+)(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(timeRegex);
    if (match) {
      const fullTimeStr = line.substring(0, line.indexOf(match[4])).trim().replace(/[-–—:]+$/, '').trim();
      const title = match[4].trim() || `Segment ${segments.length + 1}`;
      const seconds = timestampToSeconds(fullTimeStr);

      segments.push({
        id: `seg-${i + 1}-${seconds}`,
        startTime: seconds,
        timestamp: secondsToTimestamp(seconds),
        title,
      });
    }
  }

  // Sort by start time ascending
  segments.sort((a, b) => a.startTime - b.startTime);

  // Calculate endTimes based on next segment's startTime
  for (let i = 0; i < segments.length; i++) {
    if (i < segments.length - 1) {
      segments[i].endTime = segments[i + 1].startTime;
    }
  }

  return segments;
}

/**
 * Exports summary data into clean, structured Markdown for note-taking apps.
 */
export function formatSummaryToMarkdown(summary: VideoSummaryResult): string {
  const parts: string[] = [];

  parts.push(`# ${summary.videoTitle}`);
  parts.push(`*Generated via BriefTube · Saved ~${summary.timeSavedMinutes} minutes of watch time*`);
  parts.push('');

  parts.push('## Executive Summary (TL;DR)');
  for (const bullet of summary.executiveSummary) {
    parts.push(`- ${bullet}`);
  }
  parts.push('');

  if (summary.keyConcepts && summary.keyConcepts.length > 0) {
    parts.push('## Key Concepts Decoded');
    for (const concept of summary.keyConcepts) {
      parts.push(`- **${concept.term}**: ${concept.definition}`);
      if (concept.simpleAnalogy) {
        parts.push(`  *Analogy:* ${concept.simpleAnalogy}`);
      }
    }
    parts.push('');
  }

  parts.push('## Segment-by-Segment Breakdown');
  for (const seg of summary.segmentSummaries) {
    parts.push(`### [${seg.timestamp}] ${seg.title}`);
    for (const b of seg.bullets) {
      parts.push(`- ${b}`);
    }
    if (seg.plainEnglishExplanation) {
      parts.push(`> **Plain English:** ${seg.plainEnglishExplanation}`);
    }
    if (seg.keyTakeaway) {
      parts.push(`**Key Takeaway:** ${seg.keyTakeaway}`);
    }
    parts.push('');
  }

  if (summary.actionableChecklist && summary.actionableChecklist.length > 0) {
    parts.push('## Actionable Takeaways');
    for (const item of summary.actionableChecklist) {
      parts.push(`- [ ] ${item}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}
