/**
 * Comprehensive WordPress AJAX Debug Script
 * Run this in browser console on any page with the AI Tutor plugin
 */

console.log('🔍 Starting comprehensive WordPress AJAX debug...');

// Step 1: Environment Detection
function detectEnvironment() {
    console.log('\n=== STEP 1: ENVIRONMENT DETECTION ===');
    
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    // Try to detect WordPress AJAX URL
    let possibleAjaxUrls = [];
    
    if (typeof aiTutorAjax !== 'undefined') {
        possibleAjaxUrls.push(aiTutorAjax.ajaxurl);
        console.log('✅ WordPress AJAX variables found:', aiTutorAjax);
    } else {
        console.log('❌ WordPress AJAX variables not found');
        // Generate possible URLs based on current location
        const origin = window.location.origin;
        possibleAjaxUrls = [
            origin + '/wp-admin/admin-ajax.php',
            origin + '/wordpress/wp-admin/admin-ajax.php',
            origin + '/wp/wp-admin/admin-ajax.php'
        ];
        console.log('🔍 Will test these possible AJAX URLs:', possibleAjaxUrls);
    }
    
    return possibleAjaxUrls;
}

// Step 2: Test AJAX Endpoints
async function testAjaxEndpoints(urls) {
    console.log('\n=== STEP 2: TESTING AJAX ENDPOINTS ===');
    
    for (let url of urls) {
        console.log(`\n🧪 Testing: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=heartbeat'
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.status === 200) {
                console.log('✅ AJAX endpoint is accessible');
                const text = await response.text();
                console.log('Response preview:', text.substring(0, 100) + '...');
                return url; // Return the working URL
            } else if (response.status === 400) {
                console.log('⚠️ 400 Bad Request - endpoint exists but rejecting request');
                return url; // Still usable, just needs proper data
            } else {
                console.log(`❌ Unexpected status: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Network error: ${error.message}`);
        }
    }
    
    return null;
}

// Step 3: Test AI Tutor Specific Actions
async function testAITutorActions(ajaxUrl) {
    console.log('\n=== STEP 3: TESTING AI TUTOR ACTIONS ===');
    
    const actions = [
        'ai_tutor_get_subjects',
        'ai_tutor_get_subject_lessons',
        'ai_tutor_get_lesson'
    ];
    
    for (let action of actions) {
        console.log(`\n🧪 Testing action: ${action}`);
        
        try {
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=${action}&nonce=test123`
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            
            if (text === '0') {
                console.log('❌ WordPress returned "0" - action not registered or nonce failed');
            } else if (text.includes('Security check failed')) {
                console.log('❌ Nonce validation failed');
            } else if (text.includes('<!DOCTYPE')) {
                console.log('❌ WordPress returned HTML page - check plugin activation');
            } else if (text.includes('{') && text.includes('}')) {
                console.log('✅ JSON response received');
                try {
                    const json = JSON.parse(text);
                    console.log('Parsed response:', json);
                } catch (e) {
                    console.log('⚠️ Invalid JSON:', text.substring(0, 100));
                }
            } else {
                console.log('⚠️ Unexpected response:', text.substring(0, 100));
            }
            
        } catch (error) {
            console.log(`❌ Network error: ${error.message}`);
        }
    }
}

// Step 4: Plugin Detection
function checkPluginStatus() {
    console.log('\n=== STEP 4: PLUGIN STATUS CHECK ===');
    
    // Check for AI Tutor elements
    const subjects = document.querySelectorAll('.ai-tutor-subjects, .subject-card');
    const aiElements = document.querySelectorAll('[class*="ai-tutor"]');
    
    console.log(`Found ${subjects.length} subject-related elements`);
    console.log(`Found ${aiElements.length} AI Tutor elements total`);
    
    // Check for loaded scripts
    const scripts = Array.from(document.scripts);
    const aiScripts = scripts.filter(s => s.src.includes('ai-tutor'));
    console.log(`Found ${aiScripts.length} AI Tutor scripts loaded:`);
    aiScripts.forEach(s => console.log(' -', s.src));
    
    // Check for JavaScript errors
    console.log('Check browser console for any JavaScript errors above this message');
}

// Step 5: Generate Solutions
function generateSolutions(workingUrl) {
    console.log('\n=== STEP 5: RECOMMENDED SOLUTIONS ===');
    
    if (!workingUrl) {
        console.log('❌ No working AJAX URL found');
        console.log('🔧 SOLUTIONS:');
        console.log('1. Verify WordPress is installed and accessible');
        console.log('2. Check if you\'re on the correct WordPress site');
        console.log('3. Try accessing wp-admin directly in browser');
        console.log('4. Check web server is running');
        return;
    }
    
    console.log(`✅ Working AJAX URL: ${workingUrl}`);
    
    if (typeof aiTutorAjax === 'undefined') {
        console.log('❌ WordPress AJAX variables not loaded');
        console.log('🔧 SOLUTIONS:');
        console.log('1. Ensure you\'re viewing a WordPress page (not static HTML)');
        console.log('2. Check if AI Tutor plugin is activated');
        console.log('3. Verify scripts are loading correctly');
        console.log('4. Hard refresh the page (Ctrl+F5)');
    } else {
        console.log('✅ WordPress AJAX variables loaded correctly');
        console.log('🔧 If still getting 400 errors:');
        console.log('1. Check WordPress debug log for detailed errors');
        console.log('2. Ensure user is logged in (for some actions)');
        console.log('3. Clear browser cache completely');
        console.log('4. Check if other plugins are interfering');
    }
}

// Main execution
async function runCompleteDebug() {
    const urls = detectEnvironment();
    const workingUrl = await testAjaxEndpoints(urls);
    
    if (workingUrl) {
        await testAITutorActions(workingUrl);
    }
    
    checkPluginStatus();
    generateSolutions(workingUrl);
    
    console.log('\n=== DEBUG COMPLETE ===');
    console.log('📋 Copy all the above output and check the recommended solutions');
    console.log('📧 If issues persist, share this debug output for further assistance');
}

// Start the debug process
runCompleteDebug();