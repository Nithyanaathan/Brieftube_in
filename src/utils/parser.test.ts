import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timestampToSeconds,
  secondsToTimestamp,
  extractYouTubeId,
  cleanTranscript,
  parseChapters,
  formatSummaryToMarkdown,
} from './parser.ts';
import { VideoSummaryResult } from '../types/index.ts';

test('timestampToSeconds correctly converts MM:SS and HH:MM:SS', () => {
  assert.equal(timestampToSeconds('00:00'), 0);
  assert.equal(timestampToSeconds('01:30'), 90);
  assert.equal(timestampToSeconds('10:15'), 615);
  assert.equal(timestampToSeconds('01:05:20'), 3920);
  assert.equal(timestampToSeconds('[02:45]'), 165);
  assert.equal(timestampToSeconds('invalid'), 0);
});

test('secondsToTimestamp converts seconds to clean formatted strings', () => {
  assert.equal(secondsToTimestamp(0), '00:00');
  assert.equal(secondsToTimestamp(90), '01:30');
  assert.equal(secondsToTimestamp(615), '10:15');
  assert.equal(secondsToTimestamp(3920), '01:05:20');
  assert.equal(secondsToTimestamp(-10), '00:00');
});

test('extractYouTubeId extracts IDs from various YouTube URL formats', () => {
  assert.equal(extractYouTubeId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=42'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(extractYouTubeId(''), null);
});

test('cleanTranscript removes VTT headers, sound tags, and duplicate consecutive lines', () => {
  const dirty = `WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:04.000
Welcome to today's lecture. [Music]
Welcome to today's lecture.

00:00:05.000 --> 00:00:08.000
We will discuss agentic AI systems.
(Applause)
We will discuss agentic AI systems.
Let's begin now.`;

  const cleaned = cleanTranscript(dirty);
  const lines = cleaned.split('\n');

  assert.equal(lines.length, 3);
  assert.equal(lines[0], "Welcome to today's lecture.");
  assert.equal(lines[1], 'We will discuss agentic AI systems.');
  assert.equal(lines[2], "Let's begin now.");
});

test('parseChapters correctly parses timestamps and chapter names', () => {
  const chaptersText = `
00:00 Introduction & Overview
05:12 Reflection Pattern in Agents
18:40 Tool Use and Function Calling
1:02:15 Multi-Agent Collaboration
  `;

  const segments = parseChapters(chaptersText);
  assert.equal(segments.length, 4);

  assert.equal(segments[0].startTime, 0);
  assert.equal(segments[0].title, 'Introduction & Overview');
  assert.equal(segments[0].endTime, 312);

  assert.equal(segments[1].startTime, 312);
  assert.equal(segments[1].title, 'Reflection Pattern in Agents');
  assert.equal(segments[1].endTime, 1120);

  assert.equal(segments[3].startTime, 3735);
  assert.equal(segments[3].title, 'Multi-Agent Collaboration');
  assert.equal(segments[3].timestamp, '01:02:15');
});

test('formatSummaryToMarkdown formats summary into readable markdown', () => {
  const sampleSummary: VideoSummaryResult = {
    videoId: 'sample-1',
    videoTitle: 'AI Agent Workflows Explained',
    executiveSummary: ['AI agents improve LLM performance by iterative loops.'],
    readingTimeMinutes: 3,
    timeSavedMinutes: 42,
    keyConcepts: [
      {
        term: 'Reflection',
        definition: 'Self-evaluating and refining generated outputs.',
        simpleAnalogy: 'Like proofreading your own essay before handing it in.',
      },
    ],
    segmentSummaries: [
      {
        segmentId: 'seg-1',
        timestamp: '00:00',
        title: 'Introduction',
        bullets: ['Zero-shot prompting vs agentic workflows.'],
        plainEnglishExplanation: 'Iterative checking beats single-pass answers.',
        keyTakeaway: 'Adopt loops for high-accuracy reasoning.',
      },
    ],
    actionableChecklist: ['Implement automated test loops in prompt chains.'],
    comprehensionLevel: 'student',
    generatedAt: '2026-11-03T00:00:00Z',
  };

  const md = formatSummaryToMarkdown(sampleSummary);
  assert.ok(md.includes('# AI Agent Workflows Explained'));
  assert.ok(md.includes('## Executive Summary (TL;DR)'));
  assert.ok(md.includes('**Reflection**: Self-evaluating'));
  assert.ok(md.includes('### [00:00] Introduction'));
  assert.ok(md.includes('- [ ] Implement automated test loops'));
});
