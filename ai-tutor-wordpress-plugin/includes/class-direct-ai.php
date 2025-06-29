<?php

/**
 * Direct AI Integration for WordPress Plugin
 * Provides AI functionality using Google Gemini API directly from WordPress
 */

class AI_Tutor_Direct_AI {
    
    private $api_key;
    private $base_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    public function __construct() {
        $this->api_key = get_option('ai_tutor_google_api_key', '');
    }
    
    /**
     * Check if AI service is available
     */
    public function is_available() {
        return !empty($this->api_key);
    }
    
    /**
     * Generate lesson content using Google Gemini API
     */
    public function generate_lesson_content($subject, $topic, $level = 'intermediate') {
        if (!$this->is_available()) {
            throw new Exception('Google API key not configured');
        }
        
        $prompt = $this->create_lesson_content_prompt($subject, $topic, $level);
        
        try {
            $response = $this->make_api_request($prompt);
            return $this->parse_lesson_content($response);
        } catch (Exception $e) {
            error_log('Direct AI lesson content generation error: ' . $e->getMessage());
            return $this->generate_fallback_lesson_content($subject, $topic, $level);
        }
    }
    
    /**
     * Generate AI tutor response for chat
     */
    public function generate_tutor_response($message, $subject = '', $chat_history = array()) {
        if (!$this->is_available()) {
            return $this->generate_fallback_tutor_response($message, $subject);
        }
        
        $prompt = $this->create_tutor_response_prompt($message, $subject, $chat_history);
        
        try {
            $response = $this->make_api_request($prompt);
            return $this->parse_simple_response($response);
        } catch (Exception $e) {
            error_log('Direct AI tutor response error: ' . $e->getMessage());
            return $this->generate_fallback_tutor_response($message, $subject);
        }
    }
    
    /**
     * Generate questions for a lesson
     */
    public function generate_questions($subject, $topic, $count = 5, $type = 'multiple_choice', $difficulty = 'intermediate') {
        if (!$this->is_available()) {
            return $this->generate_fallback_questions($subject, $topic, $count);
        }
        
        $prompt = $this->create_questions_prompt($subject, $topic, $count, $type, $difficulty);
        
        try {
            $response = $this->make_api_request($prompt);
            return $this->parse_questions_response($response);
        } catch (Exception $e) {
            error_log('Direct AI questions generation error: ' . $e->getMessage());
            return $this->generate_fallback_questions($subject, $topic, $count);
        }
    }
    
    /**
     * Generate examples for a lesson
     */
    public function generate_examples($subject, $topic, $count = 3) {
        if (!$this->is_available()) {
            return $this->generate_fallback_examples($subject, $topic, $count);
        }
        
        $prompt = $this->create_examples_prompt($subject, $topic, $count);
        
        try {
            $response = $this->make_api_request($prompt);
            return $this->parse_examples_response($response);
        } catch (Exception $e) {
            error_log('Direct AI examples generation error: ' . $e->getMessage());
            return $this->generate_fallback_examples($subject, $topic, $count);
        }
    }
    
    /**
     * Evaluate student answer
     */
    public function evaluate_answer($question, $student_answer, $correct_answer = '', $subject = '') {
        if (!$this->is_available()) {
            return $this->generate_fallback_evaluation($question, $student_answer, $correct_answer);
        }
        
        $prompt = $this->create_evaluation_prompt($question, $student_answer, $correct_answer, $subject);
        
        try {
            $response = $this->make_api_request($prompt);
            return $this->parse_evaluation_response($response);
        } catch (Exception $e) {
            error_log('Direct AI evaluation error: ' . $e->getMessage());
            return $this->generate_fallback_evaluation($question, $student_answer, $correct_answer);
        }
    }
    
