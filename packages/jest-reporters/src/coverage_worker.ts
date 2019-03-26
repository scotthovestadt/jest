/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import {Config} from '@jest/types';
import exit from 'exit';

import generateEmptyCoverage, {
  CoverageWorkerResult,
} from './generateEmptyCoverage';

export type CoverageWorkerData = {
  configName: string;
  path: Config.Path;
};

export {CoverageWorkerResult};

// Make sure uncaught errors are logged before we exit.
process.on('uncaughtException', err => {
  console.error(err.stack);
  exit(1);
});

let globalConfig: Config.GlobalConfig;
const configs = new Map<string, Config.ProjectConfig>();
let changedFiles: Set<string> | undefined;
export function setup(setupData: {
  globalConfig: Config.GlobalConfig;
  configs: Array<Config.ProjectConfig>;
  changedFiles?: Array<string>;
}) {
  globalConfig = setupData.globalConfig;
  for (const config of setupData.configs) {
    configs.set(config.name, config);
  }
  if (setupData.changedFiles) {
    changedFiles = new Set<string>(setupData.changedFiles);
  }
}

export function worker({
  configName,
  path,
}: CoverageWorkerData): CoverageWorkerResult | null {
  const config = configs.get(configName);
  if (!config) {
    throw new Error('Cannot find config with name: ' + configName);
  }

  return generateEmptyCoverage(
    fs.readFileSync(path, 'utf8'),
    path,
    globalConfig,
    config,
    changedFiles,
  );
}
