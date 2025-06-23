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

// Fallback lesson content when OpenAI is unavailable
const fallbackLessons: Record<string, LessonContent> = {
  "Introduction to Algebra": {
    title: "Introduction to Algebra",
    description: "Learn the fundamentals of algebraic thinking and basic operations",
    content: "Algebra is the branch of mathematics that uses letters and symbols to represent numbers and quantities in formulas and equations. In algebra, we work with variables (like x or y) that can represent unknown values.\n\nKey concepts:\n• Variables: Letters that represent unknown numbers\n• Expressions: Combinations of variables and numbers (like 3x + 5)\n• Equations: Mathematical statements showing two expressions are equal (like 2x = 10)\n\nAlgebra helps us solve real-world problems by setting up equations and finding the unknown values.",
    examples: [
      {
        problem: "Solve for x: 2x + 5 = 15",
        solution: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5",
        explanation: "We isolate x by subtracting 5 from both sides, then dividing by 2"
      }
    ],
    quiz: [
      {
        question: "What is the value of x in the equation 3x = 12?",
        options: ["3", "4", "9", "15"],
        correctAnswer: 1,
        explanation: "To solve 3x = 12, we divide both sides by 3: x = 12 ÷ 3 = 4"
      }
    ]
  },
  "Atomic Structure": {
    title: "Atomic Structure",
    description: "Understanding atoms, electrons, and the periodic table",
    content: "An atom is the smallest unit of matter that retains the properties of an element. Every atom consists of three main particles:\n\n• Protons: Positively charged particles in the nucleus\n• Neutrons: Neutral particles in the nucleus  \n• Electrons: Negatively charged particles orbiting the nucleus\n\nThe number of protons determines what element an atom is. The periodic table organizes elements by their atomic number (number of protons).",
    examples: [
      {
        problem: "A carbon atom has 6 protons. How many electrons does it have in its neutral state?",
        solution: "6 electrons",
        explanation: "In a neutral atom, the number of electrons equals the number of protons to balance the charges"
      }
    ],
    quiz: [
      {
        question: "What determines an element's identity?",
        options: ["Number of neutrons", "Number of protons", "Number of electrons", "Atomic mass"],
        correctAnswer: 1,
        explanation: "The number of protons (atomic number) determines what element an atom is"
      }
    ]
  },
  "Forces and Motion": {
    title: "Forces and Motion", 
    description: "Newton's laws and basic mechanics",
    content: "Forces cause objects to change their motion. Sir Isaac Newton described three fundamental laws:\n\n1. First Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.\n\n2. Second Law: Force equals mass times acceleration (F = ma)\n\n3. Third Law: For every action, there is an equal and opposite reaction.\n\nThese laws help us understand how objects move and interact in our world.",
    examples: [
      {
        problem: "If a 2 kg object accelerates at 5 m/s², what force is applied?",
        solution: "F = ma = 2 kg × 5 m/s² = 10 N",
        explanation: "Using Newton's second law, we multiply mass by acceleration to find force"
      }
    ],
    quiz: [
      {
        question: "What is Newton's First Law also known as?",
        options: ["Law of Acceleration", "Law of Inertia", "Law of Gravity", "Law of Energy"],
        correctAnswer: 1,
        explanation: "Newton's First Law is also called the Law of Inertia because it describes an object's tendency to resist changes in motion"
      }
    ]
  },
  "Poetry Analysis": {
    title: "Poetry Analysis",
    description: "Understanding poetic devices and themes",
    content: "Poetry uses language in unique ways to create meaning and emotion. Key elements include:\n\n• Imagery: Vivid descriptions that appeal to the senses\n• Metaphor: Comparing two unlike things without using 'like' or 'as'\n• Simile: Comparing two unlike things using 'like' or 'as'\n• Rhythm: The beat or flow of the poem\n• Rhyme: Words that sound alike\n\nPoets use these devices to convey deeper meanings and create emotional connections with readers.",
    examples: [
      {
        problem: "Identify the literary device: 'Her voice is music to my ears'",
        solution: "Metaphor",
        explanation: "This compares a voice to music without using 'like' or 'as', making it a metaphor"
      }
    ],
    quiz: [
      {
        question: "What literary device compares two things using 'like' or 'as'?",
        options: ["Metaphor", "Simile", "Imagery", "Alliteration"],
        correctAnswer: 1,
        explanation: "A simile makes comparisons using the words 'like' or 'as'"
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
