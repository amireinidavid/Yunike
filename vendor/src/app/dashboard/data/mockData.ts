// Mock data for the dashboard

// KPI Data
export const kpiData = [
  {
    id: 1,
    title: 'Total Sales',
    value: '$18,230',
    period: 'last 30 days',
    change: 12.5,
    trend: 'up',
    icon: 'TrendingUp'
  },
  {
    id: 2,
    title: 'New Orders',
    value: '145',
    period: 'last 30 days',
    change: 8.2,
    trend: 'up',
    icon: 'ShoppingCart'
  },
  {
    id: 3,
    title: 'Pending Shipments',
    value: '23',
    period: 'to fulfill',
    change: -5.1,
    trend: 'down',
    icon: 'Package'
  },
  {
    id: 4,
    title: 'New Customers',
    value: '58',
    period: 'last 30 days',
    change: 15.3,
    trend: 'up',
    icon: 'Users'
  },
  {
    id: 5,
    title: 'Review Score',
    value: '4.8',
    period: 'out of 5',
    change: 0.2,
    trend: 'up',
    icon: 'Star'
  }
];

// Sales data for charts
export const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 8000 },
  { month: 'May', sales: 7000 },
  { month: 'Jun', sales: 9000 },
  { month: 'Jul', sales: 11000 },
  { month: 'Aug', sales: 10000 },
  { month: 'Sep', sales: 12500 },
  { month: 'Oct', sales: 14000 },
  { month: 'Nov', sales: 15000 },
  { month: 'Dec', sales: 18200 },
];

// Top selling products
export const topSellingProducts = [
  { name: 'Premium Headphones', units: 245, revenue: 12250 },
  { name: 'Wireless Earbuds', units: 190, revenue: 7600 },
  { name: 'Smart Watch Pro', units: 120, revenue: 14400 },
  { name: 'Fitness Tracker', units: 110, revenue: 5500 },
  { name: 'Bluetooth Speaker', units: 95, revenue: 3800 }
];

// Sales by location
export const salesByLocation = [
  { country: 'United States', value: 12500 },
  { country: 'United Kingdom', value: 4500 },
  { country: 'Canada', value: 3200 },
  { country: 'Australia', value: 2800 },
  { country: 'Germany', value: 2100 },
  { country: 'France', value: 1900 },
  { country: 'Brazil', value: 1200 },
  { country: 'Japan', value: 950 },
];

// Device breakdown
export const deviceBreakdown = [
  { name: 'Desktop', value: 45 },
  { name: 'Mobile', value: 40 },
  { name: 'Tablet', value: 15 }
];

// Recent orders
export const recentOrders = [
  {
    id: 'ORD-7652',
    customer: 'John Doe',
    date: '2025-05-23T14:48:00',
    total: '$129.99',
    status: 'processing',
    items: 3
  },
  {
    id: 'ORD-7651',
    customer: 'Sarah Miller',
    date: '2025-05-23T12:32:00',
    total: '$79.95',
    status: 'shipped',
    items: 2
  },
  {
    id: 'ORD-7650',
    customer: 'Mike Johnson',
    date: '2025-05-23T10:15:00',
    total: '$199.50',
    status: 'delivered',
    items: 4
  },
  {
    id: 'ORD-7649',
    customer: 'Emily Parker',
    date: '2025-05-22T16:40:00',
    total: '$54.75',
    status: 'processing',
    items: 1
  },
  {
    id: 'ORD-7648',
    customer: 'Robert Chen',
    date: '2025-05-22T09:22:00',
    total: '$149.99',
    status: 'shipped',
    items: 2
  }
];

