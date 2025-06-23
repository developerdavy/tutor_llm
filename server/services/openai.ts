import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface LessonContent {
  title: string;
  description: string;
  content: string;
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

// Fallback lesson content when OpenAI is unavailable - High School Level
const fallbackLessons: Record<string, LessonContent> = {
  // Mathematics
  "Algebraic Expressions and Equations": {
    title: "Algebraic Expressions and Equations",
    description: "Simplifying expressions, solving linear and quadratic equations",
    content: "Algebraic expressions combine variables, numbers, and operations. Key skills include:\n\n• Combining like terms: 3x + 5x = 8x\n• Distributive property: 2(x + 3) = 2x + 6\n• Solving linear equations: isolate the variable\n• Quadratic equations: ax² + bx + c = 0\n\nFor quadratics, use factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a",
    examples: [
      {
        problem: "Solve: 3(x - 2) + 5 = 2x + 7",
        solution: "3x - 6 + 5 = 2x + 7\n3x - 1 = 2x + 7\nx = 8",
        explanation: "Distribute first, combine like terms, then isolate x"
      }
    ],
    quiz: [
      {
        question: "What is the solution to x² - 5x + 6 = 0?",
        options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 5, 1"],
        correctAnswer: 0,
        explanation: "Factor to get (x-2)(x-3) = 0, so x = 2 or x = 3"
      }
    ]
  },
  
  // Chemistry
  "Atomic Theory and Periodic Trends": {
    title: "Atomic Theory and Periodic Trends",
    description: "Electron configuration, periodic properties, and atomic structure",
    content: "Modern atomic theory describes atoms with:\n\n• Nucleus: Contains protons (+) and neutrons (neutral)\n• Electron orbitals: s, p, d, f subshells\n• Electron configuration: 1s² 2s² 2p⁶ 3s² 3p⁶...\n\nPeriodic trends:\n• Atomic radius decreases across a period\n• Ionization energy increases across a period\n• Electronegativity increases across a period",
    examples: [
      {
        problem: "Write the electron configuration for chlorine (Cl, atomic number 17)",
        solution: "1s² 2s² 2p⁶ 3s² 3p⁵",
        explanation: "Fill orbitals in order: 2 + 2 + 6 + 2 + 5 = 17 electrons"
      }
    ],
    quiz: [
      {
        question: "Which element has the highest electronegativity?",
        options: ["Fluorine", "Oxygen", "Nitrogen", "Chlorine"],
        correctAnswer: 0,
        explanation: "Fluorine is the most electronegative element on the periodic table"
      }
    ]
  },
  
  // Physics
  "Kinematics and Motion": {
    title: "Kinematics and Motion",
    description: "Position, velocity, acceleration, and motion graphs",
    content: "Kinematics describes motion using:\n\n• Position (x): Location relative to origin\n• Velocity (v): Rate of change of position\n• Acceleration (a): Rate of change of velocity\n\nKey equations:\n• v = v₀ + at\n• x = x₀ + v₀t + ½at²\n• v² = v₀² + 2a(x - x₀)\n\nGraphs show relationships between position, velocity, and time.",
    examples: [
      {
        problem: "A car accelerates from rest at 2 m/s² for 5 seconds. What's its final velocity?",
        solution: "v = v₀ + at = 0 + (2)(5) = 10 m/s",
        explanation: "Use the kinematic equation with initial velocity = 0"
      }
    ],
    quiz: [
      {
        question: "On a position vs. time graph, what does the slope represent?",
        options: ["Acceleration", "Velocity", "Displacement", "Force"],
        correctAnswer: 1,
        explanation: "The slope of a position-time graph represents velocity"
      }
    ]
  },
  
  // Literature
  "Literary Analysis and Close Reading": {
    title: "Literary Analysis and Close Reading",
    description: "Analyzing themes, symbols, and literary devices in texts",
    content: "Close reading involves careful analysis of:\n\n• Diction: Author's word choice and its effects\n• Imagery: Sensory details that create vivid pictures\n• Symbolism: Objects or actions representing deeper meanings\n• Theme: Central message or meaning\n• Tone: Author's attitude toward the subject\n\nAnalyze how these elements work together to create meaning and emotional impact.",
    examples: [
      {
        problem: "In 'The Great Gatsby,' what does the green light symbolize?",
        solution: "Hope, dreams, and the American Dream",
        explanation: "The green light represents Gatsby's hopes and the broader theme of pursuing the American Dream"
      }
    ],
    quiz: [
      {
        question: "What is the difference between theme and plot?",
        options: ["Theme is what happens, plot is the message", "Plot is what happens, theme is the message", "They are the same thing", "Theme is only in poetry"],
        correctAnswer: 1,
        explanation: "Plot is the sequence of events; theme is the underlying message or meaning"
      }
    ]
  }
};

export async function generateLessonContent(
  subject: string, 
  topic: string, 
  level: string = "beginner"
): Promise<LessonContent> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using fallback content");
      return fallbackLessons[topic] || createGenericLesson(subject, topic);
    }

    const prompt = `Create a comprehensive lesson for ${subject} on the topic of "${topic}" at ${level} level. 
    The lesson should be engaging, educational, and appropriate for interactive AI tutoring.
    
    Return your response as JSON with this exact structure:
    {
      "title": "lesson title",
      "description": "brief description",
      "content": "detailed lesson content with explanations",
      "examples": [
        {
          "problem": "example problem",
          "solution": "step by step solution",
          "explanation": "why this solution works"
        }
      ],
      "quiz": [
        {
          "question": "quiz question",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": 1,
          "explanation": "explanation of correct answer"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!content.title || !content.description || !content.content) {
      throw new Error("Invalid lesson content structure received from OpenAI");
    }
    
    return content as LessonContent;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    console.log("Falling back to static content");
    return fallbackLessons[topic] || createGenericLesson(subject, topic);
  }
}

function createGenericLesson(subject: string, topic: string): LessonContent {
  return {
    title: topic,
    description: `Learn about ${topic} in ${subject}`,
    content: `This lesson covers the fundamentals of ${topic} in ${subject}. While we work on getting fresh AI-generated content, this lesson provides the basic concepts you need to understand this important topic.`,
    examples: [
      {
        problem: `Example problem for ${topic}`,
        solution: "Step-by-step solution would go here",
        explanation: "This explains why the solution works"
      }
    ],
    quiz: [
      {
        question: `What is the main focus of this ${topic} lesson?`,
        options: ["Basic concepts", "Advanced theory", "Historical context", "Practical applications"],
        correctAnswer: 0,
        explanation: "This lesson focuses on fundamental concepts"
      }
    ]
  };
}

export async function generateTutorResponse(
  question: string, 
  context: string,
  subject: string
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using fallback response");
      return generateFallbackResponse(question, subject);
    }

    const prompt = `You are Alex, a friendly and knowledgeable AI tutor specializing in ${subject}. 
    A student is asking: "${question}"
    
    Current lesson context: ${context}
    
    Provide a helpful, encouraging response that:
    - Answers their question clearly
    - Uses simple language appropriate for learning
    - Includes examples when helpful
    - Encourages further learning
    - Maintains a warm, supportive tone
    
    Keep your response concise but informative.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your question right now. Please try again.";
  } catch (error) {
    console.error("OpenAI Tutor Response Error:", error);
    console.log("Falling back to static response");
    return generateFallbackResponse(question, subject);
  }
}

