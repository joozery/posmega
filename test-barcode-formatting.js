// Test script to verify barcode price formatting with Thai locale
console.log('🏷️ Testing barcode price formatting...');

// Function to test price formatting
function testPriceFormatting() {
  console.log('💰 Testing price formatting...');
  
  const testPrices = [
    100,
    1000,
    15000,
    250000,
    1000000,
    15000000
  ];
  
  console.log('📊 Price formatting comparison:');
  console.log('Price\t\tUS Format\t\tThai Format');
  console.log('-----\t\t----------\t\t-----------');
  
  testPrices.forEach(price => {
    const usFormat = price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const thFormat = price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    console.log(`${price}\t\t${usFormat}\t\t${thFormat}`);
  });
  
  return testPrices;
}

// Function to test original price formatting
function testOriginalPriceFormatting() {
  console.log('\n🏷️ Testing original price formatting...');
  
  const testOriginalPrices = [
    120,
    1200,
    18000,
    300000,
    1200000,
    18000000
  ];
  
  console.log('📊 Original price formatting:');
  testOriginalPrices.forEach(price => {
    const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    console.log(`ปกติ ${formatted}`);
  });
  
  return testOriginalPrices;
}

// Function to test price with decimal formatting
function testPriceWithDecimals() {
  console.log('\n💵 Testing price with decimals...');
  
  const testPricesWithDecimals = [
    100.50,
    1000.75,
    15000.25,
    250000.99
  ];
  
  console.log('📊 Price with decimal formatting:');
  testPricesWithDecimals.forEach(price => {
    const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    console.log(`${price} -> ${formatted}`);
  });
  
  return testPricesWithDecimals;
}

// Function to test barcode label simulation
function testBarcodeLabelSimulation() {
  console.log('\n🏷️ Testing barcode label simulation...');
  
  const mockProducts = [
    {
      id: 1,
      name: 'เสื้อ Adidas',
      price: 2500,
      originalPrice: 3000,
      barcode: 'ADIDAS001'
    },
    {
      id: 2,
      name: 'รองเท้า Nike',
      price: 4500,
      originalPrice: 5500,
      barcode: 'NIKE002'
    },
    {
      id: 3,
      name: 'กระเป๋า Gucci',
      price: 15000,
      originalPrice: 18000,
      barcode: 'GUCCI003'
    },
    {
      id: 4,
      name: 'นาฬิกา Rolex',
      price: 250000,
      originalPrice: 300000,
      barcode: 'ROLEX004'
    }
  ];
  
  console.log('📋 Mock barcode labels:');
  mockProducts.forEach(product => {
    const priceFormatted = product.price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const originalPriceFormatted = product.originalPrice.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    console.log(`\n🏷️ ${product.name}`);
    console.log(`   ราคา: ${priceFormatted} บาท`);
    console.log(`   ปกติ: ${originalPriceFormatted} บาท`);
    console.log(`   Barcode: ${product.barcode}`);
  });
  
  return mockProducts;
}

// Function to test different locales
function testDifferentLocales() {
  console.log('\n🌍 Testing different locales...');
  
  const price = 15000;
  const locales = [
    'en-US',
    'th-TH',
    'de-DE',
    'fr-FR',
    'ja-JP'
  ];
  
  console.log('📊 Price formatting in different locales:');
  locales.forEach(locale => {
    const formatted = price.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    console.log(`${locale}: ${formatted}`);
  });
  
  return { price, locales };
}

// Function to run all tests
function runAllBarcodeTests() {
  console.log('🚀 Running all barcode formatting tests...\n');
  
  try {
    // Test 1: Basic price formatting
    console.log('💰 Test 1: Basic price formatting');
    const basicPrices = testPriceFormatting();
    console.log('✅ Basic price formatting test completed\n');
    
    // Test 2: Original price formatting
    console.log('🏷️ Test 2: Original price formatting');
    const originalPrices = testOriginalPriceFormatting();
    console.log('✅ Original price formatting test completed\n');
    
    // Test 3: Price with decimals
    console.log('💵 Test 3: Price with decimals');
    const decimalPrices = testPriceWithDecimals();
    console.log('✅ Price with decimals test completed\n');
    
    // Test 4: Barcode label simulation
    console.log('🏷️ Test 4: Barcode label simulation');
    const mockProducts = testBarcodeLabelSimulation();
    console.log('✅ Barcode label simulation test completed\n');
    
    // Test 5: Different locales
    console.log('🌍 Test 5: Different locales');
    const localeTest = testDifferentLocales();
    console.log('✅ Different locales test completed\n');
    
    console.log('🎉 All barcode formatting tests completed!');
    
    return {
      basicPrices,
      originalPrices,
      decimalPrices,
      mockProducts,
      localeTest
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export functions for manual testing
window.testPriceFormatting = testPriceFormatting;
window.testOriginalPriceFormatting = testOriginalPriceFormatting;
window.testPriceWithDecimals = testPriceWithDecimals;
window.testBarcodeLabelSimulation = testBarcodeLabelSimulation;
window.testDifferentLocales = testDifferentLocales;
window.runAllBarcodeTests = runAllBarcodeTests;

console.log('🛠️ Available barcode test functions:');
console.log('- testPriceFormatting() - Test basic price formatting');
console.log('- testOriginalPriceFormatting() - Test original price formatting');
console.log('- testPriceWithDecimals() - Test price with decimals');
console.log('- testBarcodeLabelSimulation() - Test barcode label simulation');
console.log('- testDifferentLocales() - Test different locales');
console.log('- runAllBarcodeTests() - Run all tests');

// Auto-run if on Barcodes page
if (window.location.pathname.includes('/barcodes')) {
  console.log('🏷️ On Barcodes page, auto-running tests...');
  setTimeout(() => {
    runAllBarcodeTests();
  }, 1000);
} else {
  console.log('💡 Run runAllBarcodeTests() to start testing');
}
