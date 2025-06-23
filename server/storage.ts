import { 
  users, subjects, lessons, userProgress, chatMessages,
  type User, type Subject, type Lesson, type UserProgress, type ChatMessage,
  type InsertUser, type InsertSubject, type InsertLesson, 
  type InsertUserProgress, type InsertChatMessage 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Subjects
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Lessons
  getLessonsBySubject(subjectId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressBySubject(userId: number, subjectId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Chat Messages
  getChatMessages(userId: number, lessonId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if subjects already exist
      const existingSubjects = await db.select().from(subjects);
      if (existingSubjects.length > 0) {
        return; // Data already initialized
      }

      // Initialize default subjects
      const defaultSubjects = [
        { name: "Mathematics", description: "Algebra, Geometry, Calculus", icon: "calculator", color: "#1E88E5" },
        { name: "Chemistry", description: "Organic, Inorganic, Physical", icon: "flask", color: "#FF7043" },
        { name: "Physics", description: "Mechanics, Thermodynamics", icon: "atom", color: "#43A047" },
        { name: "Literature", description: "Poetry, Prose, Drama", icon: "book", color: "#9C27B0" },
      ];

      const insertedSubjects = await db.insert(subjects).values(defaultSubjects).returning();

      // Initialize lessons for all subjects
      const allLessons = [
        // Mathematics lessons
        { subjectId: insertedSubjects[0].id, title: "Introduction to Algebra", description: "Basic algebraic concepts and operations", content: "", order: 1 },
        { subjectId: insertedSubjects[0].id, title: "Linear Equations", description: "Solving linear equations step by step", content: "", order: 2 },
        { subjectId: insertedSubjects[0].id, title: "Quadratic Equations", description: "Understanding and solving quadratic equations", content: "", order: 3 },
        
        // Chemistry lessons
        { subjectId: insertedSubjects[1].id, title: "Atomic Structure", description: "Understanding atoms, electrons, and periodic table", content: "", order: 1 },
        { subjectId: insertedSubjects[1].id, title: "Chemical Bonding", description: "Ionic and covalent bonds explained", content: "", order: 2 },
        { subjectId: insertedSubjects[1].id, title: "Chemical Reactions", description: "Types of reactions and balancing equations", content: "", order: 3 },
        
        // Physics lessons
        { subjectId: insertedSubjects[2].id, title: "Forces and Motion", description: "Newton's laws and basic mechanics", content: "", order: 1 },
        { subjectId: insertedSubjects[2].id, title: "Energy and Work", description: "Kinetic and potential energy concepts", content: "", order: 2 },
        { subjectId: insertedSubjects[2].id, title: "Waves and Sound", description: "Wave properties and sound phenomena", content: "", order: 3 },
        
        // Literature lessons
        { subjectId: insertedSubjects[3].id, title: "Poetry Analysis", description: "Understanding poetic devices and themes", content: "", order: 1 },
        { subjectId: insertedSubjects[3].id, title: "Character Development", description: "Analyzing characters in literature", content: "", order: 2 },
        { subjectId: insertedSubjects[3].id, title: "Literary Themes", description: "Identifying and analyzing major themes", content: "", order: 3 },
      ];

      await db.insert(lessons).values(allLessons);
    } catch (error) {
      console.error("Failed to initialize default data:", error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject || undefined;
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  // Lessons
  async getLessonsBySubject(subjectId: number): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(eq(lessons.subjectId, subjectId));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values(insertLesson).returning();
    return lesson;
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressBySubject(userId: number, subjectId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.subjectId, subjectId)));
    return progress || undefined;
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgressBySubject(insertProgress.userId, insertProgress.subjectId);
    
    if (existing) {
      const [updated] = await db.update(userProgress)
        .set({ ...insertProgress, lastAccessed: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress)
        .values({
          ...insertProgress,
          progress: insertProgress.progress ?? 0,
          completed: insertProgress.completed ?? false,
          lessonId: insertProgress.lessonId ?? null,
          lastAccessed: new Date()
        })
        .returning();
      return created;
    }
  }

  // Chat Messages
  async getChatMessages(userId: number, lessonId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.lessonId, lessonId)));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages)
      .values({
        ...insertMessage,
        timestamp: new Date()
      })
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