function generateFallbackResponse(question: string, subject: string): string {
  const responses = {
    "mathematics": [
      "Great question about math! Let me help you understand this concept step by step.",
      "Mathematics can be tricky, but with practice it becomes much clearer. Let's work through this together!",
      "I love helping with math problems! This is a fundamental concept that will help you in many areas."
    ],
    "chemistry": [
      "Chemistry is fascinating! This question touches on some important principles.",
      "Great chemistry question! Understanding these concepts will help you see how the world works at an atomic level.",
      "I'm excited to help you with chemistry! This is a key topic that connects to many real-world applications."
    ],
    "physics": [
      "Physics helps us understand how everything in the universe works! Let me explain this concept.",
      "Excellent physics question! These principles govern everything from tiny particles to massive stars.",
      "I love physics questions! This concept shows how mathematical relationships describe the physical world."
    ],
    "literature": [
      "Literature opens up new worlds and perspectives! This is a thoughtful question.",
      "Great literary analysis question! Understanding these elements will deepen your appreciation of all texts.",
      "I enjoy discussing literature! This concept helps us understand how authors craft meaning and emotion."
    ]
  };

  const subjectResponses = responses[subject.toLowerCase() as keyof typeof responses] || responses["mathematics"];
  const randomResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
  
  return `${randomResponse}\n\nRegarding your question: "${question}"\n\nWhile I work on getting you a detailed answer, I encourage you to review the lesson content and examples provided. Feel free to ask more specific questions about any part you'd like me to clarify!`;
}

export async function evaluateAnswer(
  question: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<{
  isCorrect: boolean;
  feedback: string;
  encouragement: string;
}> {
  try {
    const prompt = `As an AI tutor, evaluate this student's answer:
    
    Question: ${question}
    Student's Answer: ${studentAnswer}
    Correct Answer: ${correctAnswer}
    
    Provide evaluation as JSON:
    {
      "isCorrect": boolean,
      "feedback": "specific feedback about their answer",
      "encouragement": "encouraging message for next steps"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const evaluation = JSON.parse(response.choices[0].message.content || "{}");
    return evaluation;
  } catch (error) {
    throw new Error("Failed to evaluate answer: " + (error as Error).message);
  }
}
