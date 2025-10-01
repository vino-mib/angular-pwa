export interface DataAdapter {
  // Add other required methods
  createChatSession(): Promise<string>;
  sendMessage<T extends Record<string, unknown>>(
    params: SendMessageParams
  ): AsyncGenerator<T[], void, unknown>;
  fetchChatSessions(
    limit?: number,
    offset?: number
  ): Promise<readonly ChatSession[]>;
  fetchChatSessionDetails(sessionId: string): Promise<ChatSessionDetails>;
  renameChatSession(sessionId: string, name?: string): Promise<ChatSession>;
  sendMessageFeedback(
    messageId: string,
    isHelpful: boolean,
    text?: string
  ): Promise<number>;
}


/**
 * Represents a chat session with basic information
 */
export interface ChatSession {
  readonly id: string;
  name?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface ChatSessionDetails extends ChatSession {
  readonly messages: readonly ChatMessage[];
}

export interface ChatMessage {
  readonly id: string;
  readonly content: string;
  readonly sender: 'user' | 'assistant'; // More specific than string
  readonly timestamp: string; // Consistent type for timestamp
  readonly parentMessageId?: string;
}

export interface SendMessageParams {
  readonly message: string;
  readonly chatSessionId: string;
  readonly parentMessageId?: string;
  readonly signal?: AbortSignal;
}
