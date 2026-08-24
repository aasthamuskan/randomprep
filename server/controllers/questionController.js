const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const Question = require('../models/Question');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// ── Default Embedded Base Questions ──────────────────────────────────────────
const defaultQuestions = [
  {
    _id: 'default_dsa_1',
    questionNumber: 1,
    subject: 'DSA',
    category: 'DSA',
    subTopic: 'Arrays & Two Pointers',
    difficulty: 'Easy',
    expectedConcepts: ['two pointers', 'sorted array', 'linear time', 'opposite ends', 'O(n)'],
    hints: ['Think about iterating from both ends simultaneously'],
    idealAnswer: 'The Two Pointer technique uses two indices that traverse an array from opposite ends or at different speeds. It reduces time complexity from O(n²) to O(n) for problems like finding pairs with a target sum in a sorted array, removing duplicates, or checking palindromes.',
  },
  {
    _id: 'default_dsa_2',
    questionNumber: 2,
    subject: 'DSA',
    category: 'DSA',
    subTopic: 'Trees & Graphs',
    difficulty: 'Easy',
    expectedConcepts: ['breadth-first', 'depth-first', 'queue', 'stack', 'shortest path', 'level order'],
    hints: ['Consider which data structure each uses'],
    idealAnswer: 'BFS uses a queue and explores level by level — ideal for shortest path problems. DFS uses a stack (or recursion) and goes deep before backtracking — ideal for cycle detection, topological sort, and exhaustive search.',
  },
  {
    _id: 'default_cpp_1',
    questionNumber: 1,
    subject: 'C++',
    category: 'C++',
    subTopic: 'Memory Management',
    difficulty: 'Medium',
    expectedConcepts: ['stack', 'heap', 'allocation', 'deallocation', 'new', 'delete', 'scope', 'memory leak'],
    hints: ['Think about automatic vs manual memory management'],
    idealAnswer: 'Stack: automatically allocated/deallocated when variables go out of scope, fast, limited size. Heap: manually allocated (new) and deallocated (delete), larger, slower, can cause memory leaks.',
  }
];

// Helper to load questions from server/seed/data/*.json
const loadLocalQuestions = () => {
  const dataDir = path.join(__dirname, '..', 'seed', 'data');
  let questions = [];

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
    console.log('📂 loadLocalQuestions loading files:', files);
    files.forEach((file) => {
      try {
        const filePath = path.join(dataDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(content)) {
          questions = questions.concat(
            content.map((item, index) => ({
              _id: item._id || `${file.replace('.json', '')}_${item.questionNumber || index + 1}`,
              ...item,
              subject: item.subject || item.category || 'General',
              category: item.category || item.subject || 'General',
              subTopic: item.subTopic || 'General Constructs',
            }))
          );
        }
      } catch (err) {
        console.error(`Error loading seed file ${file}:`, err.message);
      }
    });
  }

  if (questions.length === 0) {
    questions = [...defaultQuestions];
  }

  return questions;
};

// Helper to get all combined questions from local JSON files and DB
const getAllQuestionsCombined = async () => {
  const localQuestions = loadLocalQuestions();
  let dbQuestions = [];
  try {
    dbQuestions = await Question.find({}).lean();
  } catch {
    dbQuestions = [];
  }

  const questionMap = new Map();

  // 1. Add local JSON questions first (our primary, authoritative curriculum)
  localQuestions.forEach((q) => {
    const key = `${q.subject || q.category}_${q.question}`.toLowerCase();
    questionMap.set(key, q);
  });

  // 2. Add any additional DB questions if not present
  if (Array.isArray(dbQuestions)) {
    dbQuestions.forEach((q) => {
      const key = `${q.subject || q.category}_${q.question}`.toLowerCase();
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          _id: q._id,
          ...q,
          subject: q.subject || q.category || 'General',
          category: q.category || q.subject || 'General',
          subTopic: q.subTopic || 'General Constructs',
        });
      }
    });
  }

  return Array.from(questionMap.values());
};

// ── 1. Get Subject Overview & Curriculum Breakdown ─────────────────────────────
const getSubjectOverview = async (req, res, next) => {
  try {
    const questions = await getAllQuestionsCombined();

    // Group questions by subject and subTopic
    const subjectMap = {};

    questions.forEach((q) => {
      const subj = q.subject || q.category || 'General';
      const sub = q.subTopic || 'General';

      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          name: subj,
          totalQuestions: 0,
          subTopicMap: {},
        };
      }

      subjectMap[subj].totalQuestions += 1;

      if (!subjectMap[subj].subTopicMap[sub]) {
        subjectMap[subj].subTopicMap[sub] = 0;
      }
      subjectMap[subj].subTopicMap[sub] += 1;
    });

    const subjects = Object.values(subjectMap).map((s) => ({
      name: s.name,
      totalQuestions: s.totalQuestions,
      subTopics: Object.keys(s.subTopicMap).map((subName) => ({
        name: subName,
        count: s.subTopicMap[subName],
      })),
    }));

    res.json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. Get Questions List (Database / File store query with filters) ──────────
