import type { ModelRunnerInterface } from './types';
import { WebGPURunner } from './webgpu-runner';
import { MockModelRunner } from './mock-runner';
import { GemmaRunner } from './gemma-runner';

export type RunnerMode = 'gemma' | 'heuristic';

const gemmaInstance = new GemmaRunner();
const heuristicInstance = new WebGPURunner();

let currentMode: RunnerMode = 'gemma';
let currentRunner: ModelRunnerInterface = gemmaInstance;

export function getModelRunner(): ModelRunnerInterface {
  return currentRunner;
}

export function getGemmaRunner(): GemmaRunner {
  return gemmaInstance;
}

export function setModelRunner(runner: ModelRunnerInterface): void {
  currentRunner = runner;
}

export function getRunnerMode(): RunnerMode {
  return currentMode;
}

export function setRunnerMode(mode: RunnerMode): ModelRunnerInterface {
  currentMode = mode;
  if (mode === 'gemma') {
    currentRunner = gemmaInstance;
  } else {
    currentRunner = heuristicInstance;
  }
  return currentRunner;
}

export { WebGPURunner, MockModelRunner, GemmaRunner };
export * from './types';
export * from './parser';
