<?php
/**
 * Template for displaying AI Tutor lessons
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
$examples = get_post_meta($lesson_id, '_ai_lesson_examples', true);
$quiz = get_post_meta($lesson_id, '_ai_lesson_quiz', true);

// Decode JSON data if needed
if (is_string($examples)) {
    $examples = json_decode($examples, true);
}
if (is_string($quiz)) {
    $quiz = json_decode($quiz, true);
}
?>

<div class="ai-tutor-lesson" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
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

    <!-- Lesson Content -->
    <div class="lesson-content">
        <?php echo wp_kses_post($lesson->post_content); ?>
    </div>

    <!-- Examples Section -->
    <?php if (!empty($examples) && is_array($examples)): ?>
        <div class="lesson-examples">
            <h3>Examples</h3>
            <?php foreach ($examples as $example): ?>
                <div class="example-item">
                    <div class="example-problem">
                        <strong>Problem:</strong> <?php echo esc_html($example['problem']); ?>
                    </div>
                    <div class="example-solution">
                        <strong>Solution:</strong> <?php echo esc_html($example['solution']); ?>
                    </div>
                    <?php if (!empty($example['explanation'])): ?>
                        <div class="example-explanation">
                            <strong>Explanation:</strong> <?php echo esc_html($example['explanation']); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <!-- Quiz Section -->
    <?php if (!empty($quiz) && is_array($quiz)): ?>
        <div class="lesson-quiz">
            <h3>Quiz</h3>
            <?php foreach ($quiz as $index => $question): ?>
                <div class="quiz-question" data-question-index="<?php echo esc_attr($index); ?>">
                    <p class="question-text"><?php echo esc_html($question['question']); ?></p>
                    <?php if (!empty($question['options']) && is_array($question['options'])): ?>
                        <div class="question-options">
                            <?php foreach ($question['options'] as $opt_index => $option): ?>
                                <label class="option-label">
                                    <input type="radio" name="question_<?php echo esc_attr($index); ?>" value="<?php echo esc_attr($opt_index); ?>">
                                    <?php echo esc_html($option); ?>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                    <div class="question-feedback" style="display: none;"></div>
                </div>
            <?php endforeach; ?>
            <button type="button" class="submit-quiz-btn">Submit Quiz</button>
        </div>
    <?php endif; ?>

    <!-- Action Buttons -->
    <div class="lesson-actions">
        <button type="button" class="btn btn-primary generate-content-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
            Generate AI Content
        </button>
        <button type="button" class="btn btn-secondary generate-questions-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
            Generate Questions
        </button>
        <button type="button" class="btn btn-success mark-complete-btn" data-lesson-id="<?php echo esc_attr($lesson_id); ?>">
            Mark Complete
        </button>
    </div>

    <!-- Progress Indicator -->
    <div class="lesson-progress">
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <span class="progress-text">0% Complete</span>
    </div>
</div>

<style>
.ai-tutor-lesson {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.lesson-header {
    margin-bottom: 30px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 20px;
}

.lesson-meta {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
    font-size: 14px;
}

.lesson-subject, .lesson-difficulty, .lesson-duration {
    background: #f0f0f0;
    padding: 4px 8px;
    border-radius: 4px;
    color: #666;
}

.lesson-title {
    margin: 0;
    color: #333;
    font-size: 28px;
}

.lesson-content {
    margin-bottom: 30px;
    line-height: 1.6;
    color: #444;
}

.lesson-examples, .lesson-quiz {
    margin-bottom: 30px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}

.lesson-examples h3, .lesson-quiz h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

.example-item {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #007cba;
}

.example-problem, .example-solution, .example-explanation {
    margin-bottom: 10px;
}

.quiz-question {
    margin-bottom: 25px;
    padding: 20px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #46b450;
}

.question-text {
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.question-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.option-label:hover {
    background-color: #f0f0f0;
}

.question-feedback {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    font-weight: bold;
}

.lesson-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #007cba;
    color: white;
}

.btn-primary:hover {
    background: #005a87;
}

.btn-secondary {
    background: #666;
    color: white;
}

.btn-secondary:hover {
    background: #444;
}

.btn-success {
    background: #46b450;
    color: white;
}

.btn-success:hover {
    background: #368a3c;
}

.lesson-progress {
    text-align: center;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress-fill {
    height: 100%;
    background: #46b450;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    color: #666;
    font-weight: bold;
}

@media (max-width: 768px) {
    .ai-tutor-lesson {
        padding: 15px;
    }
    
    .lesson-meta {
        flex-direction: column;
        gap: 8px;
    }
    
    .lesson-actions {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}
</style>