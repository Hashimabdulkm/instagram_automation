# Temporal Workers

This directory contains Temporal workflows, activities, and workers for processing Instagram webhooks.

## Architecture

```
temporal/
├── workflow/           # Workflow definitions (deterministic code)
│   ├── instagram-webhook-workflow.ts    # Main webhook processing workflow
│   └── user-event-workflow.ts          # Individual user event handler
├── activity/          # Activity implementations (non-deterministic code)
│   └── activity.ts    # Database queries, API calls, etc.
└── workers/           # Worker processes
    ├── main-worker.ts # Main worker for webhook processing
    └── tsconfig.json  # TypeScript config for workers
```

## Workflows

### Instagram Webhook Workflow
- **File**: [workflow/instagram-webhook-workflow.ts](workflow/instagram-webhook-workflow.ts)
- **Task Queue**: `instagram-webhook-queue`
- **Purpose**: Receives Instagram webhook payloads and spawns child workflows for each event

### User Event Workflow
- **File**: [workflow/user-event-workflow.ts](workflow/user-event-workflow.ts)
- **Purpose**: Processes individual webhook events (messages, comments, etc.)
- **Handles**: DM automations, comment automations, keyword matching, lead notifications

## Activities

All activities are defined in [activity/activity.ts](activity/activity.ts):

### Database Activities
- `getIntegrationByInstagramId` - Fetch integration by Instagram account
- `getUserAutomations` - Get user's active automations
- `createLeadNotification` - Create lead notification

### Instagram API Activities
- `fetchInstagramUserInfo` - Get user info from Instagram
- `sendDM` - Send Instagram direct message
- `replyToInstagramComment` - Reply to Instagram comment

## Running the Workers

### Prerequisites

1. **Temporal Server Running**
   ```bash
   # Using Temporal CLI
   temporal server start-dev

   # Or using Docker
   docker run -p 7233:7233 temporalio/auto-setup:latest
   ```

2. **Environment Variables**
   ```env
   TEMPORAL_ADDRESS=localhost:7233
   TEMPORAL_NAMESPACE=default
   ```

### Development Mode

Start the worker with hot reload:
```bash
npm run temporal:worker
```

### Production Mode

1. Build the worker:
   ```bash
   npm run temporal:worker:build
   ```

2. Start the worker:
   ```bash
   npm run temporal:worker:start
   ```

## How It Works

1. **Instagram webhook arrives** → POST to `/api/webhooks/instagram`
2. **Webhook handler** → Validates payload and starts workflow
   ```typescript
   const workflowId = await startWebhookWorkflow(webhook);
   ```
3. **Instagram Webhook Workflow** → Processes webhook and creates child workflows
4. **User Event Workflow** → Handles each event:
   - Looks up user integration
   - Checks automations and keywords
   - Sends DMs or comment replies
   - Creates lead notifications
   - Handles retries with exponential backoff

## Task Queues

- `instagram-webhook-queue` - Main queue for webhook processing

## Monitoring

Use the Temporal Web UI to monitor workflows:
```bash
# Default local URL
http://localhost:8233
```

You can:
- View running workflows
- Check workflow history
- See failed activities
- Retry failed workflows
- Monitor task queue performance


## Development Tips

1. **Workflow Code Must Be Deterministic**
   - No database calls, API calls, or random numbers in workflows
   - Use activities for all non-deterministic operations
   - Use `proxyActivities` to call activities from workflows

2. **Activities Can Fail and Retry**
   - Activities are automatically retried by Temporal
   - Configure retry policies in workflow code
   - Use timeouts to prevent hanging activities

3. **Testing Workflows**
   - Use `temporal workflow show` to inspect workflow state
   - Use `temporal workflow describe` to see workflow details
   - Check activity logs for debugging

## Troubleshooting

### Worker Not Starting
- Check Temporal server is running: `temporal server health`
- Verify connection settings in environment variables
- Check worker logs for errors

### Workflows Not Processing
- Verify task queue name matches in worker and client
- Check if worker is polling the correct namespace
- Look for workflow errors in Temporal UI

### Activities Timing Out
- Increase `startToCloseTimeout` in workflow code
- Check activity logs for performance issues
- Verify database/API connectivity

## Next Steps

- Add more event types (reactions, mentions, etc.)
- Implement SMARTAI listener with AI model integration
- Add metrics and monitoring
- Implement workflow versioning for safe updates
