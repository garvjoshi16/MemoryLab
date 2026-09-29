import React from 'react';
import { SimulationStep, PageRequest } from '../simulationTypes';

const StepExplanationPanel: React.FC<{
  history: SimulationStep[];
  currentStep: number;
  requests: PageRequest[];
  algorithm: 'FIFO' | 'LRU';
  state: SimulationState;
}> = ({
  history,
  currentStep,
  requests,
  algorithm,
  state,
}) => {
  const currentHistoryStep = history[currentStep - 1];
  
  // If we're at step 0 or no history yet, show instructional message
  if (currentStep === 0 || !currentHistoryStep) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg border border-blue-500/20 bg-navy p-8 text-center">
            <p className="text-blue-light/60 text-lg mb-4">
              Press <span className="text-cyan font-medium">Next Step</span> to 
              begin the simulation and see each page request processed.
            </p>
            <p className="text-sm text-blue-light/50">
              The simulator will demonstrate how FIFO and LRU page replacement algorithms work.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const step = currentHistoryStep;
  const request = requests[step.request - 1] || { pageNumber: step.request };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-cyan">What's Happening?</span>
        </h2>

        <div className="rounded-lg border border-blue-500/20 bg-navy p-6">
          <p className="text-sm text-white mb-3 font-medium">
            Step {step.step}: Requested page <span className="text-cyan font-bold">
              {request.pageNumber}
            </span>
          </p>

          <p className="text-white mb-3">
            {step.hitOrFault === 'HIT' 
              ? `Page ${request.pageNumber} is already in RAM, so this is a page hit.`
              : step.reason}
          </p>

          {step.removedPage !== null && (
            <p className="text-sm text-blue-light/50 mb-3">
              Removed page: <span className="text-red-400 font-medium">{step.removedPage}</span>
            </p>
          )}

          <p className="text-xs text-blue-light/50">
            Algorithm: <span className="font-medium text-cyan">{algorithm}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StepExplanationPanel;