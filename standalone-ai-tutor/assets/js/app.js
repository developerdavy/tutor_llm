// AI Tutor Standalone Application

class AITutorApp {
    constructor() {
        this.selectedSubject = null;
        this.selectedLesson = null;
        this.isVoiceEnabled = localStorage.getItem(STORAGE_KEYS.VOICE_ENABLED) !== 'false';
        this.userProgress = this.loadUserProgress();
        this.chatHistory = this.loadChatHistory();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSubjects();
        this.updateVoiceToggle();
        this.loadUserProgress();
        this.updateAvatarMessage("Welcome to AI Tutor! Select a subject to begin your learning journey.");
    }
    
    bindEvents() {
        // Voice toggle
        document.getElementById('voice-toggle').addEventListener('click', () => {
            this.toggleVoice();
        });
        
        // Chat functionality
        document.getElementById('send-chat').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }
    
    loadSubjects() {
        const container = document.getElementById('subjects-list');
        container.innerHTML = '';
        
        SUBJECTS_DATA.forEach(subject => {
            const subjectElement = this.createSubjectElement(subject);
            container.appendChild(subjectElement);
        });
        
        this.updateProgressTracker();
    }
    
    createSubjectElement(subject) {
        const div = document.createElement('div');
        div.className = 'subject-card animate-fade-in';
        div.dataset.subjectId = subject.id;
        
        const progress = this.getSubjectProgress(subject.id);
        
        div.innerHTML = `
            <div class="flex items-center space-x-3 mb-2">
                <div class="subject-icon" style="background-color: ${subject.color}">
                    ${subject.icon}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${subject.name}</h4>
                    <p class="text-sm text-gray-600">${subject.lessons.length} lessons</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">${subject.description}</p>
            <div class="progress-bar mb-2">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="text-xs text-gray-500">${progress}% complete</div>
        `;
        
        div.addEventListener('click', () => {
            this.selectSubject(subject);
        });
        
        return div;
    }
    
    selectSubject(subject) {
        // Update selected state
        document.querySelectorAll('.subject-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-subject-id="${subject.id}"]`).classList.add('selected');
        
        this.selectedSubject = subject;
        this.loadLessons(subject);
        this.updateAvatarMessage(`Excellent choice! ${subject.name} has so many fascinating concepts to explore. Let's pick a lesson to get started.`);
        
        // Show lessons container
        document.getElementById('lessons-container').classList.remove('hidden');
    }
    
    loadLessons(subject) {
        const container = document.getElementById('lessons-list');
        const title = document.getElementById('lessons-title');
        
        title.textContent = `${subject.name} Lessons`;
        container.innerHTML = '';
        
        subject.lessons.forEach(lesson => {
            const lessonElement = this.createLessonElement(lesson);
            container.appendChild(lessonElement);
        });
    }
    
    createLessonElement(lesson) {
        const div = document.createElement('div');
        div.className = 'lesson-card animate-fade-in';
        div.dataset.lessonId = lesson.id;
        
        const isCompleted = this.isLessonCompleted(lesson.id);
        if (isCompleted) {
            div.classList.add('lesson-completed');
        }
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-gray-900">${lesson.title}</h4>
                <span class="difficulty-badge ${lesson.difficulty}">${lesson.difficulty}</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">${lesson.description}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>Lesson ${lesson.order}</span>
                <span>⏱️ ${lesson.estimatedDuration} min</span>
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.selectLesson(lesson);
        });
        
