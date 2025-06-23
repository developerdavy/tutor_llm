<?php
// Dashboard template
$current_user = wp_get_current_user();
$subject_id = isset($atts['subject_id']) ? intval($atts['subject_id']) : '';
?>

<div id="ai-tutor-dashboard" class="ai-tutor-container">
    <div class="ai-tutor-header">
        <h1>AI Tutor Dashboard</h1>
        <p>Welcome back, <?php echo esc_html($current_user->display_name); ?>!</p>
        <button id="voice-toggle" class="ai-tutor-btn ai-tutor-btn-outline">
            🔊 Voice On
        </button>
    </div>

    <div class="ai-tutor-grid">
        <!-- Sidebar -->
        <div class="ai-tutor-sidebar">
            <!-- Subjects -->
            <div class="ai-tutor-card">
                <h3>Select a Subject</h3>
                <div id="subjects-list" class="ai-tutor-subjects">
                    <!-- Subjects will be loaded via JavaScript -->
                </div>
            </div>

            <!-- Progress Tracker -->
            <div class="ai-tutor-card">
                <h3>Your Progress</h3>
                <div id="progress-tracker">
                    <!-- Progress will be loaded via JavaScript -->
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="ai-tutor-main">
            <!-- AI Avatar -->
            <div class="ai-tutor-card">
                <div class="ai-tutor-avatar-container">
                    <h3>AI Tutor</h3>
                    <div id="ai-avatar" class="ai-tutor-avatar">
                        <div class="avatar-circle">🤖</div>
                        <div class="speech-bubble">
                            <p id="avatar-message">Select a subject to begin learning!</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lessons List -->
            <div id="lessons-container" class="ai-tutor-card" style="display: none;">
                <h3 id="lessons-title">Lessons</h3>
                <div id="lessons-list">
                    <!-- Lessons will be loaded via JavaScript -->
                </div>
            </div>

            <!-- Lesson Interface -->
            <div id="lesson-interface" class="ai-tutor-card" style="display: none;">
                <div id="lesson-content">
                    <!-- Lesson content will be loaded here -->
                </div>
            </div>

            <!-- Chat Interface -->
            <div id="chat-interface" class="ai-tutor-card" style="display: none;">
                <h3>Chat with AI Tutor</h3>
                <div id="chat-messages" class="ai-tutor-chat-messages">
                    <!-- Chat messages will appear here -->
                </div>
                <div class="ai-tutor-chat-input">
                    <input type="text" id="chat-input" placeholder="Ask a question about the lesson...">
                    <button id="send-chat" class="ai-tutor-btn">Send</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    AiTutor.init({
        subjectId: '<?php echo esc_js($subject_id); ?>',
        userId: <?php echo get_current_user_id(); ?>
    });
});
</script>