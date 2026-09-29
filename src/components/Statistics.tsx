import React from 'react';
import { SimulationState } from '../simulationTypes';

const StatisticsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}> = ({
  title,
  value,
  subtitle,
  className,
}) => {
  return (
    <div 
      className={`rounded-lg border border-blue-500/20 bg-navy p-4 ${className}`}
    >
      <p className="text-sm text-blue-light/60 mb-1 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-2xl font-bold text-cyan">
        {typeof value === 'number' ? value : value}
      </p>
      {subtitle && (
        <p className="text-xs text-blue-light/50 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

const Statistics: React.FC<{
  state: SimulationState;
  totalRequests: number;
}> = ({ state, totalRequests }) => {
  const hitRate = totalRequests > 0 
    ? ((state.totalHits / totalRequests) * 100).toFixed(1) 
    : '0';
  const faultRate = totalRequests > 0
    ? ((state.totalFaults / totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Requests"
          value={totalRequests}
          subtitle="Overall page requests processed"
        />
        <StatisticsCard
          title="Page Hits"
          value={state.totalHits}
          subtitle="Successful memory accesses"
        />
        <StatisticsCard
          title="Page Faults"
          value={state.totalFaults}
          subtitle="Missing memory accesses"
        />
        <StatisticsCard
          title="Hit Rate"
          value={hitRate}
          subtitle="% of requests that were hits"
        />
        <StatisticsCard
          title="Fault Rate"
          value={faultRate}
          subtitle="% of requests that were faults"
        />
      </div>
    </section>
  );
};

export default Statistics;