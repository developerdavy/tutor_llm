// AI Tutor Data - Subjects and Lessons

const SUBJECTS_DATA = [
    {
        id: 1,
        name: "Mathematics",
        description: "Algebra, Geometry, Calculus, Statistics",
        icon: "📊",
        color: "#1E88E5",
        lessons: [
            {
                id: 1,
                title: "Algebraic Expressions and Equations",
                description: "Learn to simplify expressions and solve linear and quadratic equations with step-by-step guidance.",
                difficulty: "beginner",
                estimatedDuration: 45,
                order: 1,
                content: {
                    overview: "Master the fundamentals of algebraic manipulation and equation solving.",
                    topics: [
                        "Simplifying algebraic expressions",
                        "Combining like terms",
                        "Solving linear equations",
                        "Quadratic equations and factoring",
                        "Word problems and applications"
                    ],
                    examples: [
                        {
                            problem: "Solve: 2x + 5 = 13",
                            solution: "x = 4",
                            explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4"
                        },
                        {
                            problem: "Factor: x² - 5x + 6",
                            solution: "(x - 2)(x - 3)",
                            explanation: "Find two numbers that multiply to 6 and add to -5: -2 and -3"
                        }
                    ]
                }
            },
            {
                id: 2,
                title: "Functions and Graphing",
                description: "Understand functions, their domains, ranges, and graphing techniques for various function types.",
                difficulty: "intermediate",
                estimatedDuration: 50,
                order: 2,
                content: {
                    overview: "Explore the world of functions and their graphical representations.",
                    topics: [
                        "Function notation and evaluation",
                        "Domain and range",
                        "Linear and quadratic functions",
                        "Transformations of functions",
                        "Composite and inverse functions"
                    ],
                    examples: [
                        {
                            problem: "Find f(3) if f(x) = 2x² - 4x + 1",
                            solution: "f(3) = 7",
                            explanation: "Substitute x = 3: f(3) = 2(9) - 4(3) + 1 = 18 - 12 + 1 = 7"
                        }
                    ]
                }
            },
            {
                id: 3,
                title: "Trigonometry Basics",
                description: "Explore trigonometric ratios, the unit circle, and fundamental trigonometric identities.",
                difficulty: "intermediate",
                estimatedDuration: 55,
                order: 3,
                content: {
                    overview: "Master the basics of trigonometry and circular functions.",
                    topics: [
                        "SOH-CAH-TOA ratios",
                        "Unit circle and radian measure",
                        "Trigonometric identities",
                        "Solving trigonometric equations",
                        "Applications in real-world problems"
                    ],
                    examples: [
                        {
                            problem: "Find sin(30°)",
                            solution: "1/2",
                            explanation: "Using the unit circle or special right triangles, sin(30°) = 1/2"
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 2,
        name: "Chemistry",
        description: "Organic, Inorganic, Physical Chemistry",
        icon: "🧪",
        color: "#FF7043",
        lessons: [
            {
                id: 4,
                title: "Atomic Theory and Periodic Trends",
                description: "Understand atomic structure, electron configuration, and how properties change across the periodic table.",
                difficulty: "beginner",
                estimatedDuration: 40,
                order: 1,
                content: {
                    overview: "Explore the building blocks of matter and periodic relationships.",
                    topics: [
                        "Atomic structure and subatomic particles",
                        "Electron configuration and orbital theory",
                        "Periodic trends: ionization energy, atomic radius",
                        "Electronegativity and chemical bonding",
                        "Nuclear chemistry basics"
                    ],
                    examples: [
                        {
                            problem: "Write the electron configuration for oxygen",
                            solution: "1s² 2s² 2p⁴",
                            explanation: "Oxygen has 8 electrons, filled in order of increasing energy levels"
                        }
                    ]
                }
            },
            {
                id: 5,
                title: "Chemical Bonding and Molecular Geometry",
                description: "Learn about ionic, covalent, and metallic bonds, plus molecular shapes using VSEPR theory.",
                difficulty: "intermediate",
                estimatedDuration: 45,
                order: 2,
                content: {
                    overview: "Understand how atoms bond and predict molecular shapes.",
                    topics: [
                        "Ionic vs covalent bonding",
                        "Lewis structures and formal charge",
                        "VSEPR theory and molecular geometry",
                        "Hybridization and molecular orbitals",
                        "Intermolecular forces"
                    ],
                    examples: [
                        {
                            problem: "Predict the shape of CH₄",
                            solution: "Tetrahedral",
                            explanation: "Carbon has 4 bonding pairs and no lone pairs, giving tetrahedral geometry"
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 3,
        name: "Physics",
        description: "Mechanics, Thermodynamics, Waves",
        icon: "⚛️",
        color: "#43A047",
        lessons: [
            {
                id: 6,
                title: "Kinematics and Motion",
                description: "Master concepts of position, velocity, acceleration, and motion graphs for one and two dimensions.",
                difficulty: "beginner",
                estimatedDuration: 50,
                order: 1,
                content: {
                    overview: "Understand how objects move and the mathematics of motion.",
                    topics: [
                        "Position, displacement, and distance",
                        "Velocity and acceleration",
                        "Motion graphs and interpretation",
                        "Kinematic equations",
                        "Projectile motion"
                    ],
                    examples: [
                        {
                            problem: "A car accelerates from rest at 2 m/s² for 5 seconds. What's its final velocity?",
                            solution: "10 m/s",
                            explanation: "Using v = u + at: v = 0 + (2)(5) = 10 m/s"
                        }
                    ]
                }
            },
            {
                id: 7,
                title: "Forces and Newton's Laws",
                description: "Apply Newton's three laws of motion to analyze forces, create free body diagrams, and solve problems.",
                difficulty: "intermediate",
                estimatedDuration: 55,
                order: 2,
                content: {
                    overview: "Learn how forces cause changes in motion.",
                    topics: [
                        "Newton's three laws of motion",
                        "Free body diagrams",
                        "Weight, normal force, friction",
                        "Tension and springs",
                        "Applications and problem solving"
                    ],
                    examples: [
                        {
                            problem: "A 10 kg box is pushed with 50 N force. If friction is 20 N, what's the acceleration?",
                            solution: "3 m/s²",
                            explanation: "Net force = 50 - 20 = 30 N. Using F = ma: a = 30/10 = 3 m/s²"
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 4,
        name: "Literature",
        description: "Poetry, Prose, Drama, Literary Analysis",
        icon: "📚",
        color: "#9C27B0",
        lessons: [
            {
                id: 8,
                title: "Literary Analysis and Close Reading",
                description: "Develop skills in analyzing themes, symbols, and literary devices across different types of texts.",
                difficulty: "beginner",
                estimatedDuration: 45,
                order: 1,
                content: {
                    overview: "Learn to read deeply and analyze literary works effectively.",
                    topics: [
                        "Close reading techniques",
                        "Identifying themes and motifs",
                        "Literary devices and figurative language",
                        "Character analysis and development",
                        "Writing analytical essays"
                    ],
                    examples: [
                        {
                            problem: "Identify the metaphor in: 'Life is a journey full of unexpected turns'",
                            solution: "Life is compared to a journey",
                            explanation: "This metaphor compares life to a journey, suggesting it has a path with surprises"
                        }
                    ]
                }
            },
            {
                id: 9,
                title: "Poetry: Form, Structure, and Meaning",
                description: "Explore poetic forms, meter, rhyme schemes, and techniques for interpreting poetry's deeper meanings.",
                difficulty: "intermediate",
                estimatedDuration: 40,
                order: 2,
                content: {
                    overview: "Understand the craft and interpretation of poetry.",
                    topics: [
                        "Poetic forms: sonnets, haikus, free verse",
                        "Meter and rhythm",
                        "Rhyme schemes and sound devices",
                        "Imagery and symbolism in poetry",
                        "Historical and cultural context"
                    ],
                    examples: [
                        {
                            problem: "What is the rhyme scheme of a Shakespearean sonnet?",
                            solution: "ABAB CDCD EFEF GG",
                            explanation: "Shakespearean sonnets have three quatrains with alternating rhymes plus a final couplet"
                        }
                    ]
                }
            }
        ]
    }
];

// User progress data (stored in localStorage)
const STORAGE_KEYS = {
    USER_PROGRESS: 'ai_tutor_user_progress',
    CHAT_HISTORY: 'ai_tutor_chat_history',
    VOICE_ENABLED: 'ai_tutor_voice_enabled'
};

// AI response templates for different types of questions
const AI_RESPONSES = {
    greeting: [
        "Hello! I'm excited to help you learn today. What would you like to explore?",
        "Hi there! Ready to dive into some learning? I'm here to guide you through any questions.",
        "Welcome! I'm your AI tutor, and I'm here to make learning engaging and fun. What can I help you with?"
    ],
    explanation: [
        "Great question! Let me break this down step by step for you.",
        "I love that you're asking for clarification! Here's how I'd explain it:",
        "That's an excellent question. Let me walk you through the concept."
    ],
    encouragement: [
        "You're doing great! Keep up the excellent work.",
        "I can see you're really thinking through this problem. That's exactly the right approach!",
        "Fantastic effort! Your understanding is clearly improving."
    ],
    help: [
        "I'm here to help! Can you tell me more about what's confusing you?",
        "No worries - this concept can be tricky. Let's work through it together.",
        "That's a common area where students need extra support. Let me help clarify."
    ]
};

// Export data for use in app.js
window.SUBJECTS_DATA = SUBJECTS_DATA;
window.STORAGE_KEYS = STORAGE_KEYS;
window.AI_RESPONSES = AI_RESPONSES;