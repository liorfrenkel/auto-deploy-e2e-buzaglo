#! /usr/bin/env node

import { $, echo, sleep } from 'zx';

const DEPLOY_GAP = 60 * 60 * 1000;
const WAIT_MS = 60 * 1000;
let lastDeploy = 0;

async function deploy() {
  await $`espresso r`;
  await $`buzaglo -p melio-core-e2e -e core-e2e deploy melio-db-migration@master`;
  await $`buzaglo -p melio-core-e2e -e core-e2e deploy sizzers-api@master`;
  // TODO: payment api ?
}

function printMinutesLeft() {
  const timePassedSinceLast = Date.now() - lastDeploy;
  const minutesLeft = Math.ceil((DEPLOY_GAP - timePassedSinceLast) / 60000);
  echo`minutes left for next execution: ${minutesLeft}`;
}

async function checkIfTimeToDeploy() {
  const now = Date.now();
  const timePassedSinceLast = now - lastDeploy;
  if (timePassedSinceLast >= DEPLOY_GAP) {
    lastDeploy = now;
    await deploy();
  }

  printMinutesLeft();
}

while (true) {
  await checkIfTimeToDeploy();
  await sleep(WAIT_MS);
}
