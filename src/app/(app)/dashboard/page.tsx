'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, Gift, Users, ClipboardList, Puzzle, BarChart, Clapperboard, Sparkles, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getOptimalLayout } from './actions';
import { MathQuizCard } from './math-quiz-card';
import { useUserData } from '../layout';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { Skeleton } from '@/components/ui/skeleton';


const DailyCheckIn = ({ onClaim, onClick }: { onClaim: (tokens: number) => void; onClick: () => void; }) => {
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ day: number, tokens: number } | null>(null);
  const { toast } = useToast();


  const checkInDays = [
    { day: 1, tokens: 10 },
    { day: 2, tokens: 15 },
    { day: 3, tokens: 20 },
    { day: 4, tokens: 25 },
    { day: 5, tokens: 30 },
  ];

  const handleDayClick = (day: { day: number, tokens: number }) => {
    onClick(); // Track engagement
    const lastClaimed = Math.max(0, ...claimedDays);
    if (day.day === lastClaimed + 1) {
        setSelectedDay(day);
        setIsDialogOpen(true);
    } else if (claimedDays.includes(day.day)) {
        toast({ title: "Already Claimed", description: `You have already claimed the reward for Day ${day.day}.`});
    } else {
        toast({ variant: "destructive", title: "Wait for your turn!", description: `Please claim your previous rewards first.`});
    }
  }

  const handleClaim = () => {
    if (!selectedDay) return;

    setIsDialogOpen(false);
    toast({
        title: "Watching Ad...",
        description: "You will be rewarded shortly for checking in.",
    });

    // Simulate ad watching for 3 seconds
    setTimeout(() => {
        onClaim(selectedDay.tokens);
        setClaimedDays([...claimedDays, selectedDay.day]);
        toast({
            title: "Reward Claimed!",
            description: `You have earned ${selectedDay.tokens} coins for Day ${selectedDay.day}.`,
        });
        setSelectedDay(null);
    }, 3000);
  }

  return (
    <>
    <Card className="w-full shadow-lg">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">Daily Check-In</h2>
          <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 -z-10"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10" style={{ width: `${(claimedDays.length / (checkInDays.length-1)) * 100}%` }}></div>
             {checkInDays.map((item, index) => {
                const isClaimed = claimedDays.includes(item.day);
                const canClaim = Math.max(0, ...claimedDays) + 1 === item.day;

                return (
                    <div key={item.day} className="flex flex-col items-center gap-2 z-0">
                       <button
                         onClick={() => handleDayClick(item)}
                         disabled={isDialogOpen}
                         className={cn(
                             "w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all border-4",
                             isClaimed ? "bg-primary border-primary/30 text-primary-foreground" : "bg-muted border-muted-foreground/20",
                             canClaim ? "cursor-pointer hover:bg-primary/80" : "cursor-not-allowed"
                         )}>
                           <Gift className="w-6 h-6"/>
                       </button>
                       <div className="text-xs font-semibold">{item.tokens} Tokens</div>
                       <div className="text-xs text-muted-foreground">{index === 0 ? "Today" : `Day: ${item.day}`}</div>
                    </div>
                )
             })}
          </div>
        </CardContent>
    </Card>

    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Claim Your Daily Reward</AlertDialogTitle>
                <AlertDialogDescription>
                    Watch a short ad to collect your reward of <span className="font-bold text-primary">{selectedDay?.tokens} coins</span> for Day {selectedDay?.day}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedDay(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClaim}>Collect</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

const ParticipateAndEarn = () => {
    const items = [
        { label: "Surveys", icon: ClipboardList, href: "/surveys"},
        { label: "OfferWalls", icon: BarChart, href: "/offerwalls"},
        { label: "Quiz", icon: Puzzle, href: "/dashboard/quiz"},
        { label: "Refer & Earn", icon: Users, href: "/refer"},
    ];
    return (
        <Card className="w-full shadow-lg">
             <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Participate And Earn</h2>
                    <div className="h-px flex-1 bg-border ml-4"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {items.map(item => (
                        <a href={item.href} key={item.label} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <item.icon className="w-8 h-8 text-primary"/>
                            </div>
                            <span className="text-sm font-medium text-center">{item.label}</span>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const WatchAdCard = ({ onAdWatched, onClick }: { onAdWatched: (coins: number) => void; onClick: () => void; }) => {
    const { toast } = useToast();
    const [isWatching, setIsWatching] = useState(false);
    const adReward = 5;

    const handleWatchAd = () => {
        onClick(); // Track engagement
        setIsWatching(true);
        toast({
            title: "Watching Ad...",
            description: "You will be rewarded shortly.",
        });

        // Simulate ad watching for 3 seconds
        setTimeout(() => {
            onAdWatched(adReward);
            toast({
                title: "Ad Finished!",
                description: `You have earned ${adReward} coins.`,
            });
            setIsWatching(false);
        }, 3000);
    };

    return (
        <Card className="w-full shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white" onClick={handleWatchAd}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Clapperboard className="w-10 h-10" />
                    <div>
                        <h2 className="text-lg font-bold">Watch Ad & Earn</h2>
                        <p className="text-sm opacity-90">Watch a short video to get free coins.</p>
                    </div>
                </div>
                <Button disabled={isWatching} variant="secondary" className="cursor-pointer">
                    {isWatching ? 'Watching...' : `+${adReward} Coins`}
                </Button>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
  const { toast } = useToast();
  const { userData, loading } = useUserData();
  const [isPending, startTransition] = useTransition();
  const [layoutOrder, setLayoutOrder] = useState<string[]>(['daily', 'ad', 'quiz']);
  const [engagementData, setEngagementData] = useState({ daily: 0, ad: 0, quiz: 0 });
  const [aiReasoning, setAiReasoning] = useState('');
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  const handleReward = async (amount: number) => {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
            coins: increment(amount)
        });
      } catch (error) {
        console.error("Error updating coins:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to update your coin balance."})
      }
  }

  const trackEngagement = (card: keyof typeof engagementData) => {
    setEngagementData(prev => ({ ...prev, [card]: prev[card] + 1 }));
  }

  const handleOptimizeLayout = () => {
    startTransition(async () => {
      const currentLayoutDescription = `The current layout is: ${layoutOrder.join(', ')}.`;
      const result = await getOptimalLayout(engagementData, currentLayoutDescription);
      
      if (result.success && result.layout) {
        setLayoutOrder(result.layout);
        setAiReasoning(result.reasoning || 'No reasoning provided.');
        setIsReasoningOpen(true); // Show reasoning dialog
        toast({
          title: "Layout Optimized!",
          description: "The layout has been updated based on your activity.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Optimization Failed",
          description: result.error || "Could not optimize the layout.",
        });
      }
    });
  }

  const engagementComponents = useMemo(() => ({
    daily: <DailyCheckIn onClaim={handleReward} onClick={() => trackEngagement('daily')} />,
    ad: <WatchAdCard onAdWatched={handleReward} onClick={() => trackEngagement('ad')} />,
    quiz: <MathQuizCard onClick={() => trackEngagement('quiz')} />
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [engagementData]);


  return (
    <div className="flex flex-col gap-6 pb-24">
       <header className="flex items-center justify-between">
           <h1 className="text-2xl font-bold">Home</h1>
           <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-card shadow">
             <CircleDollarSign className="w-6 h-6 text-yellow-500" />
             {loading ? <Skeleton className="w-16 h-6" /> : <span className="font-bold text-lg">{(userData?.coins ?? 0).toLocaleString()}</span>}
           </div>
       </header>

       <Card className="w-full shadow-lg p-0 overflow-hidden rounded-2xl">
            <div className="relative h-40">
                <Image src="https://placehold.co/600x400.png" layout="fill" objectFit="cover" alt="Instagram Promotion" data-ai-hint="social media background"/>
                <div className="absolute inset-0 bg-black/40"></div>
                 <div className="absolute bottom-0 left-0 p-4 flex items-center justify-between w-full">
                    <p className="text-white font-semibold max-w-xs">Follow us on Instagram</p>
                    <a href="https://www.instagram.com/aryanfashiondeals">
                        <Button>Follow Now</Button>
                    </a>
                </div>
            </div>
       </Card>

       <ParticipateAndEarn />
       
       <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>For You</span>
                     <Button variant="outline" size="sm" onClick={handleOptimizeLayout} disabled={isPending}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isPending ? 'Optimizing...' : 'Optimize Layout'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {layoutOrder.map(key => (
                    <div key={key}>
                        {engagementComponents[key as keyof typeof engagementComponents]}
                    </div>
                ))}
            </CardContent>
        </Card>

       <Card className="w-full shadow-lg">
        <CardHeader className="p-4">
            <h2 className="text-lg font-bold">Offer Suggested By Us</h2>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex items-center justify-between">
            <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg"></div>
                <div className="w-24 h-24 bg-muted rounded-lg"></div>
                <div className="w-24 h-24 bg-muted rounded-lg"></div>
            </div>
        </CardContent>
       </Card>

       <AlertDialog open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        AI Layout Optimization
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left pt-4 space-y-2">
                        <h4 className="font-semibold text-foreground">Here's why I changed the layout:</h4>
                        <p className="text-muted-foreground">{aiReasoning}</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsReasoningOpen(false)}>Got it!</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