    /**
     * Make API request to Google Gemini
     */
    private function make_api_request($prompt) {
        $url = $this->base_url . '?key=' . $this->api_key;
        
        $payload = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $prompt)
                    )
                )
            ),
            'generationConfig' => array(
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048
            )
        );
        
        $response = wp_remote_post($url, array(
            'body' => json_encode($payload),
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('API request failed: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception('Invalid API response format');
        }
        
        return $data['candidates'][0]['content']['parts'][0]['text'];
    }
    
    /**
     * Create prompt for lesson content generation
     */
    private function create_lesson_content_prompt($subject, $topic, $level) {
        return "Create comprehensive educational content for a {$level} level lesson on '{$topic}' in {$subject}. 

Please format your response as a JSON object with exactly this structure:
{
  \"title\": \"Lesson title\",
  \"description\": \"Brief lesson description\",
  \"content\": \"Main lesson content with detailed explanations\",
  \"examples\": [
    {
      \"problem\": \"Example problem or question\",
      \"solution\": \"Step-by-step solution\",
      \"explanation\": \"Why this solution works\"
    }
  ],
  \"quiz\": [
    {
      \"question\": \"Quiz question\",
      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
      \"correctAnswer\": 0,
      \"explanation\": \"Explanation of correct answer\"
    }
  ]
}

