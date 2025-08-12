export interface ICommunicationService {
  sendToUser(userId: string, event: string, data: any): Promise<void>;
  sendToRoom(room: string, event: string, data: any): Promise<void>;
  broadcastToAll(event: string, data: any): Promise<void>;
}

export const COMMUNICATION_SERVICE = Symbol('ICommunicationService');
