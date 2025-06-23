// AI Tutor WordPress Plugin JavaScript

(function($) {
    'use strict';

    window.AiTutor = {
        config: {
            subjectId: '',
            userId: 0,
            isVoiceEnabled: true
        },
        
        selectedSubject: null,
        selectedLesson: null,
        
        init: function(options) {
            this.config = Object.assign(this.config, options);
            this.bindEvents();
            this.loadSubjects();
            this.loadUserProgress();
            
            // Auto-select subject if provided
            if (this.config.subjectId) {
                setTimeout(() => {
                    this.selectSubject(this.config.subjectId);
                }, 500);
            }
        },
        
        bindEvents: function() {
            // Voice toggle
            $(document).on('click', '#voice-toggle', this.toggleVoice.bind(this));
            
            // Subject selection
            $(document).on('click', '.subject-item', this.handleSubjectClick.bind(this));
            
            // Lesson selection
            $(document).on('click', '.lesson-item', this.handleLessonClick.bind(this));
            
            // Chat
            $(document).on('click', '#send-chat', this.sendChatMessage.bind(this));
            $(document).on('keypress', '#chat-input', function(e) {
                if (e.which === 13) {
                    this.sendChatMessage();
                }
            }.bind(this));
            
            // Progress updates
            $(document).on('click', '.mark-complete-btn', this.markLessonComplete.bind(this));
        },
        
        loadSubjects: function() {
            this.showLoading('#subjects-list');
            
            fetch('/wp-json/ai-tutor/v1/subjects')
                .then(response => response.json())
                .then(data => {
                    this.renderSubjects(data);
                })
                .catch(error => {
                    console.error('Error loading subjects:', error);
                    this.showError('#subjects-list', 'Failed to load subjects');
                });
        },
        
        renderSubjects: function(subjects) {
            const container = $('#subjects-list');
            let html = '';
            
            subjects.forEach(subject => {
                html += `
                    <div class="subject-item" data-subject-id="${subject.id}">
                        <div class="subject-item-icon" style="background-color: ${subject.color}">
                            ${subject.icon}
                        </div>
                        <div>
                            <strong>${subject.name}</strong>
                            <br><small>${subject.description}</small>
                        </div>
                    </div>
                `;
            });
            
            container.html(html);
        },
        
        handleSubjectClick: function(e) {
            const subjectId = $(e.currentTarget).data('subject-id');
            this.selectSubject(subjectId);
        },
        
        selectSubject: function(subjectId) {
            // Update UI
            $('.subject-item').removeClass('selected');
            $(`.subject-item[data-subject-id="${subjectId}"]`).addClass('selected');
            
            // Load lessons
            this.loadLessons(subjectId);
            
            // Update avatar message
            const subjectName = $(`.subject-item[data-subject-id="${subjectId}"] strong`).text();
            this.updateAvatarMessage(`Great choice! Let's explore ${subjectName} together.`);
            
            // Show lessons container
            $('#lessons-container').show();
            
            this.selectedSubject = subjectId;
        },
        
        loadLessons: function(subjectId) {
            this.showLoading('#lessons-list');
            $('#lessons-title').text('Loading lessons...');
            
            fetch(`/wp-json/ai-tutor/v1/subjects/${subjectId}/lessons`)
                .then(response => response.json())
                .then(data => {
                    this.renderLessons(data, subjectId);
                })
                .catch(error => {
                    console.error('Error loading lessons:', error);
                    this.showError('#lessons-list', 'Failed to load lessons');
                });
        },
        
        renderLessons: function(lessons, subjectId) {
            const container = $('#lessons-list');
            const subjectName = $(`.subject-item[data-subject-id="${subjectId}"] strong`).text();
            
            $('#lessons-title').text(`${subjectName} Lessons`);
            
            let html = '';
            
            if (lessons.length === 0) {
                html = '<p>No lessons available for this subject.</p>';
            } else {
                lessons.forEach(lesson => {
                    html += `
                        <div class="lesson-item" data-lesson-id="${lesson.id}">
                            <h4>${lesson.title}</h4>
                            <p>${lesson.description}</p>
                            <div class="lesson-meta">
                                <span>Lesson ${lesson.order}</span>
                                <span>${lesson.estimatedDuration} min</span>
                            </div>
                        </div>
                    `;
                });
            }
            
            container.html(html);
        },
        
        handleLessonClick: function(e) {
            const lessonId = $(e.currentTarget).data('lesson-id');
            this.selectLesson(lessonId);
        },
        
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