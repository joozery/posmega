// Test script to check API settings and tax rate
console.log('🔍 Testing API settings and tax rate...');

// Function to test API settings
async function testAPISettings() {
    try {
        console.log('📡 Testing API settings...');
        
        // Get auth token
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            console.log('❌ No auth token found. Please login first.');
            return;
        }
        
        // Test GET /api/settings
        console.log('📋 Getting settings from API...');
        const response = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            // Check tax rate
            const taxRate = data.settings?.system?.tax_rate || data.settings?.system?.taxRate;
            console.log(`💰 Tax rate from API: ${taxRate}%`);
            
            // Check if tax rate is 3
            if (taxRate === '3' || taxRate === 3) {
                console.log('✅ Tax rate is correctly set to 3%');
            } else {
                console.log('❌ Tax rate is not 3% - it is:', taxRate);
            }
            
            // Save to localStorage
            localStorage.setItem('pos_settings', JSON.stringify(data.settings));
            console.log('✅ Settings saved to localStorage');
            
            // Dispatch event
            window.dispatchEvent(new Event('settings_updated'));
            console.log('📢 Settings update event dispatched');
            
            return data.settings;
        } else {
            console.log('❌ API call failed:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ API error:', error);
    }
}

// Function to update tax rate via API
async function updateTaxRateViaAPI(newRate) {
    try {
        console.log(`🔄 Updating tax rate to ${newRate}% via API...`);
        
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            console.log('❌ No auth token found. Please login first.');
            return;
        }
        
        // Get current settings first
        const getResponse = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!getResponse.ok) {
            console.log('❌ Failed to get current settings');
            return;
        }
        
        const currentData = await getResponse.json();
        const currentSettings = currentData.settings || {};
        
        // Update tax rate
        const updateData = {
            settings: {
                ...currentSettings,
                system: {
                    ...currentSettings.system,
                    tax_rate: String(newRate)
                }
            }
        };
        
        console.log('📤 Sending update:', updateData);
        
        const updateResponse = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
            console.log('✅ Tax rate updated via API');
            
            // Verify the update
            await testAPISettings();
        } else {
            console.log('❌ Failed to update tax rate:', updateResponse.status);
            const errorText = await updateResponse.text();
            console.log('Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ Update error:', error);
    }
}

// Function to check localStorage settings
function checkLocalStorageSettings() {
    console.log('📋 Checking localStorage settings...');
    
    const savedSettings = localStorage.getItem('pos_settings');
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        console.log('📊 Parsed settings:', parsed);
        
        const taxRate = parsed.system?.tax_rate || parsed.system?.taxRate;
        console.log(`💰 Tax rate in localStorage: ${taxRate}%`);
        
        return parsed;
    } else {
        console.log('❌ No settings in localStorage');
        return null;
    }
}

// Function to force reload from API
async function forceReloadFromAPI() {
    console.log('🔄 Force reloading from API...');
    
    // Clear localStorage
    localStorage.removeItem('pos_settings');
    console.log('✅ Cleared localStorage');
    
    // Reload from API
    const settings = await testAPISettings();
    
    if (settings) {
        console.log('✅ Successfully reloaded from API');
        return settings;
    } else {
        console.log('❌ Failed to reload from API');
        return null;
    }
}

// Function to run complete test
async function runCompleteTest() {
    console.log('🚀 Running complete API settings test...\n');
    
    // 1. Check current localStorage
    console.log('📋 Step 1: Check current localStorage');
    checkLocalStorageSettings();
    
    // 2. Test API
    console.log('\n📋 Step 2: Test API settings');
    const apiSettings = await testAPISettings();
    
    // 3. Check localStorage after API
    console.log('\n📋 Step 3: Check localStorage after API');
    checkLocalStorageSettings();
    
    // 4. Update tax rate if needed
    if (apiSettings) {
        const currentTaxRate = apiSettings.system?.tax_rate || apiSettings.system?.taxRate;
        if (currentTaxRate !== '3' && currentTaxRate !== 3) {
            console.log('\n📋 Step 4: Update tax rate to 3%');
            await updateTaxRateViaAPI(3);
        } else {
            console.log('\n📋 Step 4: Tax rate is already 3%');
        }
    }
    
    // 5. Final check
    console.log('\n📋 Step 5: Final check');
    await testAPISettings();
    checkLocalStorageSettings();
    
    console.log('\n✅ Complete test finished');
    console.log('📝 Next steps:');
    console.log('1. Refresh the page');
    console.log('2. Check if tax rate shows 3% in POS');
    console.log('3. Test cart calculation');
}

// Export functions
window.testAPISettings = testAPISettings;
window.updateTaxRateViaAPI = updateTaxRateViaAPI;
window.checkLocalStorageSettings = checkLocalStorageSettings;
window.forceReloadFromAPI = forceReloadFromAPI;
window.runCompleteTest = runCompleteTest;

console.log('🛠️ Available functions:');
console.log('- testAPISettings() - Test API settings');
console.log('- updateTaxRateViaAPI(rate) - Update tax rate via API');
console.log('- checkLocalStorageSettings() - Check localStorage');
console.log('- forceReloadFromAPI() - Force reload from API');
console.log('- runCompleteTest() - Run complete test');

// Auto-run if on POS page
if (window.location.pathname.includes('/pos')) {
    console.log('📄 On POS page, auto-running test...');
    setTimeout(() => {
        runCompleteTest();
    }, 1000);
} else {
    console.log('💡 Run runCompleteTest() to start test');
}
