// Test script to verify price formatting with comma separators in Barcodes page
console.log('🏷️ Testing Barcodes page price formatting...');

// Function to test price formatting in table
function testTablePriceFormatting() {
  console.log('💰 Testing table price formatting...');
  
  const testPrices = [
    100,
    1000,
    15000,
    250000,
    1000000,
    15000000
  ];
  
  console.log('📊 Price formatting in table:');
  console.log('Price\t\tFormatted (th-TH)\t\tFormatted (en-US)');
  console.log('-----\t\t-----------------\t\t----------------');
  
  testPrices.forEach(price => {
    const thFormat = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const usFormat = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    console.log(`${price}\t\t฿${thFormat}\t\t฿${usFormat}`);
  });
  
  return testPrices;
}

// Function to test product data simulation
function testProductDataSimulation() {
  console.log('\n📋 Testing product data simulation...');
  
  const mockProducts = [
    {
      id: 1,
      name: 'Adidas Ultraboost',
      price: 4500,
      barcode: 'test003',
      image_url: 'https://example.com/adidas.jpg'
    },
    {
      id: 2,
      name: 'MIKA3 Angelic',
      price: 980,
      barcode: 'MIKA3 WHITE',
      image_url: 'https://example.com/mika3.jpg'
    },
    {
      id: 3,
      name: 'test007',
      price: 3000,
      barcode: 'MEGA',
      image_url: 'https://example.com/test007.jpg'
    },
    {
      id: 4,
      name: 'Nike Air Max',
      price: 25000,
      barcode: 'NIKE001',
      image_url: 'https://example.com/nike.jpg'
    },
    {
      id: 5,
      name: 'Gucci Bag',
      price: 150000,
      barcode: 'GUCCI001',
      image_url: 'https://example.com/gucci.jpg'
    }
  ];
  
  console.log('📊 Mock products with formatted prices:');
  mockProducts.forEach(product => {
    const formattedPrice = product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    console.log(`\n🏷️ ${product.name}`);
    console.log(`   Barcode: ${product.barcode}`);
    console.log(`   ราคา: ฿${formattedPrice}`);
    console.log(`   ราคาเดิม: ฿${product.price.toLocaleString('en-US')}`);
  });
  
  return mockProducts;
}

// Function to test table row generation
function testTableRowGeneration() {
  console.log('\n📋 Testing table row generation...');
  
  const mockProducts = [
    { id: 1, name: 'Adidas Ultraboost', price: 4500, barcode: 'test003' },
    { id: 2, name: 'MIKA3 Angelic', price: 980, barcode: 'MIKA3 WHITE' },
    { id: 3, name: 'test007', price: 3000, barcode: 'MEGA' }
  ];
  
  console.log('📊 Table rows with formatted prices:');
  console.log('| เลือก | สินค้า | Barcode | ราคา | จำนวนป้าย |');
  console.log('|------|--------|---------|------|------------|');
  
  mockProducts.forEach(product => {
    const formattedPrice = product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const checkbox = '☐';
    const image = '🖼️';
    const name = product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name;
    const barcode = product.barcode;
    const price = `฿${formattedPrice}`;
    const quantity = '';
    
    console.log(`| ${checkbox} | ${image} ${name} | ${barcode} | ${price} | ${quantity} |`);
  });
  
  return mockProducts;
}

// Function to test different price ranges
function testPriceRanges() {
  console.log('\n💵 Testing different price ranges...');
  
  const priceRanges = [
    { range: '100-999', prices: [100, 250, 500, 750, 999] },
    { range: '1,000-9,999', prices: [1000, 2500, 5000, 7500, 9999] },
    { range: '10,000-99,999', prices: [10000, 25000, 50000, 75000, 99999] },
    { range: '100,000-999,999', prices: [100000, 250000, 500000, 750000, 999999] },
    { range: '1,000,000+', prices: [1000000, 2500000, 5000000, 10000000] }
  ];
  
  console.log('📊 Price formatting by range:');
  priceRanges.forEach(range => {
    console.log(`\n${range.range}:`);
    range.prices.forEach(price => {
      const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      console.log(`  ${price} -> ฿${formatted}`);
    });
  });
  
  return priceRanges;
}

