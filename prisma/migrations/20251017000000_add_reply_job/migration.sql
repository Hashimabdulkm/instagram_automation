-- Create ReplyJob table
CREATE TABLE "ReplyJob" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL,
    "automationId" uuid NOT NULL,
    "businessId" text NOT NULL,
    "toUserId" text NOT NULL,
    "triggerType" text NOT NULL,
    "commentId" text,
    "originalText" text NOT NULL,
    "message" text NOT NULL,
    "status" text NOT NULL DEFAULT 'pending',
    "attempts" integer NOT NULL DEFAULT 0,
    "lastError" text,
    "nextAttemptAt" timestamp with time zone NOT NULL DEFAULT now(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

-- Optionally, indexes to query pending jobs efficiently
CREATE INDEX IF NOT EXISTS replyjob_status_nextattempt_idx ON "ReplyJob" ("status", "nextAttemptAt");

