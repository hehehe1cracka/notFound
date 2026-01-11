import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Zap, LogOut, User, LayoutDashboard, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/discover', label: 'Discover' },
    { href: '/people', label: 'People' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/how-it-works', label: 'How it Works' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-primary/5" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />

      <div className="container relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Zap className="h-6 w-6 text-primary relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              momentum
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors duration-200 group overflow-hidden rounded-full',
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-primary/10 transition-transform duration-300 ease-out origin-left",
                  location.pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <ModeToggle />
          {user ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-white/5 hover:text-primary transition-colors">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src={userProfile?.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary font-display font-bold">
                        {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{userProfile?.displayName}</p>
                      <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-400/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3 animate-fade-in">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hover:text-white hover:bg-white/5">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
