'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useRef, useState, createContext, useContext, useCallback, useEffect } from 'react';
import { Home, Gift, Users, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackgroundMusic, BackgroundMusicHandle } from './background-music';
import { auth, db } from '@/lib/firebase-client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';

const BottomNavItem = ({ href, label, icon: Icon, isActive }: { href: string, label: string, icon: React.ElementType, isActive: boolean}) => (
    <Link href={href} className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-20",
        isActive ? "text-primary" : "text-muted-foreground hover:bg-muted"
    )}>
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium">{label}</span>
    </Link>
)

interface BackgroundMusicContextType {
    isPlaying: boolean;
    toggleMusic: () => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | null>(null);

export const useBackgroundMusic = () => {
    const context = useContext(BackgroundMusicContext);
    if (!context) {
        throw new Error("useBackgroundMusic must be used within a UserDataProvider");
    }
    return context;
};

interface UserDataContextType {
    userData: DocumentData | null;
    loading: boolean;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUserData must be used within a UserDataProvider");
    }
    return context;
}

const UserDataProvider = ({ children }: { children: ReactNode }) => {
    const [user, authLoading] = useAuthState(auth);
    const [userData, setUserData] = useState<DocumentData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data());
                } else {
                    setUserData(null); // Or handle user profile not found
                }
                setDataLoading(false);
            });

            return () => unsubscribe();
        } else if (!authLoading) {
            setUserData(null);
            setDataLoading(false);
        }
    }, [user, authLoading]);
    
    return (
        <UserDataContext.Provider value={{ userData, loading: authLoading || dataLoading }}>
            {children}
        </UserDataContext.Provider>
    )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const musicRef = useRef<BackgroundMusicHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // This effect ensures we have an initial isPlaying state.
  useEffect(() => {
    setIsPlaying(musicRef.current?.isPlaying() ?? false);
  }, []);


  const toggleMusic = useCallback(() => {
      musicRef.current?.togglePlayPause();
  }, []);

  const handlePlaybackChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/redeem', label: 'Redeem', icon: Gift },
    { href: '/refer', label: 'Refer', icon: Users },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <UserDataProvider>
        <BackgroundMusicContext.Provider value={{ isPlaying, toggleMusic }}>
            <div className="flex flex-col min-h-screen">
                <BackgroundMusic ref={musicRef} src="/background-music.mp3" onPlaybackChange={handlePlaybackChange} />
                <main className="flex-1 p-4 sm:p-6">
                {children}
                </main>
                <footer className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur-sm">
                    <nav className="flex justify-around items-center p-2">
                        {navItems.map((item) => (
                            <BottomNavItem 
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                            />
                        ))}
                    </nav>
                </footer>
            </div>
        </BackgroundMusicContext.Provider>
    </UserDataProvider>
  );
}
