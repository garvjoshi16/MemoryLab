import React from 'react';
import { SimulationStep, PageRequest } from '../simulationTypes';

const RequestTimeline: React.FC<{
  requests: PageRequest[];
  history: SimulationStep[];
  currentStep: number;
  totalSteps: number;
  algorithm: 'FIFO' | 'LRU';
}> = ({
  requests,
  history,
  currentStep,
  totalSteps,
  algorithm,
}) => {
  // Determine current and completed step indices
  const completedSteps = history.length;
  const isSimulationComplete = currentStep >= totalSteps && totalSteps > 0;

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-cyan">Request Timeline</span>
        </h2>

        <div className="overflow-x-auto">
          <div className="flex min-w-[calc(100% + 20px)]">
            {/* Timeline items */}
            {history.map((step, idx) => {
              const request = requests[step.request - 1] || { pageNumber: step.request, id: step.step };
              const isCurrent = idx === currentStep - 1;
              const isCompleted = idx < completedSteps;
              
              const hitClass = step.hitOrFault === 'HIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
              const hitBorder = step.hitOrFault === 'HIT' ? 'border-green-500/30' : 'border-red-500/30';

              return (
                <div
                  key={idx}
                  className={`min-w[40px] rounded-lg py-2 px-3 text-xs font-medium transition-colors duration-300 ${hitClass} ${hitBorder} ${
                    isCurrent ? 'border-2 border-white' : ''
                  } ${isCompleted ? 'shadow-lg' : 'opacity-50'}`}>
                  {isCompleted ? (
                    <span>
                      {request.pageNumber} - {step.hitOrFault}
                    </span>
                  ) : (
                    <span className="cursor-default opacity-60">
                      {request.pageNumber} - pending
                    </span>
                  )
                </div>
              );
            })}

            {/* Future requests placeholder */}
            {(completedSteps < totalSteps) && (
              <>
                {Array.from({ length: totalSteps - completedSteps }, (_, i) => completedSteps + i).map(
                  (idx) => {
                    const request = requests[idx] || { pageNumber: idx + 1, id: idx };
                    return (
                      <div
                        key={idx}
                        className="min-w[40px] rounded-lg py-2 px-3 text-xs font-medium text-blue-light/60 opacity-50">
                        {request.pageNumber} - pending
                      </div>
                    );
                  }
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestTimeline;