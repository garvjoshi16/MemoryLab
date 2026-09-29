/// <reference types="react" />

/**
 * Page Replacement Algorithm Types
 */

export type Algorithm = 'FIFO' | 'LRU';

export interface PageRequest {
  pageNumber: number;
  id: number; // unique identifier for tracking
}

export interface SimulationState {
  /** Current page request being processed */
  currentRequest: PageRequest | null;
  /** All page requests */
  requests: PageRequest[];
  /** Current step index */
  currentStep: number;
  /** Whether auto-play is running */
  isAutoPlaying: boolean;
  /** Whether the simulation is paused */
  isPaused: boolean;
  /** Whether the simulation is complete */
  isComplete: boolean;

  /** RAM configuration */
  ramFrames: number;

  /** Algorithm being used */
  algorithm: Algorithm;

  /** RAM state - pages currently in memory */
  ramFramesState: PageInRam[];

  /** Statistics */
  totalHits: number;
  totalFaults: number;
  totalRequests: number;

  /** History for step-by-step */
  history: SimulationStep[];

  /** Compare mode state */
  compareMode: boolean;
  fifoHits: number;
  fifoFaults: number;
  lruHits: number;
  lruFaults: number;
}

export interface PageInRam {
  pageNumber: number;
  enteredAtStep: number; // step when page entered
  lastAccessedStep: number; // step when last accessed (for LRU)
}

export interface SimulationStep {
  step: number;
  request: number;
  hitOrFault: 'HIT' | 'FAULT';
  removedPage: number | null;
  reason: string;
  ramState: PageInRam[];
}

export interface AlgorithmInfo {
  name: Algorithm;
  description: string;
}

/**
 * Initial state for the simulation
 */
export const initialState = (): SimulationState => ({
  currentRequest: null,
  requests: [],
  currentStep: 0,
  isAutoPlaying: false,
  isPaused: true,
  isComplete: false,
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

/**
 * FIFO Page Replacement Algorithm
 * - First-In, First-Out: removes the page that has been in memory the longest
 */
export function fifoStep(
  state: Omit<SimulationState, 'ramFramesState' | 'totalHits' | 'totalFaults' | 'totalRequests' | 'history' | 'compareMode' | 'fifoHits' | 'fifoFaults'>,
  page: number
): Omit<SimulationState, 'ramFramesState' | 'totalHits' | 'totalFaults' | 'totalRequests' | 'history' | 'compareMode' | 'fifoHits' | 'fifoFaults'> & {
  ramFramesState: PageInRam[];
  totalHits: number;
  totalFaults: number;
  totalRequests: number;
  history: SimulationStep[];
  fifoHits: number;
  fifoFaults: number;
};

/**
 * LRU Page Replacement Algorithm
 * - Least Recently Used: removes the page that has not been used for the longest time
 */
export function lruStep(
  state: Omit<SimulationState, 'ramFramesState' | 'totalHits' | 'totalFaults' | 'totalRequests' | 'history' | 'compareMode' | 'lruHits' | 'lruFaults'>,
  page: number
): Omit<SimulationState, 'ramFramesState' | 'totalHits' | 'totalFaults' | 'totalRequests' | 'history' | 'compareMode' | 'lruHits' | 'lruFaults'> & {
  ramFramesState: PageInRam[];
  totalHits: number;
  totalFaults: number;
  totalRequests: number;
  history: SimulationStep[];
  lruHits: number;
  lruFaults: number;
};