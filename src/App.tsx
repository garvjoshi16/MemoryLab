import React, { useState, useEffect } from 'react';
import { parsePageSequence, sampleScenarios, resetSimulation } from './simulationLogic';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import RamVisualization from './components/RamVisualization';
import RequestTimeline from './components/RequestTimeline';
import Statistics from './components/Statistics';
import StepExplanationPanel from './components/StepExplanationPanel';
import CompareMode from './components/CompareMode';
import AlgorithmInfo from './components/AlgorithmInfo';

const App: React.FC = () => {
  // Initial state
  const [state, setState] = useState<SimulationState>(initialAppState());
  const [compareMode, setCompareMode] = useState(false);

  // Initialize with default sample scenario
  useEffect(() => {
    const initialRequests = sampleScenarios.basic.map((p: number) => ({
      pageNumber: p,
      id: 0,
    }));
    setState(resetSimulation(initialRequests, 3, 'FIFO'));
  }, []);

  // Parse sequence input and update state
  const handleSequenceChange = (sequence: Array<{ pageNumber: number; id: number }>) => {
    setState(resetSimulation(sequence, state.ramFrames, state.algorithm));
  };

  const handleFramesChange = (frames: number) => {
    setState(prev => resetSimulation(prev.requests, frames, prev.algorithm));
  };

  const handleAlgorithmChange = (algo: 'FIFO' | 'LRU') => {
    setState(prev => resetSimulation(prev.requests, prev.ramFrames, algo));
  };

  const handleNextStep = () => {
    if (state.isComplete || state.currentStep >= state.requests.length) return;

    const currentRequest = state.requests[state.currentStep];
    const newState = processRequest(state, currentRequest.pageNumber);
    setState(newState);
  };

  const handleReset = () => {
    const initialRequests = sampleScenarios.basic.map((p: number) => ({
      pageNumber: p,
      id: 0,
    }));
    setState(resetSimulation(initialRequests, 3, 'FIFO'));
    setCompareMode(false);
  };

  const handleCompare = () => {
    setCompareMode(true);
    // Reset both algorithms with the same sequence and frames
    const initialRequests = state.requests;
    setState(prev => ({
      ...prev,
      compareMode: true,
      fifoState: resetSimulation(initialRequests, prev.ramFrames, 'FIFO'),
      lruState: resetSimulation(initialRequests, prev.ramFrames, 'LRU'),
    }));
  };

  const isSimulationComplete = state.currentStep >= state.requests.length && state.requests.length > 0;

  return (
    <div className="min-h-screen bg-navy text-white font-medium">
      <Header />

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {compareMode ? (
          <CompareMode 
            isActive={compareMode}
            onReset={() => setCompareMode(false)}
            onSequenceChange={handleSequenceChange}
            onFramesChange={handleFramesChange}
            onAlgorithmChange={handleAlgorithmChange}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left panel: Controls + RAM */}
            <div class="space-y-6">
              <ControlPanel
                onAlgorithmChange={handleAlgorithmChange}
                onFramesChange={handleFramesChange}
                onSequenceChange={handleSequenceChange}
                onNextStep={handleNextStep}
                onReset={handleReset}
                onCompare={handleCompare}
                autoPlay={state.isAutoPlaying}
                setAutoPlay={setAutoPlay => setAutoPlay(false)}
                isComplete={isSimulationComplete}
                state={state}
              />
              <RamVisualization
                ramFrames={state.ramFramesState}
                ramFramesCount={state.ramFrames}
                currentRequest={state.currentRequest ? { pageNumber: state.currentRequest.pageNumber } : null}
                status={state.history.length > 0 ? state.history[state.history.length - 1]?.hitOrFault || 'HIT' : null}
                removedPage={state.history.length > 0 ? state.history[state.history.length - 1]?.removedPage || null : null}
                reason={state.history.length > 0 ? state.history[state.history.length - 1]?.reason || '' : ''}
                currentStep={state.currentStep}
                totalFrames={state.ramFrames}
                algorithm={state.algorithm}
              />
              <RequestTimeline
                requests={state.requests}
                history={state.history}
                currentStep={state.currentStep}
                totalSteps={state.requests.length}
                algorithm={state.algorithm}
              />
            </div>

            {/* Right panel: Statistics + Explanation */}
            <div class="space-y-6">
              <Statistics
                state={state}
                totalRequests={state.totalRequests}
              />
              <StepExplanationPanel
                history={state.history}
                currentStep={state.currentStep}
                requests={state.requests}
                algorithm={state.algorithm}
                state={state}
              />
            </div>
          </div>
        )}

        {/* Algorithm Info at bottom */}
        <AlgorithmInfo />
      </main>
    </div>
  );
};

const initialAppState = (): SimulationState => ({
  currentRequest: null,
  requests: [],
  currentStep: 0,
  isAutoPlaying: false,
  isPaused: true,
  isComplete: true,
  ramFrames: 3,
  algorithm: 'FIFO',
  ramFramesState: [],
  totalHits: 0,
  totalFaults: 0,
  totalRequests: 0,
  history: [],
  compareMode: false,
  fifoHits: 0,
  fifoFaults: 0,
  lruHits: 0,
  lruFaults: 0,
});

export default App;