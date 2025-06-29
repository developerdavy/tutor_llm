/**
 * AI Tutor Real-time Chat and AI Integration
 * Replaces JavaScript-based content generation with AI backend calls
 */

class AITutorRealtime {
    constructor() {
        if (typeof aiTutorAjax === 'undefined') {
            console.error('aiTutorAjax not loaded, waiting...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
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
        // Chat functionality - multiple selectors for compatibility including new ones
        jQuery(document).on('click', '#send-chat-btn, .send-btn, #ai-tutor-send-button, .ai-send-button', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        jQuery(document).on('keypress', '#chat-input, .chat-input, .ai-chat-input, #ai-tutor-message-input', (e) => {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // AI Content Generation buttons
        jQuery(document).on('click', '.generate-content-btn', (e) => {
            e.preventDefault();
            this.generateLessonContent(jQuery(e.target).data('lesson-id'));
        });
        
        jQuery(document).on('click', '.generate-questions-btn', (e) => {
            e.preventDefault();
            this.generateQuestions(jQuery(e.target).data('lesson-id'));
        });
        
        jQuery(document).on('click', '.generate-examples-btn', (e) => {
            e.preventDefault();
            this.generateExamples(jQuery(e.target).data('lesson-id'));
        });
        
        // Answer evaluation
        jQuery(document).on('click', '.submit-answer-btn', (e) => {
            e.preventDefault();
            this.evaluateAnswer(e.target);
        });
        
        // Auto-resize textarea
        jQuery(document).on('input', '#chat-input, .chat-input, .ai-chat-input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    initializeChatInterface() {
        // Wait for DOM to be fully loaded
        jQuery(document).ready(() => {
            // Try multiple selectors for compatibility
            this.chatContainer = jQuery('#chat-messages, .chat-messages, .ai-chat-messages, #ai-tutor-chat-messages').first();
            this.messageInput = jQuery('#chat-input, .chat-input, .ai-chat-input, #ai-tutor-message-input').first();
            this.sendButton = jQuery('#send-button, .send-button, .ai-send-button, #ai-tutor-send-button').first();
            
            // If not found, create the interface dynamically
            if (this.messageInput.length === 0 || this.chatContainer.length === 0) {
                this.createChatInterface();
            }
            
            // Auto-scroll to bottom
            if (this.chatContainer.length) {
                this.scrollToBottom();
            }
            
            console.log('Chat interface initialized:', {
                chatContainer: this.chatContainer.length,
                messageInput: this.messageInput.length,
                sendButton: this.sendButton.length
            });
        });
    }
    
    createChatInterface() {
        // Find a container to add chat interface to
        const container = jQuery('.ai-tutor-lesson-content, .ai-lesson-container, [data-lesson-id], .entry-content, .content, body').first();
        
        if (container.length) {
            const chatHTML = `
                <div class="ai-tutor-chat-section" style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9;">
                    <h4>Ask the AI Tutor</h4>
                    <div id="ai-tutor-chat-messages" class="ai-chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0; background: white; border-radius: 4px;">
                        <div class="ai-message" style="margin: 10px 0; padding: 8px; background: #e3f2fd; border-radius: 8px;">
                            <strong>AI Tutor:</strong> Hello! I'm here to help you learn. Ask me any questions about this lesson!
                        </div>
                    </div>
                    <div class="ai-tutor-input-area" style="display: flex; gap: 10px;">
                        <input type="text" id="ai-tutor-message-input" class="ai-chat-input" placeholder="Type your question here..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <button id="ai-tutor-send-button" class="ai-send-button button button-primary" type="button">Send</button>
                    </div>
                </div>
            `;
            
            container.append(chatHTML);
            
            // Re-initialize elements
            this.chatContainer = jQuery('#ai-tutor-chat-messages');
            this.messageInput = jQuery('#ai-tutor-message-input');
            this.sendButton = jQuery('#ai-tutor-send-button');
            
            // Add event listeners to the new elements
            this.setupEventListeners();
            
            console.log('Chat interface created dynamically');
        } else {
            console.log('No suitable container found for chat interface');
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
        // Re-initialize elements if needed
        if (!this.messageInput || this.messageInput.length === 0) {
            this.messageInput = jQuery('#ai-tutor-message-input, #chat-input, .chat-input, .ai-chat-input').first();
        }
        if (!this.chatContainer || this.chatContainer.length === 0) {
            this.chatContainer = jQuery('#ai-tutor-chat-messages, #chat-messages, .chat-messages, .ai-chat-messages').first();
        }
        
        if (!this.messageInput || this.messageInput.length === 0) {
            console.error('Chat interface not properly initialized');
            this.initializeChatInterface();
            // Wait a moment for the interface to be created
            setTimeout(() => {
                this.messageInput = jQuery('#ai-tutor-message-input').first();
                this.chatContainer = jQuery('#ai-tutor-chat-messages').first();
            }, 100);
            return;
        }
        
        const messageValue = this.messageInput.val() || this.messageInput.value || '';
        if (!messageValue || messageValue.trim() === '') {
            console.log('No message to send');
            return;
        }
        
        const message = messageValue.trim();
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
        const typingElement = jQuery('#typing-indicator');
        
        if (show) {
            // Use built-in typing indicator if available, otherwise create one
            if (typingElement.length) {
                typingElement.show();
            } else {
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
            }
        } else {
            if (typingElement.length) {
                typingElement.hide();
            }
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
        
        button.prop('disabled', true).text('🚀 Generating...');
        this.showLoadingOverlay('Generating AI content...');
        
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
            this.hideLoadingOverlay();
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
        
        button.prop('disabled', true).text('❓ Generating...');
        this.showLoadingOverlay('Generating practice questions...');
        
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
            this.hideLoadingOverlay();
        }
    }
    
    async generateExamples(lessonId) {
        if (!lessonId) return;
        
        const button = jQuery(`.generate-examples-btn[data-lesson-id="${lessonId}"]`);
        const originalText = button.text();
        
        button.prop('disabled', true).text('💡 Generating...');
        this.showLoadingOverlay('Generating examples...');
        
        try {
            const response = await this.callAjax('ai_tutor_generate_examples', {
                lesson_id: lessonId,
                count: 3
            });
            
            if (response.success) {
                this.displayExamples(response.data.examples);
                this.showSuccess('Examples generated successfully!');
            } else {
                this.showError(response.data || 'Failed to generate examples');
            }
        } catch (error) {
            this.showError('Failed to generate examples');
            console.error('Example generation error:', error);
        } finally {
            button.prop('disabled', false).text(originalText);
            this.hideLoadingOverlay();
        }
    }

    displayQuestions(questions) {
        const questionsContainer = jQuery('.questions-container');
        if (questionsContainer.length && questions) {
            questionsContainer.html(this.renderQuiz(questions));
        }
    }

    displayExamples(examples) {
        const examplesContainer = jQuery('#generated-content');
        if (examplesContainer.length && examples) {
            examplesContainer.show().html(this.renderExamples(examples));
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
    
    showLoadingOverlay(message = 'Processing...') {
        const loadingOverlay = jQuery('#loading-overlay');
        if (loadingOverlay.length) {
            loadingOverlay.find('p').text(message);
            loadingOverlay.show();
        } else {
            // Create loading overlay if it doesn't exist
            const overlayHtml = `
                <div id="loading-overlay-ai" class="loading-overlay" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
                    <div class="loading-spinner" style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                        <p style="margin: 0; color: #333;">${message}</p>
                    </div>
                </div>
            `;
            jQuery('body').append(overlayHtml);
        }
    }

    hideLoadingOverlay() {
        const loadingOverlay = jQuery('#loading-overlay, #loading-overlay-ai');
        if (loadingOverlay.length) {
            loadingOverlay.hide();
        }
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

// Initialize when document is ready and make globally accessible
jQuery(document).ready(function() {
    if (typeof aiTutorAjax !== 'undefined') {
        window.aiTutorRealtime = new AITutorRealtime();
        console.log('AITutorRealtime initialized globally');
    } else {
        console.error('aiTutorAjax not available for initialization');
    }
});