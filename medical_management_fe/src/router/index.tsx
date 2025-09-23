import { createBrowserRouter } from 'react-router-dom';
import routes from './routes';

// Tạo router với cấu hình cơ bản cho React Router v7
export const router = createBrowserRouter(routes);

export * from './routes'; 