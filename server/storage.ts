import { 
  users, subjects, lessons, userProgress, chatMessages,
  type User, type Subject, type Lesson, type UserProgress, type ChatMessage,
  type InsertUser, type InsertSubject, type InsertLesson, 
  type InsertUserProgress, type InsertChatMessage 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private lessons: Map<number, Lesson>;
  private userProgress: Map<string, UserProgress>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentSubjectId: number;
  private currentLessonId: number;
  private currentProgressId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.lessons = new Map();
    this.userProgress = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentLessonId = 1;
    this.currentProgressId = 1;
    this.currentMessageId = 1;

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default subjects
    const defaultSubjects = [
      { name: "Mathematics", description: "Algebra, Geometry, Calculus", icon: "calculator", color: "#1E88E5" },
      { name: "Chemistry", description: "Organic, Inorganic, Physical", icon: "flask", color: "#FF7043" },
      { name: "Physics", description: "Mechanics, Thermodynamics", icon: "atom", color: "#43A047" },
      { name: "Literature", description: "Poetry, Prose, Drama", icon: "book", color: "#9C27B0" },
    ];

    defaultSubjects.forEach(subject => {
      const id = this.currentSubjectId++;
      this.subjects.set(id, { ...subject, id });
    });

    // Initialize default lessons for Mathematics
    const mathLessons = [
      { subjectId: 1, title: "Introduction to Algebra", description: "Basic algebraic concepts and operations", content: "", order: 1 },
      { subjectId: 1, title: "Linear Equations", description: "Solving linear equations step by step", content: "", order: 2 },
      { subjectId: 1, title: "Quadratic Equations", description: "Understanding and solving quadratic equations", content: "", order: 3 },
    ];

    mathLessons.forEach(lesson => {
      const id = this.currentLessonId++;
      this.lessons.set(id, { ...lesson, id });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  // Lessons
  async getLessonsBySubject(subjectId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserProgressBySubject(userId: number, subjectId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.subjectId === subjectId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const key = `${insertProgress.userId}-${insertProgress.subjectId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertProgress, lastAccessed: new Date() };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: UserProgress = { 
        ...insertProgress, 
        id, 
        lastAccessed: new Date() 
      };
      this.userProgress.set(key, progress);
      return progress;
    }
  }

  // Chat Messages
  async getChatMessages(userId: number, lessonId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId && message.lessonId === lessonId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