// Function to test locale comparison
function testLocaleComparison() {
  console.log('\n🌍 Testing locale comparison...');
  
  const testPrice = 15000;
  const locales = [
    'th-TH',
    'en-US',
    'de-DE',
    'fr-FR',
    'ja-JP',
    'zh-CN'
  ];
  
  console.log(`📊 Price ${testPrice} in different locales:`);
  locales.forEach(locale => {
    try {
      const formatted = testPrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      console.log(`  ${locale}: ฿${formatted}`);
    } catch (error) {
      console.log(`  ${locale}: Error - ${error.message}`);
    }
  });
  
  return { testPrice, locales };
}

// Function to test edge cases
function testEdgeCases() {
  console.log('\n⚠️ Testing edge cases...');
  
  const edgeCases = [
    0,
    0.5,
    1,
    1.99,
    999.99,
    1000.01,
    -100,
    NaN,
    Infinity,
    -Infinity
  ];
  
  console.log('📊 Edge case price formatting:');
  edgeCases.forEach(price => {
    try {
      if (isNaN(price) || !isFinite(price)) {
        console.log(`  ${price}: Invalid price`);
      } else {
        const formatted = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        console.log(`  ${price} -> ฿${formatted}`);
      }
    } catch (error) {
      console.log(`  ${price}: Error - ${error.message}`);
    }
  });
  
  return edgeCases;
}

// Function to run all tests
function runAllBarcodePageTests() {
  console.log('🚀 Running all Barcodes page formatting tests...\n');
  
  try {
    // Test 1: Table price formatting
    console.log('💰 Test 1: Table price formatting');
    const tablePrices = testTablePriceFormatting();
    console.log('✅ Table price formatting test completed\n');
    
    // Test 2: Product data simulation
    console.log('📋 Test 2: Product data simulation');
    const mockProducts = testProductDataSimulation();
    console.log('✅ Product data simulation test completed\n');
    
    // Test 3: Table row generation
    console.log('📋 Test 3: Table row generation');
    const tableRows = testTableRowGeneration();
    console.log('✅ Table row generation test completed\n');
    
    // Test 4: Price ranges
    console.log('💵 Test 4: Price ranges');
    const priceRanges = testPriceRanges();
    console.log('✅ Price ranges test completed\n');
    
    // Test 5: Locale comparison
    console.log('🌍 Test 5: Locale comparison');
    const localeTest = testLocaleComparison();
    console.log('✅ Locale comparison test completed\n');
    
    // Test 6: Edge cases
    console.log('⚠️ Test 6: Edge cases');
    const edgeCases = testEdgeCases();
    console.log('✅ Edge cases test completed\n');
    
    console.log('🎉 All Barcodes page formatting tests completed!');
    
    return {
      tablePrices,
      mockProducts,
      tableRows,
      priceRanges,
      localeTest,
      edgeCases
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export functions for manual testing
window.testTablePriceFormatting = testTablePriceFormatting;
window.testProductDataSimulation = testProductDataSimulation;
window.testTableRowGeneration = testTableRowGeneration;
window.testPriceRanges = testPriceRanges;
window.testLocaleComparison = testLocaleComparison;
window.testEdgeCases = testEdgeCases;
window.runAllBarcodePageTests = runAllBarcodePageTests;

console.log('🛠️ Available Barcodes page test functions:');
console.log('- testTablePriceFormatting() - Test table price formatting');
console.log('- testProductDataSimulation() - Test product data simulation');
console.log('- testTableRowGeneration() - Test table row generation');
console.log('- testPriceRanges() - Test different price ranges');
console.log('- testLocaleComparison() - Test different locales');
console.log('- testEdgeCases() - Test edge cases');
console.log('- runAllBarcodePageTests() - Run all tests');

// Auto-run if on Barcodes page
if (window.location.pathname.includes('/barcodes')) {
  console.log('🏷️ On Barcodes page, auto-running tests...');
  setTimeout(() => {
    runAllBarcodePageTests();
  }, 1000);
} else {
  console.log('💡 Run runAllBarcodePageTests() to start testing');
}
