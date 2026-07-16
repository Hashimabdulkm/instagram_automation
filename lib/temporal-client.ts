import { Client, Connection } from '@temporalio/client';
import { InstagramWebhook } from './instagram-webhookschema';

let client: Client | null = null;

/**
 * Get or create a Temporal client
 */
export async function getTemporalClient(): Promise<Client> {
  if (client) {
    return client;
  }

  // Create connection to Temporal server
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  // Create client
  client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  return client;
}

/**
 * Start an Instagram webhook processing workflow
 */
export async function startWebhookWorkflow(payload: InstagramWebhook) {
  const client = await getTemporalClient();

  // Generate unique workflow ID based on timestamp and random string
  const workflowId = `instagram-webhook-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const handle = await client.workflow.start("instagramWebhookWorkflow", {
    taskQueue: 'instagram-webhook-queue',
    args: [payload],
    workflowId,
  });

  console.log(`[Temporal] Started workflow ${handle.workflowId}`);

  // Don't wait for result - this is non-blocking
  // The workflow will process asynchronously
  return handle.workflowId;
}
