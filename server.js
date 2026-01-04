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
  'https://chandru-wp.github.io',
  'https://chandrukannan.me',
  'https://www.chandrukannan.me'
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

/* AI ASSISTANT ENDPOINT */
app.post("/api/ai-query", async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Fetch portfolio data from database
    const [profile, skills, experience, education, projects] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.skillGroup.findMany({ orderBy: { order: 'asc' } }),
      prisma.experience.findMany(),
      prisma.education.findMany(),
      prisma.portfolio.findMany()
    ]);

    const portfolioData = {
      profile,
      skills,
      experience,
      education,
      projects
    };

    // Generate response using database data
    const response = generateAIResponse(question, portfolioData);

    res.json({ answer: response, success: true });
  } catch (error) {
    console.error('AI Query error:', error);
    res.status(500).json({ message: "Error processing AI query", error: error.message });
  }
});

// Helper function to generate contextual AI responses using database data
function generateAIResponse(question, portfolioData = {}) {
  const lowerQuestion = question.toLowerCase();
  const { profile = {}, skills = [], experience = [], education = [], projects = [] } = portfolioData;
  
  // SKILLS QUESTIONS
  if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology') || lowerQuestion.includes('tech stack') || lowerQuestion.includes('proficien')) {
    let response = '';
    
    if (skills && skills.length > 0) {
      response = `Here are ${profile.name || 'Chandru'}'s skills:\n\n`;
      
      skills.forEach(skillGroup => {
        const categoryLower = skillGroup.category?.toLowerCase() || '';
        let icon = '✨';
        
        if (categoryLower.includes('front')) icon = '🎨';
        else if (categoryLower.includes('back')) icon = '⚙️';
        else if (categoryLower.includes('database') || categoryLower.includes('db')) icon = '💾';
        else if (categoryLower.includes('cloud')) icon = '☁️';
        else if (categoryLower.includes('ai') || categoryLower.includes('ml')) icon = '🤖';
        else if (categoryLower.includes('tool') || categoryLower.includes('dev')) icon = '🔧';
        
        const items = skillGroup.items && Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : 'N/A';
        response += `${icon} ${skillGroup.category}: ${items}\n`;
      });
      
      response += `\n✅ These technologies enable building scalable, modern web applications with best practices!`;
    } else {
      response = `${profile.name || 'Chandru'}'s core skills include:\n\n🎨 Frontend: React, JavaScript, Vite, Tailwind CSS, TypeScript, HTML, CSS\n⚙️ Backend: Node.js, Express.js, Python, Flask, Firebase\n💾 Database: PostgreSQL, MongoDB, Prisma\n☁️ Cloud: AWS, Render, Cloud Services\n🤖 AI/ML: Machine Learning, Data Science\n🔧 DevOps: Git, Docker, CI/CD\n\n✅ Proficient in building full-stack applications!`;
    }
    return response;
  }
  
  // PROJECT QUESTIONS
  if (lowerQuestion.includes('project') || lowerQuestion.includes('built') || lowerQuestion.includes('portfolio')) {
    let response = '';
    
    if (projects && projects.length > 0) {
      response = `🚀 ${profile.name || 'Chandru'}'s Featured Projects:\n\n`;
      
      projects.forEach((proj, idx) => {
        response += `${idx + 1}. ${proj.title}\n`;
        if (proj.description) response += `   📝 ${proj.description}\n`;
        if (proj.tech && Array.isArray(proj.tech) && proj.tech.length > 0) {
          response += `   🛠️  Tech: ${proj.tech.join(', ')}\n`;
        }
        if (proj.github) response += `   🐙 GitHub: ${proj.github}\n`;
        if (proj.website) response += `   🌐 Live: ${proj.website}\n`;
        response += '\n';
      });
      
      response += `💡 Each project showcases expertise in full-stack development, problem-solving, and modern best practices!`;
    } else {
      response = `${profile.name || 'Chandru'} has developed impressive projects:\n\n1. 🚀 UptimeEye - Uptime monitoring platform with real-time alerts\n2. 🔗 Rydirect - URL shortening service\n3. 🤖 MyMind (NYRA) - AI-powered personal assistant\n\nDemonstrating expertise in full-stack development and innovative solutions!`;
    }
    return response;
  }
  
  // EXPERIENCE QUESTIONS
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('job') || lowerQuestion.includes('work') || lowerQuestion.includes('employment')) {
    let response = '';
    
    if (experience && experience.length > 0) {
      response = `💼 ${profile.name || 'Chandru'}'s Work Experience:\n\n`;
      
      experience.forEach((exp, idx) => {
        response += `${idx + 1}. 📍 ${exp.role} at ${exp.company}\n`;
        if (exp.duration) response += `   ⏱️  ${exp.duration}\n`;
        if (exp.description) response += `   📋 ${exp.description}\n`;
        if (exp.tech && Array.isArray(exp.tech) && exp.tech.length > 0) {
          response += `   🛠️  Tech Used: ${exp.tech.join(', ')}\n`;
        }
        response += '\n';
      });
      
      response += `✅ Proven experience in full-stack development, backend systems, and scalable applications!`;
    } else {
      response = `💼 ${profile.name || 'Chandru'} has expertise in:\n\n• Full-stack web development\n• Building scalable backend systems\n• Frontend UI/UX design with React\n• Database design & optimization\n• Cloud deployment (AWS, Render)\n• API development and integration\n• DevOps and CI/CD pipelines\n\n✅ Well-equipped to handle complex technical projects and deliver quality solutions!`;
    }
    return response;
  }
  
  // EDUCATION QUESTIONS
  if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('college') || lowerQuestion.includes('university') || lowerQuestion.includes('study')) {
    let response = '';
    
    if (education && education.length > 0) {
      response = `📚 ${profile.name || 'Chandru'}'s Education:\n\n`;
      
      education.forEach((edu, idx) => {
        response += `${idx + 1}. 🎓 ${edu.degree}\n`;
        if (edu.institution) response += `   🏫 ${edu.institution}\n`;
        if (edu.year) response += `   📅 Year: ${edu.year}\n`;
        if (edu.cgpa) response += `   ⭐ CGPA: ${edu.cgpa}\n`;
        if (edu.highlights && Array.isArray(edu.highlights) && edu.highlights.length > 0) {
          response += `   🏆 Highlights: ${edu.highlights.join(', ')}\n`;
        }
        response += '\n';
      });
      
      response += `✅ Continuous learner with strong academic foundation and hands-on project experience!`;
    } else {
      response = `📚 Education & Learning:\n\n• 🎓 Formal education in relevant field\n• 📖 Continuous learning in new technologies\n• 💻 Self-taught through building real-world projects\n• 🤝 Active in tech communities and open-source\n• 🏆 Strong focus on practical, hands-on learning\n\n✅ Dedicated to staying updated with latest technologies and industry best practices!`;
    }
    return response;
  }
  
  // CONTACT/HIRE QUESTIONS
  if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone') || lowerQuestion.includes('reach') || lowerQuestion.includes('hire')) {
    let response = `📞 Contact ${profile.name || 'Chandru'}:\n\n`;
    
    if (profile.email) response += `📧 Email: ${profile.email}\n`;
    if (profile.phone) response += `📱 Phone: ${profile.phone}\n`;
    if (profile.github) response += `🐙 GitHub: ${profile.github}\n`;
    if (profile.linkedin) response += `💼 LinkedIn: ${profile.linkedin}\n`;
    
    response += `\n💼 Available for:\n• ✅ Freelance projects\n• ✅ Full-time opportunities\n• ✅ Code reviews & consultations\n• ✅ Mentoring & training\n• ✅ Custom solutions\n\n🚀 Let's collaborate on amazing projects!`;
    return response;
  }
  
  // ABOUT QUESTIONS
  if (lowerQuestion.includes('about') || lowerQuestion.includes('who') || lowerQuestion.includes('introduce') || lowerQuestion.includes('bio')) {
    let response = `👤 About ${profile.name || 'Chandru'}:\n\n`;
    
    if (profile.about) {
      response += `${profile.about}\n\n`;
    } else {
      response += `Full-stack developer passionate about building scalable web applications and solving complex technical problems.\n\n`;
    }
    
    response += `✨ Expertise: Full-stack development, React, Node.js, Cloud technologies\n🎯 Focus: Creating efficient, user-friendly solutions\n📈 Goal: Building impactful projects that make a difference\n\n`;
    
    if (profile.email || profile.phone) {
      response += `📞 Connect:\n`;
      if (profile.email) response += `📧 ${profile.email}\n`;
      if (profile.phone) response += `📱 ${profile.phone}\n`;
    }
    
    return response;
  }
  
  // GREETING QUESTIONS
  if (lowerQuestion.match(/^(hi|hello|hey|greetings|hey there)/)) {
    return `👋 Hello! I'm Neurova AI, ${profile.name || 'Chandru'}'s intelligent portfolio assistant.\n\nI can help you learn about:\n\n🛠️  Skills & Technologies\n🚀 Projects & Achievements\n💼 Work Experience\n📚 Education\n📞 Contact Information\n👤 Background\n\n💡 Just ask me anything! What would you like to know?`;
  }
  
  // HELP QUESTIONS
  if (lowerQuestion.includes('help') || lowerQuestion.includes('what can') || lowerQuestion.includes('what do you do')) {
    return `🤖 I'm here to help! I can tell you about:\n\n📚 PORTFOLIO INFORMATION:\n✅ Skills & Technical Expertise\n✅ Projects & Achievements\n✅ Work Experience & Background\n✅ Education & Qualifications\n✅ Contact Information\n\n💡 EXAMPLE QUESTIONS:\n• "What are your skills?"\n• "Tell me about projects"\n• "What's your work experience?"\n• "How do I contact you?"\n• "What's your background?"\n\nJust ask anything and I'll provide detailed information! 😊`;
  }
  
  // DEFAULT RESPONSE
  return `That's a great question! 🤔\n\nI specialize in information about ${profile.name || 'Chandru'}'s:\n\n✨ Skills & Technologies\n🚀 Projects & Portfolio\n💼 Professional Experience\n📚 Education\n📞 Contact Details\n\n💡 Try asking about specific topics like:\n• "What are the main skills?"\n• "Tell me about projects"\n• "What's the work experience?"\n• "How to contact?"\n\nWhat would you like to know? 😊`;
}

/* ROOT */
app.get("/", (req, res) => {
  res.send("🚀 Server Ready — Users + Roles + Portfolio + AI Assistant");
});

/* START SERVER */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
