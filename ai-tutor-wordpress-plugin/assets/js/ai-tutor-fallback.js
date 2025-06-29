/**
 * AI Tutor Fallback Navigation - Simple version without complex AJAX
 * This version provides basic functionality when AJAX calls fail
 */

class AITutorFallback {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('AI Tutor Fallback: Initializing simple navigation');
        this.setupBasicEventListeners();
    }
    
    setupBasicEventListeners() {
        // Handle subject card clicks with basic functionality
        jQuery(document).on('click', '.subject-card', (e) => {
            e.preventDefault();
            const subjectId = jQuery(e.currentTarget).data('subject-id');
            this.showBasicSubjectInfo(subjectId);
        });
        
        // Handle lesson clicks
        jQuery(document).on('click', '.lesson-link, .lesson-card', (e) => {
            e.preventDefault();
            const lessonId = jQuery(e.currentTarget).data('lesson-id');
            this.showBasicLessonInfo(lessonId);
        });
        
        // Handle explore/lessons buttons
        jQuery(document).on('click', '.explore-btn, .lessons-btn', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const subjectId = jQuery(e.currentTarget).data('subject-id');
            this.showSubjectLessons(subjectId);
        });
    }
    
    showBasicSubjectInfo(subjectId) {
        const subjectCard = jQuery(`[data-subject-id="${subjectId}"]`);
        const subjectTitle = subjectCard.find('.subject-title').text();
        const subjectDescription = subjectCard.find('.subject-description').text();
        
        this.showModal('Subject Details', `
            <h3>${subjectTitle}</h3>
            <p>${subjectDescription}</p>
            <p><strong>Subject ID:</strong> ${subjectId}</p>
            <p><em>Note: Full subject details require proper WordPress AJAX configuration.</em></p>
        `);
    }
    
    showSubjectLessons(subjectId) {
        const subjectCard = jQuery(`[data-subject-id="${subjectId}"]`);
        const subjectTitle = subjectCard.find('.subject-title').text();
        const lessonLinks = subjectCard.find('.lesson-link');
        
        let lessonsHtml = '<h3>Lessons for ' + subjectTitle + '</h3>';
        
        if (lessonLinks.length > 0) {
            lessonsHtml += '<ul>';
            lessonLinks.each(function() {
                const lessonTitle = jQuery(this).text();
                const lessonId = jQuery(this).data('lesson-id');
                lessonsHtml += `<li><a href="#" onclick="aiTutorFallback.showBasicLessonInfo(${lessonId})">${lessonTitle}</a></li>`;
            });
            lessonsHtml += '</ul>';
        } else {
            lessonsHtml += '<p>No lessons found for this subject.</p>';
        }
        
        lessonsHtml += '<p><em>Note: Full lesson functionality requires proper WordPress AJAX configuration.</em></p>';
        
        this.showModal('Subject Lessons', lessonsHtml);
    }
    
    showBasicLessonInfo(lessonId) {
        this.showModal('Lesson Information', `
            <h3>Lesson ID: ${lessonId}</h3>
            <p>This lesson would normally load with full AI-powered content.</p>
            <p><strong>Available Features:</strong></p>
            <ul>
                <li>AI-generated lesson content</li>
                <li>Interactive chat with AI tutor</li>
                <li>Dynamic question generation</li>
                <li>Progress tracking</li>
            </ul>
            <p><em>Note: Full lesson functionality requires proper WordPress AJAX configuration and backend connectivity.</em></p>
        `);
    }
    
    showModal(title, content) {
        // Remove existing modal if any
        jQuery('#ai-tutor-fallback-modal').remove();
        
        const modalHtml = `
            <div id="ai-tutor-fallback-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            ">
                <div style="
                    background: white; padding: 30px; border-radius: 10px;
                    max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #333;">${title}</h2>
                        <button onclick="jQuery('#ai-tutor-fallback-modal').remove()" style="
                            background: none; border: none; font-size: 24px; cursor: pointer;
                            width: 30px; height: 30px; display: flex; align-items: center;
                            justify-content: center; border-radius: 50%; color: #666;
                        ">&times;</button>
                    </div>
                    <div style="color: #555; line-height: 1.6;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        jQuery('body').append(modalHtml);
        
        // Close on background click
        jQuery('#ai-tutor-fallback-modal').on('click', function(e) {
            if (e.target === this) {
                jQuery(this).remove();
            }
        });
    }
    
    showError(message) {
        this.showModal('Error', `
            <p style="color: #d32f2f;">${message}</p>
            <p><em>Please check the troubleshooting guide for common solutions.</em></p>
        `);
    }
}

// Initialize fallback navigation when DOM is ready
jQuery(document).ready(function() {
    // Only initialize if the main navigation isn't working
    window.aiTutorFallback = new AITutorFallback();
    
    // Check if main navigation is working
    setTimeout(function() {
        if (typeof window.aiTutorNavigation === 'undefined' || !window.aiTutorNavigation) {
            console.log('AI Tutor: Using fallback navigation mode');
        }
    }, 1000);
});