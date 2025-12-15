'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TrialStartButtonProps {
  className?: string;
}

export function TrialStartButton({ className }: TrialStartButtonProps) {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const href = priceId ? `/subscription/checkout?price_id=${priceId}&trial=true` : '/start-trial';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative group', className)}
    >
      <div className="absolute -inset-[3px] bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-purple-500/0 rounded-lg opacity-75 blur-md group-hover:from-purple-500/50 group-hover:via-indigo-500/50 group-hover:to-purple-500/50 transition-all duration-300 ease-in-out" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-indigo-400/0 to-purple-400/0 rounded-lg opacity-100 group-hover:via-indigo-400/10 transition-all duration-300 ease-in-out" />

      <Link
        href={href}
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-1.5',
          'bg-gradient-to-r from-purple-600 to-indigo-600',
          'hover:from-purple-700 hover:to-indigo-700',
          'text-white font-medium rounded-lg',
          'shadow-lg hover:shadow-xl hover:shadow-indigo-500/20',
          'transition-all duration-300 ease-in-out',
          'hover:-translate-y-0.5',
          'text-sm'
        )}
      >
        <Clock className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:scale-110" />
        <span className="transition-all duration-300 ease-in-out group-hover:translate-x-0.5">
          Start free trial
        </span>
      </Link>
    </motion.div>
  );
}

