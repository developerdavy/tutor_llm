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

      // Initialize comprehensive high school lessons for all subjects
      const allLessons = [
        // Mathematics lessons - High School Level
        { subjectId: insertedSubjects[0].id, title: "Algebraic Expressions and Equations", description: "Simplifying expressions, solving linear and quadratic equations", content: "", order: 1 },
        { subjectId: insertedSubjects[0].id, title: "Functions and Graphing", description: "Understanding functions, domain, range, and graphing techniques", content: "", order: 2 },
        { subjectId: insertedSubjects[0].id, title: "Polynomials and Factoring", description: "Operations with polynomials and factoring techniques", content: "", order: 3 },
        { subjectId: insertedSubjects[0].id, title: "Exponential and Logarithmic Functions", description: "Properties and applications of exponential and log functions", content: "", order: 4 },
        { subjectId: insertedSubjects[0].id, title: "Trigonometry Basics", description: "Trigonometric ratios, unit circle, and basic identities", content: "", order: 5 },
        
        // Chemistry lessons - High School Level
        { subjectId: insertedSubjects[1].id, title: "Atomic Theory and Periodic Trends", description: "Electron configuration, periodic properties, and atomic structure", content: "", order: 1 },
        { subjectId: insertedSubjects[1].id, title: "Chemical Bonding and Molecular Geometry", description: "Ionic, covalent, and metallic bonds, VSEPR theory", content: "", order: 2 },
        { subjectId: insertedSubjects[1].id, title: "Stoichiometry and Chemical Equations", description: "Balancing equations, molar calculations, limiting reagents", content: "", order: 3 },
        { subjectId: insertedSubjects[1].id, title: "Acids, Bases, and pH", description: "Acid-base theories, pH calculations, and titrations", content: "", order: 4 },
        { subjectId: insertedSubjects[1].id, title: "Thermochemistry and Reaction Rates", description: "Energy changes in reactions and factors affecting reaction rates", content: "", order: 5 },
        
        // Physics lessons - High School Level
        { subjectId: insertedSubjects[2].id, title: "Kinematics and Motion", description: "Position, velocity, acceleration, and motion graphs", content: "", order: 1 },
        { subjectId: insertedSubjects[2].id, title: "Forces and Newton's Laws", description: "Force analysis, free body diagrams, and applications", content: "", order: 2 },
        { subjectId: insertedSubjects[2].id, title: "Energy and Momentum", description: "Kinetic and potential energy, conservation laws", content: "", order: 3 },
        { subjectId: insertedSubjects[2].id, title: "Waves and Electromagnetic Radiation", description: "Wave properties, sound waves, and electromagnetic spectrum", content: "", order: 4 },
        { subjectId: insertedSubjects[2].id, title: "Electricity and Magnetism", description: "Electric circuits, Ohm's law, and magnetic fields", content: "", order: 5 },
        
        // Literature lessons - High School Level
        { subjectId: insertedSubjects[3].id, title: "Literary Analysis and Close Reading", description: "Analyzing themes, symbols, and literary devices in texts", content: "", order: 1 },
        { subjectId: insertedSubjects[3].id, title: "Poetry: Form, Structure, and Meaning", description: "Understanding poetic forms, meter, rhyme, and interpretation", content: "", order: 2 },
        { subjectId: insertedSubjects[3].id, title: "Drama and Character Development", description: "Analyzing plays, character motivation, and dramatic techniques", content: "", order: 3 },
        { subjectId: insertedSubjects[3].id, title: "Narrative Fiction and Point of View", description: "Understanding narrative techniques, perspective, and storytelling", content: "", order: 4 },
        { subjectId: insertedSubjects[3].id, title: "Research and Academic Writing", description: "MLA format, thesis development, and evidence-based arguments", content: "", order: 5 },
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
