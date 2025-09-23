import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('websocket-info')
  getWebSocketInfo() {
    return {
      message: 'WebSocket Gateway Test Information',
      server: {
        url: 'http://localhost:9944',
        websocketUrl: 'ws://localhost:9944/chat',
        namespace: '/chat'
      },
      testMethods: {
        connection: 'Just connect to /chat namespace',
        ping: {
          emit: 'ping',
          data: '{ "message": "test ping" }',
          response: 'pong event with timestamp'
        },
        test: {
          emit: 'test',
          data: '{ "test": "hello" }',
          response: 'testResponse event'
        },
        joinRoom: {
          emit: 'joinRoom',
          data: '"room-name"',
          response: 'joinedRoom and userJoined events'
        },
        leaveRoom: {
          emit: 'leaveRoom',
          data: '"room-name"',
          response: 'leftRoom event'
        }
      },
      testFile: {
        location: './websocket-test.html',
        instructions: 'Open websocket-test.html in browser to test'
      },
      troubleshooting: {
        postman: 'Postman WebSocket có thể có vấn đề với namespace. Dùng browser test tốt hơn.',
        namespace: 'Phải connect tới /chat namespace, không phải root /',
        cors: 'CORS đã được bật cho tất cả origins',
        authentication: 'Tạm thời đã tắt authentication để test'
      },
      logs: 'Check server console để xem connection logs'
    };
  }
}
