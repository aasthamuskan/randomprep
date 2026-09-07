const Groq = require('groq-sdk');
const store = require('../config/store');

const getCleanGroqKey = () => {
  const raw = (process.env.GROQ_API_KEY || '').trim();
  return raw.split(/\s+/)[0];
};

const client = new Groq({ apiKey: getCleanGroqKey() });

// ── AI Evaluation ──────────────────────────────────────────────────────────

const evaluateWithGroq = async (question, answer, expectedConcepts, idealAnswer) => {
  const prompt = `You are a senior software engineer evaluating a candidate's interview answer.

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

EXPECTED CONCEPTS TO COVER: ${expectedConcepts.join(', ')}

IDEAL ANSWER (for reference): ${idealAnswer}

Evaluate the answer and respond ONLY with a valid JSON object — no markdown, no extra text:
{
  "score": <integer 0-100>,
  "matchedConcepts": [<list of expected concepts the candidate mentioned>],
  "feedback": "<2-3 sentence constructive feedback>",
  "strengths": "<what the candidate did well>",
  "improvements": "<what could be improved>"
}`;

  const completion = await client.chat.completions.create({
    model: 'qwen/qwen3.6-27b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
    reasoning_effort: 'none',
  });

  let raw = completion.choices[0].message.content.trim();
  raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI evaluation returned invalid format');
  return JSON.parse(jsonMatch[0]);
};

// ── POST /api/practice ─────────────────────────────────────────────────────

const savePractice = async (req, res, next) => {
  try {
    const { questionId, question, answer, timeTaken, expectedConcepts, idealAnswer, category, difficulty } = req.body;

    if (!answer || answer.trim().length === 0) {
      const err = new Error('Answer is required'); err.statusCode = 400; return next(err);
    }
    if (timeTaken === undefined || timeTaken === null) {
      const err = new Error('timeTaken is required'); err.statusCode = 400; return next(err);
    }

    let evaluation;
    try {
      evaluation = await evaluateWithGroq(
        question || 'Interview question',
        answer,
        expectedConcepts || [],
        idealAnswer || ''
      );
    } catch {
      // Fallback keyword scoring if Groq fails
      const concepts = expectedConcepts || [];
      const lower = answer.toLowerCase();
      const matched = concepts.filter((c) => lower.includes(c.toLowerCase()));
      const score = concepts.length > 0
        ? Math.min(100, Math.round((matched.length / concepts.length) * 70) + Math.min(30, Math.floor(answer.split(/\s+/).length / 10) * 5))
        : 50;
      evaluation = {
        score,
        matchedConcepts: matched,
        feedback: score >= 70 ? 'Good answer covering key concepts.' : 'Review the expected concepts and expand your answer.',
        strengths: matched.length > 0 ? `Covered: ${matched.join(', ')}` : 'Attempted the question',
        improvements: 'Consider covering more technical depth',
        isFallback: true,  // AI unavailable -- keyword-match scoring used
      };
    }

    const session = store.addSession({
      questionId: questionId || `q_${Date.now()}`,
      question: question || 'Interview question',
      category: category || 'General',
      difficulty: difficulty || 'Medium',
      answer,
      timeTaken,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      matchedConcepts: evaluation.matchedConcepts || [],
      totalConcepts: (expectedConcepts || []).length,
      idealAnswer: idealAnswer || '',
    });

    res.status(201).json({
      success: true,
      practice: {
        id: session.id,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        matchedConcepts: evaluation.matchedConcepts || [],
        totalConcepts: (expectedConcepts || []).length,
        timeTaken,
        idealAnswer: idealAnswer || '',
        createdAt: session.createdAt,
        scoredBy: evaluation.isFallback ? 'keyword-match' : 'ai',  // Scoring method transparency
      },
    });
  } catch (error) { next(error); }
};

// ── GET /api/practice/history ──────────────────────────────────────────────

