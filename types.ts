
export interface OptimizationResult {
  optimizedSubject: string;
  optimizedBody: string;
  deliverabilityScore: number;
  spamFlags: string[];
  suggestions: string[];
}

export interface EmailData {
  recipients: string[];
  subject: string;
  body: string;
}

export enum SendingStatus {
  IDLE = 'IDLE',
  OPTIMIZING = 'OPTIMIZING',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface DeliveryLog {
  email: string;
  status: 'success' | 'failed';
  timestamp: string;
}
