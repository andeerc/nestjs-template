import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    // Optional JWT authentication
    try {
      const token = client.handshake.auth.token;
      if (token) {
        const decoded = this.jwtService.verify(token);
        client.data.user = decoded;
        this.logger.log(`User authenticated: ${decoded.email}`);
      }
    } catch (error) {
      this.logger.warn(`Authentication failed for client ${client.id}: ${error.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, @MessageBody() room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('joined-room', room);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, @MessageBody() room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    client.emit('left-room', room);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, @MessageBody() payload: any) {
    this.logger.log(`Message from ${client.id}: ${JSON.stringify(payload)}`);

    // Broadcast to all clients in the room
    if (payload.room) {
      client.to(payload.room).emit('message', {
        from: client.id,
        message: payload.message,
        timestamp: new Date(),
      });
    }
  }

  // Method to broadcast events from services
  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
