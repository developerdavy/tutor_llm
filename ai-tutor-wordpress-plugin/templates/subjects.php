<?php
// Subjects template
$subjects = get_posts(array(
    'post_type' => 'ai_subject',
    'numberposts' => -1,
    'post_status' => 'publish'
));

$show_progress = $atts['show_progress'] === 'true';
?>

<div id="ai-tutor-subjects" class="ai-tutor-container">
    <div class="ai-tutor-header">
        <h1>Subjects</h1>
        <p>Explore all available subjects and track your learning progress</p>
    </div>

    <div class="ai-tutor-subjects-grid">
        <?php foreach ($subjects as $subject): 
            $icon = get_post_meta($subject->ID, '_ai_subject_icon', true);
            $color = get_post_meta($subject->ID, '_ai_subject_color', true);
            $description = get_post_meta($subject->ID, '_ai_subject_description', true);
            
            // Get lesson count
            $lessons = get_posts(array(
                'post_type' => 'ai_lesson',
                'numberposts' => -1,
                'post_status' => 'publish',
                'meta_query' => array(
                    array(
                        'key' => '_ai_lesson_subject_id',
                        'value' => $subject->ID,
                        'compare' => '='
                    )
                )
            ));
            $lesson_count = count($lessons);
            
            // Get user progress if logged in
            $progress = 0;
            $completed_lessons = 0;
            if (is_user_logged_in() && $show_progress) {
                global $wpdb;
                $table_name = $wpdb->prefix . 'ai_tutor_user_progress';
                $user_id = get_current_user_id();
                
                $progress_data = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM $table_name WHERE user_id = %d AND subject_id = %d",
                    $user_id, $subject->ID
                ));
                
                if ($progress_data) {
                    $completed_lessons = count(array_filter($progress_data, function($p) {
                        return $p->completed;
                    }));
                    $progress = $lesson_count > 0 ? round(($completed_lessons / $lesson_count) * 100) : 0;
                }
            }
        ?>
        <div class="ai-tutor-subject-card" data-subject-id="<?php echo $subject->ID; ?>">
            <div class="subject-header">
                <div class="subject-icon" style="background-color: <?php echo esc_attr($color); ?>">
                    <?php echo esc_html($icon); ?>
                </div>
                <div class="subject-info">
                    <h3><?php echo esc_html($subject->post_title); ?></h3>
                    <span class="lesson-count"><?php echo $lesson_count; ?> lessons</span>
                </div>
            </div>
            
            <div class="subject-content">
                <p><?php echo esc_html($description); ?></p>
                
                <?php if ($show_progress && is_user_logged_in()): ?>
                <div class="progress-section">
                    <div class="progress-info">
                        <span>Progress</span>
                        <span><?php echo $progress; ?>%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: <?php echo $progress; ?>%"></div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-icon">🏆</span>
                            <div>
                                <p>Completed</p>
                                <strong><?php echo $completed_lessons; ?>/<?php echo $lesson_count; ?></strong>
                            </div>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">⏱️</span>
                            <div>
                                <p>Time Spent</p>
                                <strong>0min</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <button class="ai-tutor-btn start-learning-btn" data-subject-id="<?php echo $subject->ID; ?>">
                    📚 <?php echo $progress > 0 ? 'Continue Learning' : 'Start Learning'; ?>
                </button>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Handle start learning buttons
    document.querySelectorAll('.start-learning-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const subjectId = this.getAttribute('data-subject-id');
            // Redirect to dashboard with subject parameter
            window.location.href = '<?php echo site_url('/ai-tutor-dashboard'); ?>?subject=' + subjectId;
        });
    });
});
</script>