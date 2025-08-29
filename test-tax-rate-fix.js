// Test script to verify tax rate fix
console.log('🧪 Testing tax rate fix...');

// Function to check current tax rate in localStorage
function checkTaxRate() {
    const savedSettings = localStorage.getItem('pos_settings');
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const taxRate = parsed.system?.taxRate || parsed.system?.tax_rate;
        console.log('💰 Current tax rate in localStorage:', taxRate);
        return taxRate;
    } else {
        console.log('❌ No settings found in localStorage');
        return null;
    }
}

// Function to update tax rate in localStorage
function updateTaxRate(newRate) {
    console.log(`🔄 Updating tax rate to ${newRate}%...`);
    
    const savedSettings = localStorage.getItem('pos_settings');
    let settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    if (!settings.system) {
        settings.system = {};
    }
    
    settings.system.taxRate = newRate;
    settings.system.tax_rate = String(newRate); // Also update API format
    
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    console.log('✅ Tax rate updated in localStorage');
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('settings_updated'));
    console.log('📢 Settings update event dispatched');
    
    return settings;
}

// Function to force reload settings from API
function forceReloadFromAPI() {
    console.log('🔄 Force reloading settings from API...');
    
    // Clear settings from localStorage
    localStorage.removeItem('pos_settings');
    
    // Dispatch event to force reload
    window.dispatchEvent(new Event('settings_updated'));
    
    console.log('✅ Settings cleared, components should reload from API');
}

// Function to test the complete flow
async function testCompleteFlow() {
    console.log('🚀 Starting complete tax rate test...\n');
    
    // 1. Check current state
    console.log('📋 Step 1: Check current tax rate');
    const currentRate = checkTaxRate();
    
    // 2. Update to 3%
    console.log('\n📋 Step 2: Update tax rate to 3%');
    updateTaxRate(3);
    
    // 3. Verify update
    console.log('\n📋 Step 3: Verify update');
    const updatedRate = checkTaxRate();
    
    if (updatedRate === 3) {
        console.log('✅ Tax rate successfully updated to 3%');
    } else {
        console.log('❌ Tax rate update failed');
    }
    
    // 4. Test component update
    console.log('\n📋 Step 4: Test component update');
    console.log('- Check if CartPanel shows 3% tax rate');
    console.log('- Check if ReceiptDialog shows 3% tax rate');
    console.log('- Check if POS page shows 3% tax rate');
    
    // 5. Instructions
    console.log('\n📝 Next steps:');
    console.log('1. Refresh the page');
    console.log('2. Go to POS page');
    console.log('3. Add items to cart');
    console.log('4. Check if tax rate shows 3%');
    console.log('5. Test receipt printing');
}

// Function to simulate API response
function simulateAPISettings() {
    console.log('🔄 Simulating API settings response...');
    
    const apiSettings = {
        system: {
            storeName: 'Test Store',
            taxRate: 3,
            tax_rate: '3',
            logo_url: '',
            address: '',
            phone: '',
            email: ''
        },
        payment: {
            cashEnabled: 'true',
            stripeEnabled: 'false',
            promptpayEnabled: 'false'
        },
        loyalty: {
            purchaseAmountForOnePoint: 100,
            onePointValueInBaht: 1
        },
        notifications: {
            notifyOnSale: 'false'
        }
    };
    
    localStorage.setItem('pos_settings', JSON.stringify(apiSettings));
    console.log('✅ API settings simulated');
    
    // Dispatch event
    window.dispatchEvent(new Event('settings_updated'));
    console.log('📢 Settings update event dispatched');
}

// Export functions for manual use
window.checkTaxRate = checkTaxRate;
window.updateTaxRate = updateTaxRate;
window.forceReloadFromAPI = forceReloadFromAPI;
window.testCompleteFlow = testCompleteFlow;
window.simulateAPISettings = simulateAPISettings;

console.log('🛠️ Available functions:');
console.log('- checkTaxRate() - Check current tax rate');
console.log('- updateTaxRate(rate) - Update tax rate');
console.log('- forceReloadFromAPI() - Force reload from API');
console.log('- testCompleteFlow() - Run complete test');
console.log('- simulateAPISettings() - Simulate API response');

// Auto-run if on POS page
if (window.location.pathname.includes('/pos')) {
    console.log('📄 On POS page, auto-running test...');
    setTimeout(() => {
        testCompleteFlow();
    }, 1000);
} else {
    console.log('💡 Run testCompleteFlow() to start test');
}
