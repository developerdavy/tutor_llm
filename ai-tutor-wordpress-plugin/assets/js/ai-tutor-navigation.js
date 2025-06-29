/**
 * AI Tutor Navigation System
 * Handles subject browsing, lesson selection, and AI content integration
 */

class AITutorNavigation {
    constructor() {
        this.apiUrl = aiTutorAjax.ajaxurl;
        this.nonce = aiTutorAjax.nonce;
        this.currentPage = 'subjects';
        this.selectedSubject = null;
        this.selectedLesson = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSubjects();
    }
    
    setupEventListeners() {
        // Subject card clicks
        jQuery(document).on('click', '.subject-card', (e) => {
            e.preventDefault();
            const subjectId = jQuery(e.currentTarget).data('subject-id');
            this.selectSubject(subjectId);
        });
        
        // Explore subject button
        jQuery(document).on('click', '.explore-btn', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const subjectId = jQuery(e.currentTarget).data('subject-id');
            this.showSubjectLessons(subjectId);
        });
        
        // View all lessons button
        jQuery(document).on('click', '.lessons-btn', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const subjectId = jQuery(e.currentTarget).data('subject-id');
            this.showSubjectLessons(subjectId);
        });
        
        // Lesson clicks
        jQuery(document).on('click', '.lesson-item a, .lesson-card', (e) => {
            e.preventDefault();
            const lessonId = jQuery(e.currentTarget).data('lesson-id');
            if (lessonId) {
                this.selectLesson(lessonId);
            }
        });
        
        // Back to subjects button
        jQuery(document).on('click', '.back-to-subjects', (e) => {
            e.preventDefault();
            this.showSubjects();
        });
        
        // Back to lessons button
        jQuery(document).on('click', '.back-to-lessons', (e) => {
            e.preventDefault();
            if (this.selectedSubject) {
                this.showSubjectLessons(this.selectedSubject.id);
            }
        });
    }
    
    async loadSubjects() {
        try {
            const response = await this.callAjax('get_subjects', {});
            if (response.success && response.data) {
                this.renderSubjects(response.data);
            } else {
                this.showError('Failed to load subjects');
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showError('Error loading subjects');
        }
    }
    
    async selectSubject(subjectId) {
        try {
            const response = await this.callAjax('get_subject', { subject_id: subjectId });
            if (response.success && response.data) {
                this.selectedSubject = response.data;
                this.showSubjectDetails(response.data);
            } else {
                this.showError('Failed to load subject details');
            }
        } catch (error) {
            console.error('Error loading subject:', error);
            this.showError('Error loading subject');
        }
    }
    
    async showSubjectLessons(subjectId) {
        try {
            const response = await this.callAjax('get_subject_lessons', { subject_id: subjectId });
            if (response.success && response.data) {
                this.renderLessonsPage(response.data.subject, response.data.lessons);
            } else {
                this.showError('Failed to load lessons');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            this.showError('Error loading lessons');
        }
    }
    
    async selectLesson(lessonId) {
        try {
            // Show loading state
            this.showLoading('Loading AI-powered lesson...');
            
            const response = await this.callAjax('get_lesson', { lesson_id: lessonId });
            if (response.success && response.data) {
                this.selectedLesson = response.data;
                this.showAILesson(response.data);
            } else {
                this.showError('Failed to load lesson');
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            this.showError('Error loading lesson');
        }
    }
    
    renderSubjects(subjects) {
        const container = jQuery('.ai-tutor-subjects, .subjects-grid').first();
        if (!container.length) return;
        
        this.currentPage = 'subjects';
        
        // If we're not in the subjects template, redirect to a proper subjects page
        if (!jQuery('.ai-tutor-subjects').length) {
            this.createSubjectsPage(subjects);
        }
    }
    
    createSubjectsPage(subjects) {
        const html = `
            <div class="ai-tutor-subjects">
                <div class="subjects-header">
                    <h2 class="subjects-title">📚 Available Subjects</h2>
                    <p class="subjects-description">Choose a subject to start your AI-powered learning journey</p>
                </div>
                <div class="subjects-grid">
                    ${subjects.map(subject => this.createSubjectCard(subject)).join('')}
                </div>
            </div>
        `;
        
        jQuery('.ai-tutor-content, #ai-tutor-app').html(html);
    }
    
    createSubjectCard(subject) {
        const lessonsCount = subject.lessons_count || 0;
        const icon = subject.icon || '📚';
        const color = subject.color || '#007cba';
        
        return `
            <div class="subject-card" data-subject-id="${subject.id}">
                <div class="subject-header" style="background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);">
                    <div class="subject-icon">${icon}</div>
                    <h3 class="subject-title">${subject.title}</h3>
                </div>
                
                <div class="subject-body">
                    <p class="subject-description">${subject.description || ''}</p>
                    
                    <div class="subject-meta">
                        <div class="meta-item">
                            <span class="meta-icon">📖</span>
                            <span class="meta-text">${lessonsCount} Lesson${lessonsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">📊</span>
                            <span class="meta-text">${subject.difficulty || 'Mixed'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="subject-actions">
                    ${lessonsCount > 0 ? `
                        <button class="btn btn-primary explore-btn" data-subject-id="${subject.id}">
                            <span class="btn-icon">🚀</span>
                            <span class="btn-text">Explore Subject</span>
                        </button>
                        <button class="btn btn-secondary lessons-btn" data-subject-id="${subject.id}">
                            <span class="btn-icon">📋</span>
                            <span class="btn-text">View All Lessons</span>
                        </button>
                    ` : `
                        <button class="btn btn-disabled" disabled>
                            <span class="btn-icon">⏳</span>
                            <span class="btn-text">No Lessons Yet</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    }
    
    renderLessonsPage(subject, lessons) {
        this.currentPage = 'lessons';
        this.selectedSubject = subject;
        
        const html = `
            <div class="ai-tutor-lessons">
                <div class="lessons-header">
                    <div class="navigation-breadcrumb">
                        <button class="btn btn-link back-to-subjects">
                            <span class="btn-icon">←</span>
                            <span class="btn-text">Back to Subjects</span>
                        </button>
                        <span class="breadcrumb-separator">></span>
                        <span class="current-subject">${subject.title}</span>
                    </div>
                    
                    <div class="subject-info">
                        <div class="subject-icon-large">${subject.icon || '📚'}</div>
                        <div class="subject-details">
                            <h2 class="subject-title">${subject.title}</h2>
                            <p class="subject-description">${subject.description || ''}</p>
                            <div class="subject-stats">
                                <span class="stat-item">${lessons.length} Lessons</span>
                                <span class="stat-item">${subject.difficulty || 'Mixed'} Level</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="lessons-grid">
                    ${lessons.map(lesson => this.createLessonCard(lesson)).join('')}
                </div>
            </div>
        `;
        
        jQuery('.ai-tutor-content, #ai-tutor-app').html(html);
    }
    
    createLessonCard(lesson) {
        const difficulty = lesson.difficulty || 'intermediate';
        const duration = lesson.duration || 30;
        
        return `
            <div class="lesson-card" data-lesson-id="${lesson.id}">
                <div class="lesson-header">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <div class="lesson-badges">
                        <span class="badge badge-${difficulty}">${difficulty}</span>
                        <span class="badge badge-duration">${duration} min</span>
                    </div>
                </div>
                
                <div class="lesson-body">
                    <p class="lesson-description">${lesson.description || ''}</p>
                </div>
                
                <div class="lesson-actions">
                    <button class="btn btn-primary start-lesson-btn" data-lesson-id="${lesson.id}">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">Start AI Lesson</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    showAILesson(lesson) {
        this.currentPage = 'lesson';
        this.selectedLesson = lesson;
        
        // Redirect to the AI lesson shortcode or create the lesson interface
        const aiLessonUrl = this.createAILessonUrl(lesson.id);
        if (aiLessonUrl) {
            window.location.href = aiLessonUrl;
        } else {
            this.createAILessonInterface(lesson);
        }
    }
    
    createAILessonUrl(lessonId) {
        // Try to find a page with the AI lesson shortcode
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('?')[0];
        
        // Add lesson_id parameter for AI lesson shortcode
        return `${baseUrl}?ai_lesson=${lessonId}`;
    }
    
    createAILessonInterface(lesson) {
        const html = `
            <div class="ai-tutor-ai-lesson" data-lesson-id="${lesson.id}">
                <div class="lesson-navigation">
                    <button class="btn btn-link back-to-lessons">
                        <span class="btn-icon">←</span>
                        <span class="btn-text">Back to Lessons</span>
                    </button>
                    <span class="breadcrumb-separator">></span>
                    <span class="current-lesson">${lesson.title}</span>
                </div>
                
                <div class="ai-lesson-container">
                    <div class="lesson-panel">
                        <h2>${lesson.title}</h2>
                        <div class="lesson-content">${lesson.content || 'Loading AI-generated content...'}</div>
                        
                        <div class="ai-controls">
                            <button class="btn btn-primary generate-content-btn" data-lesson-id="${lesson.id}">
                                📝 Generate Content
                            </button>
                            <button class="btn btn-secondary generate-questions-btn" data-lesson-id="${lesson.id}">
                                ❓ Generate Questions
                            </button>
                        </div>
                    </div>
                    
                    <div class="chat-panel">
                        <div class="chat-header">
                            <h3>🤖 AI Tutor Chat</h3>
                        </div>
                        <div class="chat-messages" id="chat-messages">
                            <div class="chat-message ai-message">
                                <div class="message-content">
                                    <p>Hello! I'm your AI tutor for <strong>${lesson.title}</strong>. Ask me anything about this lesson!</p>
                                </div>
                            </div>
                        </div>
                        <form class="ai-chat-form">
                            <div class="chat-input-container">
                                <textarea class="ai-chat-input" placeholder="Ask me anything about this lesson..." rows="1"></textarea>
                                <button type="submit" class="chat-send-btn">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        jQuery('.ai-tutor-content, #ai-tutor-app').html(html);
        
        // Initialize the AI chat for this lesson
        if (window.AITutorRealtime) {
            new AITutorRealtime();
        }
    }
    
    showSubjects() {
        this.currentPage = 'subjects';
        this.selectedSubject = null;
        this.selectedLesson = null;
        this.loadSubjects();
    }
    
    showLoading(message = 'Loading...') {
        const html = `
            <div class="ai-tutor-loading">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        jQuery('.ai-tutor-content, #ai-tutor-app').html(html);
    }
    
    showError(message) {
        const html = `
            <div class="ai-tutor-error">
                <div class="error-icon">⚠️</div>
                <p class="error-message">${message}</p>
                <button class="btn btn-primary retry-btn" onclick="location.reload()">Try Again</button>
            </div>
        `;
        jQuery('.ai-tutor-content, #ai-tutor-app').html(html);
    }
    
    async callAjax(action, data) {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: this.apiUrl,
                type: 'POST',
                data: {
                    action: `ai_tutor_${action}`,
                    nonce: this.nonce,
                    ...data
                },
                success: resolve,
                error: reject
            });
        });
    }
}

// Initialize navigation when DOM is ready
jQuery(document).ready(function() {
    if (typeof aiTutorAjax !== 'undefined') {
        window.aiTutorNavigation = new AITutorNavigation();
    }
});