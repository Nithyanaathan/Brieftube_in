import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with required telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Summarization Endpoint:
 * Transforms long YouTube video transcripts + user segments into concise, highly understandable bullet points.
 */
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const {
      videoTitle,
      transcript,
      segments,
      comprehensionLevel = 'student',
      density = 'balanced',
      durationSeconds = 1800,
    } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Video transcript is required.' });
    }

    // Determine instructions based on comprehensionLevel
    let styleGuidance = '';
    switch (comprehensionLevel) {
      case 'eli5':
        styleGuidance =
          'Explain concepts in simple everyday English without academic or technical jargon. Use intuitive real-world analogies. Focus on making complex ideas accessible to anyone with zero background.';
        break;
      case 'actionable':
        styleGuidance =
          'Focus intensely on actionable takeaways, tactical checklists, and immediate how-to implementations. Emphasize "What can the user do with this information today?".';
        break;
      case 'executive':
        styleGuidance =
          'High-level strategic briefing. Deliver punchy executive summary points, ROI / strategic impacts, trade-offs, and critical decisions. Omit minor operational filler.';
        break;
      case 'student':
      default:
        styleGuidance =
          'Structured study notes with high pedagogical clarity. Highlight core mechanisms, bold important concepts, logical cause-and-effect sequences, and practical applications.';
        break;
    }

    const segmentsText =
      Array.isArray(segments) && segments.length > 0
        ? segments
            .map(
              (s: any, idx: number) =>
                `Segment ${idx + 1}: [${s.timestamp || '00:00'}] ${s.title}${
                  s.description ? ` (${s.description})` : ''
                }`
            )
            .join('\n')
        : 'No specific segments provided. Segment the transcript naturally by topic and timestamps.';

    const systemInstruction = `You are BriefTube AI, an expert educational synthesizer and video summarization engine.
Your sole mission is to take long YouTube video transcripts and key segments, and turn them into the most understandable, clear, and concise bullet-point summary possible for human learners.

Guiding Principles for Maximum Human Comprehension:
1. Anti-Fluff: Strip all rhetorical preamble ("Welcome to the channel", "Don't forget to like and subscribe", long personal tangents).
2. Cognitive Anchoring: Start with 3 high-impact executive bullets that capture the core thesis in under 20 seconds.
3. Segment Fidelity: Map bullet points directly to the user's provided segments/timestamps so they can jump to video points.
4. Concept Decoding: Decode any dense terminology into plain definitions with a relatable analogy.
5. Actionability: Provide a crisp checklist of concrete takeaways.
6. Target Comprehension Style: ${styleGuidance}
7. Density Level: ${density} (concise = 2-3 bullets per segment, balanced = 3-4 bullets, comprehensive = 4-5 thorough bullets).`;

    const prompt = `Video Title: "${videoTitle || 'YouTube Video'}"
Key Segments Provided by User:
${segmentsText}

Full Video Transcript:
${transcript.slice(0, 45000)}

Generate a highly structured JSON summary following the specified response schema. Ensure all segment summaries correspond to the user's provided segments if given, or logical chapters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 punchy bullets summarizing the core thesis and significance in 20 seconds.',
            },
            readingTimeMinutes: {
              type: Type.NUMBER,
              description: 'Estimated reading time of this summary in minutes.',
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: 'Technical term or key concept.' },
                  definition: { type: Type.STRING, description: 'Plain English 1-sentence definition.' },
                  simpleAnalogy: { type: Type.STRING, description: 'Relatable everyday analogy.' },
                },
                required: ['term', 'definition', 'simpleAnalogy'],
              },
              description: '2 to 4 key jargon terms decoded for easy understanding.',
            },
            segmentSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: 'Timestamp string like 00:00 or 14:30.' },
                  title: { type: Type.STRING, description: 'Segment title.' },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Concise, high-clarity bullet points.',
                  },
                  plainEnglishExplanation: {
                    type: Type.STRING,
                    description: '1-sentence simplified summary in plain everyday language.',
                  },
                  keyTakeaway: {
                    type: Type.STRING,
                    description: 'The single most important takeaway from this segment.',
                  },
                },
                required: ['timestamp', 'title', 'bullets', 'plainEnglishExplanation', 'keyTakeaway'],
              },
              description: 'Granular breakdown for each segment of the video.',
            },
            actionableChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 concrete action items or applications derived from the video.',
            },
          },
          required: [
            'executiveSummary',
            'readingTimeMinutes',
            'keyConcepts',
            'segmentSummaries',
            'actionableChecklist',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Calculate time saved
    const videoDurationMinutes = Math.round(durationSeconds / 60) || 30;
    const readingTime = parsed.readingTimeMinutes || 3;
    const timeSaved = Math.max(1, videoDurationMinutes - readingTime);

    // Ensure segment IDs
    const segmentSummaries = (parsed.segmentSummaries || []).map((seg: any, idx: number) => ({
      segmentId: `seg-${idx}-${seg.timestamp || '00:00'}`,
      ...seg,
    }));

    const result = {
      videoId: req.body.videoId || 'custom',
      videoTitle: videoTitle || 'Video Summary',
      executiveSummary: parsed.executiveSummary || [],
      readingTimeMinutes: readingTime,
      timeSavedMinutes: timeSaved,
      keyConcepts: parsed.keyConcepts || [],
      segmentSummaries,
      actionableChecklist: parsed.actionableChecklist || [],
      comprehensionLevel,
      generatedAt: new Date().toISOString(),
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Summarization API error:', error);
    return res.status(500).json({
      error: 'Failed to generate video summary.',
      details: error.message || String(error),
    });
  }
});

/**
 * Interactive Clarifier / Q&A Endpoint:
 * Allows user to ask questions, request simpler rephrasing, or deep-dive on specific segments.
 */
app.post('/api/clarify', async (req: Request, res: Response) => {
  try {
    const { videoTitle, question, transcript, currentSummary, segmentTitle } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const systemInstruction = `You are BriefTube AI Assistant.
A user is studying the YouTube video: "${videoTitle}".
They are asking a clarification question or requesting a simpler breakdown of a concept.
Answer concisely in 2-4 bullet points or short paragraphs using clear, friendly language.
Always ground your answer in the video transcript and summary context.
If explaining a complex concept, use a clear everyday analogy.`;

    const promptContext = `Video: ${videoTitle}
${segmentTitle ? `Specific Segment of Interest: ${segmentTitle}\n` : ''}
Video Summary Context:
${JSON.stringify(currentSummary || {}).slice(0, 5000)}

Relevant Transcript Snippet:
${(transcript || '').slice(0, 15000)}

User Question: ${question}

Provide a direct, concise, and easy-to-understand explanation:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContext,
      config: {
        systemInstruction,
      },
    });

    return res.json({ answer: response.text || 'No response generated.' });
  } catch (error: any) {
    console.error('Clarification API error:', error);
    return res.status(500).json({
      error: 'Failed to process clarification question.',
      details: error.message || String(error),
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
