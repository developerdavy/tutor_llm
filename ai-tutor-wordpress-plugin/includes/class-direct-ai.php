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
            return $this->generate_fallback_lesson_content($subject, $topic, $level);
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
        
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code !== 200) {
            throw new Exception('API request failed with status code: ' . $status_code);
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (empty($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception('Empty response from API');
        }
        
        return $data['candidates'][0]['content']['parts'][0]['text'];
    }
    
    /**
     * Create lesson content prompt
     */
    private function create_lesson_content_prompt($subject, $topic, $level) {
        return "Create comprehensive lesson content for {$subject} on the topic '{$topic}' at {$level} level. 
        
        Please provide:
        1. A clear title and description
        2. Detailed explanation of key concepts
        3. 3 practical examples with solutions and explanations
        4. A 5-question quiz with multiple choice answers
        
        Format the response as structured text that can be easily parsed and displayed.";
    }
    
    /**
     * Create tutor response prompt
     */
    private function create_tutor_response_prompt($message, $subject, $chat_history) {
        $context = !empty($subject) ? "You are an AI tutor helping with {$subject}. " : "You are an AI tutor. ";
        $context .= "Respond helpfully and encouragingly to the student's question. ";
        $context .= "Keep responses concise but thorough. ";
        
        if (!empty($chat_history)) {
            $context .= "Previous conversation context: " . json_encode(array_slice($chat_history, -5)) . " ";
        }
        
        return $context . "Student's question: " . $message;
    }
    
    /**
     * Create questions prompt
     */
    private function create_questions_prompt($subject, $topic, $count, $type, $difficulty) {
        return "Generate {$count} {$type} questions about {$topic} in {$subject} at {$difficulty} difficulty level. 
        
        For each question, provide:
        1. The question text
        2. 4 multiple choice options (A, B, C, D)
        3. The correct answer
        4. A brief explanation
        
        Format as JSON array with question, options, correctAnswer, and explanation fields.";
    }
    
    /**
     * Create examples prompt
     */
    private function create_examples_prompt($subject, $topic, $count) {
        return "Generate {$count} practical examples for {$topic} in {$subject}. 
        
        For each example, provide:
        1. A problem statement
        2. Step-by-step solution
        3. Clear explanation of concepts used
        
        Format as JSON array with problem, solution, and explanation fields.";
    }
    
    /**
     * Create evaluation prompt
     */
    private function create_evaluation_prompt($question, $student_answer, $correct_answer, $subject) {
        return "Evaluate this student's answer for a {$subject} question:
        
        Question: {$question}
        Student's Answer: {$student_answer}
        Correct Answer: {$correct_answer}
        
        Provide:
        1. Whether the answer is correct (true/false)
        2. A score out of 100
        3. Constructive feedback
        4. Suggestions for improvement if needed
        
        Format as JSON with correct, score, feedback, and suggestions fields.";
    }
    
    /**
     * Parse lesson content response
     */
    private function parse_lesson_content($response) {
        return array(
            'title' => $this->extract_title($response),
            'description' => $this->extract_description($response),
            'content' => $response,
            'examples' => $this->extract_examples($response),
            'quiz' => $this->extract_quiz($response)
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
        $decoded = json_decode($response, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        return $this->parse_questions_from_text($response);
    }
    
    /**
     * Parse examples response
     */
    private function parse_examples_response($response) {
        $decoded = json_decode($response, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        return $this->parse_examples_from_text($response);
    }
    
    /**
     * Parse evaluation response
     */
    private function parse_evaluation_response($response) {
        $decoded = json_decode($response, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        
        return array(
            'correct' => strpos(strtolower($response), 'correct') !== false,
            'score' => 75,
            'feedback' => $response,
            'suggestions' => array()
        );
    }
    
    /**
     * Helper methods for content extraction
     */
    private function extract_title($content) {
        if (preg_match('/^#\s*(.+)/m', $content, $matches)) {
            return trim($matches[1]);
        }
        return 'AI Generated Lesson';
    }
    
    private function extract_description($content) {
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line) && !preg_match('/^#/', $line)) {
                return $line;
            }
        }
        return 'AI generated lesson content';
    }
    
    private function extract_examples($content) {
        $examples = array();
        if (preg_match_all('/Example\s*\d*:?\s*(.+?)(?=Example|\n\n|$)/s', $content, $matches)) {
            foreach ($matches[1] as $example) {
                $examples[] = array(
                    'problem' => trim($example),
                    'solution' => 'See explanation above',
                    'explanation' => trim($example)
                );
            }
        }
        return $examples;
    }
    
    private function extract_quiz($content) {
        $questions = array();
        if (preg_match_all('/\d+\.\s*(.+?)(?=\d+\.|$)/s', $content, $matches)) {
            foreach ($matches[1] as $question) {
                $questions[] = array(
                    'question' => trim($question),
                    'options' => array('A', 'B', 'C', 'D'),
                    'correctAnswer' => 0,
                    'explanation' => 'Check the lesson content for the answer'
                );
            }
        }
        return $questions;
    }
    
    private function parse_questions_from_text($text) {
        $questions = array();
        $lines = explode("\n", $text);
        $current_question = null;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (preg_match('/^\d+\.\s*(.+)/', $line, $matches)) {
                if ($current_question) {
                    $questions[] = $current_question;
                }
                $current_question = array(
                    'question' => $matches[1],
                    'options' => array(),
                    'correctAnswer' => 0,
                    'explanation' => ''
                );
            } elseif (preg_match('/^[A-D]\)\s*(.+)/', $line, $matches)) {
                if ($current_question) {
                    $current_question['options'][] = $matches[1];
                }
            }
        }
        
        if ($current_question) {
            $questions[] = $current_question;
        }
        
        return $questions;
    }
    
    private function parse_examples_from_text($text) {
        $examples = array();
        if (preg_match_all('/Example\s*\d*:?\s*(.+?)(?=Example|\n\n|$)/s', $text, $matches)) {
            foreach ($matches[1] as $example) {
                $examples[] = array(
                    'problem' => trim($example),
                    'solution' => 'See explanation',
                    'explanation' => trim($example)
                );
            }
        }
        return $examples;
    }
    
    /**
     * Fallback methods when AI is not available
     */
    private function generate_fallback_lesson_content($subject, $topic, $level) {
        return array(
            'title' => $topic,
            'description' => "This lesson covers {$topic} in {$subject} at {$level} level.",
            'content' => "Welcome to this lesson on {$topic}. This is a {$level} level lesson in {$subject}. Please configure your Google API key for full AI-powered content generation.",
            'examples' => array(
                array(
                    'problem' => "Sample problem for {$topic}",
                    'solution' => "Sample solution",
                    'explanation' => "This is a sample explanation. Configure AI for detailed examples."
                )
            ),
            'quiz' => array(
                array(
                    'question' => "What is the main topic of this lesson?",
                    'options' => array($topic, 'Other topic', 'Not specified', 'Unknown'),
                    'correctAnswer' => 0,
                    'explanation' => "The lesson focuses on {$topic}."
                )
            )
        );
    }
    
    private function generate_fallback_tutor_response($message, $subject) {
        $responses = array(
            "I understand your question about {$subject}. Let me help you with that.",
            "That's a great question! In {$subject}, this concept is important to understand.",
            "I'd be happy to help you with {$subject}. Let me explain this step by step.",
            "Good question! This is a fundamental concept in {$subject}."
        );
        
        return $responses[array_rand($responses)];
    }
    
    private function generate_fallback_questions($subject, $topic, $count) {
        $questions = array();
        for ($i = 1; $i <= $count; $i++) {
            $questions[] = array(
                'question' => "Question {$i} about {$topic} in {$subject}",
                'options' => array('Option A', 'Option B', 'Option C', 'Option D'),
                'correctAnswer' => 0,
                'explanation' => "This is a sample question. Configure AI for detailed questions."
            );
        }
        return $questions;
    }
    
    private function generate_fallback_examples($subject, $topic, $count) {
        $examples = array();
        for ($i = 1; $i <= $count; $i++) {
            $examples[] = array(
                'problem' => "Example {$i} for {$topic} in {$subject}",
                'solution' => "Sample solution {$i}",
                'explanation' => "This is a sample example. Configure AI for detailed examples."
            );
        }
        return $examples;
    }
    
    private function generate_fallback_evaluation($question, $student_answer, $correct_answer) {
        return array(
            'correct' => false,
            'score' => 50,
            'feedback' => 'Configure AI for detailed evaluation.',
            'suggestions' => array('Set up Google API key for personalized feedback')
        );
    }
}