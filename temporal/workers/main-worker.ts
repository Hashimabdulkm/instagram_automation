import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local (and .env if it exists)
const envLocalPath = resolve(__dirname, '../../.env.local');
const envPath = resolve(__dirname, '../../.env');

config({ path: envLocalPath });
config({ path: envPath });

import { Worker, NativeConnection, DefaultLogger, Runtime, LogEntry } from '@temporalio/worker';
import * as activities from '../activity/activity';

// Enable detailed logging
Runtime.install({
  logger: new DefaultLogger('INFO', (entry: LogEntry) => {
    console.log(`[${entry.level}]`, entry.message, entry.meta || '');
  }),
});

/**
 * Main Temporal Worker
 * Processes Instagram webhook workflows and user event workflows
 */
async function run() {
  console.log('[Temporal Worker] Starting...');
  console.log(`[Temporal Worker] Connecting to: ${process.env.TEMPORAL_ADDRESS || 'localhost:7233'}`);
  console.log(`[Temporal Worker] Namespace: ${process.env.TEMPORAL_NAMESPACE || 'default'}`);
  console.log('[Temporal Worker] Task queue: instagram-webhook-queue');

  // Create connection to Temporal server
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  console.log('[Temporal Worker] Connected to Temporal server');

  // Create worker
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: 'instagram-webhook-queue',

    // Path to workflow code directory
    workflowsPath: require.resolve("../workflow"),

    // Register activities
    activities,

    // Worker options
    maxConcurrentActivityTaskExecutions: 10,
    maxConcurrentWorkflowTaskExecutions: 10,
  });

  console.log('[Temporal Worker] Worker created successfully');
  console.log('[Temporal Worker] Listening for tasks...');

  // Start accepting tasks
  await worker.run();
}

// Handle graceful shutdown
async function shutdown() {
  console.log('[Temporal Worker] Shutting down gracefully...');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the worker
run().catch((err) => {
  console.error('[Temporal Worker] Fatal error:', err);
  process.exit(1);
});
