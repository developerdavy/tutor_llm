import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

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
  context?: string,
  chatHistory: any[] = []
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

    return response.text || generateFallbackResponse(question, subject, chatHistory);
  } catch (error) {
    console.error("Gemini Tutor Response Error:", error);
    return generateFallbackResponse(question, subject, chatHistory);
  }
}

function generateFallbackResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const questionLower = question.toLowerCase();
  
  // Detect question types and provide contextual responses
  if (questionLower.includes('how') || questionLower.includes('explain')) {
    return generateExplanationResponse(question, subject);
  } else if (questionLower.includes('why') || questionLower.includes('what if')) {
    return generateReasoningResponse(question, subject);
  } else if (questionLower.includes('solve') || questionLower.includes('calculate')) {
    return generateProblemSolvingResponse(question, subject);
  } else if (questionLower.includes('example') || questionLower.includes('show me')) {
    return generateExampleResponse(question, subject);
  } else if (questionLower.includes('help') || questionLower.includes('stuck')) {
    return generateHelpResponse(question, subject);
  } else {
    return generateGeneralResponse(question, subject);
  }
}

function generateExplanationResponse(question: string, subject: string, chatHistory: any[] = []): string {
  // Check if this is a follow-up question
  const isFollowUp = chatHistory.length > 0;
  const lastMessages = chatHistory.slice(-4).map(msg => `${msg.isFromUser ? 'Student' : 'Tutor'}: ${msg.message}`).join('\n');
  
  const contextAware = isFollowUp ? 'I see you have more questions about this topic. ' : '';
  const historyContext = isFollowUp ? `\n\nBased on our conversation:\n${lastMessages}\n\n` : '';
  
  const responses = [
    `Let me break down this ${subject} concept for you step by step.`,
    `This is a great ${subject} question that builds on fundamental principles.`,
    `Understanding this ${subject} concept will really help with more advanced topics.`
  ];
  
  const intro = responses[Math.floor(Math.random() * responses.length)];
  
  return `${contextAware}${intro}

Your question: "${question}"${historyContext}

To explain this properly, I'd need to understand:
1. What specific part is confusing you?
2. Have you worked through the examples in the lesson?
3. Is there a particular step where you get stuck?

Try reviewing the lesson examples first, then let me know what specific aspect needs clarification!`;
}

function generateReasoningResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const isFollowUp = chatHistory.length > 0;
  const contextAware = isFollowUp ? 'Building on our discussion, ' : '';
  
  return `${contextAware}Excellent analytical thinking! Questions about "why" show you're really understanding ${subject}.

Your question: "${question}"

The reasoning behind ${subject} concepts often connects to:
- Fundamental principles and laws
- Real-world applications  
- Mathematical relationships
- Historical development of the theory

What specific aspect of the reasoning would you like me to focus on? The more specific your question, the better I can help!`;
}

function generateProblemSolvingResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const isFollowUp = chatHistory.length > 0;
  const contextAware = isFollowUp ? 'Let me continue helping with this problem. ' : '';
  
  return `${contextAware}I can definitely help you work through this ${subject} problem!

Your question: "${question}"

For problem-solving in ${subject}, try this approach:
1. Identify what you're given and what you need to find
2. Choose the appropriate formula or method
3. Work through step-by-step
4. Check if your answer makes sense

Would you like to share the specific numbers or details of the problem? I can guide you through each step!`;
}

function generateExampleResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const isFollowUp = chatHistory.length > 0;
  const contextAware = isFollowUp ? 'I can provide another example to help clarify. ' : '';
  
  return `${contextAware}Examples are a great way to understand ${subject} concepts!

Your question: "${question}"

I'd love to provide a specific example. To give you the most helpful one:
- What level are you working at? (basic, intermediate, advanced)
- Are there particular numbers or scenarios you'd prefer?
- Is this for homework, test prep, or general understanding?

Check the lesson examples first - they're designed to build your understanding progressively!`;
}

function generateHelpResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const isFollowUp = chatHistory.length > 0;
  const contextAware = isFollowUp ? 'I notice you need more help with this. ' : '';
  
  return `${contextAware}I'm here to help you succeed with ${subject}! Getting stuck is part of learning.

Your question: "${question}"

Let's troubleshoot together:
- Have you tried working through the lesson examples?
- Which specific step or concept is causing trouble?
- Are there any error messages or incorrect results?

Remember: making mistakes is how we learn! Let me know exactly where you're stuck and I'll guide you through it.`;
}

function generateGeneralResponse(question: string, subject: string, chatHistory: any[] = []): string {
  const isFollowUp = chatHistory.length > 0;
  const contextResponses = isFollowUp ? [
    `I see you have another question about ${subject}!`,
    `Let me help you explore this ${subject} concept further.`,
    `Continuing our ${subject} discussion, that's a great question.`
  ] : [
    `That's a thoughtful ${subject} question!`,
    `I can see you're really thinking about ${subject} concepts.`,
    `Great question - this shows you're engaging deeply with ${subject}.`
  ];
  
  const intro = contextResponses[Math.floor(Math.random() * contextResponses.length)];
  
  return `${intro}

Your question: "${question}"

To give you the most helpful response, could you:
- Be more specific about what you'd like to know?
- Let me know your current understanding level?
- Share any work you've already tried?

I'm here to help you master these ${subject} concepts!`;
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