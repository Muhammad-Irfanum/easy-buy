'use client';

import { useState, useEffect } from 'react';

interface InventoryStatusProps {
  isLoading?: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// Mock data
const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Wireless Headphones', category: 'Electronics', stock: 35, status: 'In Stock' },
  { id: '2', name: 'Smart Watch', category: 'Electronics', stock: 12, status: 'Low Stock' },
  { id: '3', name: 'Running Shoes', category: 'Apparel', stock: 0, status: 'Out of Stock' },
  { id: '4', name: 'Organic Coffee', category: 'Food & Drink', stock: 8, status: 'Low Stock' },
  { id: '5', name: 'Monitor Stand', category: 'Office', stock: 23, status: 'In Stock' },
];

export default function InventoryStatus({ isLoading = false }: InventoryStatusProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setInventory(mockInventory);
    }
  }, [isLoading]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inventory Status</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products that need attention</p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {inventory.map((item) => (
              <li key={item.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mr-4">
                    {item.stock} in stock
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'In Stock'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                        : item.status === 'Low Stock'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3">
        <a
          href="/dashboard/products"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
        >
          View all inventory
        </a>
      </div>
    </div>
  );
}