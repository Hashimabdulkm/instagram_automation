import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activity/activity';
import { CommentEvent } from '@/lib/instagram-webhookschema';

// Type definition (copied from instagram-webhookschema to avoid bundling issues)
interface ProcessedWebhookEvent {
  type: 'message' | 'reaction' | 'postback' | 'referral' | 'message_seen' | 'message_edit' | 'comment' | 'mention';
  accountId: string;
  timestamp: number;
  data: any;
}

const {
  getIntegrationByInstagramId,
  getUserAutomations,
  createLeadNotification,
  fetchInstagramUserInfo,
  sendCommentDM,
  sendDM,
  replyToInstagramComment,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  scheduleToCloseTimeout: '3 minutes',
  scheduleToStartTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

/**
 * User Event Workflow
 * Processes a single webhook event for a user
 * Gets the user, their automations, and handles the event accordingly
 */
export async function userEventWorkflow(event: ProcessedWebhookEvent): Promise<void> {
  try {
    // Get integration (user) for this Instagram account
    const integration = await getIntegrationByInstagramId(event.accountId);

    if (!integration || !integration.userId) {
      console.warn(`[UserEventWorkflow] No integration found for account ${event.accountId}`);
      return;
    }

    const userId = integration.userId as string;
    const businessId = event.accountId;

    // Route to appropriate handler based on event type
    switch (event.type) {
      case 'message':
        await handleMessageEvent(userId, businessId, event, integration);
        break;

      case 'comment':
        await handleCommentEvent(userId, businessId, event, integration);
        break;

      case 'reaction':
      case 'postback':
      case 'referral':
      case 'message_seen':
      case 'message_edit':
      case 'mention':
        // Event types not yet implemented
        break;

      default:
        console.warn(`[UserEventWorkflow] Unknown event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[UserEventWorkflow] Error processing event:`, error);
    throw error;
  }
}

/**
 * Handle incoming message (DM) event
 */
async function handleMessageEvent(userId: string, businessId: string, event: ProcessedWebhookEvent, integration: any) {
  const messageData = event.data;
  const text = messageData.message?.text;
  const fromId = messageData.sender?.id;

  if (!text || !fromId) {
    return;
  }

  // Skip echo messages (sent by the business itself)
  if (messageData.message?.is_echo || messageData.message?.is_self) {
    return;
  }

  // Get user's active DM automations
  const automations = await getUserAutomations(userId, 'dm');

  for (const automation of automations) {
    // Check if message matches keywords
    const keywords = (automation.keywords || []).map((k: any) => k.word.toLowerCase());
    const matches = keywords.length === 0 || keywords.some((w: string) => text.toLowerCase().includes(w));

    if (!matches) continue;

    const listener = automation.listener?.[0];
    if (!listener) continue;

    // Handle MESSAGE listener
    if (listener.listener === 'MESSAGE') {
      const reply = listener.commendReply || '';
      if (reply) {
        await sendDmReply(userId, automation.id, businessId, fromId, text, reply, automation.name);
      }
    }

    // Handle SMARTAI listener
    else if (listener.listener === 'SMARTAI') {
      // Still create lead notification
      const leadName = await getLeadName(fromId, integration.token);
      await createLeadNotification({
        userId,
        automationId: automation.id,
        leadId: fromId,
        leadName,
        triggerType: 'dm',
        message: text,
        campaignName: automation.name,
      });
    }
  }
}

/**
 * Handle incoming comment event
 */
async function handleCommentEvent(userId: string, businessId: string, event: ProcessedWebhookEvent, integration: any) {
  const commentData = event.data;
  const text = commentData.value?.text;
  const fromId = commentData.value?.from?.id;
  const commentId = commentData.value?.id;
  const postId = commentData.value?.media?.id; // Extract post ID from comment data

  if (!text || !fromId) {
    return;
  }

  // Get user's active comment automations
  const automations = await getUserAutomations(userId, 'comment');

  for (const automation of automations) {
    // Check if automation targets this specific post
    const postIds = automation.postIds || [];
    const targetsAllPosts = postIds.length === 0;
    const targetsSpecificPost = postId && postIds.includes(postId);

    if (!targetsAllPosts && !targetsSpecificPost) {
      continue;
    }

    // Check if comment matches keywords
    const keywords = (automation.keywords || []).map((k: any) => k.word.toLowerCase());
    const matches = keywords.length === 0 || keywords.some((w: string) => text.toLowerCase().includes(w));

    if (!matches) continue;

    const listener = automation.listener?.[0];
    if (!listener) continue;

    // Handle MESSAGE listener
    if (listener.listener === 'MESSAGE') {
      const commentReply = listener.commentReply || '';
      const dmReply = listener.commendReply || '';

      // Reply to comment
      if (commentReply && commentId && integration.token) {
        await sendCommentReply(userId, automation.id, businessId, fromId, commentId, text, commentReply, integration.token);
      }

      // Send DM
      if (dmReply) {
        await sendCommentDmReply(userId, automation.id, businessId, commentId, text, dmReply, automation.name);
      }

      // Create lead notification
      const leadName = await getLeadName(fromId, integration.token);
      await createLeadNotification({
        userId,
        automationId: automation.id,
        leadId: fromId,
        leadName,
        triggerType: 'comment',
        message: text,
        campaignName: automation.name,
      });
    }

    // Handle SMARTAI listener
    else if (listener.listener === 'SMARTAI') {
      // TODO: Implement AI response generation
    }
  }
}

/**
 * Send a DM reply with Temporal retry logic
 */
async function sendCommentDmReply(
  userId: string,
  automationId: string,
  businessId: string,
  commentId: string,
  originalText: string,
  reply: string,
  campaignName: string
) {
  try {
    await sendCommentDM(businessId, commentId, reply);

    // Create lead notification on success
    const leadName = commentId; // Will be enriched by getLeadName if needed
    await createLeadNotification({
      userId,
      automationId,
      leadId: commentId,
      leadName,
      triggerType: 'dm',
      message: originalText,
      campaignName,
    });
  } catch (error: any) {
    console.error(`[UserEventWorkflow] Failed to send comment DM:`, error);
    throw error; // Let Temporal handle retries
  }
}

/**
 * Send a DM reply with Temporal retry logic
 */
async function sendDmReply(
  userId: string,
  automationId: string,
  businessId: string,
  toUserId: string,
  originalText: string,
  reply: string,
  campaignName: string
) {
  try {
    await sendDM(businessId, toUserId, reply);

    // Create lead notification on success
    const leadName = toUserId; // Will be enriched by getLeadName if needed
    await createLeadNotification({
      userId,
      automationId,
      leadId: toUserId,
      leadName,
      triggerType: 'dm',
      message: originalText,
      campaignName,
    });
  } catch (error: any) {
    console.error(`[UserEventWorkflow] Failed to send DM reply:`, error);
    throw error; // Let Temporal handle retries
  }
}

/**
 * Reply to a comment with Temporal retry logic
 */
async function sendCommentReply(
  userId: string,
  automationId: string,
  businessId: string,
  fromId: string,
  commentId: string,
  originalText: string,
  reply: string,
  encryptedToken: string
) {
  try {
    await replyToInstagramComment(commentId, reply, encryptedToken);
  } catch (error: any) {
    console.error(`[UserEventWorkflow] Failed to reply to comment:`, error);
    throw error; // Let Temporal handle retries
  }
}

/**
 * Get lead name from Instagram user info
 */
async function getLeadName(userId: string, encryptedToken: string | null): Promise<string> {
  if (!encryptedToken) return userId;

  try {
    const userInfo = await fetchInstagramUserInfo(userId, encryptedToken);
    return userInfo.username || userInfo.name || userId;
  } catch (error) {
    return userId;
  }
}
