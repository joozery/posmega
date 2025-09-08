// Test script to check Reports API connection
console.log('🔍 Testing Reports API connection...');

// Function to test sales stats API
async function testSalesStatsAPI() {
  try {
    console.log('📊 Testing sales stats API...');
    
    // Get auth token
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.log('❌ No auth token found. Please login first.');
      return;
    }
    
    // Test date range
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    console.log('📅 Date range:', { startDate, endDate });
    
    // Test GET /api/sales/stats/summary
    const response = await fetch(`https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/sales/stats/summary?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sales Stats API Response:', data);
      
      // Check data structure
      console.log('📋 Data structure check:');
      console.log('- Summary:', data.summary ? '✅' : '❌');
      console.log('- Payment Methods:', data.paymentMethods ? '✅' : '❌');
      console.log('- Daily Sales:', data.dailySales ? '✅' : '❌');
      console.log('- Top Products:', data.topProducts ? '✅' : '❌');
      
      // Show summary data
      if (data.summary) {
        console.log('💰 Summary Data:');
        console.log('- Total Sales:', data.summary.totalSales);
        console.log('- Total Orders:', data.summary.totalOrders);
        console.log('- Average Order Value:', data.summary.averageOrderValue);
      }
      
      return data;
    } else {
      console.log('❌ API call failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ API error:', error);
  }
}

// Function to test sales data API
async function testSalesDataAPI() {
  try {
    console.log('📈 Testing sales data API...');
    
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.log('❌ No auth token found. Please login first.');
      return;
    }
    
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    // Test GET /api/sales with date filter
    const response = await fetch(`https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/sales?startDate=${startDate}&endDate=${endDate}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sales Data API Response:', data);
      
      if (data.sales) {
        console.log('📊 Sales Data:');
        console.log('- Total sales records:', data.sales.length);
        console.log('- First sale:', data.sales[0]);
        
        // Check data structure
        if (data.sales.length > 0) {
          const firstSale = data.sales[0];
          console.log('🔍 First sale structure:');
          console.log('- ID:', firstSale.id ? '✅' : '❌');
          console.log('- Customer:', firstSale.customer ? '✅' : '❌');
          console.log('- Total:', firstSale.total ? '✅' : '❌');
          console.log('- Items:', firstSale.items ? '✅' : '❌');
          console.log('- Created At:', firstSale.created_at ? '✅' : '❌');
        }
      }
      
      return data;
    } else {
      console.log('❌ API call failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ API error:', error);
  }
}

// Function to test different date ranges
async function testDateRanges() {
  try {
    console.log('📅 Testing different date ranges...');
    
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.log('❌ No auth token found. Please login first.');
      return;
    }
    
    const dateRanges = [
      { name: 'Today', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
      { name: 'Week', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
      { name: 'Month', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }
    ];
    
    for (const range of dateRanges) {
      console.log(`\n📊 Testing ${range.name}:`, range);
      
      const response = await fetch(`https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/sales/stats/summary?startDate=${range.startDate}&endDate=${range.endDate}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${range.name} stats:`, {
          totalSales: data.summary?.totalSales || 0,
          totalOrders: data.summary?.totalOrders || 0,
          averageOrderValue: data.summary?.averageOrderValue || 0
        });
      } else {
        console.log(`❌ ${range.name} failed:`, response.status);
      }
    }
  } catch (error) {
    console.error('❌ Date range test error:', error);
  }
}

// Function to test frontend data processing
function testFrontendDataProcessing() {
  console.log('🖥️ Testing frontend data processing...');
  
  // Mock API response
  const mockStatsData = {
    summary: {
      totalSales: 50000,
      totalOrders: 25,
      averageOrderValue: 2000
    },
    paymentMethods: [
      { payment_method: 'cash', count: 15, total: 30000 },
      { payment_method: 'card', count: 10, total: 20000 }
    ],
    dailySales: [
      { date: '2024-01-15', count: 5, total: 10000 },
      { date: '2024-01-16', count: 8, total: 16000 },
      { date: '2024-01-17', count: 12, total: 24000 }
    ],
    topProducts: [
      { name: 'Product A', total_quantity: 50, total_revenue: 10000 },
      { name: 'Product B', total_quantity: 30, total_revenue: 6000 }
    ]
  };
  
  // Test data processing
  const totalSales = mockStatsData?.summary?.totalSales || 0;
  const totalOrders = mockStatsData?.summary?.totalOrders || 0;
  const avgOrderValue = mockStatsData?.summary?.averageOrderValue || 0;
  
  console.log('✅ Processed data:');
  console.log('- Total Sales:', totalSales);
  console.log('- Total Orders:', totalOrders);
  console.log('- Average Order Value:', avgOrderValue);
  
  // Test payment methods processing
  const paymentMethods = {};
  if (mockStatsData?.paymentMethods) {
    mockStatsData.paymentMethods.forEach(method => {
      paymentMethods[method.payment_method] = {
        method: method.payment_method || 'ไม่ระบุ',
        count: method.count || 0,
        amount: method.total || 0
      };
    });
  }
  
  console.log('✅ Payment methods:', paymentMethods);
  
  // Test daily sales processing
  let dailySales = [];
  if (mockStatsData?.dailySales && mockStatsData.dailySales.length > 0) {
    dailySales = mockStatsData.dailySales.map(day => ({
      date: new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
      amount: day.total || 0,
      orders: day.count || 0
    }));
  }
  
  console.log('✅ Daily sales:', dailySales);
  
  return { totalSales, totalOrders, avgOrderValue, paymentMethods, dailySales };
}

// Function to run complete test
async function runCompleteTest() {
  console.log('🚀 Running complete Reports API test...\n');
  
  try {
    // Test 1: Sales stats API
    console.log('📊 Test 1: Sales stats API');
    const statsData = await testSalesStatsAPI();
    console.log('✅ Sales stats API test completed\n');
    
    // Test 2: Sales data API
    console.log('📈 Test 2: Sales data API');
    const salesData = await testSalesDataAPI();
    console.log('✅ Sales data API test completed\n');
    
    // Test 3: Date ranges
    console.log('📅 Test 3: Date ranges');
    await testDateRanges();
    console.log('✅ Date ranges test completed\n');
    
    // Test 4: Frontend processing
    console.log('🖥️ Test 4: Frontend data processing');
    const processedData = testFrontendDataProcessing();
    console.log('✅ Frontend processing test completed\n');
    
    console.log('🎉 All tests completed!');
    
    return {
      stats: statsData,
      sales: salesData,
      processed: processedData
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export functions for manual testing
window.testSalesStatsAPI = testSalesStatsAPI;
window.testSalesDataAPI = testSalesDataAPI;
window.testDateRanges = testDateRanges;
window.testFrontendDataProcessing = testFrontendDataProcessing;
window.runCompleteTest = runCompleteTest;

console.log('🛠️ Available test functions:');
console.log('- testSalesStatsAPI() - Test sales stats API');
console.log('- testSalesDataAPI() - Test sales data API');
console.log('- testDateRanges() - Test different date ranges');
console.log('- testFrontendDataProcessing() - Test frontend data processing');
console.log('- runCompleteTest() - Run all tests');

// Auto-run if on Reports page
if (window.location.pathname.includes('/reports')) {
  console.log('📄 On Reports page, auto-running test...');
  setTimeout(() => {
    runCompleteTest();
  }, 1000);
} else {
  console.log('💡 Run runCompleteTest() to start test');
}
