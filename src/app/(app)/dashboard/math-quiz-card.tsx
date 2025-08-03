'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MathQuizCardProps {
  onClick: () => void;
}

export const MathQuizCard = ({ onClick }: MathQuizCardProps) => {
  const [question, setQuestion] = useState('');

  useEffect(() => {
    // Generate a simple question on mount
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setQuestion(`${num1} + ${num2} = ?`);
  }, []);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Play and Earn</CardTitle>
        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-center py-4">{question}</div>
        <p className="text-xs text-muted-foreground text-center pb-4">Solve quizzes to earn coins!</p>
        <Link href="/dashboard/quiz" legacyBehavior>
            <Button className="w-full">
                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