Make the content engaging, educational, and appropriate for the {$level} level. Include 2-3 examples and 3-5 quiz questions.";
    }
    
    /**
     * Create prompt for tutor response
     */
    private function create_tutor_response_prompt($message, $subject, $chat_history) {
        $context = !empty($subject) ? " in {$subject}" : '';
        $history_text = '';
        
        if (!empty($chat_history)) {
            $history_text = "\n\nPrevious conversation:\n";
            foreach (array_slice($chat_history, -5) as $msg) {
                $sender = $msg['is_user'] ? 'Student' : 'Tutor';
                $history_text .= "{$sender}: {$msg['message']}\n";
            }
        }
        
        return "You are an AI tutor helping a student{$context}. Provide a helpful, encouraging, and educational response to their question or comment.

Student's message: {$message}
{$history_text}

Respond as a supportive tutor. Be concise but thorough, and encourage further learning.";
    }
    
    /**
     * Create prompt for questions generation
     */
    private function create_questions_prompt($subject, $topic, $count, $type, $difficulty) {
        return "Generate {$count} {$difficulty} level {$type} questions about '{$topic}' in {$subject}.

Format your response as a JSON array:
[
  {
    \"question\": \"Question text\",
    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
    \"correctAnswer\": 0,
    \"explanation\": \"Why this is correct\"
  }
]

Make questions educational and appropriate for {$difficulty} level students.";
    }
    
    /**
     * Create prompt for examples generation
     */
    private function create_examples_prompt($subject, $topic, $count) {
        return "Generate {$count} practical examples for '{$topic}' in {$subject}.

Format your response as a JSON array:
[
  {
    \"problem\": \"Example problem or scenario\",
    \"solution\": \"Step-by-step solution\",
    \"explanation\": \"Educational explanation\"
  }
]

Make examples clear, practical, and educational.";
    }
    
    /**
     * Create prompt for answer evaluation
     */
    private function create_evaluation_prompt($question, $student_answer, $correct_answer, $subject) {
        $context = !empty($subject) ? " in {$subject}" : '';
        $correct_text = !empty($correct_answer) ? "\nCorrect answer: {$correct_answer}" : '';
        
        return "Evaluate this student's answer{$context}:

Question: {$question}
Student's answer: {$student_answer}
{$correct_text}

Provide feedback as a JSON object:
{
  \"correct\": true/false,
  \"score\": 0-100,
  \"feedback\": \"Constructive feedback explaining what's right/wrong and how to improve\"
}

Be encouraging and educational in your feedback.";
    }
    
    /**
     * Parse lesson content response
     */
    private function parse_lesson_content($response) {
        // Try to extract JSON from response
        $json_start = strpos($response, '{');
        $json_end = strrpos($response, '}');
        
        if ($json_start !== false && $json_end !== false) {
            $json_str = substr($response, $json_start, $json_end - $json_start + 1);
            $parsed = json_decode($json_str, true);
            
            if ($parsed) {
                return $parsed;
            }
        }
        
        // Fallback: create structured response from text
        return array(
            'title' => 'AI Generated Lesson',
            'description' => 'Comprehensive lesson content',
            'content' => $response,
            'examples' => array(),
            'quiz' => array()
        );
    }
    
    /**
     * Parse simple text response
     */
    private function parse_simple_response($response) {
        return trim($response);
    }
    
    /**
     * Parse questions response
     */
    private function parse_questions_response($response) {
        $json_start = strpos($response, '[');
        $json_end = strrpos($response, ']');
        
        if ($json_start !== false && $json_end !== false) {
            $json_str = substr($response, $json_start, $json_end - $json_start + 1);
            $parsed = json_decode($json_str, true);
            
            if ($parsed && is_array($parsed)) {
                return $parsed;
            }
        }
        
        return array();
    }
    
    /**
     * Parse examples response
     */
    private function parse_examples_response($response) {
        return $this->parse_questions_response($response); // Same format
    }
    
    /**
     * Parse evaluation response
     */
    private function parse_evaluation_response($response) {
        $json_start = strpos($response, '{');
        $json_end = strrpos($response, '}');
        
        if ($json_start !== false && $json_end !== false) {
            $json_str = substr($response, $json_start, $json_end - $json_start + 1);
            $parsed = json_decode($json_str, true);
            
            if ($parsed) {
                return $parsed;
            }
        }
        
        return array(
            'correct' => false,
            'score' => 50,
            'feedback' => 'Unable to evaluate answer properly. Please try again.'
        );
    }
    
    /**
     * Generate fallback lesson content when AI is unavailable
     */
    private function generate_fallback_lesson_content($subject, $topic, $level) {
        return array(
            'title' => $topic,
            'description' => "Introduction to {$topic} in {$subject}",
            'content' => "This lesson covers the fundamentals of {$topic}. The content would be generated by AI when a Google API key is configured.",
            'examples' => array(
                array(
                    'problem' => "Sample problem for {$topic}",
                    'solution' => "Step-by-step solution would be provided here",
                    'explanation' => "Detailed explanation would be available with AI"
                )
            ),
            'quiz' => array(
                array(
                    'question' => "What is the main concept of {$topic}?",
                    'options' => array("Concept A", "Concept B", "Concept C", "Concept D"),
                    'correctAnswer' => 0,
                    'explanation' => "AI would provide detailed explanations"
                )
            )
        );
    }
    
    /**
     * Generate fallback tutor response
     */
    private function generate_fallback_tutor_response($message, $subject) {
        $responses = array(
            "That's a great question about {$subject}! To get detailed AI-powered responses, please configure your Google API key in the plugin settings.",
            "I'd love to help you with that {$subject} topic! For personalized AI tutoring, make sure to add your Google API key in the settings.",
            "Excellent question! With a Google API key configured, I can provide much more detailed and personalized responses about {$subject}.",
        );
        
        $response = $responses[array_rand($responses)];
        return str_replace('{$subject}', $subject ?: 'this topic', $response);
    }
    
    /**
     * Generate fallback questions
     */
    private function generate_fallback_questions($subject, $topic, $count) {
        $questions = array();
        for ($i = 1; $i <= min($count, 3); $i++) {
            $questions[] = array(
                'question' => "Sample question {$i} about {$topic}",
                'options' => array("Option A", "Option B", "Option C", "Option D"),
                'correctAnswer' => 0,
                'explanation' => "Configure Google API key for AI-generated questions and explanations"
            );
        }
        return $questions;
    }
    
    /**
     * Generate fallback examples
     */
    private function generate_fallback_examples($subject, $topic, $count) {
        $examples = array();
        for ($i = 1; $i <= min($count, 2); $i++) {
            $examples[] = array(
                'problem' => "Example problem {$i} for {$topic}",
                'solution' => "AI-generated solution would appear here",
                'explanation' => "Configure Google API key for detailed AI explanations"
            );
        }
        return $examples;
    }
    
    /**
     * Generate fallback evaluation
     */
    private function generate_fallback_evaluation($question, $student_answer, $correct_answer) {
        return array(
            'correct' => !empty($correct_answer) && strtolower(trim($student_answer)) === strtolower(trim($correct_answer)),
            'score' => 75,
            'feedback' => 'Basic evaluation provided. Configure Google API key for detailed AI feedback and explanations.'
        );
    }
}