const getQuestions = async (req, res, next) => {
  try {
    const { subject, category, subTopic, difficulty, search } = req.query;

    const allQuestions = await getAllQuestionsCombined();

    const selectedSubject = subject || category;

    let filtered = allQuestions.filter((q) => {
      if (selectedSubject && selectedSubject !== 'All') {
        const matchSubj = (q.subject || '').toLowerCase() === selectedSubject.toLowerCase();
        const matchCat = (q.category || '').toLowerCase() === selectedSubject.toLowerCase();
        if (!matchSubj && !matchCat) return false;
      }

      if (subTopic && subTopic !== 'All') {
        if ((q.subTopic || '').toLowerCase() !== subTopic.toLowerCase()) return false;
      }

      if (difficulty && difficulty !== 'Mixed' && VALID_DIFFICULTIES.includes(difficulty)) {
        if (q.difficulty !== difficulty) return false;
      }

      if (search) {
        const term = search.toLowerCase();
        const text = `${q.question} ${q.description || ''} ${q.idealAnswer || ''}`.toLowerCase();
        if (!text.includes(term)) return false;
      }

      return true;
    });

    // Sort by questionNumber
    filtered.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

    res.json({
      success: true,
      count: filtered.length,
      questions: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Get Question by ID ──────────────────────────────────────────────────
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let allQuestions = [];
    try {
      allQuestions = await Question.find({}).lean();
    } catch {
      allQuestions = [];
    }

    if (!allQuestions || allQuestions.length === 0) {
      allQuestions = loadLocalQuestions();
    }

    const question = allQuestions.find((q) => String(q._id) === String(id) || String(q.id) === String(id));

    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// ── 4. Get Categories / Subjects list ────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const allQuestions = loadLocalQuestions();
    const subjects = Array.from(new Set(allQuestions.map((q) => q.subject || q.category))).filter(Boolean);
    res.json({ success: true, categories: subjects });
  } catch (error) {
    next(error);
  }
};

// ── 5. Get Random Question ───────────────────────────────────────────────────
const getRandomQuestion = async (req, res, next) => {
  try {
    const { subject, category, subTopic, difficulty } = req.query;
    const selectedSubject = subject || category;

    const allQuestions = loadLocalQuestions();

    let filtered = allQuestions.filter((q) => {
      if (selectedSubject && selectedSubject !== 'All') {
        const matchSubj = (q.subject || '').toLowerCase() === selectedSubject.toLowerCase();
        const matchCat = (q.category || '').toLowerCase() === selectedSubject.toLowerCase();
        if (!matchSubj && !matchCat) return false;
      }
      if (subTopic && subTopic !== 'All') {
        if ((q.subTopic || '').toLowerCase() !== subTopic.toLowerCase()) return false;
      }
      if (difficulty && difficulty !== 'Mixed' && VALID_DIFFICULTIES.includes(difficulty)) {
        if (q.difficulty !== difficulty) return false;
      }
      return true;
    });

    if (filtered.length > 0) {
      const randomDbQuestion = filtered[Math.floor(Math.random() * filtered.length)];
      return res.json({ success: true, question: randomDbQuestion, source: 'database' });
    }

    // AI Fallback
    const cat = selectedSubject && selectedSubject !== 'All' ? selectedSubject : 'C Language';
    const diff = difficulty && difficulty !== 'Mixed' ? difficulty : 'Medium';

    const prompt = `You are a senior software engineer conducting a verbal technical interview.

Generate ONE ${diff} difficulty THEORY-BASED interview question about "${cat}".

RULES:
- The question must be a CONCEPTUAL/THEORY question — asked verbally, not a coding challenge.
- Do NOT ask the candidate to write code, implement an algorithm, or solve a LeetCode-style problem.
- Ask about definitions, differences, how things work, why something exists, trade-offs, or real-world use.

Respond ONLY with a valid JSON object — no markdown, no preamble, no extra text:
{
  "question": "The theory interview question text here",
  "subject": "${cat}",
  "category": "${cat}",
  "subTopic": "General",
  "difficulty": "${diff}",
  "expectedConcepts": ["concept1", "concept2", "concept3", "concept4"],
  "hints": ["One short hint that nudges the candidate toward key concepts"],
  "idealAnswer": "A clear model answer covering all the key concepts an interviewer expects"
}`;

    const completion = await client.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const err = new Error('AI returned invalid format');
      err.statusCode = 500;
      return next(err);
    }

    const question = JSON.parse(jsonMatch[0]);
    question.id = `q_${Date.now()}`;

    res.json({ success: true, question, source: 'ai' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjectOverview,
  getRandomQuestion,
  getQuestions,
  getQuestionById,
  getCategories,
};
