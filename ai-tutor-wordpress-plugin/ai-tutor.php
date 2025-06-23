<?php
/**
 * Plugin Name: AI Tutor - Interactive Learning Platform
 * Plugin URI: https://yoursite.com/ai-tutor
 * Description: An interactive AI tutoring platform with personalized learning experiences, AI-generated lesson content, and real-time chat functionality.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: ai-tutor
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AI_TUTOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AI_TUTOR_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('AI_TUTOR_VERSION', '1.0.0');

// Include required files
require_once AI_TUTOR_PLUGIN_PATH . 'includes/class-ai-tutor.php';
require_once AI_TUTOR_PLUGIN_PATH . 'includes/class-database.php';
require_once AI_TUTOR_PLUGIN_PATH . 'includes/class-api.php';
require_once AI_TUTOR_PLUGIN_PATH . 'includes/class-shortcodes.php';

// Initialize the plugin
function ai_tutor_init() {
    $ai_tutor = new AI_Tutor();
    $ai_tutor->init();
}
add_action('plugins_loaded', 'ai_tutor_init');

// Activation hook
register_activation_hook(__FILE__, array('AI_Tutor_Database', 'create_tables'));

// Deactivation hook
register_deactivation_hook(__FILE__, array('AI_Tutor_Database', 'cleanup'));