<?php
/**
 * Sample Data Creator for AI Tutor Plugin
 * Run this once to create sample subjects and lessons
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

function create_ai_tutor_sample_data() {
    // Check if we already have data
    $existing_subjects = get_posts(array(
        'post_type' => 'ai_subject',
        'post_status' => 'publish',
        'numberposts' => 1
    ));
    
    if (!empty($existing_subjects)) {
        return; // Data already exists
    }
    
    // Create sample subjects
    $subjects_data = array(
        array(
            'title' => 'Mathematics',
            'content' => 'Algebra, Geometry, Calculus',
            'icon' => '📐',
            'color' => '#007cba'
        ),
        array(
            'title' => 'Chemistry',
            'content' => 'Organic, Inorganic, Physical',
            'icon' => '🧪',
            'color' => '#ff6b35'
        ),
        array(
            'title' => 'Literature',
            'content' => 'Poetry, Prose, Drama',
            'icon' => '📚',
            'color' => '#9c27b0'
        )
    );
    
    $created_subjects = array();
    
    foreach ($subjects_data as $subject_data) {
        $subject_id = wp_insert_post(array(
            'post_title' => $subject_data['title'],
            'post_content' => $subject_data['content'],
            'post_status' => 'publish',
            'post_type' => 'ai_subject'
        ));
        
        if ($subject_id && !is_wp_error($subject_id)) {
            update_post_meta($subject_id, '_ai_subject_icon', $subject_data['icon']);
            update_post_meta($subject_id, '_ai_subject_color', $subject_data['color']);
            $created_subjects[] = $subject_id;
        }
    }
    
    // Create sample lessons for each subject
    $lessons_data = array(
        // Mathematics lessons
        array(
            'subject_title' => 'Mathematics',
            'lessons' => array(
                array(
                    'title' => 'Basic Algebra',
                    'content' => 'Learn the fundamentals of algebraic expressions and equations.',
                    'difficulty' => 'Beginner',
                    'duration' => 30,
                    'order' => 1
                ),
                array(
                    'title' => 'Quadratic Equations',
                    'content' => 'Solve quadratic equations using various methods including factoring and the quadratic formula.',
                    'difficulty' => 'Intermediate',
                    'duration' => 45,
                    'order' => 2
                ),
                array(
                    'title' => 'Geometry Basics',
                    'content' => 'Explore points, lines, angles, and basic geometric shapes.',
                    'difficulty' => 'Beginner',
                    'duration' => 40,
                    'order' => 3
                )
            )
        ),
        // Chemistry lessons
        array(
            'subject_title' => 'Chemistry',
            'lessons' => array(
                array(
                    'title' => 'Atomic Structure',
                    'content' => 'Understanding atoms, electrons, protons, and neutrons.',
                    'difficulty' => 'Beginner',
                    'duration' => 35,
                    'order' => 1
                ),
                array(
                    'title' => 'Chemical Bonds',
                    'content' => 'Learn about ionic and covalent bonds between atoms.',
                    'difficulty' => 'Intermediate',
                    'duration' => 50,
                    'order' => 2
                )
            )
        ),
        // Literature lessons
        array(
            'subject_title' => 'Literature',
            'lessons' => array(
                array(
                    'title' => 'Poetry Analysis',
                    'content' => 'Analyze poems for literary devices, themes, and meaning.',
                    'difficulty' => 'Intermediate',
                    'duration' => 45,
                    'order' => 1
                ),
                array(
                    'title' => 'Character Development',
                    'content' => 'Understanding how authors develop characters in stories.',
                    'difficulty' => 'Beginner',
                    'duration' => 40,
                    'order' => 2
                )
            )
        )
    );
    
    foreach ($lessons_data as $subject_lessons) {
        // Find the subject ID
        $subject = get_posts(array(
            'post_type' => 'ai_subject',
            'post_status' => 'publish',
            'title' => $subject_lessons['subject_title'],
            'numberposts' => 1
        ));
        
        if (empty($subject)) continue;
        
        $subject_id = $subject[0]->ID;
        
        foreach ($subject_lessons['lessons'] as $lesson_data) {
            $lesson_id = wp_insert_post(array(
                'post_title' => $lesson_data['title'],
                'post_content' => $lesson_data['content'],
                'post_status' => 'publish',
                'post_type' => 'ai_lesson'
            ));
            
            if ($lesson_id && !is_wp_error($lesson_id)) {
                update_post_meta($lesson_id, '_ai_lesson_subject', $subject_id);
                update_post_meta($lesson_id, '_ai_lesson_difficulty', $lesson_data['difficulty']);
                update_post_meta($lesson_id, '_ai_lesson_duration', $lesson_data['duration']);
                update_post_meta($lesson_id, '_ai_lesson_order', $lesson_data['order']);
            }
        }
    }
}

// Auto-create sample data when plugin is activated
function ai_tutor_activation_hook() {
    create_ai_tutor_sample_data();
}
register_activation_hook(AI_TUTOR_PLUGIN_PATH . 'ai-tutor.php', 'ai_tutor_activation_hook');

// Add admin notice to create sample data
function ai_tutor_sample_data_notice() {
    $existing_subjects = get_posts(array(
        'post_type' => 'ai_subject',
        'post_status' => 'publish',
        'numberposts' => 1
    ));
    
    if (empty($existing_subjects)) {
        echo '<div class="notice notice-info is-dismissible">';
        echo '<p><strong>AI Tutor:</strong> No subjects found. ';
        echo '<a href="' . admin_url('post-new.php?post_type=ai_subject') . '">Create your first subject</a> ';
        echo 'or <a href="#" onclick="aiTutorCreateSampleData(); return false;">create sample data</a> to get started.</p>';
        echo '</div>';
        
        echo '<script>
        function aiTutorCreateSampleData() {
            if (confirm("This will create sample subjects and lessons. Continue?")) {
                jQuery.post(ajaxurl, {
                    action: "create_sample_data",
                    nonce: "' . wp_create_nonce('create_sample_data') . '"
                }, function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert("Error creating sample data");
                    }
                });
            }
        }
        </script>';
    }
}
add_action('admin_notices', 'ai_tutor_sample_data_notice');

// AJAX handler for creating sample data
function handle_create_sample_data() {
    if (!wp_verify_nonce($_POST['nonce'], 'create_sample_data')) {
        wp_die('Security check failed');
    }
    
    if (!current_user_can('manage_options')) {
        wp_die('Insufficient permissions');
    }
    
    create_ai_tutor_sample_data();
    wp_send_json_success('Sample data created successfully');
}
add_action('wp_ajax_create_sample_data', 'handle_create_sample_data');