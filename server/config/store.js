const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));

const readHistory = () => {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
};

const writeHistory = (data) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
};

const addSession = (session) => {
  const history = readHistory();
  history.unshift({ ...session, id: Date.now().toString(), createdAt: new Date().toISOString() });
  writeHistory(history);
  return history[0];
};

const getAll = () => readHistory();

const getPage = (page = 1, limit = 15) => {
  const all = readHistory();
  const total = all.length;
  const start = (page - 1) * limit;
  return {
    history: all.slice(start, start + limit),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

module.exports = { addSession, getAll, getPage };
