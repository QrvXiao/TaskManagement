require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRouter = require('./auth');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/auth', authRouter);

// 验证 token 中间件
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// 定义任务模型
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  assignee: String,
  dueDate: Date
}, { timestamps: true });

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    if (ret.dueDate) {
      ret.dueDate = (ret.dueDate instanceof Date) ? ret.dueDate.toISOString() : new Date(ret.dueDate).toISOString();
    } else {
      ret.dueDate = null;
    }
  }
});

const Task = mongoose.model('Task', taskSchema, 'TaskManagement');

// 简单校验中间件
function validateTask(req, res, next) {
  const { title, status, dueDate } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  const allowed = ['todo', 'in-progress', 'done'];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  }
  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) return res.status(400).json({ error: 'dueDate must be a valid date' });
  }
  next();
}

app.post('/tasks', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.dueDate) {
      // 支持 yyyy-MM-dd 或 ISO 字符串
      payload.dueDate = new Date(payload.dueDate);
      if (isNaN(payload.dueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid dueDate' });
      }
    } else {
      payload.dueDate = undefined;
    }
    const task = new Task(payload);
    await task.save();
    res.json(task); // toJSON transform 会把 _id->id，dueDate->ISO
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create task failed' });
  }
});


// 其余路由增加错误处理
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) res.json(task);
    else res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.delete('/tasks/:id', requireAuth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid ID' });
  }
});


// 更新任务（使用校验）
app.put('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.dueDate) update.dueDate = new Date(update.dueDate);
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    if (task) res.json(task);
    else res.status(404).send('Not found');
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid ID or bad data' });
  }
});

// 全局错误捕获（最后）
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});