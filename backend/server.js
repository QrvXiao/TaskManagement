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

// ID 格式验证中间件
function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
}

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
  dueDate: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
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
    const payload = { 
      ...req.body,
      userId: req.user.sub // 从 JWT token 中获取用户 ID
    };
    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate);
      if (isNaN(payload.dueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid dueDate' });
      }
    } else {
      payload.dueDate = undefined;
    }
    const task = new Task(payload);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create task failed' });
  }
});

// 获取任务列表 - 只返回当前用户的任务
app.get('/tasks', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.sub }); // 只查询当前用户的任务
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 获取单个任务 - 验证所有权
app.get('/tasks/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.sub // 确保任务属于当前用户
    });
    if (task) res.json(task);
    else res.status(404).json({ error: 'Task not found' });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新任务 - 验证所有权
app.put('/tasks/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.userId; // 防止用户修改 userId
    
    if (update.dueDate) {
      update.dueDate = new Date(update.dueDate);
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub }, // 确保任务属于当前用户
      update, 
      { new: true }
    );
    
    if (task) res.json(task);
    else res.status(404).json({ error: 'Task not found' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除任务 - 验证所有权
app.delete('/tasks/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.sub // 确保任务属于当前用户
    });
    if (task) res.status(204).send();
    else res.status(404).json({ error: 'Task not found' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal server error' });
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