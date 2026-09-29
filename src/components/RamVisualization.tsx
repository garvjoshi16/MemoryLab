import React from 'react';
import { SimulationStep, PageInRam, SimulationState } from '../simulationTypes';

const RamFrame: React.FC<{ frame: PageInRam; index: number; totalFrames: number; currentStep: number }> = ({
  frame,
  index,
  totalFrames,
  currentStep,
}) => {
  const isCurrent = frame.pageNumber === undefined ? false : true;
  const enteredAt = frame.enteredAtStep;
  const stepsAgo = currentStep - enteredAt;
  const wasRecentlyAdded = stepsAgo <= 1 && enteredAt > 0;

  // Determine visual state
  let bgClass = 'bg-navy';
  let borderClass = 'border-blue-500/30';
  let shadowClass = 'shadow-[0_0_10px_rgba(0,180,255,0.3)]';

  if (wasRecentlyAdded) {
    bgClass = 'bg-cyan/20';
    borderClass = 'border-cyan/40';
    shadowClass = 'shadow-[0_0_15px_rgba(0,212,255,0.4)]';
  }

  return (
    <div
      key={frame.pageNumber}
      className={`rounded-lg ${bgClass} ${borderClass} h-24 w-24 flex items-center justify-center text-sm font-medium transition-all duration-300 ${shadowClass} ${isCurrent ? '' : 'opacity-50'}`}
    >
      {frame.pageNumber !== undefined ? (
        <span>
          {frame.pageNumber}
        </span>
      ) : (
        <span className="text-blue-light/60">Empty</span>
      )}
    </div>
  );
};

const RamVisualization: React.FC<{
  ramFrames: PageInRam[];
  ramFramesCount: number;
  currentRequest: { pageNumber: number } | null;
  status: 'HIT' | 'FAULT' | null;
  removedPage: number | null;
  reason: string;
  currentStep: number;
  totalFrames: number;
  algorithm: 'FIFO' | 'LRU';
}> = ({
  ramFrames,
  ramFramesCount,
  currentRequest,
  status,
  removedPage,
  reason,
  currentStep,
  totalFrames,
  algorithm,
}) => {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-cyan">Physical Memory / RAM</span>
          <span className="text-blue-light/60">({ramFramesCount} Frames)</span>
        </h2>
        
        <div className="grid grid-cols-{{ totalFrames }} gap-3">
          {Array.from({ length: totalFrames }, (_, i) => {
            const frame = ramFrames[i] || { pageNumber: undefined, enteredAtStep: 0, lastAccessedStep: 0 };
            return <RamFrame frame={frame} index={i} totalFrames={totalFrames} currentStep={currentStep} />;
          })}
        </div>

        {/* Status info below RAM */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-500/20">
          {/* Current Request */}
          <div className="flex-1">
            <p className="text-sm text-blue-light mb-1">Current Request</p>
            <p className="text-2xl font-bold text-cyan">
              {currentRequest ? currentRequest.pageNumber : '—'}
            </p>
          </div>

          {/* Status */}
          <div className="flex-1 sm:text-right">
            <p className="text-sm text-blue-light mb-1">Status</p>
            <p className="text-{status === 'HIT' ? 'green' : 'red'}-500 font-medium text-sm {
              status === 'HIT' ? 'text-green-400' : 'text-red-400'
            }">
              {status === 'HIT' ? 'PAGE HIT' : 'PAGE FAULT'}
            </p>
          </div>

          {/* Removed Page */}
          <div className="flex-1 sm:text-right">
            <p className="text-sm text-blue-light mb-1">Removed Page</p>
            <p className="text-2xl font-bold {
              removedPage !== null ? 'text-red-400' : 'text-green-400'
            }">
              {removedPage !== null ? `${removedPage}` : 'None'}
            </p>
          </div>

          {/* Reason */}
          <div className="flex-1 sm:text-right">
            <p className="text-sm text-blue-light mb-1">Reason</p>
            <p className="text-sm text-white overflow-hidden whitespace-nowrap">
              {reason}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RamVisualization;