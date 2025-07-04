/**
 * AI Tutor Main JavaScript - Unified and Clean Implementation
 * This file combines all necessary functionality in one place
 */

jQuery(document).ready(function($) {
    'use strict';

    // Global AI Tutor object
    window.AITutor = {
        // Configuration
        config: {
            apiUrl: typeof aiTutorAjax !== 'undefined' ? aiTutorAjax.ajaxurl : '/wp-admin/admin-ajax.php',
            nonce: typeof aiTutorAjax !== 'undefined' ? aiTutorAjax.nonce : '',
            restUrl: typeof aiTutorAjax !== 'undefined' ? aiTutorAjax.rest_url : '/wp-json/ai-tutor/v1/',
            backendUrl: typeof aiTutorAjax !== 'undefined' ? aiTutorAjax.backend_url : '',
            hasGoogleAPI: typeof aiTutorAjax !== 'undefined' ? aiTutorAjax.has_google_api : false
        },
        
        // Data storage
        data: {
            subjects: [],
            currentSubject: null,
            currentLesson: null,
            userProgress: {},
            chatHistory: []
        },
        
        // Initialize the application
        init: function() {
            this.bindEvents();
            this.loadSubjects();
            this.setupChat();
            this.setupContentGeneration();
            
            console.log('AI Tutor initialized successfully');
        },
        
        // Bind all event listeners
        bindEvents: function() {
            // Navigation events
            $(document).on('click', '.subject-card', this.handleSubjectClick.bind(this));
            $(document).on('click', '.lesson-card', this.handleLessonClick.bind(this));
            $(document).on('click', '.lesson-link', this.handleLessonClick.bind(this));
            $(document).on('click', '.start-lesson-btn', this.handleLessonClick.bind(this));
            $(document).on('click', '.back-to-subjects', this.showSubjects.bind(this));
            $(document).on('click', '.back-to-lessons', this.showLessons.bind(this));
            
            // Chat events
            $(document).on('click', '#ai-tutor-send-message', this.sendChatMessage.bind(this));
            $(document).on('keypress', '#ai-tutor-message-input', this.handleChatKeypress.bind(this));
            
            // Content generation events
            $(document).on('click', '.generate-content-btn', this.generateContent.bind(this));
            $(document).on('click', '.generate-questions-btn', this.generateQuestions.bind(this));
            $(document).on('click', '.generate-examples-btn', this.generateExamples.bind(this));
            
            // Quiz events
            $(document).on('click', '.submit-quiz-btn', this.submitQuiz.bind(this));
            $(document).on('click', '.check-answers-btn', this.checkAnswers.bind(this));
        },
        
        // Load subjects from WordPress
        loadSubjects: function() {
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_get_subjects',
                    nonce: this.config.nonce
                },
                success: function(response) {
                    if (response.success) {
                        this.data.subjects = response.data;
                        this.renderSubjects();
                    } else {
                        console.error('Failed to load subjects:', response.data);
                        this.showError('Failed to load subjects. Please try again.');
                    }
                }.bind(this),
                error: function(xhr, status, error) {
                    console.error('AJAX error loading subjects:', error);
                    this.showError('Connection error. Please check your internet connection.');
                }.bind(this)
            });
        },
        
        // Handle subject card clicks
        handleSubjectClick: function(e) {
            e.preventDefault();
            const subjectId = $(e.currentTarget).data('subject-id');
            if (subjectId) {
                this.selectSubject(subjectId);
            }
        },
        
        // Handle lesson clicks
        handleLessonClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            const lessonId = $(e.currentTarget).data('lesson-id');
            if (lessonId) {
                this.selectLesson(lessonId);
            }
        },
        
        // Select a subject and show its lessons
        selectSubject: function(subjectId) {
            const subject = this.data.subjects.find(s => s.id == subjectId);
            if (subject) {
                this.data.currentSubject = subject;
                this.loadLessons(subjectId);
            }
        },
        
        // Load lessons for a subject
        loadLessons: function(subjectId) {
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_get_subject_lessons',
                    subject_id: subjectId,
                    nonce: this.config.nonce
                },
                success: function(response) {
                    if (response.success) {
                        this.data.currentSubject.lessons = response.data;
                        this.renderLessons();
                    } else {
                        console.error('Failed to load lessons:', response.data);
                        this.showError('Failed to load lessons. Please try again.');
                    }
                }.bind(this),
                error: function(xhr, status, error) {
                    console.error('AJAX error loading lessons:', error);
                    this.showError('Connection error. Please check your internet connection.');
                }.bind(this)
            });
        },
        
        // Select a lesson and show its content
        selectLesson: function(lessonId) {
            // Navigate to AI lesson page
            const lessonUrl = this.createLessonUrl(lessonId);
            window.location.href = lessonUrl;
        },
        
        // Create lesson URL
        createLessonUrl: function(lessonId) {
            const currentUrl = window.location.href;
            const baseUrl = currentUrl.split('?')[0];
            return baseUrl + '?lesson_id=' + lessonId + '&view=ai_lesson';
        },
        
        // Render subjects list
        renderSubjects: function() {
            const container = $('#ai-tutor-subjects-container');
            if (container.length === 0) return;
            
            let html = '<div class="ai-tutor-subjects-grid">';
            
            this.data.subjects.forEach(subject => {
                html += `
                    <div class="subject-card" data-subject-id="${subject.id}">
                        <div class="subject-icon">${subject.icon || '📚'}</div>
                        <h3 class="subject-title">${subject.name}</h3>
                        <p class="subject-description">${subject.description || ''}</p>
                        <div class="subject-actions">
                            <button class="btn btn-primary explore-btn" data-subject-id="${subject.id}">Explore</button>
                            <button class="btn btn-secondary lessons-btn" data-subject-id="${subject.id}">View Lessons</button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.html(html);
        },
        
        // Render lessons list
        renderLessons: function() {
            const container = $('#ai-tutor-lessons-container');
            if (container.length === 0) return;
            
            let html = `
                <div class="lessons-header">
                    <button class="btn btn-secondary back-to-subjects">← Back to Subjects</button>
                    <h2>${this.data.currentSubject.name} Lessons</h2>
                </div>
                <div class="ai-tutor-lessons-grid">
            `;
            
            if (this.data.currentSubject.lessons && this.data.currentSubject.lessons.length > 0) {
                this.data.currentSubject.lessons.forEach(lesson => {
                    html += `
                        <div class="lesson-card" data-lesson-id="${lesson.id}">
                            <h3 class="lesson-title">${lesson.title}</h3>
                            <p class="lesson-description">${lesson.description || ''}</p>
                            <div class="lesson-meta">
                                <span class="lesson-difficulty">${lesson.difficulty || 'Intermediate'}</span>
                                <span class="lesson-duration">${lesson.duration || 30} min</span>
                            </div>
                            <div class="lesson-actions">
                                <button class="btn btn-primary start-lesson-btn" data-lesson-id="${lesson.id}">Start Lesson</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                html += '<p>No lessons available for this subject.</p>';
            }
            
            html += '</div>';
            container.html(html);
        },
        
        // Show subjects view
        showSubjects: function() {
            $('#ai-tutor-lessons-container').hide();
            $('#ai-tutor-subjects-container').show();
            this.data.currentSubject = null;
        },
        
        // Show lessons view
        showLessons: function() {
            if (this.data.currentSubject) {
                $('#ai-tutor-subjects-container').hide();
                $('#ai-tutor-lessons-container').show();
            }
        },
        
        // Chat functionality
        setupChat: function() {
            this.chatContainer = $('#ai-tutor-chat');
            this.messageInput = $('#ai-tutor-message-input');
            this.messagesContainer = $('#ai-tutor-messages');
            this.sendButton = $('#ai-tutor-send-message');
        },
        
        // Handle chat keypress
        handleChatKeypress: function(e) {
            if (e.which === 13) {
                this.sendChatMessage();
            }
        },
        
        // Send chat message
        sendChatMessage: function() {
            const message = this.messageInput.val().trim();
            if (!message) return;
            
            this.addChatMessage(message, true);
            this.messageInput.val('');
            this.showTypingIndicator();
            
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_chat',
                    message: message,
                    lesson_id: this.getCurrentLessonId(),
                    nonce: this.config.nonce
                },
                success: function(response) {
                    this.hideTypingIndicator();
                    if (response.success) {
                        this.addChatMessage(response.data.response, false);
                    } else {
                        this.addChatMessage('Sorry, I encountered an error. Please try again.', false);
                    }
                }.bind(this),
                error: function() {
                    this.hideTypingIndicator();
                    this.addChatMessage('Connection error. Please check your internet connection.', false);
                }.bind(this)
            });
        },
        
        // Add message to chat
        addChatMessage: function(message, isUser) {
            const messageClass = isUser ? 'user-message' : 'ai-message';
            const messageHtml = `
                <div class="ai-tutor-message ${messageClass}">
                    <div class="message-content">${this.escapeHtml(message)}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            
            this.messagesContainer.append(messageHtml);
            this.scrollChatToBottom();
        },
        
        // Show typing indicator
        showTypingIndicator: function() {
            const typingHtml = `
                <div class="ai-tutor-message ai-message typing-indicator" id="typing-indicator">
                    <div class="message-content">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `;
            this.messagesContainer.append(typingHtml);
            this.scrollChatToBottom();
        },
        
        // Hide typing indicator
        hideTypingIndicator: function() {
            $('#typing-indicator').remove();
        },
        
        // Scroll chat to bottom
        scrollChatToBottom: function() {
            if (this.messagesContainer.length) {
                this.messagesContainer.scrollTop(this.messagesContainer[0].scrollHeight);
            }
        },
        
        // Content generation
        setupContentGeneration: function() {
            // Initialize content generation functionality
        },
        
        // Generate content
        generateContent: function(e) {
            e.preventDefault();
            const lessonId = $(e.currentTarget).data('lesson-id');
            
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_generate_content',
                    lesson_id: lessonId,
                    nonce: this.config.nonce
                },
                success: function(response) {
                    if (response.success) {
                        this.displayGeneratedContent(response.data);
                    } else {
                        this.showError('Failed to generate content: ' + response.data);
                    }
                }.bind(this),
                error: function() {
                    this.showError('Connection error while generating content.');
                }.bind(this)
            });
        },
        
        // Generate questions
        generateQuestions: function(e) {
            e.preventDefault();
            const lessonId = $(e.currentTarget).data('lesson-id');
            const type = $(e.currentTarget).data('type') || 'multiple_choice';
            const difficulty = $(e.currentTarget).data('difficulty') || 'intermediate';
            const count = $(e.currentTarget).data('count') || 5;
            
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_generate_questions',
                    lesson_id: lessonId,
                    type: type,
                    difficulty: difficulty,
                    count: count,
                    nonce: this.config.nonce
                },
                success: function(response) {
                    if (response.success) {
                        this.displayQuestions(response.data);
                    } else {
                        this.showError('Failed to generate questions: ' + response.data);
                    }
                }.bind(this),
                error: function() {
                    this.showError('Connection error while generating questions.');
                }.bind(this)
            });
        },
        
        // Generate examples
        generateExamples: function(e) {
            e.preventDefault();
            const lessonId = $(e.currentTarget).data('lesson-id');
            
            $.ajax({
                url: this.config.apiUrl,
                type: 'POST',
                data: {
                    action: 'ai_tutor_generate_examples',
                    lesson_id: lessonId,
                    nonce: this.config.nonce
                },
                success: function(response) {
                    if (response.success) {
                        this.displayExamples(response.data);
                    } else {
                        this.showError('Failed to generate examples: ' + response.data);
                    }
                }.bind(this),
                error: function() {
                    this.showError('Connection error while generating examples.');
                }.bind(this)
            });
        },
        
        // Display generated content
        displayGeneratedContent: function(content) {
            const container = $('#ai-generated-content');
            if (container.length) {
                container.html(content);
                container.show();
            }
        },
        
        // Display questions
        displayQuestions: function(questions) {
            const container = $('#ai-generated-questions');
            if (container.length && questions.length > 0) {
                let html = '<div class="ai-questions-list">';
                questions.forEach((question, index) => {
                    html += `
                        <div class="ai-question" data-question-id="${index}">
                            <h4>Question ${index + 1}</h4>
                            <p>${question.question}</p>
                            <div class="question-options">
                    `;
                    
                    if (question.options && question.options.length > 0) {
                        question.options.forEach((option, optIndex) => {
                            html += `
                                <label>
                                    <input type="radio" name="question_${index}" value="${optIndex}">
                                    ${option}
                                </label>
                            `;
                        });
                    }
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                html += '<button class="btn btn-primary check-answers-btn">Check Answers</button>';
                
                container.html(html);
                container.show();
            }
        },
        
        // Display examples
        displayExamples: function(examples) {
            const container = $('#ai-generated-examples');
            if (container.length && examples.length > 0) {
                let html = '<div class="ai-examples-list">';
                examples.forEach((example, index) => {
                    html += `
                        <div class="ai-example">
                            <h4>Example ${index + 1}</h4>
                            <p><strong>Problem:</strong> ${example.problem}</p>
                            <p><strong>Solution:</strong> ${example.solution}</p>
                            <p><strong>Explanation:</strong> ${example.explanation}</p>
                        </div>
                    `;
                });
                html += '</div>';
                
                container.html(html);
                container.show();
            }
        },
        
        // Submit quiz
        submitQuiz: function(e) {
            e.preventDefault();
            // Implementation for quiz submission
        },
        
        // Check answers
        checkAnswers: function(e) {
            e.preventDefault();
            // Implementation for answer checking
        },
        
        // Utility functions
        getCurrentLessonId: function() {
            return $('#ai-tutor-app').data('lesson-id') || null;
        },
        
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        showError: function(message) {
            console.error('AI Tutor Error:', message);
            // You can implement a proper error display here
            alert(message);
        },
        
        showSuccess: function(message) {
            console.log('AI Tutor Success:', message);
            // You can implement a proper success display here
        }
    };
    
    // Initialize the AI Tutor when DOM is ready
    window.AITutor.init();
});