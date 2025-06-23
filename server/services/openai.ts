import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
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

export async function generateLessonContent(
  subject: string, 
  topic: string, 
  level: string = "beginner"
): Promise<LessonContent> {
  try {
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
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    return content as LessonContent;
  } catch (error) {
    throw new Error("Failed to generate lesson content: " + (error as Error).message);
  }
}

export async function generateTutorResponse(
  question: string, 
  context: string,
  subject: string
): Promise<string> {
  try {
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
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your question right now. Please try again.";
  } catch (error) {
    throw new Error("Failed to generate tutor response: " + (error as Error).message);
  }
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
