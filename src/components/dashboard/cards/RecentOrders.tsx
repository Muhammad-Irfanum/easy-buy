'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecentOrdersProps {
  isLoading?: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Cancelled' | 'Refunded';
}

// Mock data
const mockOrders: Order[] = [
  { id: '1', orderNumber: 'ORD-001', customer: 'Irfan', date: '2023-05-23', amount: 128.50, status: 'Completed' },
  { id: '2', orderNumber: 'ORD-002', customer: 'Haleem', date: '2023-05-23', amount: 75.20, status: 'Processing' },
  { id: '3', orderNumber: 'ORD-003', customer: 'Karar', date: '2023-05-22', amount: 245.99, status: 'Completed' },
  { id: '4', orderNumber: 'ORD-004', customer: 'Ali', date: '2023-05-22', amount: 89.95, status: 'Cancelled' },
  { id: '5', orderNumber: 'ORD-005', customer: 'Haider', date: '2023-05-21', amount: 156.80, status: 'Processing' },
];

export default function RecentOrders({ isLoading = false }: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setOrders(mockOrders);
    }
  }, [isLoading]);

  const statusStyles = {
    Completed: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
    Processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
    Refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest customer orders</p>
        </div>
        <a
          href="/dashboard/orders"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
        >
          View all
        </a>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Order
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <Link href={`/dashboard/orders/${order.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-medium',
                              statusStyles[order.status]
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}