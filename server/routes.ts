import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateLessonContent, generateTutorResponse, evaluateAnswer, generateQuestions } from "./services/gemini";
import { hashPassword, comparePassword, generateToken, authenticateToken, optionalAuth, type AuthRequest } from "./auth";
import { registerSchema, loginSchema } from "@shared/schema";
import { insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        fullName: validatedData.fullName,
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        fullName: req.user!.fullName,
      },
    });
  });

  // Get all subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get lessons for a subject
  app.get("/api/subjects/:id/lessons", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const lessons = await storage.getLessonsBySubject(subjectId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get lesson by ID
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Generate lesson content with AI
  app.post("/api/lessons/:id/generate", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const subject = await storage.getSubject(lesson.subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const content = await generateLessonContent(
        subject.name,
        lesson.title,
        "high school"
      );

      res.json(content);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate lesson content",
        error: (error as Error).message 
      });
    }
  });

  // AI Tutor Chat endpoint
  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const { message, lesson, chatHistory } = req.body;
      
      if (!message || !lesson) {
        return res.status(400).json({ message: "Message and lesson are required" });
      }

      const response = await generateTutorResponse(
        message,
        lesson.subject || "General",
        chatHistory || []
      );

      res.json({ response });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate AI response",
        error: (error as Error).message 
      });
    }
  });

  // Generate questions endpoint
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { subject, topic, type, difficulty, count } = req.body;
      
      const questions = await generateQuestions(
        subject || "General",
        topic || "General Topic",
        count || 5
      );

      res.json({ questions });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate questions",
        error: (error as Error).message 
      });
    }
  });

  // Evaluate answer endpoint
  app.post("/api/answers/evaluate", async (req, res) => {
    try {
      const { question, answer, correctAnswer, context } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer are required" });
      }

      const evaluation = await evaluateAnswer(
        question,
        answer,
        correctAnswer || "",
        context || "General"
      );

      res.json({ evaluation });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to evaluate answer",
        error: (error as Error).message 
      });
    }
  });

  // Get user progress
  app.get("/api/users/:userId/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Update user progress
  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressData = { ...req.body, userId };
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get chat messages
  app.get("/api/users/:userId/lessons/:lessonId/messages", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      const messages = await storage.getChatMessages(userId, lessonId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // WordPress compatible chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, subject, lessonTitle, lessonContent, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Convert WordPress chat history format
      const formattedHistory = chatHistory?.map((msg: any) => ({
        message: msg.message,
        isFromUser: Boolean(msg.is_from_user)
      })) || [];

      const context = lessonContent ? `${lessonTitle}: ${lessonContent}` : lessonTitle;
      const aiResponse = await generateTutorResponse(message, subject, context, undefined, formattedHistory);

      res.json({ response: aiResponse });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: (error as Error).message 
      });
    }
  });

  // Generate questions endpoint
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { subject, topic, content, type, difficulty, count } = req.body;
      
      const questions = await generateQuestions(subject, topic, content, type, difficulty, count);
      res.json({ questions });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate questions",
        error: (error as Error).message 
      });
    }
  });

  // Evaluate answer endpoint
  app.post("/api/evaluate", async (req, res) => {
    try {
      const { question, user_answer, correct_answer, subject } = req.body;
      
      const evaluation = await evaluateAnswer(question, user_answer, correct_answer, subject);
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to evaluate answer",
        error: (error as Error).message 
      });
    }
  });

  // Send message to AI tutor
  app.post("/api/users/:userId/lessons/:lessonId/chat", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        lessonId,
        message,
        isFromUser: true
      });

      // Get lesson context and chat history
      const lesson = await storage.getLesson(lessonId);
      const subject = lesson ? await storage.getSubject(lesson.subjectId) : null;
      const chatHistory = await storage.getChatMessages(userId, lessonId);
      
      const context = lesson ? `${lesson.title}: ${lesson.description}` : "";
      const subjectName = subject?.name || "General";

      // Generate AI response with chat history context
      const aiResponse = await generateTutorResponse(message, subjectName, context, undefined, chatHistory);

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        lessonId,
        message: aiResponse,
        isFromUser: false
      });

      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: (error as Error).message 
      });
    }
  });

  // WordPress plugin compatible chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, subject, lessonTitle, lessonContent, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const context = lessonTitle ? `${lessonTitle}: ${lessonContent}` : "";
      const subjectName = subject || "General";

      // Generate AI response with chat history context
      const aiResponse = await generateTutorResponse(message, subjectName, context, undefined, chatHistory);

      res.json({
        response: aiResponse
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: (error as Error).message 
      });
    }
  });

  // Generate questions endpoint for WordPress
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { subject, topic, content, type, difficulty, count } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({ message: "Subject and topic are required" });
      }

      // Generate questions using AI
      const questions = await generateQuestions(subject, topic, content, type, difficulty, count);

      res.json({
        questions
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate questions",
        error: (error as Error).message 
      });
    }
  });

  // Evaluate answer endpoint for WordPress
  app.post("/api/evaluate", async (req, res) => {
    try {
      const { question, user_answer, correct_answer, subject } = req.body;

      if (!question || !user_answer || !subject) {
        return res.status(400).json({ message: "Question, user answer, and subject are required" });
      }

      // Evaluate answer using AI
      const evaluation = await evaluateAnswer(question, user_answer, correct_answer, subject);

      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to evaluate answer",
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