        return div;
    }
    
    selectLesson(lesson) {
        // Update selected state
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-lesson-id="${lesson.id}"]`).classList.add('selected');
        
        this.selectedLesson = lesson;
        this.loadLessonContent(lesson);
        this.updateAvatarMessage(`Great! Let's dive into "${lesson.title}". I'm here to help you understand every concept. Feel free to ask me anything!`);
        
        // Show lesson and chat interfaces
        document.getElementById('lesson-interface').classList.remove('hidden');
        document.getElementById('chat-interface').classList.remove('hidden');
        
        // Load chat history for this lesson
        this.loadChatHistory(lesson.id);
    }
    
    loadLessonContent(lesson) {
        const container = document.getElementById('lesson-content');
        
        container.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-2xl font-bold text-gray-900">${lesson.title}</h2>
                    <div class="flex items-center space-x-2">
                        <span class="difficulty-badge ${lesson.difficulty}">${lesson.difficulty}</span>
                        <span class="text-sm text-gray-500">⏱️ ${lesson.estimatedDuration} min</span>
                    </div>
                </div>
                <p class="text-gray-700 mb-6">${lesson.description}</p>
            </div>
            
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                    <p class="text-gray-700">${lesson.content.overview}</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">Key Topics</h3>
                    <ul class="list-disc list-inside space-y-1 text-gray-700">
                        ${lesson.content.topics.map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
                    <div class="space-y-4">
                        ${lesson.content.examples.map(example => `
                            <div class="bg-gray-50 rounded-lg p-4">
                                <p class="font-medium text-gray-900 mb-2">Problem: ${example.problem}</p>
                                <p class="text-green-700 mb-2">Solution: ${example.solution}</p>
                                <p class="text-sm text-gray-600">Explanation: ${example.explanation}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="aiTutorApp.markLessonComplete(${lesson.id})" 
                            class="btn-primary ${this.isLessonCompleted(lesson.id) ? 'opacity-50 cursor-not-allowed' : ''}">
                        ${this.isLessonCompleted(lesson.id) ? '✅ Completed' : 'Mark as Complete'}
                    </button>
                    <button onclick="aiTutorApp.generateQuiz(${lesson.id})" class="btn-outline">
                        📝 Practice Quiz
                    </button>
                </div>
            </div>
        `;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.val.trim();
        
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
            if (this.isVoiceEnabled) {
                this.speakText(response);
            }
        }, 500);
    }
    
    addChatMessage(message, isUser) {
        const container = document.getElementById('chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'ai'} animate-fade-in`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // Save to chat history
        if (!this.chatHistory[this.selectedLesson.id]) {
            this.chatHistory[this.selectedLesson.id] = [];
        }
        this.chatHistory[this.selectedLesson.id].push({
            message,
            isUser,
            timestamp: Date.now()
        });
        this.saveChatHistory();
    }
    
    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Simple keyword-based response generation
        if (message.includes('help') || message.includes('confused') || message.includes('don\'t understand')) {
            return this.getRandomResponse(AI_RESPONSES.help) + " " + this.getContextualHelp();
        } else if (message.includes('explain') || message.includes('how') || message.includes('why')) {
            return this.getRandomResponse(AI_RESPONSES.explanation) + " " + this.getContextualExplanation();
        } else if (message.includes('thank') || message.includes('great') || message.includes('good')) {
            return this.getRandomResponse(AI_RESPONSES.encouragement);
        } else {
            return this.getContextualResponse(userMessage);
        }
    }
    
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getContextualHelp() {
        if (!this.selectedLesson) return "I'm here to help with any questions you have!";
        
        return `For "${this.selectedLesson.title}", I recommend focusing on these key concepts: ${this.selectedLesson.content.topics.slice(0, 2).join(' and ')}. What specific part would you like me to explain?`;
    }
    
    getContextualExplanation() {
        if (!this.selectedLesson) return "I'd be happy to explain any concept in detail!";
        
        const examples = this.selectedLesson.content.examples;
        if (examples.length > 0) {
            const example = examples[0];
            return `Let me give you an example: ${example.problem} The solution is ${example.solution}. ${example.explanation}`;
        }
        
        return `This lesson covers ${this.selectedLesson.content.topics.length} main topics. Which one would you like me to focus on?`;
    }
    
    getContextualResponse(userMessage) {
        if (!this.selectedLesson) {
            return "I'm ready to help! Please select a lesson and I can provide specific guidance on that topic.";
        }
        
        return `That's a great question about "${this.selectedLesson.title}"! Based on what we're studying, I'd say: ${this.selectedLesson.content.overview} Would you like me to elaborate on any specific aspect?`;
    }
    
    markLessonComplete(lessonId) {
        if (this.isLessonCompleted(lessonId)) return;
        
        // Update progress
        if (!this.userProgress[this.selectedSubject.id]) {
            this.userProgress[this.selectedSubject.id] = {};
        }
        this.userProgress[this.selectedSubject.id][lessonId] = {
            completed: true,
            completedAt: Date.now(),
            timeSpent: 0 // Could be tracked
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
        event.target.textContent = '✅ Completed';
        event.target.classList.add('opacity-50', 'cursor-not-allowed');
        
        this.updateAvatarMessage("Congratulations! You've completed this lesson. Great job! Ready to tackle the next one?");
    }
    
    generateQuiz(lessonId) {
        // Placeholder for quiz functionality
        this.updateAvatarMessage("Quiz feature coming soon! For now, try explaining the key concepts back to me in the chat - that's a great way to test your understanding!");
    }
    
    toggleVoice() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        localStorage.setItem(STORAGE_KEYS.VOICE_ENABLED, this.isVoiceEnabled);
        this.updateVoiceToggle();
    }
    
    updateVoiceToggle() {
        const button = document.getElementById('voice-toggle');
        if (this.isVoiceEnabled) {
            button.textContent = '🔊 Voice On';
            button.className = 'px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors';
        } else {
            button.textContent = '🔇 Voice Off';
            button.className = 'px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors';
        }
    }
    
    speakText(text) {
        if ('speechSynthesis' in window && this.isVoiceEnabled) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Add speaking animation to avatar
            const avatar = document.querySelector('#ai-avatar .w-20');
            avatar.classList.add('avatar-speaking');
            
            utterance.onend = () => {
                avatar.classList.remove('avatar-speaking');
            };
            
            speechSynthesis.speak(utterance);
        }
    }
    
    updateAvatarMessage(message) {
        document.getElementById('avatar-message').textContent = message;
    }
    
    loadChatHistory(lessonId = null) {
        if (!lessonId || !this.chatHistory[lessonId]) return;
        
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';
        
        this.chatHistory[lessonId].forEach(chat => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${chat.isUser ? 'user' : 'ai'}`;
            messageDiv.textContent = chat.message;
            container.appendChild(messageDiv);
        });
        
        container.scrollTop = container.scrollHeight;
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
    
    updateProgressTracker() {
        const container = document.getElementById('progress-tracker');
        
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
            <div class="space-y-4">
                <div>
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Overall Progress</span>
                        <span>${overallProgress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${overallProgress}%"></div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold text-blue-600">${completedLessons}</div>
                        <div class="text-xs text-gray-600">Completed</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-gray-400">${totalLessons - completedLessons}</div>
                        <div class="text-xs text-gray-600">Remaining</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    loadUserProgress() {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
        this.userProgress = saved ? JSON.parse(saved) : {};
        return this.userProgress;
    }
    
    saveUserProgress() {
        localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(this.userProgress));
    }
    
    loadChatHistory() {
        const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        this.chatHistory = saved ? JSON.parse(saved) : {};
        return this.chatHistory;
    }
    
    saveChatHistory() {
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(this.chatHistory));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiTutorApp = new AITutorApp();
});