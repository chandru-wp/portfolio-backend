require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:5001',
  'https://chandru-wp.github.io'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    // requests from tools (curl, server-side) - allow
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  // respond to preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

/* =====================================================
   PORTFOLIO DATA (Profile, Skills, Experience, Education)
===================================================== */

// Profile (single document expected)
app.get("/api/profile", async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst({
      orderBy: { createdAt: "desc" }
    });
    res.json(profile || {});
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: "Error fetching profile", details: error.message });
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const created = await prisma.profile.create({ data: req.body });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Error creating profile" });
  }
});

app.put("/api/profile", async (req, res) => {
  try {
    // Find existing profile or create new one
    const existing = await prisma.profile.findFirst();
    
    if (existing) {
      const updated = await prisma.profile.update({
        where: { id: existing.id },
        data: req.body
      });
      res.json(updated);
    } else {
      const created = await prisma.profile.create({ data: req.body });
      res.status(201).json(created);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Skills grouped
app.get("/api/skills", async (req, res) => {
  try {
    const skills = await prisma.skillGroup.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(skills || []);
  } catch (error) {
    console.error('Skills fetch error:', error);
    res.status(500).json({ message: "Error fetching skills", details: error.message });
  }
});

app.post("/api/skills", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const created = await prisma.skillGroup.createMany({ data: payload });
    res.status(201).json({ count: created.count });
  } catch (error) {
    res.status(500).json({ message: "Error creating skills" });
  }
});

app.put("/api/skills/:id", async (req, res) => {
  try {
    const updated = await prisma.skillGroup.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating skill" });
  }
});

app.delete("/api/skills/:id", async (req, res) => {
  try {
    const deleted = await prisma.skillGroup.delete({
      where: { id: req.params.id }
    });
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Error deleting skill" });
  }
});

// Experience
app.get("/api/experience", async (req, res) => {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(experience || []);
  } catch (error) {
    console.error('Experience fetch error:', error);
    res.status(500).json({ message: "Error fetching experience", details: error.message });
  }
});

app.post("/api/experience", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const created = await prisma.experience.createMany({ data: payload });
    res.status(201).json({ count: created.count });
  } catch (error) {
    res.status(500).json({ message: "Error creating experience" });
  }
});

app.put("/api/experience/:id", async (req, res) => {
  try {
    const updated = await prisma.experience.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating experience" });
  }
});

app.delete("/api/experience/:id", async (req, res) => {
  try {
    const deleted = await prisma.experience.delete({
      where: { id: req.params.id }
    });
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Error deleting experience" });
  }
});

// Education
app.get("/api/education", async (req, res) => {
  try {
    const education = await prisma.education.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(education || []);
  } catch (error) {
    console.error('Education fetch error:', error);
    res.status(500).json({ message: "Error fetching education", details: error.message });
  }
});

app.post("/api/education", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const created = await prisma.education.createMany({ data: payload });
    res.status(201).json({ count: created.count });
  } catch (error) {
    res.status(500).json({ message: "Error creating education" });
  }
});

app.put("/api/education/:id", async (req, res) => {
  try {
    const updated = await prisma.education.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating education" });
  }
});

app.delete("/api/education/:id", async (req, res) => {
  try {
    const deleted = await prisma.education.delete({
      where: { id: req.params.id }
    });
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Error deleting education" });
  }
});

/* =====================================================
   REGISTER USER (Admin + User)
===================================================== */
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log('Registration attempt:', { username, role });

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exist = await prisma.user.findUnique({ where: { username } });
    if (exist) {
      console.log('User already exists:', username);
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await prisma.user.create({
      data: { username, password, role }
    });

    console.log('User registered successfully:', username);
    res.status(201).json({
      message: "Registered successfully",
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

/* =====================================================
   LOGIN
===================================================== */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt for:', username);

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      console.log('Incorrect password for:', username);
      return res.status(400).json({ message: "Incorrect password" });
    }

    console.log('Login successful for:', username);
    res.json({
      message: "Login successful",
      username: user.username,
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

/* =====================================================
   ADMIN: CHANGE USER ROLE
===================================================== */
app.put("/api/change-role/:id", async (req, res) => {
  try {
    const { role } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });

    res.json({ message: "Role updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating role" });
  }
});

/* =====================================================
   PORTFOLIO CRUD
===================================================== */

// CREATE Portfolio
app.post("/api/portfolio", async (req, res) => {
  try {
    const { userId, title, description, github, website } = req.body;

    const save = await prisma.portfolio.create({
      data: { userId, title, description, github, website }
    });

    res.status(201).json(save);
  } catch (error) {
    res.status(500).json({ message: "Error saving portfolio" });
  }
});

// GET All Portfolio
app.get("/api/portfolio", async (req, res) => {
  try {
    const items = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(items || []);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: "Error fetching portfolio", details: error.message });
  }
});

// GET Portfolio by ID
app.get("/api/portfolio/:id", async (req, res) => {
  try {
    const item = await prisma.portfolio.findUnique({
      where: { id: req.params.id }
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    res.json(item);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: "Error fetching portfolio", details: error.message });
  }
});

// UPDATE Portfolio
app.put("/api/portfolio/:id", async (req, res) => {
  try {
    const updated = await prisma.portfolio.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error updating portfolio" });
  }
});

// DELETE Portfolio
app.delete("/api/portfolio/:id", async (req, res) => {
  try {
    await prisma.portfolio.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Portfolio deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting portfolio" });
  }
});

// Update profile (no id: updates the first profile)
app.put('/api/profile', async (req, res) => {
  try {
    const existing = await prisma.profile.findFirst({ select: { id: true } });
    if (!existing) return res.status(404).json({ error: 'Profile not found' });

    const updated = await prisma.profile.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update profile by id
app.put('/api/profile/:id', async (req, res) => {
  try {
    const existing = await prisma.profile.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ error: 'Profile not found' });

    const updated = await prisma.profile.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update skill group
app.put('/api/skills/:id', async (req, res) => {
  try {
    const updated = await prisma.skillGroup.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

// Update experience
app.put('/api/experience/:id', async (req, res) => {
  try {
    const updated = await prisma.experience.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// Update education
app.put('/api/education/:id', async (req, res) => {
  try {
    const updated = await prisma.education.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

// Update portfolio project
app.put('/api/portfolio/:id', async (req, res) => {
  try {
    const updated = await prisma.portfolio.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/* =====================================================
   MESSAGES API
===================================================== */

// GET all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// CREATE a message
app.post("/api/messages", async (req, res) => {
  try {
    const { username, subject, message } = req.body;

    if (!username || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newMessage = await prisma.message.create({
      data: { username, subject, message }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error creating message" });
  }
});

// REPLY to a message (admin only)
app.put("/api/messages/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { reply, replied: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error replying to message" });
  }
});

// EDIT a reply (admin only)
app.put("/api/messages/:id/edit-reply", async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { reply }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error editing reply" });
  }
});

// DELETE a reply (admin only)
app.put("/api/messages/:id/delete-reply", async (req, res) => {
  try {
    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { reply: null, replied: false }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error deleting reply" });
  }
});

// DELETE a message (admin only)
app.delete("/api/messages/:id", async (req, res) => {
  try {
    const deleted = await prisma.message.delete({
      where: { id: req.params.id }
    });

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Error deleting message" });
  }
});

/* ROOT */
app.get("/", (req, res) => {
  res.send("🚀 Server Ready — Users + Roles + Portfolio (Only 2 Tables)");
});

/* START SERVER */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
