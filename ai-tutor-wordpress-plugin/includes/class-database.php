<?php

class AI_Tutor_Database {
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // User Progress table
        $table_user_progress = $wpdb->prefix . 'ai_tutor_user_progress';
        $sql_progress = "CREATE TABLE $table_user_progress (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            subject_id bigint(20) NOT NULL,
            lesson_id bigint(20),
            completed tinyint(1) DEFAULT 0,
            progress int(11) DEFAULT 0,
            last_accessed datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY subject_id (subject_id),
            KEY lesson_id (lesson_id)
        ) $charset_collate;";
        
        // Chat Messages table
        $table_chat_messages = $wpdb->prefix . 'ai_tutor_chat_messages';
        $sql_chat = "CREATE TABLE $table_chat_messages (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            lesson_id bigint(20) NOT NULL,
            message text NOT NULL,
            is_from_user tinyint(1) NOT NULL,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY lesson_id (lesson_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_progress);
        dbDelta($sql_chat);
        
        // Insert default subjects and lessons
        self::insert_default_data();
    }
    
    public static function insert_default_data() {
        // Check if subjects already exist
        $existing_subjects = get_posts(array('post_type' => 'ai_subject', 'numberposts' => 1));
        if (!empty($existing_subjects)) {
            return; // Data already exists
        }
        
        // Create default subjects
        $subjects_data = array(
            array(
                'title' => 'Mathematics',
                'description' => 'Algebra, Geometry, Calculus',
                'icon' => '📊',
                'color' => '#1E88E5'
            ),
            array(
                'title' => 'Chemistry',
                'description' => 'Organic, Inorganic, Physical',
                'icon' => '🧪',
                'color' => '#FF7043'
            ),
            array(
                'title' => 'Physics',
                'description' => 'Mechanics, Thermodynamics',
                'icon' => '⚛️',
                'color' => '#43A047'
            ),
            array(
                'title' => 'Literature',
                'description' => 'Poetry, Prose, Drama',
                'icon' => '📚',
                'color' => '#9C27B0'
            )
        );
        
        $subject_ids = array();
        
        foreach ($subjects_data as $subject_data) {
            $subject_id = wp_insert_post(array(
                'post_title' => $subject_data['title'],
                'post_content' => $subject_data['description'],
                'post_status' => 'publish',
                'post_type' => 'ai_subject'
            ));
            
            if ($subject_id) {
                update_post_meta($subject_id, '_ai_subject_icon', $subject_data['icon']);
                update_post_meta($subject_id, '_ai_subject_color', $subject_data['color']);
                update_post_meta($subject_id, '_ai_subject_description', $subject_data['description']);
                $subject_ids[] = $subject_id;
            }
        }
        
        // Create default lessons
        $lessons_data = array(
            // Mathematics lessons
            array(
                'subject_index' => 0,
                'title' => 'Algebraic Expressions and Equations',
                'description' => 'Simplifying expressions, solving linear and quadratic equations',
                'order' => 1,
                'difficulty' => 'Beginner',
                'duration' => 45
            ),
            array(
                'subject_index' => 0,
                'title' => 'Functions and Graphing',
                'description' => 'Understanding functions, domain, range, and graphing techniques',
                'order' => 2,
                'difficulty' => 'Intermediate',
                'duration' => 50
            ),
            array(
                'subject_index' => 0,
                'title' => 'Trigonometry Basics',
                'description' => 'Trigonometric ratios, unit circle, and basic identities',
                'order' => 3,
                'difficulty' => 'Intermediate',
                'duration' => 55
            ),
            
            // Chemistry lessons
            array(
                'subject_index' => 1,
                'title' => 'Atomic Theory and Periodic Trends',
                'description' => 'Electron configuration, periodic properties, and atomic structure',
                'order' => 1,
                'difficulty' => 'Beginner',
                'duration' => 40
            ),
            array(
                'subject_index' => 1,
                'title' => 'Chemical Bonding and Molecular Geometry',
                'description' => 'Ionic, covalent, and metallic bonds, VSEPR theory',
                'order' => 2,
                'difficulty' => 'Intermediate',
                'duration' => 45
            ),
            
            // Physics lessons
            array(
                'subject_index' => 2,
                'title' => 'Kinematics and Motion',
                'description' => 'Position, velocity, acceleration, and motion graphs',
                'order' => 1,
                'difficulty' => 'Beginner',
                'duration' => 50
            ),
            array(
                'subject_index' => 2,
                'title' => 'Forces and Newton\'s Laws',
                'description' => 'Force analysis, free body diagrams, and applications',
                'order' => 2,
                'difficulty' => 'Intermediate',
                'duration' => 55
            ),
            
            // Literature lessons
            array(
                'subject_index' => 3,
                'title' => 'Literary Analysis and Close Reading',
                'description' => 'Analyzing themes, symbols, and literary devices in texts',
                'order' => 1,
                'difficulty' => 'Beginner',
                'duration' => 45
            ),
            array(
                'subject_index' => 3,
                'title' => 'Poetry: Form, Structure, and Meaning',
                'description' => 'Understanding poetic forms, meter, rhyme, and interpretation',
                'order' => 2,
                'difficulty' => 'Intermediate',
                'duration' => 40
            )
        );
        
        foreach ($lessons_data as $lesson_data) {
            if (isset($subject_ids[$lesson_data['subject_index']])) {
                $lesson_id = wp_insert_post(array(
                    'post_title' => $lesson_data['title'],
                    'post_content' => $lesson_data['description'],
                    'post_status' => 'publish',
                    'post_type' => 'ai_lesson'
                ));
                
                if ($lesson_id) {
                    update_post_meta($lesson_id, '_ai_lesson_subject_id', $subject_ids[$lesson_data['subject_index']]);
                    update_post_meta($lesson_id, '_ai_lesson_order', $lesson_data['order']);
                    update_post_meta($lesson_id, '_ai_lesson_difficulty', $lesson_data['difficulty']);
                    update_post_meta($lesson_id, '_ai_lesson_duration', $lesson_data['duration']);
                }
            }
        }
    }
    
    public static function cleanup() {
        // Optional: Remove plugin data on deactivation
        // This is commented out to preserve user data
        /*
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ai_tutor_user_progress");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ai_tutor_chat_messages");
        */
    }
}