<?php
/**
 * AI Tutor WordPress Plugin Configuration
 * This file contains configuration settings for the AI Tutor plugin
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configuration class
class AI_Tutor_Config {
    
    /**
     * Get the backend URL for API calls
     * If running locally with Replit backend, use the local URL
     * If deployed, use the deployed backend URL
     */
    public static function get_backend_url() {
        // Check if user has configured a backend URL in WordPress settings
        $configured_url = get_option('ai_tutor_backend_url', '');
        
        if (!empty($configured_url)) {
            return rtrim($configured_url, '/');
        }
        
        // Default to localhost for development
        // Users can change this in WordPress Admin > AI Tutor > Settings
        return 'http://localhost:5000';
    }
    
    /**
     * Check if backend URL is available
     */
    public static function is_backend_available() {
        $url = self::get_backend_url() . '/api/subjects';
        
        $response = wp_remote_get($url, array(
            'timeout' => 5,
            'headers' => array(
                'Content-Type' => 'application/json'
            )
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        return $status_code === 200;
    }
    
    /**
     * Get the Google API key
     */
    public static function get_google_api_key() {
        return get_option('ai_tutor_google_api_key', '');
    }
    
    /**
     * Check if direct AI is available
     */
    public static function is_direct_ai_available() {
        return !empty(self::get_google_api_key());
    }
    
    /**
     * Get the preferred AI mode (backend or direct)
     */
    public static function get_ai_mode() {
        if (self::is_backend_available()) {
            return 'backend';
        } elseif (self::is_direct_ai_available()) {
            return 'direct';
        } else {
            return 'fallback';
        }
    }
    
    /**
     * Get configuration status for admin display
     */
    public static function get_status() {
        return array(
            'backend_url' => self::get_backend_url(),
            'backend_available' => self::is_backend_available(),
            'google_api_key' => !empty(self::get_google_api_key()),
            'ai_mode' => self::get_ai_mode()
        );
    }
}