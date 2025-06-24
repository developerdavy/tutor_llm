// AI Tutor WordPress Plugin - React Style JavaScript

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
        const container = document.getElementById('subjects-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        SUBJECTS_DATA.forEach(subject => {
            const subjectElement = this.createSubjectElement(subject);
            container.appendChild(subjectElement);
        });
        
        this.updateProgressTracker();
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
        
        selectLesson: function(lessonId) {
            // Update UI
            $('.lesson-item').removeClass('selected');
            $(`.lesson-item[data-lesson-id="${lessonId}"]`).addClass('selected');
            
            // Load lesson content
            this.loadLessonContent(lessonId);
            
            // Show lesson and chat interfaces
            $('#lesson-interface').show();
            $('#chat-interface').show();
            
            // Update avatar message
            this.updateAvatarMessage("Perfect! I'm here to help you with this lesson. Feel free to ask me anything!");
            
            this.selectedLesson = lessonId;
        },
        
        loadLessonContent: function(lessonId) {
            this.showLoading('#lesson-content');
            
            fetch(`/wp-json/ai-tutor/v1/lessons/${lessonId}`)
                .then(response => response.json())
                .then(data => {
                    this.renderLessonContent(data);
                })
                .catch(error => {
                    console.error('Error loading lesson:', error);
                    this.showError('#lesson-content', 'Failed to load lesson content');
                });
        },
        
        renderLessonContent: function(lesson) {
            const container = $('#lesson-content');
            
            const html = `
                <div class="lesson-header">
                    <h2>${lesson.title}</h2>
                    <div class="lesson-meta">
                        <span class="difficulty-badge ${lesson.difficulty.toLowerCase()}">${lesson.difficulty}</span>
                        <span class="duration">⏱️ ${lesson.estimatedDuration} min</span>
                    </div>
                </div>
                <div class="lesson-body">
                    <p>${lesson.description}</p>
                    <div class="lesson-actions">
                        <button class="ai-tutor-btn mark-complete-btn" data-lesson-id="${lesson.id}">
                            Mark as Complete
                        </button>
                        <button class="ai-tutor-btn ai-tutor-btn-outline" onclick="AiTutor.generateContent(${lesson.id})">
                            Generate AI Content
                        </button>
                    </div>
                </div>
            `;
            
            container.html(html);
        },
        
        sendChatMessage: function() {
            const input = $('#chat-input');
            const message = input.val().trim();
            
            if (!message || !this.selectedLesson) return;
            
            // Add user message to chat
            this.addChatMessage(message, true);
            
            // Clear input
            input.val('');
            
            // Send to server
            const data = new FormData();
            data.append('action', 'ai_tutor_chat');
            data.append('nonce', ai_tutor_ajax.nonce);
            data.append('lesson_id', this.selectedLesson);
            data.append('message', message);
            
            fetch(ai_tutor_ajax.ajax_url, {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.addChatMessage(data.data.response, false);
                    
                    // Speak response if voice is enabled
                    if (this.config.isVoiceEnabled && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(data.data.response);
                        speechSynthesis.speak(utterance);
                    }
                } else {
                    this.addChatMessage('Sorry, I encountered an error. Please try again.', false);
                }
            })
            .catch(error => {
                console.error('Chat error:', error);
                this.addChatMessage('Sorry, I encountered an error. Please try again.', false);
            });
        },
        
        addChatMessage: function(message, isUser) {
            const container = $('#chat-messages');
            const messageClass = isUser ? 'user' : 'ai';
            
            const html = `
                <div class="chat-message ${messageClass}">
                    ${message}
                </div>
            `;
            
            container.append(html);
            container.scrollTop(container[0].scrollHeight);
        },
        
        markLessonComplete: function(e) {
            const lessonId = $(e.target).data('lesson-id');
            
            const data = new FormData();
            data.append('action', 'ai_tutor_progress');
            data.append('nonce', ai_tutor_ajax.nonce);
            data.append('subject_id', this.selectedSubject);
            data.append('lesson_id', lessonId);
            data.append('progress', 100);
            data.append('completed', 1);
            
            fetch(ai_tutor_ajax.ajax_url, {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $(e.target).text('✅ Completed').prop('disabled', true);
                    this.updateAvatarMessage('Congratulations! You completed the lesson. Ready for the next one?');
                    this.loadUserProgress(); // Refresh progress
                }
            })
            .catch(error => {
                console.error('Progress update error:', error);
            });
        },
        
        generateContent: function(lessonId) {
            this.updateAvatarMessage('Generating personalized content for you...');
            
            // This would integrate with AI content generation
            // For now, show a placeholder
            setTimeout(() => {
                this.updateAvatarMessage('AI content generation is coming soon! For now, explore the existing lesson content.');
            }, 2000);
        },
        
        toggleVoice: function() {
            this.config.isVoiceEnabled = !this.config.isVoiceEnabled;
            const button = $('#voice-toggle');
            
            if (this.config.isVoiceEnabled) {
                button.text('🔊 Voice On');
                button.removeClass('ai-tutor-btn-outline').addClass('ai-tutor-btn');
            } else {
                button.text('🔇 Voice Off');
                button.removeClass('ai-tutor-btn').addClass('ai-tutor-btn-outline');
            }
        },
        
        updateAvatarMessage: function(message) {
            $('#avatar-message').text(message);
        },
        
        loadUserProgress: function() {
            if (!this.config.userId) return;
            
            fetch('/wp-json/ai-tutor/v1/user/progress')
                .then(response => response.json())
                .then(data => {
                    this.renderProgress(data);
                })
                .catch(error => {
                    console.error('Error loading progress:', error);
                });
        },
        
        renderProgress: function(progressData) {
            const container = $('#progress-tracker');
            
            if (!progressData || progressData.length === 0) {
                container.html('<p>Start learning to track your progress!</p>');
                return;
            }
            
            // Calculate stats
            const totalLessons = progressData.length;
            const completedLessons = progressData.filter(p => p.completed == 1).length;
            const progressPercent = Math.round((completedLessons / totalLessons) * 100);
            
            const html = `
                <div class="progress-stats">
                    <div class="stat-item">
                        <strong>${completedLessons}</strong>
                        <span>Lessons Completed</span>
                    </div>
                    <div class="stat-item">
                        <strong>${progressPercent}%</strong>
                        <span>Overall Progress</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            `;
            
            container.html(html);
        },
        
        showLoading: function(selector) {
            $(selector).html('<div class="ai-tutor-loading"><div class="ai-tutor-spinner"></div>Loading...</div>');
        },
        
        showError: function(selector, message) {
            $(selector).html(`<div class="ai-tutor-error">❌ ${message}</div>`);
        }
    };

})(jQuery);