/**
 * WordPress Plugin Lesson Navigation Debug Script
 * Run this in browser console to test lesson navigation
 */

console.log('=== AI Tutor Lesson Navigation Debug ===');

// Check if required scripts are loaded
console.log('1. Checking loaded scripts...');
const requiredScripts = [
    'ai-tutor-navigation',
    'ai-tutor-realtime'
];

requiredScripts.forEach(script => {
    const scriptElement = document.querySelector(`script[src*="${script}"]`);
    console.log(`${script}: ${scriptElement ? '✓ Loaded' : '✗ Missing'}`);
});

// Check if global variables are available
console.log('\n2. Checking global variables...');
console.log('aiTutorAjax:', typeof aiTutorAjax !== 'undefined' ? '✓ Available' : '✗ Missing');
console.log('window.aiTutorNavigation:', typeof window.aiTutorNavigation !== 'undefined' ? '✓ Available' : '✗ Missing');

// Check lesson links on page
console.log('\n3. Analyzing lesson links...');
const lessonLinks = document.querySelectorAll('.lesson-link');
console.log(`Found ${lessonLinks.length} lesson links`);

lessonLinks.forEach((link, index) => {
    const lessonId = link.dataset.lessonId;
    const text = link.textContent.trim();
    console.log(`  Link ${index + 1}: ID=${lessonId}, Text="${text}"`);
    
    // Check if link has proper event listeners
    const listeners = getEventListeners ? getEventListeners(link) : 'Unable to check';
    console.log(`    Event listeners:`, listeners);
});

// Check for conflicting event handlers
console.log('\n4. Checking for conflicts...');
const conflictingSelectors = [
    '.subject-card',
    '.explore-btn',
    '.lessons-btn'
];

conflictingSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`${selector}: ${elements.length} elements found`);
});

// Test AJAX endpoint
console.log('\n5. Testing AJAX endpoint...');
if (typeof aiTutorAjax !== 'undefined') {
    fetch(aiTutorAjax.ajaxurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'ai_tutor_get_subjects',
            nonce: aiTutorAjax.nonce
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('AJAX Test Result:', data.success ? '✓ Working' : '✗ Failed');
        if (!data.success) console.log('Error:', data.data);
    })
    .catch(error => {
        console.log('AJAX Test Result: ✗ Network Error');
        console.log('Error:', error);
    });
} else {
    console.log('AJAX Test: ✗ Cannot test - aiTutorAjax not available');
}

// Function to test a specific lesson
window.testLessonNavigation = function(lessonId) {
    console.log(`\n=== Testing Lesson ${lessonId} ===`);
    
    if (window.aiTutorNavigation && typeof window.aiTutorNavigation.selectLesson === 'function') {
        console.log('Attempting to select lesson via navigation system...');
        window.aiTutorNavigation.selectLesson(lessonId);
    } else {
        console.log('Navigation system not available');
    }
};

// Function to simulate lesson link click
window.simulateLessonClick = function(index = 0) {
    const lessonLinks = document.querySelectorAll('.lesson-link');
    if (lessonLinks[index]) {
        console.log(`Simulating click on lesson link ${index + 1}`);
        lessonLinks[index].click();
    } else {
        console.log(`No lesson link found at index ${index}`);
    }
};

console.log('\n=== Debug Complete ===');
console.log('Use testLessonNavigation(lessonId) to test specific lesson');
console.log('Use simulateLessonClick(index) to test lesson link clicks');