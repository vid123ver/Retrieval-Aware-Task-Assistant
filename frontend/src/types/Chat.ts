export type ChatRole = "user" | "assistant";

export type ChatActionType =
  | "create_task"
  | "update_task"
  | "delete_task"
  | "list_tasks";

export interface ChatAction {
  type: ChatActionType;
  task?: {
    id: string;
    title: string;
  };
  count?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  actions?: ChatAction[];
}