import { z } from 'zod';

// ============================================================================
// Base Types
// ============================================================================

const CommentFromSchema = z.object({
  id: z.string().describe('Instagram-scoped user ID'),
  username: z.string().describe('Username of the commenter'),
});

const CommentMediaSchema = z.object({
  id: z.string().describe('Media ID'),
  media_product_type: z.string().describe('Media location: ad, feed, story, or reel'),
});

// ============================================================================
// Business Login for Instagram - Individual Event Types
// ============================================================================

// Comment Event
const CommentEventSchema = z.object({
  field: z.enum(['comments', 'live_comments']),
  value: z.object({
    id: z.string().describe('Comment ID'),
    from: CommentFromSchema,
    text: z.string().describe('Comment text'),
    media: CommentMediaSchema,
  }),
});

export type CommentEvent = z.infer<typeof CommentEventSchema>;

// Message Event
const MessageAttachmentSchema = z.object({
  type: z.string().describe('Attachment type: audio, file, image, share, story_mention, video, ig_reel, reel'),
  payload: z.object({
    url: z.string().describe('URL for the media'),
  }),
});

const QuickReplySchema = z.object({
  payload: z.string().describe('Quick reply option selected'),
});

export type QuickReply = z.infer<typeof QuickReplySchema>;

const ReferralAdsContextSchema = z.object({
  ad_title: z.string(),
  photo_url: z.string().optional(),
  video_url: z.string().optional(),
});

const MessageReferralSchema = z.object({
  ref: z.string().optional().describe('Ad ref parameter value if set'),
  ad_id: z.string().optional().describe('Ad ID (required for ADS source)'),
  source: z.enum(['ADS', 'SHORTLINKS']).describe('Source of the referral'),
  type: z.literal('OPEN_THREAD'),
  ads_context_data: ReferralAdsContextSchema.optional().describe('Ad context data (required for ADS source)'),
});

const ReplyToMessageSchema = z.object({
  mid: z.string().describe('Message ID'),
});

const ReplyToStorySchema = z.object({
  story: z.object({
    url: z.string().describe('CDN URL for the story'),
    id: z.string().describe('Story ID'),
  }),
});

const MessageObjectSchema = z.object({
  mid: z.string().describe('Message ID'),
  text: z.string().optional().describe('Message text'),
  attachments: z.array(MessageAttachmentSchema).optional(),
  is_deleted: z.boolean().optional().describe('True if message was deleted'),
  is_echo: z.boolean().optional().describe('True if message was sent by your app user'),
  is_self: z.boolean().optional().describe('True for test messages to your own account'),
  is_unsupported: z.boolean().optional().describe('True if message contains unsupported media'),
  quick_reply: QuickReplySchema.optional(),
  referral: MessageReferralSchema.optional(),
  reply_to: z.union([ReplyToMessageSchema, ReplyToStorySchema]).optional(),
});

const MessageEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number().describe('Time webhook was triggered'),
  message: MessageObjectSchema,
});

export type MessageEvent = z.infer<typeof MessageEventSchema>;

// Message Reaction Event
const ReactionEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number(),
  reaction: z.object({
    mid: z.string().describe('Message ID'),
    action: z.enum(['react', 'unreact']),
    reaction: z.literal('love').optional().describe('Reaction type (only when action is react)'),
    emoji: z.string().optional().describe('Emoji unicode (only when action is react)'),
  }),
});

export type ReactionEvent = z.infer<typeof ReactionEventSchema>;

// Postback Event
const PostbackEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number(),
  postback: z.object({
    mid: z.string().describe('Message ID'),
    title: z.string().describe('Icebreaker or CTA button selected'),
    payload: z.string().describe('Payload for the selection'),
  }),
});

export type PostbackEvent = z.infer<typeof PostbackEventSchema>;

// Referral Event
const ReferralEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number(),
  referral: z.object({
    ref: z.string().describe('Value of ref parameter in ig.me link'),
    source: z.string().describe('ig.me link that was clicked'),
    type: z.literal('OPEN_THREAD').optional().describe('Included when part of existing conversation'),
  }),
});

export type ReferralEvent = z.infer<typeof ReferralEventSchema>;

// Message Seen Event
const MessageSeenEventSchema = z.object({
  sender: z.object({ id: z.string() }).optional(),
  recipient: z.object({ id: z.string() }).optional(),
  timestamp: z.number(),
  read: z.object({
    mid: z.string().describe('Message ID that was read'),
  }),
});

export type MessageSeenEvent = z.infer<typeof MessageSeenEventSchema>;

// Message Edit Event
const MessageEditEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number(),
  message_edit: z.object({
    mid: z.string().describe('Message ID that was edited'),
    text: z.string().describe('Edited text message'),
    num_edit: z.string().describe('Number of times message has been edited'),
  }),
});

export type MessageEditEvent = z.infer<typeof MessageEditEventSchema>;

