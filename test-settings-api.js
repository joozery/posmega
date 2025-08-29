// Test script to check settings API connection and tax rate
console.log('🔍 Testing Settings API connection...');

// Function to test settings API
async function testSettingsAPI() {
  try {
    // 1. Get current settings from localStorage
    const savedSettings = localStorage.getItem('pos_settings');
    console.log('📋 Current localStorage settings:', savedSettings ? JSON.parse(savedSettings) : 'null');
    
    // 2. Test API call (if we have auth token)
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      console.log('🔑 Auth token found, testing API...');
      
      try {
        const response = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Response:', data);
          
          const taxRate = data.settings?.system?.tax_rate || data.settings?.system?.taxRate;
          console.log(`💰 Tax rate from API: ${taxRate}%`);
          
          // 3. Test updating tax rate
          console.log('🔄 Testing tax rate update...');
          const updateResponse = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              settings: {
                system: {
                  ...data.settings.system,
                  tax_rate: '3'
                }
              }
            })
          });
          
          if (updateResponse.ok) {
            console.log('✅ Tax rate updated successfully');
            
            // 4. Verify the update
            const verifyResponse = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/settings', {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              const updatedTaxRate = verifyData.settings?.system?.tax_rate || verifyData.settings?.system?.taxRate;
              console.log(`💰 Updated tax rate: ${updatedTaxRate}%`);
              
              if (updatedTaxRate === '3') {
                console.log('🎉 Tax rate successfully updated to 3%!');
              } else {
                console.log('❌ Tax rate update failed!');
              }
            }
          } else {
            console.log('❌ Failed to update tax rate:', updateResponse.status);
          }
        } else {
          console.log('❌ API call failed:', response.status);
        }
      } catch (error) {
        console.log('❌ API error:', error.message);
      }
    } else {
      console.log('🔑 No auth token found. Please login first.');
    }
    
    // 5. Check if settings are properly loaded in frontend
    console.log('\n📱 Frontend Settings Check:');
    console.log('- Go to Settings page');
    console.log('- Check if tax rate field shows 3%');
    console.log('- Try changing tax rate and save');
    console.log('- Check if changes persist after refresh');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Function to reset localStorage settings
function resetLocalStorageSettings() {
  console.log('🔄 Resetting localStorage settings...');
  
  const currentSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
  console.log('📋 Current settings:', currentSettings);
  
  // Update tax rate to 3%
  if (!currentSettings.system) {
    currentSettings.system = {};
  }
  currentSettings.system.taxRate = 3;
  
  // Save back to localStorage
  localStorage.setItem('pos_settings', JSON.stringify(currentSettings));
  console.log('✅ Settings updated in localStorage');
  
  // Dispatch event to notify components
  window.dispatchEvent(new Event('settings_updated'));
  console.log('📢 Settings update event dispatched');
  
  console.log('🎉 LocalStorage reset completed! Please refresh the page.');
}

// Function to clear all localStorage
function clearAllLocalStorage() {
  console.log('🗑️ Clearing all localStorage...');
  localStorage.clear();
  console.log('✅ All localStorage cleared');
  console.log('🔄 Please refresh the page to reload settings from API');
}

// Export functions for use in browser console
window.testSettingsAPI = testSettingsAPI;
window.resetLocalStorageSettings = resetLocalStorageSettings;
window.clearAllLocalStorage = clearAllLocalStorage;

console.log('🚀 Settings API test functions loaded:');
console.log('- testSettingsAPI() - Test API connection and tax rate');
console.log('- resetLocalStorageSettings() - Reset tax rate in localStorage');
console.log('- clearAllLocalStorage() - Clear all localStorage');

// Auto-run test if on settings page
if (window.location.pathname.includes('/settings')) {
  console.log('📄 On settings page, auto-running test...');
  setTimeout(() => {
    testSettingsAPI();
  }, 1000);
}
