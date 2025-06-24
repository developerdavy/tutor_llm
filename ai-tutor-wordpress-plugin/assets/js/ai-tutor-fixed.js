// Complete AI Tutor implementation for WordPress - Fixed Version

// Subject and lesson data
const SUBJECTS_DATA = [
    {
        id: 1,
        name: "Mathematics",
        description: "Algebra, Geometry, Calculus",
        icon: "📊",
        color: "#1E88E5",
        lessons: [
            {
                id: 1,
                title: "Algebraic Expressions and Equations",
                description: "Learn to simplify expressions and solve linear and quadratic equations with step-by-step guidance.",
                difficulty: "beginner",
                estimatedDuration: 45,
                order: 1
            },
            {
                id: 2,
                title: "Functions and Graphing",
                description: "Understand functions, their domains, ranges, and graphing techniques for various function types.",
                difficulty: "intermediate",
                estimatedDuration: 50,
                order: 2
            },
            {
                id: 3,
                title: "Trigonometry Basics",
                description: "Explore trigonometric ratios, the unit circle, and fundamental trigonometric identities.",
                difficulty: "intermediate",
                estimatedDuration: 55,
                order: 3
            }
        ]
    },
    {
        id: 2,
        name: "Chemistry",
        description: "Organic, Inorganic, Physical",
        icon: "🧪",
        color: "#FF7043",
        lessons: [
            {
                id: 4,
                title: "Atomic Theory and Periodic Trends",
                description: "Understand atomic structure, electron configuration, and how properties change across the periodic table.",
                difficulty: "beginner",
                estimatedDuration: 40,
                order: 1
            },
            {
                id: 5,
                title: "Chemical Bonding and Molecular Geometry",
                description: "Learn about ionic, covalent, and metallic bonds, plus molecular shapes using VSEPR theory.",
                difficulty: "intermediate",
                estimatedDuration: 45,
                order: 2
            }
        ]
    },
    {
        id: 3,
        name: "Physics",
        description: "Mechanics, Thermodynamics",
        icon: "⚛️",
        color: "#43A047",
        lessons: [
            {
                id: 6,
                title: "Kinematics and Motion",
                description: "Master concepts of position, velocity, acceleration, and motion graphs for one and two dimensions.",
                difficulty: "beginner",
                estimatedDuration: 50,
                order: 1
            },
            {
                id: 7,
                title: "Forces and Newton's Laws",
                description: "Apply Newton's three laws of motion to analyze forces, create free body diagrams, and solve problems.",
                difficulty: "intermediate",
                estimatedDuration: 55,
                order: 2
            }
        ]
    },
    {
        id: 4,
        name: "Literature",
        description: "Poetry, Prose, Drama",
        icon: "📚",
        color: "#9C27B0",
        lessons: [
            {
                id: 8,
                title: "Literary Analysis and Close Reading",
                description: "Develop skills in analyzing themes, symbols, and literary devices across different types of texts.",
                difficulty: "beginner",
                estimatedDuration: 45,
                order: 1
            },
            {
                id: 9,
                title: "Poetry: Form, Structure, and Meaning",
                description: "Explore poetic forms, meter, rhyme schemes, and techniques for interpreting poetry's deeper meanings.",
                difficulty: "intermediate",
                estimatedDuration: 40,
                order: 2
            }
        ]
    }
];

class AiTutorReact {
    constructor(options = {}) {
        this.config = {
            subjectId: '',
            userId: 0,
            apiUrl: '',
            nonce: '',
            isVoiceEnabled: localStorage.getItem('ai_tutor_voice_enabled') !== 'false',
            ...options
        };
        
        this.selectedSubject = null;
        this.selectedLesson = null;
        this.userProgress = this.loadUserProgress();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSubjects();
        this.updateVoiceToggle();
        this.updateAvatarMessage("Welcome to AI Tutor! Select a subject to begin your learning journey.");
        
        // Auto-select subject if provided
        if (this.config.subjectId) {
            setTimeout(() => {
                this.selectSubject(parseInt(this.config.subjectId));
            }, 500);
        }
    }
    
