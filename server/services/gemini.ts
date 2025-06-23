import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

// Fallback lesson content when Gemini is unavailable - High School Level
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
  }
};

export async function generateLessonContent(
  subject: string,
  topic: string,
  level: string = "high school"
): Promise<LessonContent> {
  try {
    const prompt = `Create a comprehensive ${level} lesson for ${subject} on the topic "${topic}". Respond ONLY with valid JSON, no markdown formatting, no code blocks, no additional text. Use this exact structure:

{"title": "${topic}", "description": "Brief lesson description", "content": "Detailed educational content with key concepts and explanations", "examples": [{"problem": "Sample problem", "solution": "Step-by-step solution", "explanation": "Why this approach works"}], "quiz": [{"question": "Test question about the topic", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "explanation": "Explanation of correct answer"}]}

Respond with ONLY the JSON object, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let responseText = response.text || "{}";
    
    // Clean markdown formatting from response
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').replace(/```/g, '').trim();
    
    // Extract JSON from the response if it's wrapped in other text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    const content = JSON.parse(responseText);
    
    if (!content.title) {
      throw new Error("Invalid response");
    }
    
    return content as LessonContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
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
        question: `What is an important concept in ${topic}?`,
        options: ["Concept A", "Concept B", "Concept C", "All of the above"],
        correctAnswer: 3,
        explanation: "This lesson covers multiple important concepts"
      }
    ]
  };
}

export async function generateTutorResponse(
  question: string,
  subject: string,
  lessonTopic?: string,
  context?: string
): Promise<string> {
  try {
    const systemPrompt = `You are an expert AI tutor specializing in ${subject}. You provide clear, encouraging, and educational responses to student questions.

Guidelines:
- Be patient and supportive
- Break down complex concepts into simple steps
- Use examples and analogies when helpful
- Encourage further learning
- Keep responses focused and educational
- If the question is off-topic, gently redirect to the subject matter`;

    const userPrompt = `Student question: "${question}"
    
    ${lessonTopic ? `Current lesson topic: ${lessonTopic}` : ''}
    ${context ? `Additional context: ${context}` : ''}
    
    Please provide a helpful, educational response that addresses the student's question while encouraging learning.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
    });

    return response.text || generateFallbackResponse(question, subject);
  } catch (error) {
    console.error("Gemini Tutor Response Error:", error);
    return generateFallbackResponse(question, subject);
  }
}

function generateFallbackResponse(question: string, subject: string): string {
  const responses = [
    `Great question about ${subject}! Let me help you understand this concept step by step.`,
    `I love helping with ${subject} problems! This is a fundamental concept that will help you in many areas.`,
    `${subject} can be tricky, but with practice it becomes much clearer. Let's work through this together!`,
    `That's an excellent ${subject} question! Understanding this will really strengthen your foundation.`
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return `${randomResponse}

Regarding your question: "${question}"

While I work on getting you a detailed answer, I encourage you to review the lesson content and examples provided. Feel free to ask more specific questions about any part you'd like me to clarify!`;
}

export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  subject: string
): Promise<{ isCorrect: boolean; feedback: string; explanation: string }> {
  try {
    const prompt = `As an expert ${subject} tutor, evaluate this student's answer:

Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide feedback as JSON:
{
  "isCorrect": boolean,
  "feedback": "encouraging feedback message",
  "explanation": "detailed explanation of the concept"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            isCorrect: { type: "boolean" },
            feedback: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["isCorrect", "feedback", "explanation"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      isCorrect: result.isCorrect || false,
      feedback: result.feedback || "Thank you for your answer!",
      explanation: result.explanation || "Let me explain this concept further..."
    };
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return {
      isCorrect: false,
      feedback: "Thank you for your answer! Let me provide some feedback.",
      explanation: "This is an important concept that requires careful consideration."
    };
  }
}