/**
 * Virtual Memory Simulator - Core Logic
 * 
 * FIFO (First-In, First-Out):
 * - If requested page is already in RAM → HIT
 * - If there is an empty frame → load the page without replacement
 * - If RAM is full → remove the oldest loaded page
 * - Maintain correct FIFO order independently of page hits
 * 
 * LRU (Least Recently Used):
 * - If requested page is already in RAM → HIT and update its recent-use information
 * - If there is an empty frame → load the page
 * - If RAM is full → remove the least recently used page
 * - Correctly track the most recent use of every page
 */

import type {
  SimulationState,
  PageInRam,
  SimulationStep,
  Algorithm,
} from './simulationTypes';

// FIFO implementation
function updateFifoRam(state: SimulationState, page: number): SimulationState {
  const { ramFramesState, ramFrames } = state;

  // Check if page is already in RAM (HIT)
  const alreadyInRam = ramFramesState.some((frame) => frame.pageNumber === page);

  if (alreadyInRam) {
    // Update the last accessed step for this page
    const updatedFrames = ramFramesState.map((frame) =>
      frame.pageNumber === page
        ? { ...frame, lastAccessedStep: state.currentStep }
        : frame
    );

    return {
      ...state,
      ramFramesState: updatedFrames,
      totalHits: state.totalHits + 1,
    };
  }

  // Page fault - need to load the page
  if (ramFramesState.length < ramFrames) {
    // There's an empty frame
    const newFrame: PageInRam = {
      pageNumber: page,
      enteredAtStep: state.currentStep,
      lastAccessedStep: state.currentStep,
    };

    const updatedFrames = [...ramFramesState, newFrame];

    return {
      ...state,
      ramFramesState: updatedFrames,
      totalFaults: state.totalFaults + 1,
    };
  }

  // RAM is full - remove the oldest loaded page (FIFO)
  // Sort by enteredAtStep to find the oldest
  const sortedByEntry = [...ramFramesState].sort(
    (a, b) => a.enteredAtStep - b.enteredAtStep
  );
  const pageToRemove = sortedByEntry[0].pageNumber;

  // Replace the oldest page
  const newFrames = ramFramesState.map((frame) => {
    if (frame.pageNumber === pageToRemove) {
      return {
        pageNumber: page,
        enteredAtStep: state.currentStep,
        lastAccessedStep: state.currentStep,
      };
    }
    return frame;
  });

  return {
    ...state,
    ramFramesState: newFrames,
    totalFaults: state.totalFaults + 1,
    fifoFaults: state.fifoFaults + 1,
  };
}

// LRU implementation
function updateLruRam(state: SimulationState, page: number): SimulationState {
  const { ramFramesState } = state;

  // Check if page is already in RAM (HIT)
  const alreadyInRam = ramFramesState.some((frame) => frame.pageNumber === page);

  if (alreadyInRam) {
    // Update the last accessed step for this page
    const updatedFrames = ramFramesState.map((frame) =>
      frame.pageNumber === page
        ? { ...frame, lastAccessedStep: state.currentStep }
        : frame
    );

    return {
      ...state,
      ramFramesState: updatedFrames,
      totalHits: state.totalHits + 1,
    };
  }

  // Page fault - need to load the page
  if (ramFramesState.length < state.ramFrames) {
    // There's an empty frame
    const newFrame: PageInRam = {
      pageNumber: page,
      enteredAtStep: state.currentStep,
      lastAccessedStep: state.currentStep,
    };

    const updatedFrames = [...ramFramesState, newFrame];

    return {
      ...state,
      ramFramesState: updatedFrames,
      totalFaults: state.totalFaults + 1,
      lruFaults: state.lruFaults + 1,
    };
  }

  // RAM is full - remove the least recently used page
  // The LRU page is the one with the smallest lastAccessedStep
  const sortedByRecency = [...ramFramesState].sort(
    (a, b) => a.lastAccessedStep - b.lastAccessedStep
  );
  const pageToRemove = sortedByRecency[0].pageNumber;

  // Replace the LRU page
  const newFrames = ramFramesState.map((frame) => {
    if (frame.pageNumber === pageToRemove) {
      return {
        pageNumber: page,
        enteredAtStep: state.currentStep,
        lastAccessedStep: state.currentStep,
      };
    }
    return frame;
  });

  return {
    ...state,
    ramFramesState: newFrames,
    totalFaults: state.totalFaults + 1,
    lruFaults: state.lruFaults + 1,
  };
}

// Run one step of FIFO
export function runFifoStep(
  state: SimulationState,
  page: number
): SimulationState {
  return updateFifoRam(state, page);
}

// Run one step of LRU
export function runLruStep(
  state: SimulationState,
  page: number
): SimulationState {
  return updateLruRam(state, page);
}

/**
 * Process a page request through the selected algorithm
 * and update history/statistics
 */
