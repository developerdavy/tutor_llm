<?php
// Admin page template
?>

<div class="wrap">
    <h1>AI Tutor - Dashboard</h1>
    
    <div class="ai-tutor-admin-grid">
        <div class="ai-tutor-admin-card">
            <h2>📊 Statistics</h2>
            <?php
            $subjects_count = wp_count_posts('ai_subject')->publish;
            $lessons_count = wp_count_posts('ai_lesson')->publish;
            
            global $wpdb;
            $users_count = $wpdb->get_var("SELECT COUNT(DISTINCT user_id) FROM {$wpdb->prefix}ai_tutor_user_progress");
            $messages_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ai_tutor_chat_messages");
            ?>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number"><?php echo $subjects_count; ?></div>
                    <div class="stat-label">Subjects</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo $lessons_count; ?></div>
                    <div class="stat-label">Lessons</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo $users_count ?: 0; ?></div>
                    <div class="stat-label">Active Learners</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo $messages_count ?: 0; ?></div>
                    <div class="stat-label">Chat Messages</div>
                </div>
            </div>
        </div>
        
        <div class="ai-tutor-admin-card">
            <h2>🚀 Quick Actions</h2>
            <div class="quick-actions">
                <a href="<?php echo admin_url('post-new.php?post_type=ai_subject'); ?>" class="button button-primary">
                    ➕ Add New Subject
                </a>
                <a href="<?php echo admin_url('post-new.php?post_type=ai_lesson'); ?>" class="button button-primary">
                    📝 Add New Lesson
                </a>
                <a href="<?php echo admin_url('edit.php?post_type=ai_subject'); ?>" class="button">
                    📚 Manage Subjects
                </a>
                <a href="<?php echo admin_url('edit.php?post_type=ai_lesson'); ?>" class="button">
                    📖 Manage Lessons
                </a>
            </div>
        </div>
        
        <div class="ai-tutor-admin-card">
            <h2>📋 Shortcodes</h2>
            <p>Use these shortcodes to display AI Tutor content on your pages:</p>
            
            <div class="shortcode-list">
                <div class="shortcode-item">
                    <code>[ai_tutor_dashboard]</code>
                    <p>Displays the full AI Tutor dashboard with subjects, lessons, and chat interface.</p>
                </div>
                
                <div class="shortcode-item">
                    <code>[ai_tutor_subjects]</code>
                    <p>Shows a grid of all available subjects with progress tracking.</p>
                </div>
                
                <div class="shortcode-item">
                    <code>[ai_tutor_lesson lesson_id="123"]</code>
                    <p>Displays a specific lesson with its content and chat interface.</p>
                </div>
            </div>
        </div>
        
        <div class="ai-tutor-admin-card">
            <h2>🔧 System Status</h2>
            <div class="system-status">
                <div class="status-item <?php echo function_exists('curl_init') ? 'status-ok' : 'status-error'; ?>">
                    <span class="status-indicator"></span>
                    <span>cURL Extension</span>
                </div>
                
                <div class="status-item <?php echo extension_loaded('json') ? 'status-ok' : 'status-error'; ?>">
                    <span class="status-indicator"></span>
                    <span>JSON Extension</span>
                </div>
                
                <div class="status-item <?php echo is_writable(WP_CONTENT_DIR) ? 'status-ok' : 'status-error'; ?>">
                    <span class="status-indicator"></span>
                    <span>File Permissions</span>
                </div>
                
                <?php
                $db_check = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}ai_tutor_user_progress'");
                ?>
                <div class="status-item <?php echo $db_check ? 'status-ok' : 'status-error'; ?>">
                    <span class="status-indicator"></span>
                    <span>Database Tables</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.ai-tutor-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.ai-tutor-admin-card {
    background: white;
    border: 1px solid #ccd0d4;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.ai-tutor-admin-card h2 {
    margin-top: 0;
    color: #23282d;
    font-size: 18px;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.stat-box {
    text-align: center;
    padding: 15px;
    background: #f7f7f7;
    border-radius: 6px;
}

.stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #0073aa;
}

.stat-label {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.shortcode-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.shortcode-item code {
    background: #f1f1f1;
    padding: 5px 8px;
    border-radius: 3px;
    font-family: monospace;
    display: block;
    margin-bottom: 5px;
}

.shortcode-item p {
    margin: 0;
    font-size: 13px;
    color: #666;
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.status-ok .status-indicator {
    background: #46b450;
}

.status-error .status-indicator {
    background: #dc3232;
}
</style>