    bindEvents() {
        // Voice toggle
        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => this.toggleVoice());
        }
        
        // Chat functionality
        const sendBtn = document.getElementById('send-chat');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
        
        // Delegate event handlers for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('subject-item') || e.target.closest('.subject-item')) {
                const subjectItem = e.target.closest('.subject-item') || e.target;
                const subjectId = parseInt(subjectItem.dataset.subjectId);
                if (subjectId) this.handleSubjectClick(subjectId);
            }
            
            if (e.target.classList.contains('lesson-item') || e.target.closest('.lesson-item')) {
                const lessonItem = e.target.closest('.lesson-item') || e.target;
                const lessonId = parseInt(lessonItem.dataset.lessonId);
                if (lessonId) this.handleLessonClick(lessonId);
            }
        });
    }
    
    loadSubjects() {
        console.log('Loading subjects...');
        const container = document.getElementById('subjects-list');
        console.log('Subjects container:', container);
        
        if (!container) {
            console.error('subjects-list container not found');
            return;
        }
        
        container.innerHTML = '';
        console.log('Subjects data:', SUBJECTS_DATA);
        
        SUBJECTS_DATA.forEach((subject, index) => {
            console.log(`Creating subject element ${index + 1}:`, subject.name);
            const subjectElement = this.createSubjectElement(subject);
            container.appendChild(subjectElement);
        });
        
        console.log('Subjects loaded, updating progress...');
        this.updateProgressTracker();
        console.log('Subjects loading complete');
    }
    
    createSubjectElement(subject) {
        const div = document.createElement('div');
        div.className = 'subject-item animate-fade-in';
        div.dataset.subjectId = subject.id;
        
        const progress = this.getSubjectProgress(subject.id);
        
        div.innerHTML = `
            <div class="subject-icon" style="background-color: ${subject.color}">
                ${subject.icon}
            </div>
            <div class="subject-info">
                <h4>${subject.name}</h4>
                <div class="subject-meta">${subject.lessons.length} lessons • ${progress}% complete</div>
            </div>
        `;
        
        return div;
    }
    
    handleSubjectClick(subjectId) {
        const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
        if (subject) this.selectSubject(subject);
    }
    
    selectSubject(subject) {
        // Update selected state
        document.querySelectorAll('.subject-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-subject-id="${subject.id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.selectedSubject = subject;
        this.loadLessons(subject);
        this.updateAvatarMessage(`Excellent choice! ${subject.name} has so many fascinating concepts to explore. Let's pick a lesson to get started.`);
        
        // Show lessons container
        const lessonsContainer = document.getElementById('lessons-container');
        if (lessonsContainer) {
            lessonsContainer.classList.remove('hidden');
        }
    }
    
    loadLessons(subject) {
        const container = document.getElementById('lessons-list');
        const title = document.getElementById('lessons-title');
        
        if (title) title.textContent = `${subject.name} Lessons`;
        if (!container) return;
        
        container.innerHTML = '';
        
        subject.lessons.forEach(lesson => {
            const lessonElement = this.createLessonElement(lesson);
            container.appendChild(lessonElement);
        });
    }
    
    createLessonElement(lesson) {
        const div = document.createElement('div');
        div.className = 'lesson-item animate-fade-in';
        div.dataset.lessonId = lesson.id;
        
        const isCompleted = this.isLessonCompleted(lesson.id);
        if (isCompleted) {
            div.classList.add('lesson-completed');
        }
        
        div.innerHTML = `
            <div class="lesson-header">
                <h4 class="lesson-title">${lesson.title}</h4>
                <span class="difficulty-badge ${lesson.difficulty}">${lesson.difficulty}</span>
            </div>
            <p class="lesson-description">${lesson.description}</p>
            <div class="lesson-meta">
                <span>Lesson ${lesson.order}</span>
                <span>⏱️ ${lesson.estimatedDuration} min</span>
            </div>
        `;
        
        return div;
    }
    
    handleLessonClick(lessonId) {
        const lesson = this.findLesson(lessonId);
        if (lesson) this.selectLesson(lesson);
    }
    
    selectLesson(lesson) {
        // Update selected state
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-lesson-id="${lesson.id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.selectedLesson = lesson;
        this.loadLessonContent(lesson);
        this.updateAvatarMessage(`Great! Let's dive into "${lesson.title}". I'm here to help you understand every concept. Feel free to ask me anything!`);
        
        // Show lesson and chat interfaces
        const lessonInterface = document.getElementById('lesson-interface');
        const chatInterface = document.getElementById('chat-interface');
        
        if (lessonInterface) lessonInterface.classList.remove('hidden');
        if (chatInterface) chatInterface.classList.remove('hidden');
        
        // Clear chat messages for new lesson
        this.clearChatMessages();
    }
    
    loadLessonContent(lesson) {
        const container = document.getElementById('lesson-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="lesson-header-full">
                <div class="lesson-title-section">
                    <h2 class="lesson-main-title">${lesson.title}</h2>
                    <div class="lesson-badges">
                        <span class="difficulty-badge ${lesson.difficulty}">${lesson.difficulty}</span>
                        <span class="duration-badge">⏱️ ${lesson.estimatedDuration} min</span>
                    </div>
                </div>
                <p class="lesson-main-description">${lesson.description}</p>
            </div>
            
            <div class="lesson-actions">
                <button onclick="window.aiTutorApp.markLessonComplete(${lesson.id})" 
                        class="complete-btn ${this.isLessonCompleted(lesson.id) ? 'completed' : ''}">
                    ${this.isLessonCompleted(lesson.id) ? '✅ Completed' : 'Mark as Complete'}
                </button>
                <button onclick="window.aiTutorApp.generateQuiz(${lesson.id})" class="quiz-btn">
                    📝 Practice Quiz
                </button>
            </div>
        `;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message || !this.selectedLesson) return;
        
        // Add user message
        this.addChatMessage(message, true);
        
        // Clear input
        input.value = '';
        
        // Generate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, false);
            
            // Speak response if voice is enabled
            if (this.config.isVoiceEnabled) {
                this.speakText(response);
            }
        }, 500);
    }
    
    addChatMessage(message, isUser) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'ai'} animate-fade-in`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Context-aware responses based on current lesson
        if (!this.selectedLesson) {
            return "Please select a lesson first, and I'll be happy to help you with specific questions about that topic!";
        }
        
        if (message.includes('help') || message.includes('confused') || message.includes('don\'t understand')) {
            return `I understand ${this.selectedLesson.title} can be challenging! Let me break it down: This lesson focuses on ${this.selectedLesson.description.toLowerCase()}. What specific part would you like me to explain further?`;
        }
        
        if (message.includes('explain') || message.includes('how') || message.includes('why')) {
            return `Great question about ${this.selectedLesson.title}! This is a ${this.selectedLesson.difficulty} level concept. The key thing to understand is that ${this.selectedLesson.description.toLowerCase()}. Would you like me to give you a specific example?`;
        }
        
        if (message.includes('example') || message.includes('show me')) {
            return `Here's a practical example for ${this.selectedLesson.title}: Think of it like ${this.getContextualExample()}. This should help illustrate the main concept we're studying.`;
        }
        
        if (message.includes('thank') || message.includes('great') || message.includes('good')) {
            return `You're very welcome! I'm glad I could help with ${this.selectedLesson.title}. Keep up the excellent work - you're really grasping these concepts well!`;
        }
        
        // Default contextual response
        return `That's an insightful question about ${this.selectedLesson.title}! This ${this.selectedLesson.difficulty} level topic is all about ${this.selectedLesson.description.toLowerCase()}. Can you tell me what specific aspect you'd like to explore further?`;
    }
    
    getContextualExample() {
        if (!this.selectedLesson) return "a real-world application";
        
        const examples = {
            1: "solving a puzzle where you need to find the missing piece (the variable)",
            2: "a machine that takes an input and produces a specific output",
            3: "the relationship between the sides of a triangle and angles",
            4: "building blocks that make up everything around us",
            5: "atoms connecting like puzzle pieces to form molecules",
            6: "tracking how a ball moves when you throw it",
            7: "understanding why objects move the way they do",
            8: "reading between the lines to find hidden meanings",
            9: "music with words that paint pictures in your mind"
        };
        
        return examples[this.selectedLesson.id] || "a concept you can apply in everyday life";
    }
    
    markLessonComplete(lessonId) {
        if (this.isLessonCompleted(lessonId)) return;
        
        // Update progress
        if (!this.userProgress[this.selectedSubject.id]) {
            this.userProgress[this.selectedSubject.id] = {};
        }
        
        this.userProgress[this.selectedSubject.id][lessonId] = {
            completed: true,
            completedAt: Date.now()
        };
        
        this.saveUserProgress();
        this.updateProgressTracker();
        this.loadSubjects(); // Refresh to show updated progress
        
        // Update UI
        const lessonCard = document.querySelector(`[data-lesson-id="${lessonId}"]`);
        if (lessonCard) {
            lessonCard.classList.add('lesson-completed');
        }
        
        // Update button
        const button = document.querySelector('.complete-btn');
        if (button) {
            button.textContent = '✅ Completed';
            button.classList.add('completed');
        }
        
        this.updateAvatarMessage("Congratulations! You've completed this lesson. Great job! Ready to tackle the next one?");
    }
    
    generateQuiz(lessonId) {
        this.updateAvatarMessage("Quiz feature coming soon! For now, try explaining the key concepts back to me in the chat - that's a great way to test your understanding!");
    }
    
    toggleVoice() {
        this.config.isVoiceEnabled = !this.config.isVoiceEnabled;
        localStorage.setItem('ai_tutor_voice_enabled', this.config.isVoiceEnabled);
        this.updateVoiceToggle();
    }
    
    updateVoiceToggle() {
        const button = document.getElementById('voice-toggle');
        if (!button) return;
        
        if (this.config.isVoiceEnabled) {
            button.textContent = '🔊 Voice On';
            button.className = 'voice-btn voice-on';
        } else {
            button.textContent = '🔇 Voice Off';
            button.className = 'voice-btn voice-off';
        }
    }
    
    speakText(text) {
        if ('speechSynthesis' in window && this.config.isVoiceEnabled) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Add speaking animation to avatar
            const avatar = document.querySelector('.avatar-circle');
            if (avatar) {
                avatar.style.animation = 'pulse 1s ease-in-out infinite';
                
                utterance.onend = () => {
                    avatar.style.animation = '';
                };
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    updateAvatarMessage(message) {
        const avatarMessage = document.getElementById('avatar-message');
        if (avatarMessage) {
            avatarMessage.textContent = message;
        }
    }
    
    clearChatMessages() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    getSubjectProgress(subjectId) {
        const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
        if (!subject || !this.userProgress[subjectId]) return 0;
        
        const totalLessons = subject.lessons.length;
        const completedLessons = Object.keys(this.userProgress[subjectId]).length;
        
        return Math.round((completedLessons / totalLessons) * 100);
    }
    
    isLessonCompleted(lessonId) {
        if (!this.selectedSubject || !this.userProgress[this.selectedSubject.id]) return false;
        return !!this.userProgress[this.selectedSubject.id][lessonId]?.completed;
    }
    
    findLesson(lessonId) {
        for (const subject of SUBJECTS_DATA) {
            const lesson = subject.lessons.find(l => l.id === lessonId);
            if (lesson) return lesson;
        }
        return null;
    }
    
    updateProgressTracker() {
        const container = document.getElementById('progress-tracker');
        if (!container) return;
        
        let totalLessons = 0;
        let completedLessons = 0;
        
        SUBJECTS_DATA.forEach(subject => {
            totalLessons += subject.lessons.length;
            if (this.userProgress[subject.id]) {
                completedLessons += Object.keys(this.userProgress[subject.id]).length;
            }
        });
        
        const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        container.innerHTML = `
            <div class="progress-stats">
                <div class="stat-item">
                    <div class="stat-number">${completedLessons}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalLessons - completedLessons}</div>
                    <div class="stat-label">Remaining</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${overallProgress}%"></div>
            </div>
        `;
    }
    
    loadUserProgress() {
        const saved = localStorage.getItem('ai_tutor_user_progress');
        this.userProgress = saved ? JSON.parse(saved) : {};
        return this.userProgress;
    }
    
    saveUserProgress() {
        localStorage.setItem('ai_tutor_user_progress', JSON.stringify(this.userProgress));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Tutor initializing...');
    console.log('Looking for ai-tutor-app element...');
    
    const appElement = document.getElementById('ai-tutor-app');
    console.log('App element found:', appElement);
    
    if (appElement) {
        console.log('Creating AiTutorReact instance...');
        try {
            window.aiTutorApp = new AiTutorReact({
                userId: 1 // Default user ID for WordPress
            });
            console.log('AI Tutor initialized successfully', window.aiTutorApp);
        } catch (error) {
            console.error('Error initializing AI Tutor:', error);
        }
    } else {
        console.log('ai-tutor-app element not found, will retry...');
        // Retry after a short delay in case of timing issues
        setTimeout(function() {
            const retryElement = document.getElementById('ai-tutor-app');
            if (retryElement) {
                console.log('Found ai-tutor-app on retry, initializing...');
                window.aiTutorApp = new AiTutorReact({
                    userId: 1
                });
                console.log('AI Tutor initialized on retry');
            } else {
                console.error('ai-tutor-app element still not found after retry');
            }
        }, 1000);
    }
});

// Export the class to global scope
window.AiTutorReact = AiTutorReact;