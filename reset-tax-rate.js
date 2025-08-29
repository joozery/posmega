// Script to reset tax rate to 3% in localStorage
console.log('🔄 Resetting tax rate to 3%...');

// Get current settings from localStorage
const currentSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
console.log('📋 Current settings:', currentSettings);

// Update tax rate to 3%
if (!currentSettings.system) {
    currentSettings.system = {};
}
currentSettings.system.taxRate = 3;

// Save updated settings back to localStorage
localStorage.setItem('pos_settings', JSON.stringify(currentSettings));
console.log('✅ Tax rate updated to 3% in localStorage');

// Verify the change
const updatedSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
console.log('🔍 Updated settings:', updatedSettings);
console.log('📊 New tax rate:', updatedSettings.system?.taxRate);

// Dispatch event to notify components about settings change
window.dispatchEvent(new Event('settings_updated'));
console.log('📢 Settings update event dispatched');

console.log('🎉 Tax rate reset completed! Please refresh the page.');
