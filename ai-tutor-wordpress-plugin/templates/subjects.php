<?php
/**
 * Template for displaying AI Tutor subjects
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$subjects = get_posts(array(
    'post_type' => 'ai_subject',
    'post_status' => 'publish',
    'numberposts' => -1,
    'orderby' => 'title',
    'order' => 'ASC'
));
?>

<div class="ai-tutor-subjects">
    <div class="subjects-header">
        <h2 class="subjects-title">📚 Available Subjects</h2>
        <p class="subjects-description">Choose a subject to start your AI-powered learning journey</p>
    </div>

    <?php if (empty($subjects)): ?>
        <div class="empty-subjects">
            <div class="empty-icon">📖</div>
            <h3>No Subjects Available</h3>
            <p>Subjects will appear here once they are created by an administrator.</p>
        </div>
    <?php else: ?>
        <div class="subjects-grid">
            <?php foreach ($subjects as $subject): ?>
                <?php
                $subject_id = $subject->ID;
                
                // Get lessons count for this subject (check both meta keys for compatibility)
                $subject_lessons = get_posts(array(
                    'post_type' => 'ai_lesson',
                    'meta_query' => array(
                        'relation' => 'OR',
                        array(
                            'key' => '_ai_lesson_subject',
                            'value' => $subject_id,
                            'compare' => '='
                        ),
                        array(
                            'key' => '_ai_lesson_subject_id',
                            'value' => $subject_id,
                            'compare' => '='
                        )
                    ),
                    'post_status' => 'publish',
                    'numberposts' => -1
                ));
                $lessons_count = count($subject_lessons);
                
                // Get subject metadata
                $subject_color = get_post_meta($subject_id, '_ai_subject_color', true) ?: '#007cba';
                $subject_icon = get_post_meta($subject_id, '_ai_subject_icon', true) ?: '📚';
                $difficulty_levels = array('Beginner', 'Intermediate', 'Advanced');
                
                // Calculate average difficulty
                $difficulty_counts = array('Beginner' => 0, 'Intermediate' => 0, 'Advanced' => 0);
                foreach ($subject_lessons as $lesson) {
                    $lesson_difficulty = get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'Intermediate';
                    if (isset($difficulty_counts[$lesson_difficulty])) {
                        $difficulty_counts[$lesson_difficulty]++;
                    }
                }
                
                $primary_difficulty = 'Intermediate';
                if ($lessons_count > 0) {
                    $max_count = max($difficulty_counts);
                    foreach ($difficulty_counts as $level => $count) {
                        if ($count === $max_count) {
                            $primary_difficulty = $level;
                            break;
                        }
                    }
                }
                ?>
                
                <div class="subject-card" data-subject-id="<?php echo esc_attr($subject_id); ?>">
                    <div class="subject-header" style="background: linear-gradient(135deg, <?php echo esc_attr($subject_color); ?> 0%, <?php echo esc_attr($subject_color); ?>cc 100%);">
                        <div class="subject-icon"><?php echo esc_html($subject_icon); ?></div>
                        <h3 class="subject-title"><?php echo esc_html($subject->post_title); ?></h3>
                    </div>
                    
                    <div class="subject-body">
                        <p class="subject-description"><?php echo esc_html(wp_trim_words($subject->post_content, 20)); ?></p>
                        
                        <div class="subject-meta">
                            <div class="meta-item">
                                <span class="meta-icon">📖</span>
                                <span class="meta-text"><?php echo $lessons_count; ?> Lesson<?php echo $lessons_count !== 1 ? 's' : ''; ?></span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">📊</span>
                                <span class="meta-text"><?php echo esc_html($primary_difficulty); ?></span>
                            </div>
                        </div>
                        
                        <?php if ($lessons_count > 0): ?>
                            <div class="lesson-preview">
                                <h4 class="preview-title">Recent Lessons:</h4>
                                <ul class="lesson-list">
                                    <?php foreach (array_slice($subject_lessons, 0, 3) as $lesson): ?>
                                        <li class="lesson-item">
                                            <a href="#" class="lesson-link" data-lesson-id="<?php echo esc_attr($lesson->ID); ?>">
                                                <?php echo esc_html($lesson->post_title); ?>
                                            </a>
                                        </li>
                                    <?php endforeach; ?>
                                    <?php if ($lessons_count > 3): ?>
                                        <li class="lesson-item more-lessons">
                                            <span>and <?php echo $lessons_count - 3; ?> more...</span>
                                        </li>
                                    <?php endif; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="subject-actions">
                        <?php if ($lessons_count > 0): ?>
                            <button class="btn btn-primary explore-btn" data-subject-id="<?php echo esc_attr($subject_id); ?>">
                                <span class="btn-icon">🚀</span>
                                <span class="btn-text">Explore Subject</span>
                            </button>
                            <button class="btn btn-secondary lessons-btn" data-subject-id="<?php echo esc_attr($subject_id); ?>">
                                <span class="btn-icon">📋</span>
                                <span class="btn-text">View All Lessons</span>
                            </button>
                        <?php else: ?>
                            <button class="btn btn-disabled" disabled>
                                <span class="btn-icon">⏳</span>
                                <span class="btn-text">No Lessons Yet</span>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <!-- Subject Details Modal -->
    <div id="subject-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-subject-title">Subject Details</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div id="subject-details"></div>
            </div>
        </div>
    </div>
</div>

<style>
.ai-tutor-subjects {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subjects-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
}

.subjects-title {
    margin: 0 0 12px 0;
    font-size: 32px;
    font-weight: 700;
    color: #333;
}

.subjects-description {
    margin: 0;
    font-size: 16px;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
}

.empty-subjects {
    text-align: center;
    padding: 80px 20px;
    color: #666;
}

.empty-icon {
    font-size: 72px;
    margin-bottom: 20px;
}

.empty-subjects h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 24px;
}

.subjects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.subject-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
    position: relative;
}

.subject-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.subject-header {
    padding: 32px 24px;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.subject-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
}

.subject-icon {
    font-size: 56px;
    margin-bottom: 16px;
    display: block;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.subject-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.subject-body {
    padding: 24px;
}

.subject-description {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 15px;
}

.subject-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e9ecef;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
}

.meta-icon {
    font-size: 16px;
}

.meta-text {
    font-weight: 500;
}

.lesson-preview {
    margin-bottom: 20px;
}

.preview-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.lesson-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.lesson-item {
    margin-bottom: 8px;
}

.lesson-link {
    color: #007bff;
    text-decoration: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    padding: 6px 0;
    transition: color 0.2s ease;
}

.lesson-link::before {
    content: '▶';
    margin-right: 8px;
    font-size: 10px;
    opacity: 0.7;
}

.lesson-link:hover {
    color: #0056b3;
}

.more-lessons {
    color: #666;
    font-style: italic;
    font-size: 13px;
    padding: 6px 0;
}

.subject-actions {
    padding: 20px 24px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn {
    flex: 1;
    min-width: 120px;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-decoration: none;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.btn-secondary {
    background: white;
    color: #007bff;
    border: 2px solid #007bff;
}

.btn-secondary:hover {
    background: #007bff;
    color: white;
}

.btn-disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
}

.btn-icon {
    font-size: 16px;
}

.btn-text {
    font-weight: 600;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 700px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
}

.modal-header {
    padding: 24px 28px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.modal-header h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #e9ecef;
    color: #333;
}

.modal-body {
    padding: 28px;
    max-height: 60vh;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .ai-tutor-subjects {
        padding: 15px;
    }
    
    .subjects-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    
    .subjects-title {
        font-size: 28px;
    }
    
    .subject-actions {
        flex-direction: column;
    }
    
    .btn {
        min-width: auto;
    }
    
    .subject-meta {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .subjects-header {
        padding: 30px 15px;
    }
    
    .subject-card {
        margin: 0 -5px;
    }
    
    .subjects-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('subject-modal');
    const modalTitle = document.getElementById('modal-subject-title');
    const subjectDetails = document.getElementById('subject-details');
    const modalClose = document.querySelector('.modal-close');

    // Explore subject buttons
    document.querySelectorAll('.explore-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectId = this.dataset.subjectId;
            showSubjectDetails(subjectId);
        });
    });

    // View lessons buttons
    document.querySelectorAll('.lessons-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectId = this.dataset.subjectId;
            showSubjectLessons(subjectId);
        });
    });

    // Lesson links
    document.querySelectorAll('.lesson-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lessonId = this.dataset.lessonId;
            // You can redirect to lesson page or load lesson content
            console.log('Load lesson:', lessonId);
        });
    });

    // Close modal
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function showSubjectDetails(subjectId) {
        modal.style.display = 'flex';
        modalTitle.textContent = 'Subject Details';
        subjectDetails.innerHTML = '<div class="loading">Loading subject details...</div>';

        // Fetch subject details
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'ai_tutor_get_subject_details',
                subject_id: subjectId,
                nonce: '<?php echo wp_create_nonce('ai_tutor_get_subject_details'); ?>'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySubjectDetails(data.data);
            } else {
                subjectDetails.innerHTML = '<div class="error">Error loading subject details.</div>';
            }
        })
        .catch(error => {
            subjectDetails.innerHTML = '<div class="error">Error loading subject details.</div>';
        });
    }

    function showSubjectLessons(subjectId) {
        modal.style.display = 'flex';
        modalTitle.textContent = 'Subject Lessons';
        subjectDetails.innerHTML = '<div class="loading">Loading lessons...</div>';

        // Fetch lessons
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'ai_tutor_get_lessons',
                subject_id: subjectId,
                nonce: '<?php echo wp_create_nonce('ai_tutor_get_lessons'); ?>'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySubjectLessons(data.data.lessons, data.data.subject_title);
            } else {
                subjectDetails.innerHTML = '<div class="error">Error loading lessons.</div>';
            }
        })
        .catch(error => {
            subjectDetails.innerHTML = '<div class="error">Error loading lessons.</div>';
        });
    }

    function displaySubjectDetails(subject) {
        modalTitle.textContent = subject.title;
        
        let html = `
            <div class="subject-detail">
                <div class="subject-detail-header">
                    <div class="subject-detail-icon">${subject.icon || '📚'}</div>
                    <h3>${subject.title}</h3>
                </div>
                <div class="subject-detail-content">
                    <p class="subject-full-description">${subject.description}</p>
                    <div class="subject-stats">
                        <div class="stat-box">
                            <div class="stat-number">${subject.lessons_count}</div>
                            <div class="stat-label">Lessons</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">${subject.difficulty}</div>
                            <div class="stat-label">Primary Level</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        subjectDetails.innerHTML = html;
    }

    function displaySubjectLessons(lessons, subjectTitle) {
        modalTitle.textContent = subjectTitle + ' - All Lessons';
        
        if (lessons.length === 0) {
            subjectDetails.innerHTML = '<div class="empty-lessons">No lessons available for this subject.</div>';
            return;
        }

        let html = '<div class="lessons-grid-modal">';
        lessons.forEach(lesson => {
            html += `
                <div class="lesson-item-modal">
                    <h4 class="lesson-title-modal">${lesson.title}</h4>
                    <p class="lesson-excerpt-modal">${lesson.excerpt}</p>
                    <div class="lesson-meta-modal">
                        <span class="lesson-difficulty-modal">${lesson.difficulty || 'Intermediate'}</span>
                        <span class="lesson-duration-modal">${lesson.duration || 30} min</span>
                    </div>
                    <div class="lesson-actions-modal">
                        <a href="#" class="btn btn-primary lesson-link-modal" data-lesson-id="${lesson.id}">Start Lesson</a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        subjectDetails.innerHTML = html;
    }
});
</script>