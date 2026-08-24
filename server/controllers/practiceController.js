const Groq = require('groq-sdk');
const store = require('../config/store');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    // Calculate streak from practice timestamps
    const uniqueDays = new Set(
      all.map(s => new Date(s.createdAt).toISOString().split('T')[0])
    );
    let streak = uniqueDays.size;

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
    const base64Data = audioBase64.includes(';base64,') ? audioBase64.split(';base64,')[1] : audioBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length < 100) {
      return res.json({ success: true, text: '' });
    }

    const cleanType = mimeType.split(';')[0] || 'audio/webm';
    let ext = 'webm';
    if (cleanType.includes('mp4') || cleanType.includes('m4a')) ext = 'm4a';
    else if (cleanType.includes('ogg')) ext = 'ogg';
    else if (cleanType.includes('wav')) ext = 'wav';

    const file = await toFile(buffer, `speech.${ext}`, { type: cleanType });

    const transcription = await client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      prompt: 'Interview practice verbal answer from candidate:',
      temperature: 0.2,
    });

    res.json({
      success: true,
      text: transcription.text ? transcription.text.trim() : '',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { savePractice, getHistory, getStats, transcribeAudio };
