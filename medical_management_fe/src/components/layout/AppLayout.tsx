import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold transition-colors duration-300">Medical Management</div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-cyan-100 transition-colors duration-300">Trang chủ</Link>
              </li>
              <li>
                <Link to="/tutorial" className="hover:text-cyan-100 transition-colors duration-300">Hướng dẫn</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-background transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;