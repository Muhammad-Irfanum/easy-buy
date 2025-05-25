import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface StateCardProps {
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  isLoading?: boolean;
}

export default function StateCard({title, value, change, changeType, icon, isLoading}: StateCardProps) {
    return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <div className="h-7 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-16"></div>
                ) : (
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {value}
                  </div>
                )}
                
                {!isLoading && change > 0 && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    changeType === 'increase' ? "text-green-600 dark:text-green-400" : 
                    changeType === 'decrease' ? "text-red-600 dark:text-red-400" : 
                    "text-gray-600 dark:text-gray-400"
                  )}>
                    {changeType === 'increase' && (
                      <ArrowUpIcon className="h-3 w-3 self-center flex-shrink-0" aria-hidden="true" />
                    )}
                    {changeType === 'decrease' && (
                      <ArrowDownIcon className="h-3 w-3 self-center flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className="ml-1">{change}%</span>
                    <span className="sr-only">
                      {changeType === 'increase' ? 'Increased' : 'Decreased'} by {change}%
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
