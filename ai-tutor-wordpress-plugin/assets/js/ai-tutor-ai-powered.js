jQuery(document).ready(function($) {
    'use strict';
    
    // AI-Powered Chat System
    class AIPoweredChat {
        constructor() {
            this.chatContainer = $('#ai-tutor-chat');
            this.messageInput = $('#ai-tutor-message-input');
            this.sendButton = $('#ai-tutor-send-message');
            this.messagesContainer = $('#ai-tutor-messages');
            this.currentLessonId = this.chatContainer.data('lesson-id');
            this.currentSubject = this.chatContainer.data('subject');
            this.currentLessonTitle = this.chatContainer.data('lesson-title');
            this.chatHistory = [];
            
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.loadChatHistory();
        }
        
        bindEvents() {
            this.sendButton.on('click', () => this.sendMessage());
            this.messageInput.on('keypress', (e) => {
                if (e.which === 13) {
                    this.sendMessage();
                }
            });
        }
        
        async sendMessage() {
            const message = this.messageInput.val().trim();
            if (!message) return;
            
            // Add user message to UI
            this.addMessageToUI(message, true);
            this.messageInput.val('');
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                // Send to AI backend
                const response = await this.callAI(message);
                this.hideTypingIndicator();
                this.addMessageToUI(response, false);
                
                // Update chat history
                this.chatHistory.push(
                    { message: message, isFromUser: true },
                    { message: response, isFromUser: false }
                );
                
            } catch (error) {
                this.hideTypingIndicator();
                this.addMessageToUI('Sorry, I encountered an error. Please try again.', false);
                console.error('Chat error:', error);
            }
        }
        
        async callAI(message) {
            const data = {
                action: 'ai_tutor_chat',
                nonce: ai_tutor.nonce,
                lesson_id: this.currentLessonId,
                message: message
            };
            
            const response = await $.post(ai_tutor.ajax_url, data);
            
            if (response.success) {
                return response.data.response;
            } else {
                throw new Error(response.data || 'Failed to get AI response');
            }
        }
        
        addMessageToUI(message, isFromUser) {
            const messageClass = isFromUser ? 'user-message' : 'ai-message';
            const messageHTML = `
                <div class="ai-tutor-message ${messageClass}">
                    <div class="message-content">${this.escapeHtml(message)}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            
            this.messagesContainer.append(messageHTML);
            this.scrollToBottom();
        }
        
        showTypingIndicator() {
            const typingHTML = `
                <div class="ai-tutor-message ai-message typing-indicator" id="typing-indicator">
                    <div class="message-content">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `;
            this.messagesContainer.append(typingHTML);
            this.scrollToBottom();
        }
        
        hideTypingIndicator() {
            $('#typing-indicator').remove();
        }
        
        scrollToBottom() {
            this.messagesContainer.scrollTop(this.messagesContainer[0].scrollHeight);
        }
        
        escapeHtml(text) {
            return $('<div>').text(text).html();
        }
        
        loadChatHistory() {
            // Load existing chat history for this lesson
            // This would typically come from the server
        }
    }
    
    // AI-Powered Content Generation
    class AIContentGenerator {
        constructor() {
            this.init();
        }
        
        init() {
            this.bindEvents();
        }
        
        bindEvents() {
            $(document).on('click', '.generate-ai-content', (e) => {
                e.preventDefault();
                const lessonId = $(e.target).data('lesson-id');
                this.generateContent(lessonId);
            });
            
            $(document).on('click', '.generate-ai-questions', (e) => {
                e.preventDefault();
                const lessonId = $(e.target).data('lesson-id');
                const type = $(e.target).data('type') || 'multiple_choice';
                const difficulty = $(e.target).data('difficulty') || 'medium';
                const count = $(e.target).data('count') || 5;
                this.generateQuestions(lessonId, type, difficulty, count);
            });
        }
        
        async generateContent(lessonId) {
            const button = $(`.generate-ai-content[data-lesson-id="${lessonId}"]`);
            const originalText = button.text();
            
            button.text('Generating...').prop('disabled', true);
            
            try {
                const data = {
                    action: 'ai_tutor_generate_content',
                    nonce: ai_tutor.nonce,
                    lesson_id: lessonId
                };
                
                const response = await $.post(ai_tutor.ajax_url, data);
                
                if (response.success) {
                    // Update the lesson content on the page
                    this.updateLessonContent(lessonId, response.data);
                    this.showNotification('Content generated successfully!', 'success');
                } else {
                    throw new Error(response.data || 'Failed to generate content');
                }
                
            } catch (error) {
                this.showNotification('Failed to generate content: ' + error.message, 'error');
                console.error('Content generation error:', error);
            } finally {
                button.text(originalText).prop('disabled', false);
            }
        }
        
        async generateQuestions(lessonId, type, difficulty, count) {
            const button = $(`.generate-ai-questions[data-lesson-id="${lessonId}"]`);
            const originalText = button.text();
            
            button.text('Generating...').prop('disabled', true);
            
            try {
                const data = {
                    action: 'ai_tutor_generate_questions',
                    nonce: ai_tutor.nonce,
                    lesson_id: lessonId,
                    type: type,
                    difficulty: difficulty,
                    count: count
                };
                
                const response = await $.post(ai_tutor.ajax_url, data);
                
                if (response.success) {
                    this.displayQuestions(response.data.questions);
                    this.showNotification('Questions generated successfully!', 'success');
                } else {
                    throw new Error(response.data || 'Failed to generate questions');
                }
                
            } catch (error) {
                this.showNotification('Failed to generate questions: ' + error.message, 'error');
                console.error('Question generation error:', error);
            } finally {
                button.text(originalText).prop('disabled', false);
            }
        }
        
        updateLessonContent(lessonId, content) {
            const contentContainer = $(`.lesson-content[data-lesson-id="${lessonId}"]`);
            if (contentContainer.length) {
                contentContainer.html(content.content);
                
                // Update examples if provided
                if (content.examples) {
                    this.displayExamples(content.examples);
                }
                
                // Update quiz if provided
                if (content.quiz) {
                    this.displayQuiz(content.quiz);
                }
            }
        }
        
        displayQuestions(questions) {
            const questionsContainer = $('#ai-generated-questions');
            if (!questionsContainer.length) {
                $('body').append('<div id="ai-generated-questions" class="ai-questions-modal"></div>');
            }
            
            let questionsHTML = '<div class="questions-container"><h3>AI Generated Questions</h3>';
            
            questions.forEach((question, index) => {
                questionsHTML += `
                    <div class="question-item" data-question-index="${index}">
                        <h4>Question ${index + 1}</h4>
                        <p class="question-text">${question.question}</p>
                        <div class="question-options">
                            ${question.options.map((option, optIndex) => `
                                <label>
                                    <input type="radio" name="question_${index}" value="${optIndex}">
                                    ${option}
                                </label>
                            `).join('')}
                        </div>
                        <div class="question-explanation" style="display: none;">
                            <strong>Explanation:</strong> ${question.explanation}
                        </div>
                    </div>
                `;
            });
            
            questionsHTML += '<button class="check-answers">Check Answers</button><button class="close-questions">Close</button></div>';
            
            $('#ai-generated-questions').html(questionsHTML).show();
            
            // Bind answer checking
            $('.check-answers').on('click', () => this.checkAnswers(questions));
            $('.close-questions').on('click', () => $('#ai-generated-questions').hide());
        }
        
        checkAnswers(questions) {
            questions.forEach((question, index) => {
                const selectedAnswer = $(`input[name="question_${index}"]:checked`).val();
                const questionItem = $(`.question-item[data-question-index="${index}"]`);
                const explanation = questionItem.find('.question-explanation');
                
                if (selectedAnswer == question.correctAnswer) {
                    questionItem.addClass('correct');
                } else {
                    questionItem.addClass('incorrect');
                }
                
                explanation.show();
            });
        }
        
        displayExamples(examples) {
            const examplesContainer = $('#lesson-examples');
            if (examplesContainer.length) {
                let examplesHTML = '<h3>Examples</h3>';
                examples.forEach((example, index) => {
                    examplesHTML += `
                        <div class="example-item">
                            <h4>Example ${index + 1}</h4>
                            <div class="example-problem"><strong>Problem:</strong> ${example.problem}</div>
                            <div class="example-solution"><strong>Solution:</strong> ${example.solution}</div>
                            <div class="example-explanation"><strong>Explanation:</strong> ${example.explanation}</div>
                        </div>
                    `;
                });
                examplesContainer.html(examplesHTML);
            }
        }
        
        displayQuiz(quiz) {
            const quizContainer = $('#lesson-quiz');
            if (quizContainer.length) {
                let quizHTML = '<h3>Quiz</h3>';
                quiz.forEach((question, index) => {
                    quizHTML += `
                        <div class="quiz-question" data-question-index="${index}">
                            <h4>Question ${index + 1}</h4>
                            <p>${question.question}</p>
                            <div class="quiz-options">
                                ${question.options.map((option, optIndex) => `
                                    <label>
                                        <input type="radio" name="quiz_${index}" value="${optIndex}">
                                        ${option}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
                quizHTML += '<button class="submit-quiz">Submit Quiz</button>';
                quizContainer.html(quizHTML);
                
                $('.submit-quiz').on('click', () => this.submitQuiz(quiz));
            }
        }
        
        submitQuiz(quiz) {
            let score = 0;
            quiz.forEach((question, index) => {
                const selectedAnswer = $(`input[name="quiz_${index}"]:checked`).val();
                const questionItem = $(`.quiz-question[data-question-index="${index}"]`);
                
                if (selectedAnswer == question.correctAnswer) {
                    score++;
                    questionItem.addClass('correct');
                } else {
                    questionItem.addClass('incorrect');
                }
                
                // Show explanation
                questionItem.append(`<div class="quiz-explanation"><strong>Explanation:</strong> ${question.explanation}</div>`);
            });
            
            const percentage = Math.round((score / quiz.length) * 100);
            this.showNotification(`Quiz completed! Score: ${score}/${quiz.length} (${percentage}%)`, 'success');
        }
        
        showNotification(message, type) {
            const notification = $(`<div class="ai-tutor-notification ${type}">${message}</div>`);
            $('body').append(notification);
            
            setTimeout(() => {
                notification.fadeOut(() => notification.remove());
            }, 5000);
        }
    }
    
    // Initialize AI-powered components
    if ($('#ai-tutor-chat').length) {
        new AIPoweredChat();
    }
    
    new AIContentGenerator();
    
    // Real-time conversation features
    class RealTimeConversation {
        constructor() {
            this.isTyping = false;
            this.typingTimeout = null;
            this.init();
        }
        
        init() {
            this.bindEvents();
        }
        
        bindEvents() {
            $('#ai-tutor-message-input').on('input', () => {
                this.handleTyping();
            });
        }
        
        handleTyping() {
            if (!this.isTyping) {
                this.isTyping = true;
                // Could send typing indicator to other users in a multi-user scenario
            }
            
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.isTyping = false;
                // Stop typing indicator
            }, 1000);
        }
    }
    
    new RealTimeConversation();
});