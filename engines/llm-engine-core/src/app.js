const express = require('express');
const bodyParser = require('body-parser');
const llmRoutes = require('./routes/llm.routes');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/llm', llmRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('[LLM] MongoDB connected'))
    .catch(err => logger.error('[LLM] MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => logger.info(`[LLM] Engine running on port ${PORT}`));
