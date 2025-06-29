<?php
/**
 * Debug AJAX Test Page for AI Tutor Plugin
 * Place this file in your WordPress root directory and access it to test AJAX functionality
 */

// Simple WordPress integration test
?>
<!DOCTYPE html>
<html>
<head>
    <title>AI Tutor AJAX Debug Test</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <h1>AI Tutor AJAX Debug Test</h1>
    
    <div id="test-results">
        <p>Click the button below to test AJAX functionality:</p>
    </div>
    
    <button id="test-subjects" onclick="testSubjects()">Test Load Subjects</button>
    <button id="test-lessons" onclick="testLessons()">Test Load Lessons (Subject ID: 1)</button>
    
    <div id="debug-output"></div>

    <script>
    // Test configuration
    const ajaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
    const nonce = '<?php echo wp_create_nonce('ai_tutor_nonce'); ?>';
    
    function testSubjects() {
        console.log('Testing subjects AJAX...');
        document.getElementById('debug-output').innerHTML = '<p>Testing subjects...</p>';
        
        jQuery.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'ai_tutor_get_subjects',
                nonce: nonce
            },
            success: function(response) {
                console.log('Success:', response);
                document.getElementById('debug-output').innerHTML = 
                    '<h3>Success!</h3><pre>' + JSON.stringify(response, null, 2) + '</pre>';
            },
            error: function(xhr, status, error) {
                console.error('Error:', xhr, status, error);
                document.getElementById('debug-output').innerHTML = 
                    '<h3>Error!</h3>' +
                    '<p>Status: ' + status + '</p>' +
                    '<p>Error: ' + error + '</p>' +
                    '<p>Response: ' + xhr.responseText + '</p>';
            }
        });
    }
    
    function testLessons() {
        console.log('Testing lessons AJAX...');
        document.getElementById('debug-output').innerHTML = '<p>Testing lessons...</p>';
        
        jQuery.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'ai_tutor_get_subject_lessons',
                subject_id: 1,
                nonce: nonce
            },
            success: function(response) {
                console.log('Success:', response);
                document.getElementById('debug-output').innerHTML = 
                    '<h3>Success!</h3><pre>' + JSON.stringify(response, null, 2) + '</pre>';
            },
            error: function(xhr, status, error) {
                console.error('Error:', xhr, status, error);
                document.getElementById('debug-output').innerHTML = 
                    '<h3>Error!</h3>' +
                    '<p>Status: ' + status + '</p>' +
                    '<p>Error: ' + error + '</p>' +
                    '<p>Response: ' + xhr.responseText + '</p>';
            }
        });
    }
    
    // Display configuration info
    console.log('AJAX URL:', ajaxUrl);
    console.log('Nonce:', nonce);
    </script>
    
    <hr>
    <h3>Debug Information</h3>
    <p><strong>AJAX URL:</strong> <?php echo admin_url('admin-ajax.php'); ?></p>
    <p><strong>Nonce:</strong> <?php echo wp_create_nonce('ai_tutor_nonce'); ?></p>
    <p><strong>WordPress Version:</strong> <?php echo get_bloginfo('version'); ?></p>
    <p><strong>Plugin Active:</strong> <?php echo is_plugin_active('ai-tutor-wordpress-plugin/ai-tutor.php') ? 'Yes' : 'No'; ?></p>
    
    <?php
    // Check if subjects exist
    $subjects = get_posts(array(
        'post_type' => 'ai_subject',
        'post_status' => 'publish',
        'numberposts' => -1
    ));
    echo '<p><strong>Available Subjects:</strong> ' . count($subjects) . '</p>';
    
    if (empty($subjects)) {
        echo '<p><em>No subjects found. Create some subjects in WordPress admin first.</em></p>';
    } else {
        echo '<ul>';
        foreach ($subjects as $subject) {
            echo '<li>ID: ' . $subject->ID . ' - ' . $subject->post_title . '</li>';
        }
        echo '</ul>';
    }
    ?>
</body>
</html>