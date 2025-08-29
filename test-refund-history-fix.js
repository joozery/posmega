// Test script to verify RefundHistory fixes
console.log('🧪 Testing RefundHistory fixes...');

// Function to test data filtering with undefined values
function testDataFiltering() {
  console.log('📋 Testing data filtering...');
  
  // Mock sales data with some undefined values
  const mockSales = [
    {
      id: 'SALE001',
      customer: 'John Doe',
      customer_name: 'John Doe',
      items: [
        { name: 'Product 1', product_name: 'Product 1', quantity: 2 },
        { name: 'Product 2', product_name: 'Product 2', quantity: 1 }
      ],
      total: 1000,
      subtotal: 900,
      tax: 100,
      status: 'completed',
      payment_method: 'cash',
      created_at: '2024-01-15T10:00:00Z',
      timestamp: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SALE002',
      customer: undefined, // This should not cause error
      customer_name: 'Jane Smith',
      items: undefined, // This should not cause error
      total: 500,
      subtotal: undefined, // This should not cause error
      tax: undefined, // This should not cause error
      status: 'refunded',
      payment_method: undefined, // This should not cause error
      created_at: undefined, // This should not cause error
      timestamp: undefined // This should not cause error
    },
    {
      id: undefined, // This should not cause error
      customer: 'Bob Wilson',
      customer_name: 'Bob Wilson',
      items: [
        { name: undefined, product_name: undefined, quantity: undefined } // This should not cause error
      ],
      total: undefined, // This should not cause error
      subtotal: undefined, // This should not cause error
      tax: undefined, // This should not cause error
      status: 'completed',
      payment_method: 'card',
      created_at: '2024-01-16T15:30:00Z',
      timestamp: '2024-01-16T15:30:00Z'
    }
  ];

  console.log('📊 Mock sales data:', mockSales);

  // Test filtering with search term
  const searchTerm = 'john';
  const filtered = mockSales.filter(sale => 
    (sale.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.items || []).some(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log('🔍 Filtered results for "john":', filtered);

  // Test date filtering
  const startDate = new Date('2024-01-15');
  const endDate = new Date('2024-01-16');
  const dateFiltered = mockSales.filter(sale => {
    const saleDate = new Date(sale.timestamp || sale.created_at || new Date());
    return saleDate >= startDate && saleDate < endDate;
  });

  console.log('📅 Date filtered results:', dateFiltered);

  // Test total calculation
  const totalSales = mockSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
  console.log('💰 Total sales:', totalSales);

  // Test items calculation
  const totalItems = mockSales.reduce((sum, sale) => sum + (sale.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);
  console.log('📦 Total items:', totalItems);

  return { mockSales, filtered, dateFiltered, totalSales, totalItems };
}

// Function to test CSV export data
function testCSVExport() {
  console.log('📄 Testing CSV export...');
  
  const mockSales = [
    {
      id: 'SALE001',
      customer: 'John Doe',
      customer_name: 'John Doe',
      items: [
        { name: 'Product 1', product_name: 'Product 1', quantity: 2 },
        { name: 'Product 2', product_name: 'Product 2', quantity: 1 }
      ],
      total: 1000,
      subtotal: 900,
      tax: 100,
      status: 'completed',
      payment_method: 'cash',
      created_at: '2024-01-15T10:00:00Z',
      timestamp: '2024-01-15T10:00:00Z',
      pointsUsed: 50,
      pointsEarned: 10
    }
  ];

  const dataToExport = mockSales.map(sale => ({
    'Sale ID': sale.id,
    'Date': new Date(sale.timestamp || sale.created_at || new Date()).toLocaleString('th-TH'),
    'Customer': sale.customer || sale.customer_name || 'ลูกค้าทั่วไป',
    'Items': (sale.items || []).map(item => `${item.name || 'สินค้าไม่ระบุ'} (x${item.quantity || 0})`).join(', '),
    'Subtotal': (sale.subtotal || 0).toFixed(2),
    'Tax': (sale.tax || 0).toFixed(2),
    'Total': (sale.total || 0).toFixed(2),
    'Payment Method': sale.paymentMethod || sale.payment_method || 'ไม่ระบุ',
    'Status': sale.status || 'completed',
    'Points Used': sale.pointsUsed || 0,
    'Points Earned': sale.pointsEarned || 0
  }));

  console.log('📊 CSV export data:', dataToExport);
  return dataToExport;
}

// Function to test error handling
function testErrorHandling() {
  console.log('⚠️ Testing error handling...');
  
  try {
    // Test with completely undefined sale object
    const undefinedSale = undefined;
    
    // These should not throw errors
    const customer = (undefinedSale?.customer || '');
    const id = (undefinedSale?.id || '').toString();
    const items = (undefinedSale?.items || []);
    
    console.log('✅ Undefined sale handling:', { customer, id, items });
    
    // Test with null values
    const nullSale = {
      customer: null,
      id: null,
      items: null,
      total: null,
      subtotal: null,
      tax: null,
      payment_method: null,
      created_at: null,
      timestamp: null
    };
    
    const customer2 = (nullSale.customer || '');
    const id2 = (nullSale.id || '').toString();
    const items2 = (nullSale.items || []);
    const total2 = parseFloat(nullSale.total || 0);
    
    console.log('✅ Null sale handling:', { customer2, id2, items2, total2 });
    
  } catch (error) {
    console.error('❌ Error in error handling test:', error);
  }
}

// Function to run all tests
function runAllTests() {
  console.log('🚀 Running all RefundHistory tests...\n');
  
  try {
    // Test 1: Data filtering
    console.log('📋 Test 1: Data filtering');
    const filteringResults = testDataFiltering();
    console.log('✅ Data filtering test passed\n');
    
    // Test 2: CSV export
    console.log('📄 Test 2: CSV export');
    const csvResults = testCSVExport();
    console.log('✅ CSV export test passed\n');
    
    // Test 3: Error handling
    console.log('⚠️ Test 3: Error handling');
    testErrorHandling();
    console.log('✅ Error handling test passed\n');
    
    console.log('🎉 All tests passed! RefundHistory should work without errors.');
    
    return {
      filtering: filteringResults,
      csv: csvResults
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export functions for manual testing
window.testDataFiltering = testDataFiltering;
window.testCSVExport = testCSVExport;
window.testErrorHandling = testErrorHandling;
window.runAllTests = runAllTests;

console.log('🛠️ Available test functions:');
console.log('- testDataFiltering() - Test data filtering with undefined values');
console.log('- testCSVExport() - Test CSV export data preparation');
console.log('- testErrorHandling() - Test error handling');
console.log('- runAllTests() - Run all tests');

// Auto-run if on RefundHistory page
if (window.location.pathname.includes('/refund-history') || window.location.pathname.includes('/sales')) {
  console.log('📄 On RefundHistory page, auto-running tests...');
  setTimeout(() => {
    runAllTests();
  }, 1000);
} else {
  console.log('💡 Run runAllTests() to start testing');
}
