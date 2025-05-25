'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/cards/StateCard';
import RevenueChart from '@/components/dashboard/cards/RevenueChart';
import RecentOrders from '@/components/dashboard/cards/RecentOrders';
import InventoryStatus from '@/components/dashboard/cards/InventoryStatus';
import {
  ArrowTrendingUpIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Temporary mock data
const mockStats = {
  totalRevenue: 24580,
  orders: 182,
  products: 67,
  customers: 346,
};

export default function Dashboard() {
  const [stats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <ArrowTrendingUpIcon className="mr-2 h-4 w-4" />
          View Full Analytics
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={12.5}
          changeType="increase"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Orders"
          value={stats.orders}
          change={8.2}
          changeType="increase"
          icon={<ShoppingCartIcon className="h-6 w-6 text-blue-600" />}
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Products"
          value={stats.products}
          change={0}
          changeType="neutral"
          icon={<CubeIcon className="h-6 w-6 text-indigo-600" />}
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Customers"
          value={stats.customers}
          change={4.1}
          changeType="increase"
          icon={<UserGroupIcon className="h-6 w-6 text-purple-600" />}
          isLoading={isLoading}
        />
      </div>
      
      {/* Charts & Tables */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RevenueChart isLoading={isLoading} />
        <InventoryStatus isLoading={isLoading} />
      </div>
      
      {/* Recent Orders */}
      <RecentOrders isLoading={isLoading} />
    </div>
  );
}