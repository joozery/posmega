// Script to clear localStorage and reset settings
console.log('🧹 Clearing localStorage and resetting settings...');

// Function to clear all localStorage
function clearAllLocalStorage() {
  console.log('🗑️ Clearing all localStorage...');
  localStorage.clear();
  console.log('✅ All localStorage cleared');
  console.log('🔄 Please refresh the page to reload settings from API');
}

// Function to clear specific settings
function clearSettingsOnly() {
  console.log('⚙️ Clearing settings from localStorage...');
  
  // Remove specific settings keys
  localStorage.removeItem('pos_settings');
  localStorage.removeItem('pending_checkout_cart');
  localStorage.removeItem('pending_checkout_customer');
  localStorage.removeItem('pending_checkout_discount');
  
  console.log('✅ Settings cleared from localStorage');
  console.log('🔄 Please refresh the page to reload settings from API');
}

// Function to reset tax rate in localStorage
function resetTaxRate() {
  console.log('💰 Resetting tax rate in localStorage...');
  
  const currentSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
  console.log('📋 Current settings:', currentSettings);
  
  // Update tax rate to 3%
  if (!currentSettings.system) {
    currentSettings.system = {};
  }
  currentSettings.system.taxRate = 3;
  currentSettings.system.tax_rate = '3'; // Also update the API format
  
  // Save back to localStorage
  localStorage.setItem('pos_settings', JSON.stringify(currentSettings));
  console.log('✅ Tax rate updated to 3% in localStorage');
  
  // Dispatch event to notify components
  window.dispatchEvent(new Event('settings_updated'));
  console.log('📢 Settings update event dispatched');
  
  console.log('🎉 Tax rate reset completed! Please refresh the page.');
}

// Function to show current localStorage contents
function showLocalStorageContents() {
  console.log('📋 Current localStorage contents:');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  }
  
  // Show parsed settings if exists
  const settings = localStorage.getItem('pos_settings');
  if (settings) {
    try {
      const parsedSettings = JSON.parse(settings);
      console.log('📊 Parsed pos_settings:', parsedSettings);
      console.log('💰 Current tax rate:', parsedSettings.system?.taxRate || parsedSettings.system?.tax_rate);
    } catch (error) {
      console.log('❌ Error parsing pos_settings:', error);
    }
  }
}

// Function to force reload settings from API
function forceReloadSettings() {
  console.log('🔄 Force reloading settings from API...');
  
  // Clear settings from localStorage
  localStorage.removeItem('pos_settings');
  
  // Dispatch event to force reload
  window.dispatchEvent(new Event('settings_updated'));
  
  // Reload the page
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Auto-execute main clearing function
function main() {
  console.log('🚀 Starting localStorage cleanup...\n');
  
  // Show current contents
  showLocalStorageContents();
  
  console.log('\n🧹 Clearing localStorage...');
  clearAllLocalStorage();
  
  console.log('\n✅ Cleanup completed!');
  console.log('📝 Next steps:');
  console.log('1. Refresh the page');
  console.log('2. Go to Settings page');
  console.log('3. Check if tax rate shows 3%');
  console.log('4. Save settings if needed');
  console.log('5. Test in POS page');
}

// Export functions for manual use
window.clearAllLocalStorage = clearAllLocalStorage;
window.clearSettingsOnly = clearSettingsOnly;
window.resetTaxRate = resetTaxRate;
window.showLocalStorageContents = showLocalStorageContents;
window.forceReloadSettings = forceReloadSettings;
window.main = main;

console.log('🛠️ Available functions:');
console.log('- main() - Auto-clear all localStorage');
console.log('- clearAllLocalStorage() - Clear all localStorage');
console.log('- clearSettingsOnly() - Clear only settings');
console.log('- resetTaxRate() - Reset tax rate to 3%');
console.log('- showLocalStorageContents() - Show current localStorage');
console.log('- forceReloadSettings() - Force reload from API');

// Auto-run if on POS or Settings page
if (window.location.pathname.includes('/pos') || window.location.pathname.includes('/settings')) {
  console.log('📄 On POS or Settings page, auto-running cleanup...');
  setTimeout(() => {
    main();
  }, 1000);
} else {
  console.log('💡 Run main() to start cleanup');
}