// Union of all messaging events (fallback catches unknown shapes like partial read receipts)
const MessagingEventSchema = z.union([
  MessageEventSchema,
  ReactionEventSchema,
  PostbackEventSchema,
  ReferralEventSchema,
  MessageSeenEventSchema,
  MessageEditEventSchema,
  z.record(z.any()),
]);

export type MessagingEvent = z.infer<typeof MessagingEventSchema>;

// ============================================================================
// Facebook Login for Business - Event Types
// ============================================================================

const FBLoginCommentMediaSchema = z.object({
  id: z.string().describe('Media ID'),
  ad_id: z.string().optional().describe('Ad ID if comment was on an ad'),
  ad_title: z.string().optional().describe('Ad title if comment was on an ad'),
  original_media_id: z.string().optional().describe('Original media ID if comment was on an ad'),
  media_product_type: z.string().optional().describe('Product ID if comment was on a specific product'),
});

const FBLoginCommentChangeSchema = z.object({
  field: z.enum(['comments', 'live_comments']),
  value: z.object({
    from: CommentFromSchema,
    id: z.string().describe('Comment ID'),
    parent_id: z.string().optional().describe('Parent comment ID if replying to a comment'),
    text: z.string().optional().describe('Comment text'),
    media: FBLoginCommentMediaSchema,
  }),
});

export type FBLoginCommentChange = z.infer<typeof FBLoginCommentChangeSchema>;

// Mention Events
const MentionMediaChangeSchema = z.object({
  field: z.literal('mentions'),
  value: z.object({
    media_id: z.string().describe('ID of media where account was mentioned'),
  }),
});

const MentionCommentChangeSchema = z.object({
  field: z.literal('mentions'),
  value: z.object({
    comment_id: z.string().describe('ID of comment with mention'),
    media_id: z.string().describe('ID of media that was commented on'),
  }),
});

const MentionChangeSchema = z.union([MentionMediaChangeSchema, MentionCommentChangeSchema]);

export type MentionChange = z.infer<typeof MentionChangeSchema>;

// Union of all Facebook Login changes
const FBLoginChangeSchema = z.union([
  FBLoginCommentChangeSchema,
  MentionChangeSchema,
]);

export type FBLoginChange = z.infer<typeof FBLoginChangeSchema>;

// ============================================================================
// Main Webhook Structure
// ============================================================================

// Business Login Entry
const BusinessLoginEntrySchema = z.object({
  id: z.string().describe('Your app user\'s Instagram account ID'),
  time: z.number().describe('Time Meta sent this notification'),
  field: z.string().optional(),
  value: z.any().optional(),
  messaging: z.array(MessagingEventSchema).optional(),
});

export type BusinessLoginEntry = z.infer<typeof BusinessLoginEntrySchema>;

// Facebook Login Entry
const FBLoginEntrySchema = z.object({
  id: z.string().describe('Your app user\'s Instagram account ID'),
  time: z.number().describe('Time Meta sent this notification'),
  changes: z.array(FBLoginChangeSchema),
});

export type FBLoginEntry = z.infer<typeof FBLoginEntrySchema>;

// Combined Entry Schema - try FB Login first since it has required changes field
const EntrySchema = z.union([FBLoginEntrySchema, BusinessLoginEntrySchema]);

export type Entry = z.infer<typeof EntrySchema>;

// Main Webhook Schema
export const InstagramWebhookSchema = z.object({
  object: z.literal('instagram'),
  entry: z.array(EntrySchema),
});

export type InstagramWebhook = z.infer<typeof InstagramWebhookSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse and validate an Instagram webhook payload
 * @param payload - The raw webhook payload
 * @returns Parsed and validated webhook data
 * @throws ZodError if validation fails
 */
export function parseInstagramWebhook(payload: unknown): InstagramWebhook {
  return InstagramWebhookSchema.parse(payload);
}

/**
 * Safely parse an Instagram webhook payload
 * @param payload - The raw webhook payload
 * @returns Success or error result
 */
