'use client';

import { useState } from 'react';
import { updateUserSubscriptionPlan } from '../actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditSubscriptionPlanFormProps {
  userId: string;
  currentPlan: string | null;
}

export default function EditSubscriptionPlanForm({
  userId,
  currentPlan,
}: EditSubscriptionPlanFormProps) {
  const [plan, setPlan] = useState<'free' | 'pro'>(
    (currentPlan === 'free' || currentPlan === 'pro') ? currentPlan : 'free'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handlePlanChange = async () => {
    if (plan === currentPlan) {
      setMessage({
        type: 'error',
        text: 'No change: The user is already on this plan.',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateUserSubscriptionPlan(userId, plan);

      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Current Plan:</span>
            <Badge variant={currentPlan === 'pro' ? 'default' : 'secondary'}>
              {currentPlan ? currentPlan.toUpperCase() : 'NOT SET'}
            </Badge>
          </div>
          <Select value={plan} onValueChange={(value) => setPlan(value as 'free' | 'pro')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Subscription Plans</SelectLabel>
                <SelectItem value="free">FREE</SelectItem>
                <SelectItem value="pro">PRO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handlePlanChange}
          disabled={isLoading || plan === currentPlan}
        >
          {isLoading ? 'Updating...' : 'Update Plan'}
        </Button>
      </div>

      {message && (
        <div 
          className={`p-3 rounded-md flex items-start gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}
    </div>
  );
} 