export function processRequest(
  state: SimulationState,
  page: number
): SimulationState {
  const { algorithm } = state;

  let newState: SimulationState;

  if (algorithm === 'FIFO') {
    newState = updateFifoRam(state, page);
  } else {
    newState = updateLruRam(state, page);
  }

  // Determine if this was a hit or fault
  const hitOrFault = newState.totalFaults > state.totalFaults ? 'FAULT' : 'HIT';

  // Compute which page was removed (if any)
  const removedPageNum = computeRemovedPage(state, newState, algorithm);

  // Generate human-readable reason
  const reason = generateReason(page, hitOrFault, removedPageNum, algorithm, state, newState);

  // Create history step entry
  const newStep: SimulationStep = {
    step: state.currentStep + 1,
    request: page,
    hitOrFault,
    removedPage: removedPageNum,
    reason,
    ramState: [...newState.ramFramesState],
  };

  return {
    ...newState,
    currentStep: state.currentStep + 1,
    history: [...state.history, newStep],
    totalRequests: state.totalRequests + 1,
    currentRequest: { pageNumber: page, id: state.currentStep + 1 },
  };
}

/**
 * Compute which page was removed during a page fault
 */
function computeRemovedPage(
  prevState: SimulationState,
  newState: SimulationState,
  algorithm: Algorithm
): number | null {
  // If RAM was full before the step, a page was replaced
  if (prevState.ramFramesState.length >= state.ramFrames) {
    if (algorithm === 'FIFO') {
      // The replaced page is the one that was oldest in FIFO order
      const prevSorted = [...prevState.ramFramesState].sort(
        (a, b) => a.enteredAtStep - b.enteredAtStep
      );
      const oldestPrev = prevSorted[0].pageNumber;

      // Check if oldest is still in new state (could be unchanged if hit)
      const stillInNew = newState.ramFramesState.some((f) => f.pageNumber === oldestPrev);
      return stillInNew ? null : oldestPrev;
    } else {
      // LRU - the replaced page is the least recently used
      const prevSorted = [...prevState.ramFramesState].sort(
        (a, b) => a.lastAccessedStep - b.lastAccessedStep
      );
      const lruPrev = prevSorted[0].pageNumber;

      const stillInNew = newState.ramFramesState.some((f) => f.pageNumber === lruPrev);
      return stillInNew ? null : lruPrev;
    }
  }
  return null;
}

/**
 * Generate a human-readable explanation for what happened
 */
function generateReason(
  page: number,
  hitOrFault: 'HIT' | 'FAULT',
  removedPage: number | null,
  algorithm: Algorithm,
  state: SimulationState,
  newState: SimulationState
): string {
  if (hitOrFault === 'HIT') {
    return `Page ${page} is already in RAM, so this is a page hit.`;
  }

  // It's a page fault
  if (state.ramFramesState.length < state.ramFrames) {
    // This case shouldn't happen logically since we check length before,
    // but handle it anyway
    return `Page ${page} caused a page fault.`;
  }

  // Need to replace a page
  if (algorithm === 'FIFO') {
    const prevSorted = [...state.ramFramesState].sort(
      (a, b) => a.enteredAtStep - b.enteredAtStep
    );
    const oldest = prevSorted[0].pageNumber;
    return `RAM is full. FIFO removes page ${oldest} because it arrived first.`;
  } else {
    const prevSorted = [...state.ramFramesState].sort(
      (a, b) => a.lastAccessedStep - b.lastAccessedStep
    );
    const lru = prevSorted[0].pageNumber;
    return `RAM is full. LRU removes page ${lru} because it has not been used recently.`;
  }
}

/**
 * Parse a comma-separated page request string
 */
export function parsePageSequence(input: string): PageRequest[] | { error: string } {
  if (!input || input.trim() === '') {
    return { error: 'Please enter a page request sequence.' };
  }

  // Split by comma and trim
  const parts = input.split(',').map(s => s.trim()).filter(s => s.length > 0);

  // Validate each part is a valid number
  for (const part of parts) {
    const num = Number(part);
    if (!Number.isInteger(num) || num < 0) {
      return { error: `Invalid page number: "${part}". Please enter positive integers separated by commas.` };
    }
  }

  return parts.map((page, index) => ({
    pageNumber: Number(page),
    id: index,
  }));
}

/**
 * Get initial sample scenarios
 */
export const sampleScenarios = {
  basic: [1, 2, 3, 1, 4, 2],
  repeated: [1, 2, 1, 3, 1, 4, 2],
  longer: [7, 0, 1, 2, 0, 3, 0, 4],
};

/**
 * Reset state to initial for a new simulation
 */
export function resetSimulation(
  initialRequests: PageRequest[],
  initialFrames: number = 3,
  initialAlgorithm: Algorithm = 'FIFO'
): SimulationState {
  return {
    currentRequest: null,
    requests: initialRequests,
    currentStep: 0,
    isAutoPlaying: false,
    isPaused: true,
    isComplete: initialRequests.length === 0,
    ramFrames: initialFrames,
    algorithm: initialAlgorithm,
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
  };
}