import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateLessonContent, generateTutorResponse } from "./services/gemini";
import { insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Get user progress
  app.get("/api/users/:userId/progress", async (req, res) => {
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

      // Get lesson context
      const lesson = await storage.getLesson(lessonId);
      const subject = lesson ? await storage.getSubject(lesson.subjectId) : null;
      
      const context = lesson ? `${lesson.title}: ${lesson.description}` : "";
      const subjectName = subject?.name || "General";

      // Generate AI response
      const aiResponse = await generateTutorResponse(message, context, subjectName);

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

  const httpServer = createServer(app);
  return httpServer;
}
