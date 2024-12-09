export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  result: string;
}

export interface ChatError {
  error: string;
}
