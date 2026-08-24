const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techprep';

// Default questions array
const defaultQuestions = [
  // ─── DSA ───────────────────────────────────────────────────────────────────
  {
    question: 'Explain the Two Pointer technique and when you would use it.',
    subject: 'DSA', category: 'DSA', subTopic: 'Arrays & Two Pointers', difficulty: 'Easy',
    expectedConcepts: ['two pointers', 'sorted array', 'linear time', 'opposite ends', 'O(n)'],
    hints: ['Think about iterating from both ends simultaneously'],
    idealAnswer: 'The Two Pointer technique uses two indices that traverse an array from opposite ends or at different speeds. It reduces time complexity from O(n²) to O(n) for problems like finding pairs with a target sum in a sorted array, removing duplicates, or checking palindromes.',
  },
  {
    question: 'What is the difference between BFS and DFS? When would you choose one over the other?',
    subject: 'DSA', category: 'DSA', subTopic: 'Trees & Graphs', difficulty: 'Easy',
    expectedConcepts: ['breadth-first', 'depth-first', 'queue', 'stack', 'shortest path', 'level order'],
    hints: ['Consider which data structure each uses'],
    idealAnswer: 'BFS uses a queue and explores level by level — ideal for shortest path problems. DFS uses a stack (or recursion) and goes deep before backtracking — ideal for cycle detection, topological sort, and exhaustive search.',
  },
  {
    question: 'Explain the Sliding Window technique with an example.',
    subject: 'DSA', category: 'DSA', subTopic: 'Arrays & Strings', difficulty: 'Medium',
    expectedConcepts: ['window', 'subarray', 'O(n)', 'expand', 'shrink', 'contiguous'],
    hints: ['Think about maintaining a range of elements'],
    idealAnswer: 'Sliding Window maintains a contiguous subarray by expanding the right pointer and shrinking the left when a condition is violated. Example: maximum sum subarray of size k — slide a window of size k across the array tracking the running sum.',
  },
  {
    question: 'What is dynamic programming? Explain with a classic example.',
    subject: 'DSA', category: 'DSA', subTopic: 'Dynamic Programming', difficulty: 'Medium',
    expectedConcepts: ['memoization', 'overlapping subproblems', 'optimal substructure', 'top-down', 'bottom-up', 'fibonacci'],
    hints: ['Think about breaking problems into subproblems'],
    idealAnswer: 'Dynamic programming solves problems by breaking them into overlapping subproblems and caching results. It requires optimal substructure and overlapping subproblems. Classic example: Fibonacci — instead of O(2^n) recursion, cache results for O(n) time.',
  },
  {
    question: 'Explain how a HashMap works internally. What happens during a collision?',
    subject: 'DSA', category: 'DSA', subTopic: 'Hashing & Collections', difficulty: 'Medium',
    expectedConcepts: ['hash function', 'bucket', 'collision', 'chaining', 'open addressing', 'load factor', 'O(1)'],
    hints: ['Think about the underlying array and hash function'],
    idealAnswer: 'A HashMap uses a hash function to map keys to array indices. Collisions (two keys mapping to the same index) are handled by chaining (linked list at each bucket) or open addressing (probe for next empty slot). Average O(1) lookup; degrades to O(n) on too many collisions. Load factor triggers resizing.',
  },
  {
    question: 'What is the difference between stack and heap memory in C++?',
    subject: 'C++', category: 'C++', subTopic: 'Memory Management', difficulty: 'Medium',
    expectedConcepts: ['stack', 'heap', 'allocation', 'deallocation', 'new', 'delete', 'scope', 'memory leak'],
    hints: ['Think about automatic vs manual memory management'],
    idealAnswer: 'Stack: automatically allocated/deallocated when variables go out of scope, fast, limited size. Heap: manually allocated (new) and deallocated (delete), larger, slower, can cause memory leaks. Smart pointers (unique_ptr, shared_ptr) manage heap memory automatically to prevent leaks.',
  },
  {
    question: 'What are smart pointers in C++?',
    subject: 'C++', category: 'C++', subTopic: 'Modern C++', difficulty: 'Hard',
    expectedConcepts: ['unique_ptr', 'shared_ptr', 'weak_ptr', 'RAII', 'ownership', 'memory leak', 'reference count'],
    hints: ['Think about automatic memory management'],
    idealAnswer: 'Smart pointers automate memory management (RAII). unique_ptr: exclusive ownership — automatically deletes when out of scope, not copyable. shared_ptr: shared ownership via reference counting — deletes when count reaches 0. weak_ptr: non-owning reference to shared_ptr object — avoids circular references causing memory leaks.',
  }
];

const loadSeedDataFromFiles = () => {
  const dataDir = path.join(__dirname, 'data');
  let loadedQuestions = [...defaultQuestions];

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} JSON seed data file(s) in server/seed/data/`);

    files.forEach(file => {
      try {
        const filePath = path.join(dataDir, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const fileQuestions = JSON.parse(rawContent);
        if (Array.isArray(fileQuestions)) {
          loadedQuestions = loadedQuestions.concat(fileQuestions);
          console.log(`   └─ Loaded ${fileQuestions.length} questions from ${file}`);
        }
      } catch (err) {
        console.error(`❌ Error reading ${file}:`, err.message);
      }
    });
  }

  // Ensure subject and category are synced for all items
  return loadedQuestions.map(q => ({
    ...q,
    subject: q.subject || q.category || 'General',
    category: q.category || q.subject || 'General',
    subTopic: q.subTopic || 'General Constructs'
  }));
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    const allQuestions = loadSeedDataFromFiles();

    const result = await Question.insertMany(allQuestions);
    console.log(`\n✅ Seeded total ${result.length} questions into database`);

    const counts = await Question.aggregate([
      {
        $group: {
          _id: { subject: '$subject', subTopic: '$subTopic' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.subject': 1, '_id.subTopic': 1 } },
    ]);

    console.log('\n📊 Questions Breakdown by Subject & Sub-Topic:');
    counts.forEach(({ _id, count }) => {
      console.log(`   • [${_id.subject}] ${_id.subTopic}: ${count} question(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
