import { InstagramWebhook } from '@/lib/instagram-webhookschema';
import { userEventWorkflow } from './user-event-workflow';
import * as activities from '../activity/activity';
import { proxyActivities, executeChild } from '@temporalio/workflow';

const { processWebhookPayload } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

/**
 * Instagram Webhook Processing Workflow
 * Main workflow that receives the webhook payload and starts a child workflow for each event
 */
export async function instagramWebhookWorkflow(payload: InstagramWebhook): Promise<void> {
  // Process the webhook to extract normalized events
  const events = await processWebhookPayload(payload);

  // Start a child workflow for each event
  const childWorkflows = events.map(async (event, index) => {
    try {
      // Execute child workflow and wait for it to complete
      await executeChild("userEventWorkflow", {
        workflowId: `user-event-${event.accountId}-${event.timestamp}-${index}`,
        taskQueue: 'instagram-webhook-queue',
        args: [event],
        retry: {
          maximumAttempts: 3,
        },
      });
    } catch (error) {
      console.error(`[InstagramWebhookWorkflow] Failed to process event ${index + 1}:`, error);
      throw error;
    }
  });

  // Wait for all child workflows to complete
  await Promise.all(childWorkflows);
}

