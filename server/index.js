require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const questionRoutes = require('./routes/questionRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/practice', practiceRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'TechPrep API running', groq: !!process.env.GROQ_API_KEY })
);

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TechPrep server running on http://localhost:${PORT}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? '✅ Connected' : '❌ Key missing'}`);
  console.log(`📂 History: JSON file store (no MongoDB needed)`);
}); // reload trigger
