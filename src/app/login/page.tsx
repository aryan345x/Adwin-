'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Gem } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,36.689,44,31.016,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const createUserProfile = async (user: User) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // User is new, create a profile
      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          coins: 100, // Starting bonus coins
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error creating user profile in Firestore:", error);
        toast({
            variant: "destructive",
            title: "Profile Creation Failed",
            description: "Could not create your user profile in the database. Please check Firestore rules."
        })
        throw error;
      }
    }
  }


export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not log in with Google. Please try again.',
      });
    }
  };




  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="w-full text-center mt-16">
            <h1 className="text-4xl font-bold text-blue-500">Adwin</h1>
            <p className="mt-4 text-lg text-gray-700">
                Access <span className="font-bold text-pink-500">Adwin</span> in Seconds!
            </p>
            <p className="mt-1 text-gray-600">
                Earn Amazing Rewards & More <Gem className="inline-block w-4 h-4 text-blue-400" /> Let&apos;s Authenticate.
            </p>
        </div>
      
        <div className="relative w-full max-w-sm">
            <Image 
                src="https://placehold.co/400x400.png"
                width={400}
                height={400}
                alt="Authentication illustration"
                data-ai-hint="hand holding phone security"
                className="w-full"
            />
        </div>

        <div className="w-full max-w-md pb-8">
            <Button className="w-full h-14 bg-white text-gray-700 text-lg shadow-lg hover:bg-gray-100" onClick={handleGoogleLogin}>
                <GoogleIcon className="mr-3" />
                Authenticate With Google
            </Button>
        </div>
    </main>
  );
}
