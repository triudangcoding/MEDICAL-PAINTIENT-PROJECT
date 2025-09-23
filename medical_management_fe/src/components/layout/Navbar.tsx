import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "relative px-3 py-2 transition-all duration-300 hover:text-primary group",
        isActive
          ? "text-primary font-medium"
          : "text-foreground/80",
        className
      )}
    >
      {children}
      <span className={cn(
        "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
        isActive ? "w-full" : "w-0 group-hover:w-full"
      )} />
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Medical Management</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/">Trang chủ</NavLink>
            <NavLink href="/features">Tính năng</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <div className="hidden md:flex">
              <ModeToggle />
            </div>

            {/* Auth button */}
            <div className="hidden md:block">
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/login')}>Đăng nhập</Button>
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3 animate-in slide-in-from-top-5">
            <div className="flex flex-col space-y-2">
              <NavLink href="/" className="py-3">Trang chủ</NavLink>
              <NavLink href="/features" className="py-3">Tính năng</NavLink>
              <NavLink href="/dashboard" className="py-3">Dashboard</NavLink>
              <NavLink href="/products" className="py-3">Sản phẩm</NavLink>
              <NavLink href="/about" className="py-3">Về chúng tôi</NavLink>
              <NavLink href="/contact" className="py-3">Liên hệ</NavLink>

              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/auth/login')}>Đăng nhập</Button>
              </div>

              <div className="mt-2 self-start">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 