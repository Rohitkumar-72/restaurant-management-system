export const adminStats = [
  { label: 'Total Orders', value: '1,284', change: '+12.4%', icon: 'ShoppingBag', accent: 'gold' },
  { label: "Today's Revenue", value: '$18,460', change: '+8.2%', icon: 'DollarSign', accent: 'sapphire' },
  { label: 'Pending Orders', value: '18', change: 'Needs attention', icon: 'Clock3', accent: 'gold' },
  { label: 'Preparing Orders', value: '12', change: 'In kitchen', icon: 'ChefHat', accent: 'sapphire' },
  { label: 'Completed Orders', value: '246', change: '+16.8%', icon: 'CircleCheck', accent: 'gold' },
  { label: 'Total Menu Items', value: '42', change: '38 available', icon: 'UtensilsCrossed', accent: 'sapphire' },
];

export const salesData = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 15800 },
  { day: 'Wed', revenue: 13900 },
  { day: 'Thu', revenue: 17200 },
  { day: 'Fri', revenue: 22600 },
  { day: 'Sat', revenue: 28400 },
  { day: 'Sun', revenue: 18460 },
];

export const recentOrders = [
  { id: 'SV-10482', customer: 'Maya Chen', items: 4, type: 'Dine-in', amount: '$186.40', status: 'Preparing', time: '2 min ago' },
  { id: 'SV-10481', customer: 'Arjun Patel', items: 2, type: 'Takeaway', amount: '$54.00', status: 'Ready', time: '6 min ago' },
  { id: 'SV-10480', customer: 'Nora Williams', items: 3, type: 'Dine-in', amount: '$92.75', status: 'Confirmed', time: '11 min ago' },
  { id: 'SV-10479', customer: 'Leo Martin', items: 5, type: 'Takeaway', amount: '$128.20', status: 'Pending', time: '14 min ago' },
  { id: 'SV-10478', customer: 'Emma Davis', items: 2, type: 'Dine-in', amount: '$68.50', status: 'Completed', time: '22 min ago' },
  { id: 'SV-10477', customer: 'Noah Wilson', items: 3, type: 'Takeaway', amount: '$76.90', status: 'Cancelled', time: '31 min ago' },
];

export const popularItems = [
  { name: 'Truffle Tenderloin', category: 'Main Course', orders: 184, revenue: '$6,992', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=160&q=80' },
  { name: 'Saffron Sea Bass', category: 'Main Course', orders: 156, revenue: '$4,992', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=160&q=80' },
  { name: 'Vista Smash Burger', category: 'Burgers', orders: 142, revenue: '$3,124', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=160&q=80' },
  { name: 'Truffle Cheese Pizza', category: 'Pizza', orders: 118, revenue: '$3,186', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=160&q=80' },
];
