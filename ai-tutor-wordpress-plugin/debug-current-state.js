/**
 * Debug Current WordPress State
 * Run this in browser console to check what data exists
 */

console.log('🔍 Debugging current WordPress AI Tutor state...');

// Check if WordPress AJAX is available
if (typeof aiTutorAjax !== 'undefined') {
    console.log('✅ WordPress AJAX variables:', aiTutorAjax);
    
    // Test direct AJAX calls
    async function testDirectAjax() {
        console.log('\n=== TESTING CURRENT AJAX CALLS ===');
        
        // Test get_subjects
        try {
            const subjectsResponse = await fetch(aiTutorAjax.ajaxurl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=ai_tutor_get_subjects&nonce=${aiTutorAjax.nonce}`
            });
            
            console.log('📚 Subjects response:', subjectsResponse.status);
            const subjectsData = await subjectsResponse.text();
            console.log('📚 Subjects data:', subjectsData);
            
            if (subjectsData.includes('{')) {
                const subjects = JSON.parse(subjectsData);
                console.log('📚 Parsed subjects:', subjects);
                
                // If we have subjects, test lessons for the first one
                if (subjects.success && subjects.data && subjects.data.length > 0) {
                    const firstSubjectId = subjects.data[0].id;
                    console.log(`\n📖 Testing lessons for subject ID: ${firstSubjectId}`);
                    
                    const lessonsResponse = await fetch(aiTutorAjax.ajaxurl, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: `action=ai_tutor_get_subject_lessons&subject_id=${firstSubjectId}&nonce=${aiTutorAjax.nonce}`
                    });
                    
                    console.log('📖 Lessons response:', lessonsResponse.status);
                    const lessonsData = await lessonsResponse.text();
                    console.log('📖 Lessons data:', lessonsData);
                    
                    if (lessonsData.includes('{')) {
                        const lessons = JSON.parse(lessonsData);
                        console.log('📖 Parsed lessons:', lessons);
                    }
                } else {
                    console.log('❌ No subjects found - need to create sample data');
                }
            }
        } catch (error) {
            console.error('❌ AJAX test error:', error);
        }
    }
    
    // Run the test
    testDirectAjax();
    
} else {
    console.log('❌ WordPress AJAX variables not found');
    console.log('💡 Possible solutions:');
    console.log('1. Make sure you\'re on a WordPress page with the AI Tutor plugin');
    console.log('2. Check if the plugin is activated');
    console.log('3. Hard refresh the page (Ctrl+F5)');
}

// Check DOM elements
console.log('\n=== DOM ELEMENTS CHECK ===');
const aiElements = document.querySelectorAll('[class*="ai-tutor"], .subject-card');
console.log(`Found ${aiElements.length} AI Tutor elements:`, aiElements);

// Check for current navigation instance
if (window.aiTutorNavigation) {
    console.log('✅ Navigation instance found:', window.aiTutorNavigation);
} else {
    console.log('❌ Navigation instance not found');
}

console.log('\n=== SUMMARY ===');
console.log('Check the logs above for:');
console.log('- AJAX connectivity status');
console.log('- Available subjects and lessons data');
console.log('- Any specific error messages');
console.log('- DOM element presence');