<?php
/**
 * Template for AI Tutor Dashboard
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$user_id = get_current_user_id();
$subjects = get_posts(array(
    'post_type' => 'ai_subject',
    'post_status' => 'publish',
    'numberposts' => -1,
    'orderby' => 'title',
    'order' => 'ASC'
));

// Get user progress if logged in
$user_progress = array();
if ($user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ai_tutor_user_progress';
    $progress_data = $wpdb->get_results($wpdb->prepare(
        "SELECT subject_id, completed_lessons, total_lessons, last_activity FROM $table_name WHERE user_id = %d",
        $user_id
    ));
    
    foreach ($progress_data as $progress) {
        $user_progress[$progress->subject_id] = $progress;
    }
}
?>

<div class="ai-tutor-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
        <div class="welcome-section">
            <h1 class="dashboard-title">🎓 AI Tutor Dashboard</h1>
            <?php if ($user_id): ?>
                <p class="welcome-text">Welcome back, <?php echo esc_html(wp_get_current_user()->display_name); ?>!</p>
            <?php else: ?>
                <p class="welcome-text">Welcome to your AI-powered learning platform!</p>
            <?php endif; ?>
        </div>
        
        <!-- Quick Stats -->
        <?php if ($user_id && !empty($user_progress)): ?>
            <div class="quick-stats">
                <div class="stat-item">
                    <div class="stat-number"><?php echo count($user_progress); ?></div>
                    <div class="stat-label">Subjects Started</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">
                        <?php 
                        $total_completed = array_sum(array_column($user_progress, 'completed_lessons'));
                        echo $total_completed;
                        ?>
                    </div>
                    <div class="stat-label">Lessons Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">
                        <?php 
                        $total_progress = 0;
                        $subject_count = 0;
                        foreach ($user_progress as $progress) {
                            if ($progress->total_lessons > 0) {
                                $total_progress += ($progress->completed_lessons / $progress->total_lessons) * 100;
                                $subject_count++;
                            }
                        }
                        echo $subject_count > 0 ? round($total_progress / $subject_count) : 0;
                        ?>%
                    </div>
                    <div class="stat-label">Average Progress</div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- Main Content -->
    <div class="dashboard-content">
        <!-- Subjects Grid -->
        <div class="subjects-section">
            <h2 class="section-title">📚 Available Subjects</h2>
            
            <?php if (empty($subjects)): ?>
                <div class="empty-state">
                    <div class="empty-icon">📖</div>
                    <h3>No Subjects Available</h3>
                    <p>Subjects will appear here once they are created by an administrator.</p>
                </div>
            <?php else: ?>
                <div class="subjects-grid">
                    <?php foreach ($subjects as $subject): ?>
                        <?php
                        $subject_id = $subject->ID;
                        $subject_progress = isset($user_progress[$subject_id]) ? $user_progress[$subject_id] : null;
                        $progress_percentage = 0;
                        
                        if ($subject_progress && $subject_progress->total_lessons > 0) {
                            $progress_percentage = ($subject_progress->completed_lessons / $subject_progress->total_lessons) * 100;
                        }
                        
                        // Get lessons count
                        $lessons_count = wp_count_posts('ai_lesson')->publish ?? 0;
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
                        ?>
                        
                        <div class="subject-card" data-subject-id="<?php echo esc_attr($subject_id); ?>">
                            <div class="subject-header" style="background-color: <?php echo esc_attr($subject_color); ?>;">
                                <div class="subject-icon"><?php echo esc_html($subject_icon); ?></div>
                                <h3 class="subject-title"><?php echo esc_html($subject->post_title); ?></h3>
                            </div>
                            
                            <div class="subject-body">
                                <p class="subject-description"><?php echo esc_html($subject->post_content); ?></p>
                                
                                <div class="subject-stats">
                                    <div class="stat">
                                        <span class="stat-label">Lessons:</span>
                                        <span class="stat-value"><?php echo $lessons_count; ?></span>
                                    </div>
                                    <?php if ($subject_progress): ?>
                                        <div class="stat">
                                            <span class="stat-label">Completed:</span>
                                            <span class="stat-value"><?php echo $subject_progress->completed_lessons; ?>/<?php echo $subject_progress->total_lessons; ?></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                
                                <?php if ($progress_percentage > 0): ?>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: <?php echo $progress_percentage; ?>%; background-color: <?php echo esc_attr($subject_color); ?>;"></div>
                                    </div>
                                    <div class="progress-text"><?php echo round($progress_percentage); ?>% Complete</div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="subject-actions">
                                <?php if ($lessons_count > 0): ?>
                                    <button class="btn btn-primary view-lessons-btn" data-subject-id="<?php echo esc_attr($subject_id); ?>">
                                        <?php echo $progress_percentage > 0 ? 'Continue Learning' : 'Start Learning'; ?>
                                    </button>
                                <?php else: ?>
                                    <button class="btn btn-secondary" disabled>
                                        No Lessons Available
                                    </button>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Recent Activity (if user is logged in) -->
        <?php if ($user_id): ?>
            <div class="activity-section">
                <h2 class="section-title">📈 Recent Activity</h2>
                
                <?php
                // Get recent chat messages or activity
                global $wpdb;
                $chat_table = $wpdb->prefix . 'ai_tutor_chat_messages';
                $recent_activity = $wpdb->get_results($wpdb->prepare(
                    "SELECT cm.*, p.post_title as lesson_title FROM $chat_table cm 
                     LEFT JOIN {$wpdb->posts} p ON cm.lesson_id = p.ID 
                     WHERE cm.user_id = %d 
                     ORDER BY cm.timestamp DESC 
                     LIMIT 5",
                    $user_id
                ));
                ?>
                
                <?php if (empty($recent_activity)): ?>
                    <div class="empty-activity">
                        <p>Start learning to see your recent activity here!</p>
                    </div>
                <?php else: ?>
                    <div class="activity-list">
                        <?php foreach ($recent_activity as $activity): ?>
                            <div class="activity-item">
                                <div class="activity-icon">💬</div>
                                <div class="activity-content">
                                    <div class="activity-title">Chat in "<?php echo esc_html($activity->lesson_title); ?>"</div>
                                    <div class="activity-message"><?php echo esc_html(wp_trim_words($activity->message, 10)); ?></div>
                                    <div class="activity-time"><?php echo human_time_diff(strtotime($activity->timestamp), current_time('timestamp')); ?> ago</div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Lessons Modal -->
    <div id="lessons-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Subject Lessons</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div id="lessons-list"></div>
            </div>
        </div>
    </div>
</div>

<style>
.ai-tutor-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.dashboard-title {
    margin: 0 0 8px 0;
    font-size: 36px;
    font-weight: 700;
}

.welcome-text {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
}

.quick-stats {
    display: flex;
    gap: 24px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    min-width: 80px;
}

.stat-number {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.dashboard-content {
    display: grid;
    gap: 40px;
}

.section-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.subjects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
}

.subject-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
}

.subject-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.subject-header {
    padding: 24px;
    color: white;
    text-align: center;
    position: relative;
}

.subject-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.subject-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.subject-body {
    padding: 24px;
}

.subject-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.subject-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 14px;
}

.stat {
    display: flex;
    gap: 4px;
}

.stat-label {
    color: #666;
}

.stat-value {
    font-weight: 600;
    color: #333;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 12px;
    color: #666;
    text-align: center;
}

.subject-actions {
    padding: 20px 24px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.btn {
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    cursor: not-allowed;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-icon {
    font-size: 72px;
    margin-bottom: 20px;
}

.empty-state h3 {
    margin: 0 0 12px 0;
    color: #333;
}

.activity-section {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-activity {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #007bff;
}

.activity-icon {
    font-size: 20px;
    flex-shrink: 0;
}

.activity-content {
    flex: 1;
}

.activity-title {
    font-weight: 600;
    margin-bottom: 4px;
    color: #333;
}

.activity-message {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
}

.activity-time {
    font-size: 12px;
    color: #999;
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
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }
    
    .quick-stats {
        width: 100%;
        justify-content: center;
    }
    
    .subjects-grid {
        grid-template-columns: 1fr;
    }
    
    .dashboard-title {
        font-size: 28px;
    }
    
    .ai-tutor-dashboard {
        padding: 15px;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('lessons-modal');
    const modalTitle = document.getElementById('modal-title');
    const lessonsList = document.getElementById('lessons-list');
    const modalClose = document.querySelector('.modal-close');

    // View lessons buttons
    document.querySelectorAll('.view-lessons-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectId = this.dataset.subjectId;
            loadSubjectLessons(subjectId);
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

    function loadSubjectLessons(subjectId) {
        // Show modal
        modal.style.display = 'flex';
        modalTitle.textContent = 'Loading lessons...';
        lessonsList.innerHTML = '<div class="loading">Loading lessons...</div>';

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
                displayLessons(data.data.lessons, data.data.subject_title);
            } else {
                lessonsList.innerHTML = '<div class="error">Error loading lessons.</div>';
            }
        })
        .catch(error => {
            lessonsList.innerHTML = '<div class="error">Error loading lessons.</div>';
        });
    }

    function displayLessons(lessons, subjectTitle) {
        modalTitle.textContent = subjectTitle + ' - Lessons';
        
        if (lessons.length === 0) {
            lessonsList.innerHTML = '<div class="empty-lessons">No lessons available for this subject.</div>';
            return;
        }

        let html = '<div class="lessons-grid">';
        lessons.forEach(lesson => {
            html += `
                <div class="lesson-item">
                    <h4 class="lesson-title">${lesson.title}</h4>
                    <p class="lesson-excerpt">${lesson.excerpt}</p>
                    <div class="lesson-meta">
                        <span class="lesson-difficulty">${lesson.difficulty || 'Intermediate'}</span>
                        <span class="lesson-duration">${lesson.duration || 30} min</span>
                    </div>
                    <div class="lesson-actions">
                        <a href="#" class="btn btn-primary lesson-link" data-lesson-id="${lesson.id}">Start Lesson</a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        lessonsList.innerHTML = html;

        // Add click handlers for lesson links
        lessonsList.querySelectorAll('.lesson-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const lessonId = this.dataset.lessonId;
                // You can redirect to lesson page or load lesson content
                console.log('Load lesson:', lessonId);
            });
        });
    }
});
</script>