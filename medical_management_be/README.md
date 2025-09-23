<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


Dự án này là một ứng dụng NestJS sử dụng Bun làm JavaScript runtime thay vì Node.js.

## Yêu cầu

- [Bun](https://bun.sh/) (phiên bản 1.0.0 trở lên)

## Cài đặt

```bash
# Cài đặt dependencies
$ bun install
```

## Chạy ứng dụng

```bash
# Chế độ phát triển (với hot reload)
$ bun run dev

# Chế độ phát triển (sử dụng NestJS CLI)
$ bun run start:dev

# Chế độ debug
$ bun run start:debug

# Chế độ production
$ bun run start:prod
```

## Kiểm thử

```bash
# unit tests
$ bun test

# e2e tests
$ bun run test:e2e

# test coverage
$ bun run test:cov
```

## Cấu trúc dự án

```
src/
├── app.controller.spec.ts  # Controller unit tests
├── app.controller.ts       # Sample controller
├── app.module.ts           # Root application module
├── app.service.ts          # Sample service
└── main.ts                 # Application entry point
```

## Tính năng

- **NestJS Framework**: Framework TypeScript cho phát triển backend
- **Bun Runtime**: JavaScript runtime hiệu suất cao
- **Hot Reloading**: Phát triển nhanh với hot reload
- **TypeScript**: Đầy đủ hỗ trợ TypeScript
- **Testing**: Hỗ trợ unit tests và e2e tests

## Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com)
- [Bun Documentation](https://bun.sh/docs)

## License

Dự án này được phân phối dưới giấy phép [MIT licensed](LICENSE).