export function safeParseInstagramWebhook(payload: unknown) {
  return InstagramWebhookSchema.safeParse(payload);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if entry is a Business Login entry (has messaging array)
 */
export function isBusinessLoginEntry(entry: Entry): entry is BusinessLoginEntry {
  return 'messaging' in entry && Array.isArray(entry.messaging);
}

/**
 * Check if entry is a Facebook Login entry (has changes array)
 */
export function isFBLoginEntry(entry: Entry): entry is FBLoginEntry {
  return 'changes' in entry && Array.isArray(entry.changes);
}

/**
 * Check if messaging event is a message event
 */
export function isMessageEvent(event: MessagingEvent): event is MessageEvent {
  return 'message' in event;
}

/**
 * Check if messaging event is a reaction event
 */
export function isReactionEvent(event: MessagingEvent): event is ReactionEvent {
  return 'reaction' in event;
}

/**
 * Check if messaging event is a postback event
 */
export function isPostbackEvent(event: MessagingEvent): event is PostbackEvent {
  return 'postback' in event;
}

/**
 * Check if messaging event is a referral event
 */
export function isReferralEvent(event: MessagingEvent): event is ReferralEvent {
  return 'referral' in event;
}

/**
 * Check if messaging event is a message seen event
 */
export function isMessageSeenEvent(event: MessagingEvent): event is MessageSeenEvent {
  return 'read' in event;
}

/**
 * Check if messaging event is a message edit event
 */
export function isMessageEditEvent(event: MessagingEvent): event is MessageEditEvent {
  return 'message_edit' in event;
}

/**
 * Check if change is a comment change
 */
export function isCommentChange(change: FBLoginChange): change is FBLoginCommentChange {
  return change.field === 'comments' || change.field === 'live_comments';
}

/**
 * Check if change is a mention change
 */
export function isMentionChange(change: FBLoginChange): change is MentionChange {
  return change.field === 'mentions';
}

/**
 * Check if a message event contains a quick reply
 */
export function hasQuickReply(event: MessageEvent): boolean {
  return event.message.quick_reply !== undefined;
}

// ============================================================================
// Webhook Processing Helper
// ============================================================================

export interface ProcessedWebhookEvent {
  type: 'message' | 'reaction' | 'postback' | 'referral' | 'message_seen' | 'message_edit' | 'comment' | 'mention';
  accountId: string;
  timestamp: number;
  data: any;
}

/**
 * Process a webhook and extract all events in a normalized format
 * @param webhook - Validated Instagram webhook
 * @returns Array of processed events
 */
export function processWebhook(webhook: InstagramWebhook): ProcessedWebhookEvent[] {
  const events: ProcessedWebhookEvent[] = [];

  for (const entry of webhook.entry) {
    // Handle Business Login entries (messaging events)
    if (isBusinessLoginEntry(entry) && entry.messaging) {
      for (const messagingEvent of entry.messaging) {
        if (isMessageEvent(messagingEvent)) {
          events.push({
            type: 'message',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        } else if (isReactionEvent(messagingEvent)) {
          events.push({
            type: 'reaction',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        } else if (isPostbackEvent(messagingEvent)) {
          events.push({
            type: 'postback',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        } else if (isReferralEvent(messagingEvent)) {
          events.push({
            type: 'referral',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        } else if (isMessageSeenEvent(messagingEvent)) {
          events.push({
            type: 'message_seen',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        } else if (isMessageEditEvent(messagingEvent)) {
          events.push({
            type: 'message_edit',
            accountId: entry.id,
            timestamp: messagingEvent.timestamp,
            data: messagingEvent,
          });
        }
      }
    }

    // Handle Facebook Login entries (changes events)
    if (isFBLoginEntry(entry)) {
      for (const change of entry.changes) {
        if (isCommentChange(change)) {
          events.push({
            type: 'comment',
            accountId: entry.id,
            timestamp: entry.time,
            data: change,
          });
        } else if (isMentionChange(change)) {
          events.push({
            type: 'mention',
            accountId: entry.id,
            timestamp: entry.time,
            data: change,
          });
        }
      }
    }
  }

  return events;
}

// ============================================================================
// Usage Example (commented out)
// ============================================================================

/*
// Example: Processing incoming webhook
app.post('/webhook', async (req, res) => {
  try {
    // Validate the webhook
    const webhook = parseInstagramWebhook(req.body);
    
    // Process all events in the webhook
    const events = processWebhook(webhook);
    
    // Loop through each event
    for (const event of events) {
      console.log(`Processing ${event.type} event for account ${event.accountId}`);
      
      switch (event.type) {
        case 'message':
          const messageData = event.data as MessageEvent;
          console.log('Message text:', messageData.message.text);
          console.log('From:', messageData.sender.id);
          break;
          
        case 'comment':
          const commentData = event.data as FBLoginCommentChange;
          console.log('Comment text:', commentData.value.text);
          console.log('Comment ID:', commentData.value.comment_id);
          break;
          
        case 'reaction':
          const reactionData = event.data as ReactionEvent;
          console.log('Reaction:', reactionData.reaction.action);
          break;
          
        // ... handle other event types
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Invalid webhook:', error);
    res.sendStatus(400);
  }
});

// Example: Direct entry iteration
const webhook = parseInstagramWebhook(payload);

for (const entry of webhook.entry) {
  console.log('Account ID:', entry.id);
  
  if (isBusinessLoginEntry(entry) && entry.messaging) {
    for (const event of entry.messaging) {
      if (isMessageEvent(event)) {
        // Handle message
      }
    }
  }
  
  if (isFBLoginEntry(entry)) {
    for (const change of entry.changes) {
      if (isCommentChange(change)) {
        // Handle comment
      }
    }
  }
}
*/