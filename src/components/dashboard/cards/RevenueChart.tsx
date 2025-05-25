'use client';

import React, { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto';
interface RevenueChartProps {
  isLoading: boolean;
}


export default function RevenueChart({isLoading = false}: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const mockData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    revenue : [1200, 1900, 3000, 2500, 4000, 3500],
    order:[28, 48, 40, 19, 86, 27],
  };

  useEffect(() => {
    if (isLoading) return;
    
    // Cleanup previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (!chartRef.current) return;
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: mockData.labels,
        datasets: [
          {
            label: 'Revenue',
            data: mockData.revenue,
            backgroundColor: gradient,
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            },
          },
          y: {
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
              callback: (value) => `$${value}`,
              stepSize: 1000,
            },
            beginAtZero: true,
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isLoading]);

return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Over Time</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly revenue for the current year</p>
      </div>
      <div className="p-5 pt-0">
        {isLoading ? (
          <div className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <div className="h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        )}
      </div>
    </div>
  );
}
