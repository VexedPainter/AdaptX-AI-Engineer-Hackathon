/**
 * Extraction Schemas — Chat Log Documents
 * 
 * Realistic nested schema for extracting structured data from
 * messy chat logs (Slack, Teams, live chat transcripts).
 * Handles multi-participant conversations, action items, sentiment.
 */

import { z } from 'zod';

/** Schema for a chat participant */
export const ChatParticipantSchema = z.object({
  name: z.string().min(1, 'Participant name is required').describe('Display name or username of the participant'),
  role: z.enum(['customer', 'agent', 'bot', 'manager', 'unknown'])
    .describe('Role of the participant in the conversation'),
  department: z.string().optional().describe('Department if identifiable (e.g., Sales, Support)'),
});

/** Schema for a detected action item from the chat */
export const ActionItemSchema = z.object({
  description: z.string().min(1, 'Action description is required').describe('What needs to be done'),
  assignee: z.string().optional().describe('Who is responsible'),
  deadline: z.string().optional().describe('Due date if mentioned (ISO 8601 or descriptive)'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
    .describe('Priority level'),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).default('open')
    .describe('Current status of the action item'),
});

/** Schema for a topic/issue discussed in the chat */
export const DiscussionTopicSchema = z.object({
  topic: z.string().min(1, 'Topic description is required').describe('Brief description of the topic discussed'),
  resolution: z.string().optional().describe('How the topic was resolved, if at all'),
  resolved: z.boolean().describe('Whether this topic was resolved in the chat'),
});

/** Schema for key decisions made during the chat */
export const DecisionSchema = z.object({
  decision: z.string().min(1, 'Decision description is required').describe('The decision that was made'),
  madeBy: z.string().optional().describe('Who made or proposed the decision'),
  context: z.string().optional().describe('Context or reasoning behind the decision'),
});

/** Top-level chat log extraction schema */
export const ChatLogSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required').describe('Identifier for the conversation'),
  platform: z.enum(['slack', 'teams', 'live_chat', 'email_thread', 'discord', 'other'])
    .describe('Platform where the conversation took place'),
  startTime: z.string().min(1, 'Start time is required').describe('When the conversation started (ISO 8601 or descriptive)'),
  endTime: z.string().optional().describe('When the conversation ended'),
  participants: z.array(ChatParticipantSchema).min(1)
    .describe('People involved in the conversation'),
  summary: z.string().min(1, 'Summary is required').describe('Brief summary of the entire conversation'),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed', 'escalated'])
    .describe('Overall sentiment of the conversation'),
  topics: z.array(DiscussionTopicSchema).describe('Topics discussed'),
  actionItems: z.array(ActionItemSchema).describe('Action items identified'),
  decisions: z.array(DecisionSchema).describe('Key decisions made'),
  escalated: z.boolean().describe('Whether the conversation was escalated'),
  escalationReason: z.string().optional().describe('Reason for escalation if applicable'),
  followUpRequired: z.boolean().describe('Whether follow-up is needed'),
  followUpDeadline: z.string().optional().describe('Deadline for follow-up if specified'),
  messageCount: z.number().int().optional().describe('Total number of messages in the chat'),
  language: z.string().default('en').describe('Primary language of the conversation'),
});

export type ChatLogExtraction = z.infer<typeof ChatLogSchema>;
