<?php
/**
 * Create Test Data for AI Tutor Plugin
 * Copy this to your WordPress root and run it to create sample subjects and lessons
 */

// Include WordPress
require_once('wp-config.php');
require_once('wp-includes/wp-db.php');
require_once('wp-includes/functions.php');
require_once('wp-includes/pluggable.php');
require_once('wp-includes/post.php');

// Set up WordPress environment
wp();

// Check if user is admin
if (!current_user_can('manage_options')) {
    die('Access denied. Please log in as administrator.');
}

echo "<h1>Creating AI Tutor Test Data</h1>";

// Create sample subjects
$subjects = array(
    array(
        'title' => 'Mathematics',
        'description' => 'Learn fundamental and advanced mathematical concepts',
        'icon' => '🔢',
        'color' => '#e74c3c',
        'difficulty' => 'Beginner to Advanced'
    ),
    array(
        'title' => 'Science',
        'description' => 'Explore the wonders of physics, chemistry, and biology',
        'icon' => '🔬',
        'color' => '#3498db',
        'difficulty' => 'Intermediate'
    ),
    array(
        'title' => 'Programming',
        'description' => 'Master coding skills and software development',
        'icon' => '💻',
        'color' => '#2ecc71',
        'difficulty' => 'Beginner to Expert'
    )
);

$created_subjects = array();

foreach ($subjects as $subject_data) {
    // Create subject post
    $subject_id = wp_insert_post(array(
        'post_title' => $subject_data['title'],
        'post_content' => $subject_data['description'],
        'post_type' => 'ai_subject',
        'post_status' => 'publish'
    ));
    
    if ($subject_id && !is_wp_error($subject_id)) {
        // Add metadata
        update_post_meta($subject_id, '_ai_subject_icon', $subject_data['icon']);
        update_post_meta($subject_id, '_ai_subject_color', $subject_data['color']);
        update_post_meta($subject_id, '_ai_subject_difficulty', $subject_data['difficulty']);
        
        $created_subjects[] = array('id' => $subject_id, 'title' => $subject_data['title']);
        echo "<p>✅ Created subject: {$subject_data['title']} (ID: $subject_id)</p>";
    } else {
        echo "<p>❌ Failed to create subject: {$subject_data['title']}</p>";
    }
}

// Create sample lessons for each subject
$lessons_data = array(
    'Mathematics' => array(
        array('title' => 'Basic Arithmetic', 'description' => 'Addition, subtraction, multiplication, and division'),
        array('title' => 'Algebra Fundamentals', 'description' => 'Variables, equations, and expressions'),
        array('title' => 'Geometry Basics', 'description' => 'Shapes, angles, and measurements')
    ),
    'Science' => array(
        array('title' => 'Introduction to Physics', 'description' => 'Forces, motion, and energy'),
        array('title' => 'Chemistry Basics', 'description' => 'Atoms, molecules, and reactions'),
        array('title' => 'Biology Overview', 'description' => 'Cells, organisms, and ecosystems')
    ),
    'Programming' => array(
        array('title' => 'Programming Fundamentals', 'description' => 'Variables, functions, and control structures'),
        array('title' => 'Web Development', 'description' => 'HTML, CSS, and JavaScript basics'),
        array('title' => 'Data Structures', 'description' => 'Arrays, objects, and algorithms')
    )
);

foreach ($created_subjects as $subject) {
    $subject_lessons = $lessons_data[$subject['title']] ?? array();
    
    foreach ($subject_lessons as $lesson_data) {
        $lesson_id = wp_insert_post(array(
            'post_title' => $lesson_data['title'],
            'post_content' => $lesson_data['description'],
            'post_type' => 'ai_lesson',
            'post_status' => 'publish'
        ));
        
        if ($lesson_id && !is_wp_error($lesson_id)) {
            // Link lesson to subject
            update_post_meta($lesson_id, '_ai_lesson_subject_id', $subject['id']);
            update_post_meta($lesson_id, '_ai_lesson_description', $lesson_data['description']);
            update_post_meta($lesson_id, '_ai_lesson_difficulty', 'Beginner');
            update_post_meta($lesson_id, '_ai_lesson_duration', '15 min');
            
            echo "<p>✅ Created lesson: {$lesson_data['title']} for {$subject['title']} (ID: $lesson_id)</p>";
        } else {
            echo "<p>❌ Failed to create lesson: {$lesson_data['title']}</p>";
        }
    }
}

echo "<h2>Test Data Creation Complete!</h2>";
echo "<p><strong>Next steps:</strong></p>";
echo "<ul>";
echo "<li>Go back to your WordPress page with the AI Tutor plugin</li>";
echo "<li>Hard refresh the page (Ctrl+F5)</li>";
echo "<li>Try clicking on the subject cards</li>";
echo "<li>Check browser console for any remaining errors</li>";
echo "</ul>";

// Display summary
echo "<h3>Created Data Summary:</h3>";
echo "<p>Subjects: " . count($created_subjects) . "</p>";
echo "<p>Total Lessons: " . array_sum(array_map('count', $lessons_data)) . "</p>";
?>