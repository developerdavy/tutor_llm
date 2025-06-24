/**
 * AI Tutor Real-time Chat and AI Integration
 * Replaces JavaScript-based content generation with AI backend calls
 */

class AITutorRealtime {
    constructor() {
        this.apiUrl = aiTutorAjax.ajaxurl;
        this.nonce = aiTutorAjax.nonce;
        this.currentLessonId = null;
        this.chatContainer = null;
        this.messageInput = null;
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeChatInterface();
        this.loadChatHistory();
    }
    
    setupEventListeners() {
        // Chat form submission
        jQuery(document).on('submit', '.ai-chat-form', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Enter key in chat input
        jQuery(document).on('keypress', '.ai-chat-input', (e) => {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Generate content button
        jQuery(document).on('click', '.generate-content-btn', (e) => {
            e.preventDefault();
            this.generateLessonContent(jQuery(e.target).data('lesson-id'));
        });
        
        // Generate questions button
        jQuery(document).on('click', '.generate-questions-btn', (e) => {
            e.preventDefault();
            this.generateQuestions(jQuery(e.target).data('lesson-id'));
        });
        
        // Submit answer button
        jQuery(document).on('click', '.submit-answer-btn', (e) => {
            e.preventDefault();
            this.evaluateAnswer(e.target);
        });
        
        // Auto-resize textarea
        jQuery(document).on('input', '.ai-chat-input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    initializeChatInterface() {
        this.chatContainer = jQuery('.ai-chat-messages');
        this.messageInput = jQuery('.ai-chat-input');
        
        // Auto-scroll to bottom
        if (this.chatContainer.length) {
            this.scrollToBottom();
        }
    }
    
    loadChatHistory() {
        const lessonId = this.getCurrentLessonId();
        if (!lessonId) return;
        
        // Chat history is typically loaded server-side, but we can refresh if needed
        this.currentLessonId = lessonId;
    }
    
    getCurrentLessonId() {
        return jQuery('[data-lesson-id]').first().data('lesson-id') || null;
    }
    
    async sendMessage() {
        const message = this.messageInput.val().trim();
        if (!message || this.isTyping) return;
        
        const lessonId = this.getCurrentLessonId();
        if (!lessonId) {
            this.showError('Lesson ID not found');
            return;
        }
        
        // Clear input and add user message to UI
        this.messageInput.val('');
        this.addMessageToUI(message, true);
        this.setTypingIndicator(true);
        
        try {
            const response = await this.callAjax('ai_tutor_chat', {
                lesson_id: lessonId,
                message: message
            });
            
            if (response.success) {
                this.addMessageToUI(response.data.response, false);
            } else {
                this.showError(response.data || 'Failed to get AI response');
            }
        } catch (error) {
            this.showError('Connection error. Please try again.');
            console.error('Chat error:', error);
        } finally {
            this.setTypingIndicator(false);
        }
    }
    
    addMessageToUI(message, isUser) {
        const messageClass = isUser ? 'user-message' : 'ai-message';
        const avatar = isUser ? '👤' : '🤖';
        const timestamp = new Date().toLocaleTimeString();
        
        const messageHtml = `
            <div class="chat-message ${messageClass}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(message)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
        
        this.chatContainer.append(messageHtml);
        this.scrollToBottom();
    }
    
    formatMessage(message) {
        // Basic formatting for AI responses
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    setTypingIndicator(show) {
        this.isTyping = show;
        
        if (show) {
            const typingHtml = `
                <div class="chat-message ai-message typing-indicator">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `;
            this.chatContainer.append(typingHtml);
        } else {
            this.chatContainer.find('.typing-indicator').remove();
        }
        
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        if (this.chatContainer.length) {
            this.chatContainer.scrollTop(this.chatContainer[0].scrollHeight);
        }
    }
    
    async generateLessonContent(lessonId) {
        if (!lessonId) return;
        
        const button = jQuery(`.generate-content-btn[data-lesson-id="${lessonId}"]`);
        const originalText = button.text();
        
        button.prop('disabled', true).text('Generating...');
        
        try {
            const response = await this.callAjax('ai_tutor_generate_content', {
                lesson_id: lessonId
            });
            
            if (response.success) {
                this.displayGeneratedContent(response.data);
                this.showSuccess('Content generated successfully!');
            } else {
                this.showError(response.data || 'Failed to generate content');
            }
        } catch (error) {
            this.showError('Failed to generate content');
            console.error('Content generation error:', error);
        } finally {
            button.prop('disabled', false).text(originalText);
        }
    }
    
    displayGeneratedContent(content) {
        const contentContainer = jQuery('.lesson-content-container');
        if (contentContainer.length) {
            contentContainer.html(`
                <div class="generated-content">
                    <h3>${content.title || 'Generated Content'}</h3>
                    <div class="content-body">${content.content || ''}</div>
                    ${content.examples ? this.renderExamples(content.examples) : ''}
                    ${content.quiz ? this.renderQuiz(content.quiz) : ''}
                </div>
            `);
        }
    }
    
    renderExamples(examples) {
        if (!examples || !examples.length) return '';
        
        const examplesHtml = examples.map(example => `
            <div class="example-item">
                <h4>Example: ${example.problem}</h4>
                <div class="example-solution">
                    <strong>Solution:</strong> ${example.solution}
                </div>
                <div class="example-explanation">
                    <strong>Explanation:</strong> ${example.explanation}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="examples-section">
                <h4>Examples</h4>
                ${examplesHtml}
            </div>
        `;
    }
    
    renderQuiz(quiz) {
        if (!quiz || !quiz.length) return '';
        
        const quizHtml = quiz.map((question, index) => `
            <div class="quiz-question" data-question-index="${index}">
                <h4>Question ${index + 1}: ${question.question}</h4>
                <div class="quiz-options">
                    ${question.options.map((option, optIndex) => `
                        <label class="quiz-option">
                            <input type="radio" name="question_${index}" value="${optIndex}">
                            ${option}
                        </label>
                    `).join('')}
                </div>
                <button class="submit-answer-btn" data-question-index="${index}">Submit Answer</button>
                <div class="answer-feedback" style="display: none;"></div>
            </div>
        `).join('');
        
        return `
            <div class="quiz-section">
                <h4>Quiz</h4>
                ${quizHtml}
            </div>
        `;
    }
    
    async generateQuestions(lessonId) {
        if (!lessonId) return;
        
        const button = jQuery(`.generate-questions-btn[data-lesson-id="${lessonId}"]`);
        const originalText = button.text();
        
        button.prop('disabled', true).text('Generating Questions...');
        
        try {
            const response = await this.callAjax('ai_tutor_generate_questions', {
                lesson_id: lessonId,
                type: 'multiple_choice',
                difficulty: 'medium',
                count: 5
            });
            
            if (response.success) {
                this.displayQuestions(response.data.questions);
                this.showSuccess('Questions generated successfully!');
            } else {
                this.showError(response.data || 'Failed to generate questions');
            }
        } catch (error) {
            this.showError('Failed to generate questions');
            console.error('Question generation error:', error);
        } finally {
            button.prop('disabled', false).text(originalText);
        }
    }
    
    displayQuestions(questions) {
        const questionsContainer = jQuery('.questions-container');
        if (questionsContainer.length && questions) {
            questionsContainer.html(this.renderQuiz(questions));
        }
    }
    
    async evaluateAnswer(button) {
        const questionIndex = jQuery(button).data('question-index');
        const questionContainer = jQuery(button).closest('.quiz-question');
        const selectedOption = questionContainer.find('input[type="radio"]:checked');
        
        if (!selectedOption.length) {
            this.showError('Please select an answer');
            return;
        }
        
        const originalText = jQuery(button).text();
        jQuery(button).prop('disabled', true).text('Evaluating...');
        
        try {
            const questionText = questionContainer.find('h4').text();
            const userAnswer = selectedOption.next().text();
            
            const response = await this.callAjax('ai_tutor_evaluate_answer', {
                question: questionText,
                user_answer: userAnswer,
                correct_answer: '', // Will be determined by AI
                subject: this.getCurrentSubject()
            });
            
            if (response.success) {
                this.displayAnswerFeedback(questionContainer, response.data);
            } else {
                this.showError(response.data || 'Failed to evaluate answer');
            }
        } catch (error) {
            this.showError('Failed to evaluate answer');
            console.error('Answer evaluation error:', error);
        } finally {
            jQuery(button).prop('disabled', false).text(originalText);
        }
    }
    
    displayAnswerFeedback(container, feedback) {
        const feedbackContainer = container.find('.answer-feedback');
        const isCorrect = feedback.isCorrect;
        
        feedbackContainer.html(`
            <div class="feedback-result ${isCorrect ? 'correct' : 'incorrect'}">
                <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                <p>${feedback.feedback}</p>
                <div class="explanation">
                    <strong>Explanation:</strong> ${feedback.explanation}
                </div>
            </div>
        `).show();
    }
    
    getCurrentSubject() {
        return jQuery('[data-subject]').first().data('subject') || 'General';
    }
    
    async callAjax(action, data) {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: this.apiUrl,
                type: 'POST',
                data: {
                    action: action,
                    nonce: this.nonce,
                    ...data
                },
                success: resolve,
                error: reject
            });
        });
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notificationHtml = `
            <div class="ai-tutor-notification ${type}">
                ${message}
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        jQuery('body').append(notificationHtml);
        
        setTimeout(() => {
            jQuery('.ai-tutor-notification').last().fadeOut(() => {
                jQuery(this).remove();
            });
        }, 5000);
    }
}

// Initialize when document is ready
jQuery(document).ready(function() {
    if (typeof aiTutorAjax !== 'undefined') {
        new AITutorRealtime();
    }
});