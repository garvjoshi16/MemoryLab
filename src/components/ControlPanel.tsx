import React, { useState } from 'react';
import { 
  parsePageSequence, 
  sampleScenarios, 
  resetSimulation, 
  SimulationState 
} from '../simulationLogic';

type ControlPanelProps = {
  onAlgorithmChange: (algo: 'FIFO' | 'LRU') => void;
  onFramesChange: (frames: number) => void;
  onSequenceChange: (sequence: Array<{ pageNumber: number; id: number }>) => void;
  onNextStep: () => void;
  onReset: () => void;
  onCompare: () => void;
  autoPlay: boolean;
  setAutoPlay: (val: boolean) => void;
  isComplete: boolean;
  state: SimulationState;
};

interface PageRequest {
  pageNumber: number;
  id: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAlgorithmChange,
  onFramesChange,
  onSequenceChange,
  onNextStep,
  onReset,
  onCompare,
  autoPlay,
  setAutoPlay,
  isComplete,
  state,
}) => {
  const [frameOptions] = useState<number[]>([3, 4, 5, 6]);
  const [selectedFrames, setSelectedFrames] = useState(state.ramFrames);
  const [sequenceInput, setSequenceInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate input when user types or selects a scenario
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

  // Apply a sample scenario
  const applyScenario = (scenarioKey: keyof typeof sampleScenarios) => {
    const sequence = sampleScenarios[scenarioKey];
    const pageRequests = sequence.map((p: number, i: number) => ({ pageNumber: p, id: i }));
    setSequenceInput(sequence.join(','));
    setShowError(false);
    onSequenceChange(pageRequests);
    setSelectedScenario(null);
  };

  // Next step button handler
  const handleNextStep = () => {
    if (isComplete) return;
    
    if (state.currentStep >= state.requests.length) {
      // Simulation complete, reset
      onReset();
      return;
    }

    const currentRequest = state.requests[state.currentStep];
    onNextStep();
    setShowError(false);
  };

  // Reset handler
  const handleReset = () => {
    onReset();
    setSequenceInput('');
    setShowError(false);
  };

  // Compare handler
  const handleCompare = () => {
    onCompare();
    setSequenceInput('');
    setShowError(false);
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* RAM Frames Selector */}
          <div>
            <label className="block text-sm font-medium text-blue-light mb-2">
              RAM Frames
            </label>
            <select
              value={selectedFrames}
              onChange={(e) => {
                const frames = parseInt(e.target.value, 10);
                setSelectedFrames(frames);
                onFramesChange(frames);
              }}
              className="w-full rounded-lg border border-blue-500/20 bg-navy/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan/50"
            >
              {frameOptions.map((frames) => (
                <option key={frames} value={frames}>
                  {frames}
                </option>
              ))}
            </select>
          </div>

          {/* Page Request Sequence */}
          <div>
            <label className="block text-sm font-medium text-blue-light mb-2">
              Page Request Sequence
            </label>
            <div className="rounded-lg border border-blue-500/20 bg-navy/50 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sequenceInput}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3, 1, 4, 2"
                  className="flex-1 bg-navy border border-blue-500/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  disabled={isComplete}
                  aria-invalid={showError ? 'true' : undefined}
                />
                {showError && (
                  <span className="text-red-500 text-xs">
                    {errorMessage}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(sampleScenarios).map((key) => {
                return (
                  <button
                    key={key}
                    onClick={() => applyScenario(key as keyof typeof sampleScenarios)}
                    className="px-3 py-1.5 rounded-lg border border-blue-500/20 text-sm text-blue-light hover:bg-cyan/20 hover:text-navy transition-colors"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Algorithm Selector */}
          <div>
            <label className="block text-sm font-medium text-blue-light mb-2">
              Algorithm
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/20 bg-navy cursor-pointer select-none">
                <input
                  type="radio"
                  name="algorithm"
                  value="FIFO"
                  checked={state.algorithm === 'FIFO'}
                  onChange={() => onAlgorithmChange('FIFO')}
                  className="hidden"
                />
                <span className="text-white">FIFO</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/20 bg-navy cursor-pointer select-none">
                <input
                  type="radio"
                  name="algorithm"
                  value="LRU"
                  checked={state.algorithm === 'LRU'}
                  onChange={() => onAlgorithmChange('LRU')}
                  className="hidden"
                />
                <span className="text-white">LRU</span>
              </label>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleNextStep}
            disabled={isComplete || state.currentStep >= state.requests.length}
            className="flex-1 py-2.5 rounded-lg border border-white/20 bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 hover:text-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step
          </button>
          
          {/* Auto Play / Pause */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="py-2.5 rounded-lg border border-white/20 bg-navy text-white font-medium text-sm hover:bg-cyan/60 transition-colors"
              disabled={isComplete || state.currentStep >= state.requests.length}
            >
              {autoPlay ? 'Pause' : 'Auto Play'}
            </button>
          </div>

          <button
            onClick={handleReset}
            className="py-2.5 rounded-lg border border-white/20 bg-navy text-white font-medium text-sm hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>

          <button
            onClick={handleCompare}
            className="py-2.5 rounded-lg border border-white/20 bg-navy text-white font-medium text-sm hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare FIFO vs LRU
          </button>
        </div>
      </div>
    </section>
  );
};

export default ControlPanel;