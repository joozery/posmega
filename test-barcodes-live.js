// Live test script for Barcodes page price formatting
console.log('🏷️ Testing Barcodes page price formatting in real-time...');

// Function to check current page prices
function checkCurrentPagePrices() {
  console.log('🔍 Checking current page prices...');
  
  // Look for price elements in the table
  const priceCells = document.querySelectorAll('td:nth-child(5)'); // 5th column is price
  
  if (priceCells.length === 0) {
    console.log('❌ No price cells found. Please make sure you are on the Barcodes page.');
    return;
  }
  
  console.log(`📊 Found ${priceCells.length} price cells`);
  
  priceCells.forEach((cell, index) => {
    const priceText = cell.textContent.trim();
    console.log(`Row ${index + 1}: ${priceText}`);
    
    // Check if price has comma separators
    if (priceText.includes(',')) {
      console.log(`  ✅ Has comma separators: ${priceText}`);
    } else {
      console.log(`  ❌ No comma separators: ${priceText}`);
    }
  });
  
  return priceCells;
}

// Function to test price formatting function
function testPriceFormattingFunction() {
  console.log('\n🧪 Testing price formatting function...');
  
  const testPrices = [
    100,
    1000,
    15000,
    250000,
    1000000
  ];
  
  console.log('📊 Testing toLocaleString with th-TH:');
  testPrices.forEach(price => {
    const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    console.log(`  ${price} -> ${formatted}`);
  });
  
  return testPrices;
}

// Function to check if the page is refreshed
function checkPageRefresh() {
  console.log('\n🔄 Checking if page needs refresh...');
  
  // Look for any price without comma
  const allText = document.body.textContent;
  const pricePattern = /฿\d{4,}/g;
  const pricesWithoutComma = allText.match(pricePattern);
  
  if (pricesWithoutComma) {
    console.log('⚠️ Found prices without comma separators:');
    pricesWithoutComma.forEach(price => {
      console.log(`  ${price}`);
    });
    console.log('💡 Try refreshing the page (F5) to see the updated formatting');
  } else {
    console.log('✅ All prices appear to have comma separators');
  }
  
  return pricesWithoutComma;
}

// Function to simulate price formatting
function simulatePriceFormatting() {
  console.log('\n🎭 Simulating price formatting...');
  
  const mockProducts = [
    { name: 'Adidas Ultraboost', price: 4500 },
    { name: 'MIKA3 Angelic', price: 980 },
    { name: 'test007', price: 3000 }
  ];
  
  console.log('📋 Mock products with formatted prices:');
  mockProducts.forEach(product => {
    const formatted = product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    console.log(`  ${product.name}: ฿${formatted}`);
  });
  
  return mockProducts;
}

// Function to check browser locale support
function checkBrowserLocaleSupport() {
  console.log('\n🌍 Checking browser locale support...');
  
  const testPrice = 15000;
  const locales = ['th-TH', 'en-US', 'de-DE', 'fr-FR'];
  
  console.log(`📊 Testing price ${testPrice} in different locales:`);
  locales.forEach(locale => {
    try {
      const formatted = testPrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      console.log(`  ${locale}: ${formatted}`);
    } catch (error) {
      console.log(`  ${locale}: Error - ${error.message}`);
    }
  });
  
  // Check current browser locale
  console.log(`\n🔍 Current browser locale: ${navigator.language}`);
  console.log(`🔍 Available locales: ${navigator.languages?.join(', ') || 'Not available'}`);
  
  return { testPrice, locales };
}

// Function to force refresh prices
function forceRefreshPrices() {
  console.log('\n🔄 Attempting to force refresh prices...');
  
  // Look for price cells and update them
  const priceCells = document.querySelectorAll('td:nth-child(5)');
  
  if (priceCells.length === 0) {
    console.log('❌ No price cells found to refresh');
    return;
  }
  
  console.log(`🔄 Refreshing ${priceCells.length} price cells...`);
  
  priceCells.forEach((cell, index) => {
    const currentText = cell.textContent.trim();
    console.log(`  Row ${index + 1}: ${currentText}`);
    
    // Try to extract the price number
    const priceMatch = currentText.match(/฿(\d+(?:\.\d{2})?)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      console.log(`    ${price} -> ฿${formatted}`);
    }
  });
  
  console.log('💡 If prices still don\'t show commas, try:');
  console.log('   1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
  console.log('   2. Clear browser cache');
  console.log('   3. Check browser console for errors');
  
  return priceCells;
}

// Function to run all live tests
function runAllLiveTests() {
  console.log('🚀 Running all live Barcodes page tests...\n');
  
  try {
    // Test 1: Check current page prices
    console.log('🔍 Test 1: Check current page prices');
    const priceCells = checkCurrentPagePrices();
    console.log('✅ Current page prices check completed\n');
    
    // Test 2: Test price formatting function
    console.log('🧪 Test 2: Test price formatting function');
    const testPrices = testPriceFormattingFunction();
    console.log('✅ Price formatting function test completed\n');
    
    // Test 3: Check page refresh
    console.log('🔄 Test 3: Check page refresh');
    const pricesWithoutComma = checkPageRefresh();
    console.log('✅ Page refresh check completed\n');
    
    // Test 4: Simulate price formatting
    console.log('🎭 Test 4: Simulate price formatting');
    const mockProducts = simulatePriceFormatting();
    console.log('✅ Price formatting simulation completed\n');
    
    // Test 5: Check browser locale support
    console.log('🌍 Test 5: Check browser locale support');
    const localeTest = checkBrowserLocaleSupport();
    console.log('✅ Browser locale support check completed\n');
    
    // Test 6: Force refresh prices
    console.log('🔄 Test 6: Force refresh prices');
    const refreshedCells = forceRefreshPrices();
    console.log('✅ Force refresh prices completed\n');
    
    console.log('🎉 All live tests completed!');
    
    return {
      priceCells,
      testPrices,
      pricesWithoutComma,
      mockProducts,
      localeTest,
      refreshedCells
    };
    
  } catch (error) {
    console.error('❌ Live test failed:', error);
    return null;
  }
}

// Export functions for manual testing
window.checkCurrentPagePrices = checkCurrentPagePrices;
window.testPriceFormattingFunction = testPriceFormattingFunction;
window.checkPageRefresh = checkPageRefresh;
window.simulatePriceFormatting = simulatePriceFormatting;
window.checkBrowserLocaleSupport = checkBrowserLocaleSupport;
window.forceRefreshPrices = forceRefreshPrices;
window.runAllLiveTests = runAllLiveTests;

console.log('🛠️ Available live test functions:');
console.log('- checkCurrentPagePrices() - Check current page prices');
console.log('- testPriceFormattingFunction() - Test price formatting function');
console.log('- checkPageRefresh() - Check if page needs refresh');
console.log('- simulatePriceFormatting() - Simulate price formatting');
console.log('- checkBrowserLocaleSupport() - Check browser locale support');
console.log('- forceRefreshPrices() - Force refresh prices');
console.log('- runAllLiveTests() - Run all live tests');

// Auto-run if on Barcodes page
if (window.location.pathname.includes('/barcodes')) {
  console.log('🏷️ On Barcodes page, auto-running live tests...');
  setTimeout(() => {
    runAllLiveTests();
  }, 1000);
} else {
  console.log('💡 Run runAllLiveTests() to start live testing');
}