const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const result = store.getPage(parseInt(page), parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

// ── GET /api/practice/stats ────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    const all = store.getAll();
    const total = all.length;
    const avgScore = total > 0
      ? Math.round(all.reduce((sum, s) => sum + (s.score || 0), 0) / total)
      : 0;

    // ── Professional Consecutive Daily Streak Algorithm ────────────────────
    const uniqueDays = new Set(
      all.map((s) => {
        const d = new Date(s.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    const getFormattedDate = (dateObj) => {
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    };

    const now = new Date();
    const todayStr = getFormattedDate(now);

    const yesterdayObj = new Date(now);
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterdayObj);

    let streak = 0;

    // Determine starting anchor date for consecutive check
    let checkDate = null;
    if (uniqueDays.has(todayStr)) {
      checkDate = new Date(now);
    } else if (uniqueDays.has(yesterdayStr)) {
      checkDate = yesterdayObj;
    }

    // Count consecutive days backward
    if (checkDate) {
      const iter = new Date(checkDate);
      while (uniqueDays.has(getFormattedDate(iter))) {
        streak += 1;
        iter.setDate(iter.getDate() - 1);
      }
    }

    // Group by category
    const catMap = {};
    for (const s of all) {
      const cat = s.category || 'Unknown';
      if (!catMap[cat]) catMap[cat] = { count: 0, totalScore: 0 };
      catMap[cat].count++;
      catMap[cat].totalScore += s.score || 0;
    }
    const byCategory = Object.entries(catMap).map(([_id, v]) => ({
      _id,
      count: v.count,
      avgScore: Math.round(v.totalScore / v.count),
    }));

    res.json({ success: true, stats: { total, averageScore: avgScore, streak, byCategory } });
  } catch (error) { next(error); }
};

// ── POST /api/practice/transcribe ──────────────────────────────────────────

const transcribeAudio = async (req, res, next) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      const err = new Error('Audio data is required for transcription');
      err.statusCode = 400;
      return next(err);
    }

    const { toFile } = require('groq-sdk');
    const base64Data = audioBase64.includes(';base64,')
      ? audioBase64.split(';base64,')[1]
      : audioBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`[Whisper] Audio buffer size: ${buffer.length} bytes, mimeType: ${mimeType}`);

    // Need at least 1KB of real audio data (avoid sending silence/noise)
    if (buffer.length < 1000) {
      console.log('[Whisper] Buffer too small, skipping transcription');
      return res.json({ success: true, text: '' });
    }

    const cleanType = mimeType.split(';')[0].trim() || 'audio/webm';
    let ext = 'webm';
    if (cleanType.includes('mp4') || cleanType.includes('m4a')) ext = 'm4a';
    else if (cleanType.includes('ogg')) ext = 'ogg';
    else if (cleanType.includes('wav')) ext = 'wav';
    else if (cleanType.includes('mp3') || cleanType.includes('mpeg')) ext = 'mp3';
    // webm is default — handles both webm and webm;codecs=opus

    console.log(`[Whisper] Sending ${ext} file (${(buffer.length / 1024).toFixed(1)}KB) to Groq Whisper...`);

    const file = await toFile(buffer, `speech.${ext}`, { type: cleanType });

    // ── Custom 30-second timeout via AbortController ────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn('[Whisper] Request aborted — exceeded 30s timeout');
    }, 30_000);

    let transcription;
    try {
      transcription = await client.audio.transcriptions.create(
        {
          file,
          model: 'whisper-large-v3-turbo',
          prompt: 'Transcribe this interview practice verbal answer from a software engineering candidate:',
          temperature: 0.0,
          response_format: 'text',
        },
        { signal: controller.signal }  // Attach abort signal for timeout control
      );
    } finally {
      clearTimeout(timeoutId);  // Always clear — prevents memory leak on success
    }

    // Groq returns a string when response_format is 'text'
    const text = typeof transcription === 'string'
      ? transcription.trim()
      : (transcription.text ? transcription.text.trim() : '');

    console.log(`[Whisper] Transcription SUCCESS: "${text.substring(0, 80)}..."`)

    res.json({ success: true, text });
  } catch (error) {
    // Distinguish between timeout abort and actual Groq failures for clean debugging
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') {
      console.warn('[Whisper] Timeout: request exceeded 30s — returning empty transcript');
    } else {
      console.error('[Whisper] Transcription FAILED:', error?.message || error);
    }
    // Both cases: return empty text so client silently falls back to live-preview
    res.json({ success: true, text: '', timedOut: error?.name === 'AbortError' });
  }
};

module.exports = { savePractice, getHistory, getStats, transcribeAudio };

