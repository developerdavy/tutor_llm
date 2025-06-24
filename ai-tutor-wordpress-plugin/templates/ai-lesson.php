<?php
/**
 * Template for displaying AI-powered lessons with chat interface
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$lesson = get_post($lesson_id);
if (!$lesson) {
    echo '<p>Lesson not found.</p>';
    return;
}

$subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
$subject = get_post($subject_id);
$difficulty = get_post_meta($lesson_id, '_ai_lesson_difficulty', true) ?: 'Intermediate';
$duration = get_post_meta($lesson_id, '_ai_lesson_duration', true) ?: 30;
$user_id = get_current_user_id();

// Check if Google API key is configured
$google_api_key = get_option('ai_tutor_google_api_key', '');
$backend_url = get_option('ai_tutor_backend_url', '');
$ai_enabled = !empty($google_api_key) || !empty($backend_url);
?>

<div id="ai-tutor-app" class="ai-tutor-ai-lesson" data-lesson-id="<?php echo esc_attr($lesson_id); ?>" data-user-id="<?php echo esc_attr($user_id); ?>">
    <!-- AI Status Indicator -->
    <div class="ai-status <?php echo $ai_enabled ? 'ai-enabled' : 'ai-disabled'; ?>">
        <?php if ($ai_enabled): ?>
            <span class="status-icon">🤖</span>
            <span class="status-text">AI-Powered Learning Enabled</span>
        <?php else: ?>
            <span class="status-icon">⚠️</span>
            <span class="status-text">Configure AI settings to enable full features</span>
            <a href="<?php echo admin_url('admin.php?page=ai-tutor-settings'); ?>" class="settings-link">Settings</a>
        <?php endif; ?>
    </div>

    <!-- Lesson Header -->
    <div class="lesson-header">
        <div class="lesson-meta">
            <?php if ($subject): ?>
                <span class="lesson-subject"><?php echo esc_html($subject->post_title); ?></span>
            <?php endif; ?>
            <span class="lesson-difficulty"><?php echo esc_html($difficulty); ?></span>
            <span class="lesson-duration"><?php echo esc_html($duration); ?> min</span>
        </div>
        <h2 class="lesson-title"><?php echo esc_html($lesson->post_title); ?></h2>
    </div>

    <!-- Main Content Area -->
    <div class="lesson-main">
        <!-- Left Panel: Lesson Content -->
        <div class="lesson-panel">
            <div class="lesson-content">
                <?php if (empty($lesson->post_content)): ?>
                    <div class="empty-content">
                        <p>This lesson is ready for AI-generated content.</p>
                        <button type="button" class="btn btn-primary generate-content-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
                            🚀 Generate AI Content
                        </button>
                    </div>
                <?php else: ?>
                    <?php echo wp_kses_post($lesson->post_content); ?>
                <?php endif; ?>
            </div>

            <!-- AI Content Generation Buttons -->
            <div class="ai-controls">
                <button type="button" class="btn btn-primary generate-content-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
                    📝 Generate Content
                </button>
                <button type="button" class="btn btn-secondary generate-questions-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
                    ❓ Generate Questions
                </button>
                <button type="button" class="btn btn-info generate-examples-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
                    💡 Generate Examples
                </button>
            </div>

            <!-- Generated Content Display -->
            <div id="generated-content" class="generated-content" style="display: none;"></div>
        </div>

        <!-- Right Panel: AI Chat Interface -->
        <div class="chat-panel">
            <div class="chat-header">
                <h3>🤖 AI Tutor Chat</h3>
                <div class="chat-status">Ready to help!</div>
            </div>

            <div id="chat-messages" class="chat-messages">
                <div class="chat-message ai-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <p>Hello! I'm your AI tutor for <strong><?php echo esc_html($lesson->post_title); ?></strong>. Ask me anything about this lesson!</p>
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="input-group">
                    <input type="text" id="chat-input" class="chat-input" placeholder="Ask me anything about this lesson..." maxlength="500">
                    <button type="button" id="send-chat-btn" class="send-btn">
                        <span class="send-icon">➤</span>
                    </button>
                </div>
                <div class="input-help">
                    <small>Press Enter to send • AI responses are powered by Google Gemini</small>
                </div>
            </div>

            <!-- Typing Indicator -->
            <div id="typing-indicator" class="typing-indicator" style="display: none;">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">AI is thinking...</span>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay" style="display: none;">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Generating AI content...</p>
        </div>
    </div>
</div>

<style>
.ai-tutor-ai-lesson {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.ai-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 500;
}

.ai-status.ai-enabled {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.ai-status.ai-disabled {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.settings-link {
    margin-left: auto;
    color: inherit;
    text-decoration: underline;
}

.lesson-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e9ecef;
}

.lesson-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.lesson-subject, .lesson-difficulty, .lesson-duration {
    background: #f8f9fa;
    color: #495057;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.lesson-title {
    margin: 0;
    color: #212529;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
}

.lesson-main {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
    min-height: 600px;
}

.lesson-panel, .chat-panel {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.lesson-content {
    padding: 24px;
    line-height: 1.7;
    color: #495057;
}

.empty-content {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
}

.ai-controls {
    padding: 20px 24px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
    transform: translateY(-1px);
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-info:hover {
    background: #117a8b;
    transform: translateY(-1px);
}

.generated-content {
    padding: 24px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.chat-panel {
    display: flex;
    flex-direction: column;
    height: fit-content;
    max-height: 700px;
}

.chat-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.chat-header h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
}

.chat-status {
    font-size: 12px;
    opacity: 0.9;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    max-height: 400px;
    background: #f8f9fa;
}

.chat-message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    animation: fadeInUp 0.3s ease;
}

.chat-message.user-message {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.ai-message .message-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-message .message-avatar {
    background: #007bff;
    color: white;
    font-weight: bold;
}

.message-content {
    flex: 1;
    background: white;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    max-width: 70%;
}

.user-message .message-content {
    background: #007bff;
    color: white;
}

.chat-input-area {
    padding: 20px;
    background: white;
    border-top: 1px solid #e9ecef;
}

.input-group {
    display: flex;
    gap: 8px;
    align-items: center;
}

.chat-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
}

.chat-input:focus {
    border-color: #007bff;
}

.send-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: #007bff;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.send-btn:hover {
    background: #0056b3;
    transform: scale(1.05);
}

.send-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

.input-help {
    margin-top: 8px;
    text-align: center;
}

.input-help small {
    color: #6c757d;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

.typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    background: #007bff;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

.typing-text {
    font-size: 12px;
    color: #6c757d;
}

.loading-overlay {
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

.loading-spinner {
    background: white;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-10px);
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
    .lesson-main {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .chat-panel {
        order: -1;
        max-height: 500px;
    }
}

@media (max-width: 768px) {
    .ai-tutor-ai-lesson {
        padding: 15px;
    }
    
    .lesson-meta {
        flex-direction: column;
        gap: 8px;
    }
    
    .lesson-title {
        font-size: 24px;
    }
    
    .ai-controls {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const loadingOverlay = document.getElementById('loading-overlay');
    const lessonId = document.querySelector('.ai-tutor-ai-lesson').dataset.lessonId;
    const userId = document.querySelector('.ai-tutor-ai-lesson').dataset.userId;

    // Chat functionality
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat(message, true);
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to AI
        sendToAI(message);
    }

    function addMessageToChat(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${isUser ? 'U' : '🤖'}</div>
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function sendToAI(message) {
        // Make AJAX call to WordPress backend
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'ai_tutor_chat',
                message: message,
                lesson_id: lessonId,
                user_id: userId,
                nonce: '<?php echo wp_create_nonce('ai_tutor_chat'); ?>'
            })
        })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            if (data.success) {
                addMessageToChat(data.data.response, false);
            } else {
                addMessageToChat('Sorry, I encountered an error. Please try again.', false);
            }
        })
        .catch(error => {
            hideTypingIndicator();
            addMessageToChat('Sorry, I encountered an error. Please try again.', false);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // AI Content Generation
    document.querySelectorAll('.generate-content-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = this.dataset.lessonId;
            generateContent(lessonId, 'content');
        });
    });

    document.querySelectorAll('.generate-questions-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = this.dataset.lessonId;
            generateContent(lessonId, 'questions');
        });
    });

    document.querySelectorAll('.generate-examples-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = this.dataset.lessonId;
            generateContent(lessonId, 'examples');
        });
    });

    function generateContent(lessonId, type) {
        loadingOverlay.style.display = 'flex';
        
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'ai_tutor_generate',
                lesson_id: lessonId,
                type: type,
                nonce: '<?php echo wp_create_nonce('ai_tutor_generate'); ?>'
            })
        })
        .then(response => response.json())
        .then(data => {
            loadingOverlay.style.display = 'none';
            if (data.success) {
                displayGeneratedContent(data.data, type);
            } else {
                alert('Error generating content: ' + (data.data || 'Unknown error'));
            }
        })
        .catch(error => {
            loadingOverlay.style.display = 'none';
            alert('Error generating content. Please try again.');
        });
    }

    function displayGeneratedContent(content, type) {
        const contentDiv = document.getElementById('generated-content');
        contentDiv.style.display = 'block';
        
        let html = `<h3>Generated ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;
        
        if (type === 'content') {
            html += `<div class="generated-lesson-content">${content.content || content}</div>`;
            if (content.examples) {
                html += '<h4>Examples:</h4>';
                content.examples.forEach(example => {
                    html += `
                        <div class="generated-example">
                            <strong>Problem:</strong> ${example.problem}<br>
                            <strong>Solution:</strong> ${example.solution}<br>
                            <strong>Explanation:</strong> ${example.explanation}
                        </div>
                    `;
                });
            }
        } else if (type === 'questions') {
            if (Array.isArray(content.questions)) {
                content.questions.forEach((q, index) => {
                    html += `
                        <div class="generated-question">
                            <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                            <ul>
                                ${q.options.map(option => `<li>${option}</li>`).join('')}
                            </ul>
                            <p><em>Correct answer: ${q.options[q.correctAnswer]}</em></p>
                            <p><small>${q.explanation}</small></p>
                        </div>
                    `;
                });
            }
        }
        
        contentDiv.innerHTML = html;
    }
});
</script>