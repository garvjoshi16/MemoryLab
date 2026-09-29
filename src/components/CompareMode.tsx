import React, { useState } from 'react';
import { 
  SimulationState, 
  parsePageSequence, 
  sampleScenarios, 
  resetSimulation,
  runFifoStep,
  runLruStep 
} from '../simulationLogic';
import Statistics from './Statistics';

const CompareMode: React.FC = () => {
  const [compareActive, setCompareActive] = useState(false);
  const [sequenceInput, setSequenceInput] = useState('');
  const [selectedFrames, setSelectedFrames] = useState(3);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSequenceInput(value);
    setShowError(false);
    
    const result = parsePageSequence(value);
    if (result.error) {
      setShowError(true);
      setErrorMessage(result.error);
    }
  };

  const applyScenario = (scenarioKey: keyof typeof sampleScenarios) => {
    const sequence = sampleScenarios[scenarioKey];
    const pageRequests = sequence.map((p: number, i: number) => ({ pageNumber: p, id: i }));
    setSequenceInput(sequence.join(','));
    setShowError(false);
    onResetSimulation(pageRequests);
    setSelectedFrames(3);
  };

  const onResetSimulation = (requests: Array<{ pageNumber: number; id: number }>) => {
    setFifoState(resetSimulation(requests, selectedFrames, 'FIFO'));
    setLruState(resetSimulation(requests, selectedFrames, 'LRU'));
    setFifoStep(0);
    setLruStep(0);
    setCompareComplete(false);
  };

  const [fifoState, setFifoState] = useState<SimulationState>(() => resetSimulation([], 3, 'FIFO'));
  const [lruState, setLruState] = useState<SimulationState>(() => resetSimulation([], 3, 'LRU'));
  const [fifoStep, setFifoStep] = useState(0);
  const [lruStep, setLruStep] = useState(0);
  const [compareComplete, setCompareComplete] = useState(false);

  const handleNextFifo = () => {
    if (fifoStep >= fifoState.requests.length) return;
    
    const page = fifoState.requests[fifoStep].pageNumber;
    const newState = runFifoStep(fifoState, page);
    setFifoState(newState);
    setFifoStep(fifoStep + 1);
    
    if (fifoStep + 1 >= fifoState.requests.length) {
      setCompareComplete(true);
    }
  };

  const handleNextLru = () => {
    if (lruStep >= lruState.requests.length) return;
    
    const page = lruState.requests[lruStep].pageNumber;
    const newState = runLruStep(lruState, page);
    setLruState(newState);
    setLruStep(lruStep + 1);
    
    if (lruStep + 1 >= lruState.requests.length) {
      setCompareComplete(true);
    }
  };

  const resetComparison = () => {
    setCompareActive(false);
    setSequenceInput('');
    setShowError(false);
    setFifoState(resetSimulation([], 3, 'FIFO'));
    setLruState(resetSimulation([], 3, 'LRU'));
    setFifoStep(0);
    setLruStep(0);
    setCompareComplete(false);
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-6 rounded-lg border border-blue-500/20 bg-navy p-4">
          <h3 className="text-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan">Compare FIFO vs LRU</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={sequenceInput}
              onChange={handleInputChange}
              placeholder="1, 2, 3, 1, 4, 2"
              className="rounded-lg border border-blue-500/20 bg-navy text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan/50"
              disabled={compareActive}
            />
            <div className="flex flex-wrap gap-2">
              {Object.keys(sampleScenarios).map((key) => {
                const scenarioKey = key as keyof typeof sampleScenarios;
                return (
                  <button
                    key={key}
                    onClick={() => applyScenario(scenarioKey)}
                    className="px-3 py-1.5 rounded-lg border border-blue-500/20 text-sm text-blue-light hover:bg-cyan/20 hover:text-navy transition-colors disabled:opacity-50"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {showError && (
            <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>

        {/* Comparison Results */}
        {compareActive && compareComplete && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* FIFO Stats */}
            <div>
              <h4 className="text-white mb-4">FIFO Results</h4>
              <Statistics
                state={fifoState}
                totalRequests={fifoState.totalRequests}
              />
            </div>

            {/* LRU Stats */}
            <div>
              <h4 className="text-white mb-4">LRU Results</h4>
              <Statistics
                state={lruState}
                totalRequests={lruState.totalRequests}
              />
            </div>
          </div>

          {/* Visual Comparison Bars */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg h-8 bg-navy border border-blue-500/20 overflow-hidden">
              <div
                className="h-full bg-cyan"
                style={{ width: `${Math.min((fifoState.totalFaults / Math.max(fifoState.totalRequests, 1)) * 100, 100)}%` }}
                aria-label="FIFO Fault Rate"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="text-xs text-white ml-2">FIFO Faults: {fifoState.totalFaults}</span>
            
            <div className="rounded-lg h-8 bg-navy border border-blue-500/20 overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${Math.min((lruState.totalFaults / Math.max(lruState.totalRequests, 1)) * 100, 100)}%` }}
                aria-label="LRU Fault Rate"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="text-xs text-white ml-2">LRU Faults: {lruState.totalFaults}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompareMode;