<?php
// React-style Dashboard template
$current_user = wp_get_current_user();
$subject_id = isset($atts['subject_id']) ? intval($atts['subject_id']) : '';
?>

<!-- AI Tutor React-style Interface -->
<div id="ai-tutor-app" class="ai-tutor-react-container">
    <!-- Navigation Bar -->
    <nav class="ai-tutor-nav">
        <div class="nav-content">
            <div class="nav-brand">
                <h1 class="brand-title">AI Tutor</h1>
            </div>
            <div class="nav-actions">
                <button id="voice-toggle" class="voice-btn voice-on">
                    🔊 Voice On
                </button>
                <div class="user-info">
                    Welcome, <span class="user-name"><?php echo esc_html($current_user->display_name); ?></span>!
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content Grid -->
    <div class="main-container">
        <div class="content-grid">
            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Subjects Card -->
                <div class="react-card">
                    <h3 class="card-title">Subjects</h3>
                    <div id="subjects-list" class="subjects-container">
                        <!-- Subjects will be loaded here -->
                    </div>
                </div>

                <!-- Progress Card -->
                <div class="react-card">
                    <h3 class="card-title">Your Progress</h3>
                    <div id="progress-tracker" class="progress-container">
                        <!-- Progress will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- AI Avatar Card -->
                <div class="react-card">
                    <div class="avatar-section">
                        <h3 class="card-title">AI Tutor</h3>
                        <div id="ai-avatar" class="avatar-container">
                            <div class="avatar-circle">
                                🤖
                            </div>
                            <div class="speech-bubble">
                                <div class="bubble-arrow"></div>
                                <p id="avatar-message">Select a subject to begin learning!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lessons Container -->
                <div id="lessons-container" class="react-card hidden">
                    <h3 id="lessons-title" class="card-title">Lessons</h3>
                    <div id="lessons-list" class="lessons-grid">
                        <!-- Lessons will be loaded here -->
                    </div>
                </div>

                <!-- Lesson Interface -->
                <div id="lesson-interface" class="react-card hidden">
                    <div id="lesson-content" class="lesson-content">
                        <!-- Lesson content will be loaded here -->
                    </div>
                </div>

                <!-- Chat Interface -->
                <div id="chat-interface" class="react-card hidden">
                    <h3 class="card-title">Chat with AI Tutor</h3>
                    <div id="chat-messages" class="chat-messages">
                        <!-- Chat messages will appear here -->
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Ask a question about the lesson..." class="chat-input">
                        <button id="send-chat" class="send-btn">Send</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading Modal -->
    <div id="loading-modal" class="loading-modal hidden">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    </div>
</div>

<script>
// The JavaScript will auto-initialize when DOM is ready
// No additional script needed here as it's handled in the JS file
console.log('AI Tutor dashboard template loaded');
</script>