// Recent product updates
export const productUpdates = [
  {
    id: 'PRD-342',
    name: 'Wireless Earbuds',
    event: 'low_stock',
    date: '2025-05-23T08:15:00',
    details: 'Only 5 units remaining'
  },
  {
    id: 'PRD-128',
    name: 'Smart Watch Pro',
    event: 'new_review',
    date: '2025-05-22T16:30:00',
    details: '5 stars: "Excellent product, love the features!"'
  },
  {
    id: 'PRD-289',
    name: 'Bluetooth Speaker',
    event: 'price_change',
    date: '2025-05-22T11:45:00',
    details: 'Price updated to $39.99 (was $44.99)'
  }
];

// Customer messages
export const customerMessages = [
  {
    id: 'MSG-456',
    customer: 'Lisa Wong',
    date: '2025-05-23T13:24:00',
    subject: 'Return request for order #7620',
    read: false
  },
  {
    id: 'MSG-455',
    customer: 'David Smith',
    date: '2025-05-22T10:15:00',
    subject: 'Question about product warranty',
    read: true
  },
  {
    id: 'MSG-454',
    customer: 'Maria Garcia',
    date: '2025-05-21T15:40:00',
    subject: 'Shipping delay inquiry',
    read: true
  }
];

// Notifications
export const notifications = [
  {
    id: 'NOTIF-001',
    type: 'warning',
    message: 'Payment for order #7630 has failed',
    date: '2025-05-23T14:05:00'
  },
  {
    id: 'NOTIF-002',
    type: 'info',
    message: 'Platform maintenance scheduled for May 26, 2:00 AM UTC',
    date: '2025-05-23T09:30:00'
  },
  {
    id: 'NOTIF-003',
    type: 'success',
    message: 'Your store passed the quarterly compliance review',
    date: '2025-05-22T11:15:00'
  },
  {
    id: 'NOTIF-004',
    type: 'error',
    message: 'Product "Smart Watch Pro" has been flagged for policy violation',
    date: '2025-05-21T16:45:00'
  }
];

// AI Suggestions
export const aiSuggestions = [
  {
    id: 'AI-001',
    type: 'inventory',
    message: 'You\'re running low on stock for "Wireless Earbuds". Consider reordering soon.',
    confidence: 0.92
  },
  {
    id: 'AI-002',
    type: 'trending',
    message: 'Increase stock for "Smart Watch Pro" - demand is predicted to rise by 30% next month.',
    confidence: 0.85
  },
  {
    id: 'AI-003',
    type: 'optimization',
    message: 'Your "Premium Headphones" product title could be optimized for better search visibility.',
    confidence: 0.78
  },
  {
    id: 'AI-004',
    type: 'pricing',
    message: 'Consider a 5-10% price increase for "Bluetooth Speaker" based on market trends.',
    confidence: 0.72
  }
];

// System health & limits
export const systemHealth = {
  storage: {
    used: 87,
    total: 100,
    unit: 'GB'
  },
  products: {
    active: 42,
    limit: 50
  },
  bandwidth: {
    used: 68.5,
    total: 100,
    unit: 'GB'
  },
  plan: 'Professional',
  renewalDate: '2025-06-15',
  billingAmount: '$49.99/month'
};

// Store status
export const storeStatus = {
  online: true,
  activeProducts: 42,
  productsNeedingAttention: 3,
  pendingVerifications: 0,
  approvalStatus: 'approved',
  lastVerified: '2025-05-01T09:00:00'
};

// Announcements
export const announcements = [
  {
    id: 'ANN-001',
    title: 'New AI Tools Available',
    date: '2025-05-20',
    content: 'We\'ve launched new AI-powered tools to help optimize your product listings and marketing campaigns.',
    important: true
  },
  {
    id: 'ANN-002',
    title: 'Platform Update: Enhanced Analytics',
    date: '2025-05-15',
    content: 'Our new analytics dashboard provides deeper insights into customer behavior and sales patterns.',
    important: false
  },
  {
    id: 'ANN-003',
    title: 'Commission Structure Update',
    date: '2025-05-10',
    content: 'New commission rates for high-volume sellers will take effect on June 1st. See details in your account settings.',
    important: true
  }
]; 