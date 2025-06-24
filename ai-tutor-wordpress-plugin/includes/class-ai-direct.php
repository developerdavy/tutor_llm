<?php

class AI_Tutor_Direct_AI {
    
    private $google_api_key;
    
    public function __construct() {
        $this->google_api_key = get_option('ai_tutor_google_api_key', '');
    }
    
    public function generate_lesson_content($subject, $topic, $level = 'high school') {
        if (empty($this->google_api_key)) {
            return $this->get_fallback_content($subject, $topic);
        }
        
        $prompt = "Create a comprehensive {$level} lesson for {$subject} on the topic \"{$topic}\". Respond ONLY with valid JSON, no markdown formatting. Use this structure:

{\"title\": \"{$topic}\", \"description\": \"Brief lesson description\", \"content\": \"Detailed educational content with key concepts\", \"examples\": [{\"problem\": \"Sample problem\", \"solution\": \"Step-by-step solution\", \"explanation\": \"Why this approach works\"}], \"quiz\": [{\"question\": \"Test question\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": 0, \"explanation\": \"Explanation of correct answer\"}]}";
        
        $response = $this->call_gemini_api($prompt);
        
        if ($response) {
            $content = json_decode($response, true);
            if ($content && isset($content['title'])) {
                return $content;
            }
        }
        
        return $this->get_fallback_content($subject, $topic);
    }
    
    public function generate_tutor_response($message, $subject, $lesson_title = '', $lesson_content = '') {
        if (empty($this->google_api_key)) {
            return $this->get_fallback_response($message, $subject, $lesson_title);
        }
        
        $context = $lesson_title ? "Current lesson: {$lesson_title}" : '';
        
        $prompt = "You are an expert AI tutor specializing in {$subject}. Provide a clear, encouraging response to this student question: \"{$message}\"
        
{$context}

Guidelines:
- Be patient and supportive
- Break down complex concepts into simple steps
- Use examples when helpful
- Keep responses focused and educational
- Encourage further learning";
        
        $response = $this->call_gemini_api($prompt);
        
        if ($response) {
            return $response;
        }
        
        return $this->get_fallback_response($message, $subject, $lesson_title);
    }
    
    public function generate_questions($subject, $topic, $content = '', $type = 'multiple_choice', $difficulty = 'medium', $count = 5) {
        if (empty($this->google_api_key)) {
            return $this->get_fallback_questions($subject, $topic, $count);
        }
        
        $prompt = "Generate {$count} {$type} questions about {$topic} in {$subject} at {$difficulty} difficulty level.
        " . ($content ? "Based on this content: {$content}" : '') . "
        
Respond ONLY with valid JSON array:
[
  {
    \"question\": \"Question text\",
    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
    \"correctAnswer\": 0,
    \"explanation\": \"Why this is correct\"
  }
]";
        
        $response = $this->call_gemini_api($prompt);
        
        if ($response) {
            $questions = json_decode($response, true);
            if (is_array($questions)) {
                return $questions;
            }
        }
        
        return $this->get_fallback_questions($subject, $topic, $count);
    }
    
    public function evaluate_answer($question, $user_answer, $correct_answer, $subject) {
        if (empty($this->google_api_key)) {
            return $this->get_fallback_evaluation($user_answer, $correct_answer);
        }
        
        $prompt = "As an expert {$subject} tutor, evaluate this student's answer:

Question: {$question}
Student's Answer: {$user_answer}
Correct Answer: {$correct_answer}

Provide feedback as JSON:
{
  \"isCorrect\": boolean,
  \"feedback\": \"encouraging feedback message\",
  \"explanation\": \"detailed explanation\"
}";
        
        $response = $this->call_gemini_api($prompt);
        
        if ($response) {
            $evaluation = json_decode($response, true);
            if ($evaluation && isset($evaluation['isCorrect'])) {
                return $evaluation;
            }
        }
        
        return $this->get_fallback_evaluation($user_answer, $correct_answer);
    }
    
    private function call_gemini_api($prompt) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' . $this->google_api_key;
        
        $data = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $prompt)
                    )
                )
            )
        );
        
        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data),
            'timeout' => 30
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            error_log('Gemini API Error: ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            $text = $data['candidates'][0]['content']['parts'][0]['text'];
            // Clean up any markdown formatting
            $text = preg_replace('/```json\s*/', '', $text);
            $text = preg_replace('/```\s*$/', '', $text);
            return trim($text);
        }
        
        return false;
    }
    
    private function get_fallback_content($subject, $topic) {
        return array(
            'title' => $topic,
            'description' => "Learn about {$topic} in {$subject}",
            'content' => "This lesson covers the fundamentals of {$topic} in {$subject}. This content would be AI-generated with your Google API key configured.",
            'examples' => array(
                array(
                    'problem' => "Example problem for {$topic}",
                    'solution' => "Step-by-step solution would go here",
                    'explanation' => "This explains the solution approach"
                )
            ),
            'quiz' => array(
                array(
                    'question' => "What is an important concept in {$topic}?",
                    'options' => array("Concept A", "Concept B", "Concept C", "All of the above"),
                    'correctAnswer' => 3,
                    'explanation' => "This covers multiple important concepts in {$topic}"
                )
            )
        );
    }
    
    private function get_fallback_response($message, $subject, $lesson_title) {
        $responses = array(
            "That's a great question about {$subject}! With the Google API key configured, I could provide detailed explanations.",
            "I can see you're asking about {$lesson_title}. To give you AI-powered responses, please add your Google API key in the settings.",
            "Excellent question! This relates to key concepts in {$subject}. Enable AI responses by setting up your Google API key.",
            "Good thinking! This type of question shows you're engaging with {$subject}. Full AI responses available with API key setup."
        );
        
        return $responses[array_rand($responses)];
    }
    
    private function get_fallback_questions($subject, $topic, $count) {
        $questions = array();
        for ($i = 1; $i <= $count; $i++) {
            $questions[] = array(
                'question' => "Question {$i}: What is an important concept in {$topic}?",
                'options' => array("Concept A", "Concept B", "Concept C", "All of the above"),
                'correctAnswer' => 3,
                'explanation' => "This {$subject} question covers fundamental concepts. Enable AI generation with your Google API key for dynamic questions."
            );
        }
        return $questions;
    }
    
    private function get_fallback_evaluation($user_answer, $correct_answer) {
        $is_correct = strtolower(trim($user_answer)) === strtolower(trim($correct_answer));
        
        return array(
            'isCorrect' => $is_correct,
            'feedback' => $is_correct ? 'Correct! Good job!' : 'Not quite right, but keep trying!',
            'explanation' => 'With Google API key configured, you would get detailed AI-powered feedback and explanations.'
        );
    }
}