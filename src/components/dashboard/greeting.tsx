'use client';

import { useEffect, useState } from 'react';
import { getGreeting } from '@/lib/utils';

interface GreetingProps {
  firstName: string | null;
}

export function Greeting({ firstName }: GreetingProps) {
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
      {greeting}, {firstName}
    </h1>
  );
}
