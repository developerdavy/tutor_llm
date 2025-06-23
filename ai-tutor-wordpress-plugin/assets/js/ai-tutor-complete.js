// Complete AI Tutor React-style implementation for WordPress

// Continue with remaining methods from the previous class

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

// Export the class to global scope
window.AiTutorReact = AiTutorReact;