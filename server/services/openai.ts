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

  "Functions and Graphing": {
    title: "Functions and Graphing",
    description: "Understanding functions, domain, range, and graphing techniques",
    content: "Functions represent relationships between variables:\n\n• Domain: Set of all possible input values (x)\n• Range: Set of all possible output values (y)\n• Vertical Line Test: Each x-value has only one y-value\n• Linear functions: f(x) = mx + b (slope-intercept form)\n• Quadratic functions: f(x) = ax² + bx + c\n\nGraphs help visualize function behavior and transformations.",
    examples: [
      {
        problem: "Find the domain of f(x) = 1/(x-3)",
        solution: "All real numbers except x = 3",
        explanation: "The function is undefined when the denominator equals zero"
      }
    ],
    quiz: [
      {
        question: "What is the y-intercept of f(x) = 2x - 5?",
        options: ["-5", "5", "2", "-2"],
        correctAnswer: 0,
        explanation: "The y-intercept is the constant term when x = 0"
      }
    ]
  },

  "Polynomials and Factoring": {
    title: "Polynomials and Factoring",
    description: "Operations with polynomials and factoring techniques",
    content: "Polynomials are expressions with variables and coefficients:\n\n• Addition/Subtraction: Combine like terms\n• Multiplication: Use distributive property or FOIL\n• Factoring techniques:\n  - Greatest Common Factor (GCF)\n  - Difference of squares: a² - b² = (a+b)(a-b)\n  - Trinomials: ax² + bx + c\n  - Grouping method",
    examples: [
      {
        problem: "Factor x² - 9",
        solution: "(x + 3)(x - 3)",
        explanation: "This is a difference of squares pattern"
      }
    ],
    quiz: [
      {
        question: "What is the GCF of 12x³ and 18x²?",
        options: ["6x²", "6x³", "12x²", "18x²"],
        correctAnswer: 0,
        explanation: "The GCF is the largest factor common to both terms"
      }
    ]
  },

  "Exponential and Logarithmic Functions": {
    title: "Exponential and Logarithmic Functions",
    description: "Properties and applications of exponential and log functions",
    content: "Exponential and logarithmic functions are inverses:\n\n• Exponential: f(x) = aˣ (where a > 0, a ≠ 1)\n• Logarithmic: f(x) = log_a(x)\n• Natural log: ln(x) = log_e(x)\n• Properties:\n  - log(xy) = log(x) + log(y)\n  - log(x/y) = log(x) - log(y)\n  - log(xⁿ) = n·log(x)",
    examples: [
      {
        problem: "Solve: 2ˣ = 32",
        solution: "x = 5",
        explanation: "Since 2⁵ = 32, x = 5"
      }
    ],
    quiz: [
      {
        question: "What is log₂(16)?",
        options: ["4", "8", "2", "16"],
        correctAnswer: 0,
        explanation: "2⁴ = 16, so log₂(16) = 4"
      }
    ]
  },

  "Trigonometry Basics": {
    title: "Trigonometry Basics",
    description: "Trigonometric ratios, unit circle, and basic identities",
    content: "Trigonometry studies relationships in triangles:\n\n• Right triangle ratios:\n  - sin(θ) = opposite/hypotenuse\n  - cos(θ) = adjacent/hypotenuse\n  - tan(θ) = opposite/adjacent\n• Unit circle: radius = 1\n• Special angles: 30°, 45°, 60°\n• Pythagorean identity: sin²(θ) + cos²(θ) = 1",
    examples: [
      {
        problem: "Find sin(30°)",
        solution: "1/2",
        explanation: "This is a special angle with known exact value"
      }
    ],
    quiz: [
      {
        question: "In a right triangle, if sin(θ) = 3/5, what is cos(θ)?",
        options: ["4/5", "3/4", "5/4", "5/3"],
        correctAnswer: 0,
        explanation: "Using Pythagorean theorem: 3² + 4² = 5², so cos(θ) = 4/5"
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

  "Chemical Bonding and Molecular Geometry": {
    title: "Chemical Bonding and Molecular Geometry",
    description: "Ionic, covalent, and metallic bonds, VSEPR theory",
    content: "Chemical bonds form between atoms:\n\n• Ionic bonds: Transfer of electrons (metal + nonmetal)\n• Covalent bonds: Sharing of electrons (nonmetal + nonmetal)\n• Metallic bonds: Sea of electrons (metal + metal)\n\nVSEPR Theory predicts molecular shapes:\n• Linear: 2 electron pairs\n• Trigonal planar: 3 electron pairs\n• Tetrahedral: 4 electron pairs",
    examples: [
      {
        problem: "What is the shape of CH₄ (methane)?",
        solution: "Tetrahedral",
        explanation: "Carbon has 4 bonding pairs, no lone pairs"
      }
    ],
    quiz: [
      {
        question: "What type of bond forms between Na and Cl?",
        options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
        correctAnswer: 0,
        explanation: "Metal + nonmetal = ionic bond"
      }
    ]
  },

  "Stoichiometry and Chemical Equations": {
    title: "Stoichiometry and Chemical Equations",
    description: "Balancing equations, molar calculations, limiting reagents",
    content: "Stoichiometry is the quantitative study of chemical reactions:\n\n• Balancing equations: Same number of atoms on both sides\n• Mole ratios: From balanced equation coefficients\n• Limiting reagent: Reactant that runs out first\n• Percent yield: (actual yield / theoretical yield) × 100%\n\nMolar mass converts between grams and moles.",
    examples: [
      {
        problem: "Balance: H₂ + O₂ → H₂O",
        solution: "2H₂ + O₂ → 2H₂O",
        explanation: "Need 2 water molecules to balance oxygen atoms"
      }
    ],
    quiz: [
      {
        question: "How many moles of O₂ are needed to make 4 moles of H₂O?",
        options: ["2 moles", "4 moles", "8 moles", "1 mole"],
        correctAnswer: 0,
        explanation: "From 2H₂ + O₂ → 2H₂O, ratio is 1:2"
      }
    ]
  },

  "Acids, Bases, and pH": {
    title: "Acids, Bases, and pH",
    description: "Acid-base theories, pH calculations, and titrations",
    content: "Acids and bases are characterized by their properties:\n\n• Arrhenius: Acids produce H⁺, bases produce OH⁻\n• Brønsted-Lowry: Acids donate H⁺, bases accept H⁺\n• pH scale: 0-14 (7 is neutral)\n• pH = -log[H⁺]\n• Titrations: Neutralization reactions\n• Indicators: Show pH changes",
    examples: [
      {
        problem: "What is the pH of 0.01 M HCl?",
        solution: "pH = 2",
        explanation: "pH = -log(0.01) = -log(10⁻²) = 2"
      }
    ],
    quiz: [
      {
        question: "A solution with pH = 9 is:",
        options: ["Acidic", "Basic", "Neutral", "Cannot determine"],
        correctAnswer: 1,
        explanation: "pH > 7 indicates a basic solution"
      }
    ]
  },

  "Thermochemistry and Reaction Rates": {
    title: "Thermochemistry and Reaction Rates",
    description: "Energy changes in reactions and factors affecting reaction rates",
    content: "Chemical reactions involve energy changes:\n\n• Exothermic: Release energy (ΔH < 0)\n• Endothermic: Absorb energy (ΔH > 0)\n• Activation energy: Minimum energy to start reaction\n• Catalysts: Lower activation energy\n\nReaction rate factors:\n• Temperature, concentration, surface area, catalysts",
    examples: [
      {
        problem: "How does temperature affect reaction rate?",
        solution: "Higher temperature increases reaction rate",
        explanation: "More molecules have sufficient energy to react"
      }
    ],
    quiz: [
      {
        question: "What does a catalyst do?",
        options: ["Increases ΔH", "Decreases ΔH", "Lowers activation energy", "Changes products"],
        correctAnswer: 2,
        explanation: "Catalysts provide an alternate pathway with lower activation energy"
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

  "Forces and Newton's Laws": {
    title: "Forces and Newton's Laws",
    description: "Force analysis, free body diagrams, and applications",
    content: "Newton's three laws govern motion:\n\n1. First Law (Inertia): Objects resist changes in motion\n2. Second Law: F = ma (Force = mass × acceleration)\n3. Third Law: Action-reaction pairs\n\nCommon forces:\n• Weight: W = mg\n• Normal force, friction, tension\n• Free body diagrams show all forces",
    examples: [
      {
        problem: "A 5 kg object experiences 20 N of force. What's its acceleration?",
        solution: "a = F/m = 20/5 = 4 m/s²",
        explanation: "Use Newton's second law: F = ma"
      }
    ],
    quiz: [
      {
        question: "If you push on a wall, what pushes back?",
        options: ["Gravity", "The wall", "Air resistance", "Your muscles"],
        correctAnswer: 1,
        explanation: "Newton's third law: the wall pushes back with equal force"
      }
    ]
  },

  "Energy and Momentum": {
    title: "Energy and Momentum",
    description: "Kinetic and potential energy, conservation laws",
    content: "Energy and momentum are conserved quantities:\n\n• Kinetic energy: KE = ½mv²\n• Potential energy: PE = mgh (gravitational)\n• Conservation of energy: Total energy remains constant\n• Momentum: p = mv\n• Conservation of momentum: Total momentum conserved in collisions",
    examples: [
      {
        problem: "A 2 kg ball moving at 10 m/s. What's its kinetic energy?",
        solution: "KE = ½mv² = ½(2)(10)² = 100 J",
        explanation: "Use the kinetic energy formula"
      }
    ],
    quiz: [
      {
        question: "What happens to kinetic energy when speed doubles?",
        options: ["Doubles", "Triples", "Quadruples", "Stays the same"],
        correctAnswer: 2,
        explanation: "KE ∝ v², so doubling speed quadruples kinetic energy"
      }
    ]
  },

  "Waves and Electromagnetic Radiation": {
    title: "Waves and Electromagnetic Radiation",
    description: "Wave properties, sound waves, and electromagnetic spectrum",
    content: "Waves transfer energy without transferring matter:\n\n• Wave equation: v = fλ (velocity = frequency × wavelength)\n• Amplitude: Maximum displacement\n• Frequency: Waves per second (Hz)\n• Sound waves: Longitudinal pressure waves\n• Electromagnetic spectrum: Radio to gamma rays\n• Light: Electromagnetic radiation",
    examples: [
      {
        problem: "A wave has frequency 100 Hz and wavelength 2 m. What's its speed?",
        solution: "v = fλ = 100 × 2 = 200 m/s",
        explanation: "Use the wave equation"
      }
    ],
    quiz: [
      {
        question: "Which has the highest frequency?",
        options: ["Radio waves", "Visible light", "X-rays", "Microwaves"],
        correctAnswer: 2,
        explanation: "X-rays have higher frequency than visible light, radio, or microwaves"
      }
    ]
  },

  "Electricity and Magnetism": {
    title: "Electricity and Magnetism",
    description: "Electric circuits, Ohm's law, and magnetic fields",
    content: "Electricity and magnetism are related phenomena:\n\n• Electric current: Flow of charge (Amperes)\n• Voltage: Electric potential difference (Volts)\n• Resistance: Opposition to current flow (Ohms)\n• Ohm's Law: V = IR\n• Power: P = VI = I²R = V²/R\n• Magnetic fields: Created by moving charges",
    examples: [
      {
        problem: "A circuit has 12 V and 3 Ω resistance. What's the current?",
        solution: "I = V/R = 12/3 = 4 A",
        explanation: "Use Ohm's law to find current"
      }
    ],
    quiz: [
      {
        question: "What creates a magnetic field?",
        options: ["Static charges", "Moving charges", "Neutral objects", "Insulators"],
        correctAnswer: 1,
        explanation: "Moving electric charges create magnetic fields"
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
  },

  "Poetry: Form, Structure, and Meaning": {
    title: "Poetry: Form, Structure, and Meaning",
    description: "Understanding poetic forms, meter, rhyme, and interpretation",
    content: "Poetry uses structure and sound to create meaning:\n\n• Form: Sonnet, villanelle, free verse, haiku\n• Meter: Pattern of stressed/unstressed syllables\n• Rhyme scheme: Pattern of end rhymes (ABAB, ABBA)\n• Figurative language: Metaphor, simile, personification\n• Sound devices: Alliteration, assonance, consonance\n\nAnalyze how form supports meaning and emotional impact.",
    examples: [
      {
        problem: "Identify the rhyme scheme: ABAB CDCD EFEF GG",
        solution: "Shakespearean sonnet",
        explanation: "This is the characteristic rhyme scheme of a Shakespearean sonnet"
      }
    ],
    quiz: [
      {
        question: "What is iambic pentameter?",
        options: ["5 stressed syllables", "10 total syllables in unstressed-stressed pattern", "Rhyming couplets", "Free verse"],
        correctAnswer: 1,
        explanation: "Iambic pentameter has 10 syllables with unstressed-stressed pattern"
      }
    ]
  },

  "Drama and Character Development": {
    title: "Drama and Character Development",
    description: "Analyzing plays, character motivation, and dramatic techniques",
    content: "Drama combines elements to create compelling stories:\n\n• Character types: Protagonist, antagonist, foil, round/flat\n• Dramatic structure: Exposition, rising action, climax, resolution\n• Conflict: Internal vs. external, man vs. nature/society/self\n• Dialogue: Reveals character, advances plot\n• Stage directions: Guide performance and interpretation\n\nAnalyze how characters drive the dramatic action.",
    examples: [
      {
        problem: "What is a character foil?",
        solution: "A character who contrasts with another to highlight their traits",
        explanation: "Foils emphasize characteristics through contrast"
      }
    ],
    quiz: [
      {
        question: "What is dramatic irony?",
        options: ["Characters are unaware of something the audience knows", "Coincidental events", "Humorous dialogue", "Tragic ending"],
        correctAnswer: 0,
        explanation: "Dramatic irony occurs when the audience knows more than the characters"
      }
    ]
  },

  "Narrative Fiction and Point of View": {
    title: "Narrative Fiction and Point of View",
    description: "Understanding narrative techniques, perspective, and storytelling",
    content: "Narrative techniques shape how stories are told:\n\n• Point of view: First person (I), third person limited/omniscient\n• Narrator: Reliable vs. unreliable\n• Setting: Time, place, atmosphere\n• Plot structure: Linear, flashback, foreshadowing\n• Character development: Dynamic vs. static characters\n\nAnalyze how narrative choices affect reader understanding.",
    examples: [
      {
        problem: "What's the difference between third person limited and omniscient?",
        solution: "Limited knows one character's thoughts; omniscient knows all characters' thoughts",
        explanation: "The scope of the narrator's knowledge differs"
      }
    ],
    quiz: [
      {
        question: "What is foreshadowing?",
        options: ["Revealing the ending", "Hints about future events", "Returning to past events", "Character thoughts"],
        correctAnswer: 1,
        explanation: "Foreshadowing provides clues about what will happen later"
      }
    ]
  },

  "Research and Academic Writing": {
    title: "Research and Academic Writing",
    description: "MLA format, thesis development, and evidence-based arguments",
    content: "Academic writing requires structure and evidence:\n\n• Thesis statement: Clear, arguable claim\n• Evidence: Primary and secondary sources\n• MLA format: Citations and Works Cited page\n• Paragraph structure: Topic sentence, evidence, analysis\n• Avoiding plagiarism: Proper attribution of sources\n\nDevelop arguments supported by credible evidence.",
    examples: [
      {
        problem: "Write a thesis statement about social media's impact on teens",
        solution: "Social media negatively affects teenage mental health by increasing anxiety, reducing face-to-face social skills, and promoting unrealistic comparisons.",
        explanation: "A strong thesis is specific, arguable, and provides direction for the essay"
      }
    ],
    quiz: [
      {
        question: "What is a Works Cited page?",
        options: ["Bibliography of sources used", "Summary of main points", "Outline of the essay", "List of topics covered"],
        correctAnswer: 0,
        explanation: "Works Cited lists all sources referenced in the paper"
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
