<?php
if (!defined('ABSPATH')) {
    exit;
}

$lesson_id = isset($atts['lesson_id']) ? intval($atts['lesson_id']) : 0;
$lesson = get_post($lesson_id);

if (!$lesson || $lesson->post_type !== 'ai_lesson') {
    echo '<p>Lesson not found.</p>';
    return;
}

$subject = get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General';
$difficulty = get_post_meta($lesson_id, '_ai_lesson_difficulty', true) ?: 'Medium';
$duration = get_post_meta($lesson_id, '_ai_lesson_duration', true) ?: '30';
$examples = json_decode(get_post_meta($lesson_id, '_ai_lesson_examples', true) ?: '[]', true);
$quiz = json_decode(get_post_meta($lesson_id, '_ai_lesson_quiz', true) ?: '[]', true);
?>

<div class="ai-tutor-lesson" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
    <div class="lesson-header">
        <h2><?php echo esc_html($lesson->post_title); ?></h2>
        <div class="lesson-meta">
            <span class="subject">Subject: <?php echo esc_html($subject); ?></span>
            <span class="difficulty">Difficulty: <?php echo esc_html($difficulty); ?></span>
            <span class="duration">Duration: <?php echo esc_html($duration); ?> minutes</span>
        </div>
        
        <?php if (current_user_can('manage_options')): ?>
        <div class="lesson-admin-controls">
            <button class="generate-ai-content" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
                Generate AI Content
            </button>
            <button class="generate-ai-questions" data-lesson-id="<?php echo esc_attr($lesson_id); ?>" 
                    data-type="multiple_choice" data-difficulty="medium" data-count="5">
                Generate Questions
            </button>
        </div>
        <?php endif; ?>
    </div>

    <div class="lesson-content" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
        <?php echo wp_kses_post($lesson->post_content); ?>
    </div>

    <?php if (!empty($examples)): ?>
    <div id="lesson-examples">
        <h3>Examples</h3>
        <?php foreach ($examples as $index => $example): ?>
        <div class="example-item">
            <h4>Example <?php echo $index + 1; ?></h4>
            <div class="example-problem"><strong>Problem:</strong> <?php echo esc_html($example['problem']); ?></div>
            <div class="example-solution"><strong>Solution:</strong> <?php echo esc_html($example['solution']); ?></div>
            <div class="example-explanation"><strong>Explanation:</strong> <?php echo esc_html($example['explanation']); ?></div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($quiz)): ?>
    <div id="lesson-quiz">
        <h3>Quiz</h3>
        <?php foreach ($quiz as $index => $question): ?>
        <div class="quiz-question" data-question-index="<?php echo $index; ?>">
            <h4>Question <?php echo $index + 1; ?></h4>
            <p><?php echo esc_html($question['question']); ?></p>
            <div class="quiz-options">
                <?php foreach ($question['options'] as $optIndex => $option): ?>
                <label>
                    <input type="radio" name="quiz_<?php echo $index; ?>" value="<?php echo $optIndex; ?>">
                    <?php echo esc_html($option); ?>
                </label>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
        <button class="submit-quiz">Submit Quiz</button>
    </div>
    <?php endif; ?>

    <div class="ai-tutor-chat-section">
        <h3>Ask AI Tutor</h3>
        <div id="ai-tutor-chat" data-lesson-id="<?php echo esc_attr($lesson_id); ?>" 
             data-subject="<?php echo esc_attr($subject); ?>" 
             data-lesson-title="<?php echo esc_attr($lesson->post_title); ?>">
            
            <div id="ai-tutor-messages" class="chat-messages">
                <div class="ai-tutor-message ai-message">
                    <div class="message-content">
                        Hello! I'm your AI tutor for <?php echo esc_html($lesson->post_title); ?>. 
                        Feel free to ask me any questions about this <?php echo esc_html($subject); ?> topic!
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <input type="text" id="ai-tutor-message-input" placeholder="Type your question..." />
                <button id="ai-tutor-send-message">Send</button>
            </div>
        </div>
    </div>
</div>

<div id="ai-generated-questions" class="ai-questions-modal" style="display: none;"></div>

<style>
.ai-tutor-lesson {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.lesson-header {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.lesson-meta {
    display: flex;
    gap: 20px;
    margin: 10px 0;
    font-size: 14px;
    color: #666;
}

.lesson-admin-controls {
    margin: 15px 0;
}

.lesson-admin-controls button {
    background: #007cba;
    color: white;
    border: none;
    padding: 8px 16px;
    margin-right: 10px;
    border-radius: 4px;
    cursor: pointer;
}

.lesson-admin-controls button:hover {
    background: #005a87;
}

.lesson-content {
    line-height: 1.6;
    margin-bottom: 30px;
}

.example-item, .quiz-question {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
}

.quiz-options {
    margin: 10px 0;
}

.quiz-options label {
    display: block;
    margin: 8px 0;
    cursor: pointer;
}

.quiz-question.correct {
    border-color: #4caf50;
    background-color: #f1f8e9;
}

.quiz-question.incorrect {
    border-color: #f44336;
    background-color: #ffebee;
}

.ai-tutor-chat-section {
    margin-top: 40px;
    border-top: 2px solid #e0e0e0;
    padding-top: 20px;
}

#ai-tutor-chat {
    border: 1px solid #ddd;
    border-radius: 8px;
    height: 400px;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f9f9f9;
}

.ai-tutor-message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    max-width: 80%;
}

.user-message {
    background: #007cba;
    color: white;
    margin-left: auto;
}

.ai-message {
    background: white;
    border: 1px solid #ddd;
}

.message-time {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 5px;
}

.chat-input-container {
    display: flex;
    padding: 15px;
    border-top: 1px solid #ddd;
}

#ai-tutor-message-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
}

#ai-tutor-send-message {
    background: #007cba;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

#ai-tutor-send-message:hover {
    background: #005a87;
}

.typing-indicator .typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
    animation: typing 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

.ai-questions-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.questions-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.ai-tutor-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 4px;
    color: white;
    z-index: 1001;
}

.ai-tutor-notification.success {
    background: #4caf50;
}

.ai-tutor-notification.error {
    background: #f44336;
}
</style>