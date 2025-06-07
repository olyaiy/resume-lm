import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ApiKeyErrorAlertProps {
  error: unknown;
  router: ReturnType<typeof useRouter>;
}

export function ApiKeyErrorAlert({ error, router }: ApiKeyErrorAlertProps) {
  // Detailed console debugging
  console.group('🔍 ApiKeyErrorAlert Debug');
  console.log('Raw error:', error);
  console.log('Error type:', typeof error);
  console.log('Error constructor:', error?.constructor?.name);
  
  if (error instanceof Error) {
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('Error name:', error.name);
  }
  
  try {
    console.log('Error stringified:', JSON.stringify(error, null, 2));
  } catch (e) {
    console.log('Error cannot be stringified:', e);
  }
  
  // Check specific conditions
  const errorString = typeof error === 'string' ? error : (error as Error)?.message || '';
  const errorJson = JSON.stringify(error);
  
  console.log('Error string for checking:', errorString);
  console.log('Error JSON for checking:', errorJson);
  console.log('Contains OpenAI API key not found:', errorString.includes('OpenAI API key not found') || errorJson.includes('OpenAI API key not found'));
  console.log('Contains invalid x-api-key:', errorString.includes('invalid x-api-key') || errorJson.includes('authentication_error'));
  console.log('Contains Incorrect API key:', errorString.includes('Incorrect API key provided') || errorJson.includes('invalid_api_key'));
  console.log('Contains Rate limit:', errorString.includes('Rate limit exceeded') || errorJson.includes('Rate limit exceeded'));
  console.groupEnd();

  return (
    <div className={cn(
      "mt-2 text-sm px-4",
      "rounded-lg py-2",
      "bg-red-50/50 border border-red-200/50",
      "flex flex-col gap-2"
    )}>
      <div className={cn(
        "flex flex-col items-center gap-4 p-6",
        "text-red-500 text-center",
        "bg-white/80 backdrop-blur-md",
        "rounded-xl",
        "border border-red-200",
        "shadow-sm"
      )}>
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="font-medium text-red-600">
            {typeof error === 'string' 
              ? error
              : ((error as Error)?.name === 'DataCloneError' || 
                  (error as Error)?.message?.includes('structuredClone') ||
                  (error as Error)?.message?.includes('could not be cloned'))
                  ? "There was an issue processing the response. Please try your request again."
                  : ((error as Error)?.message?.includes('OpenAI API key not found') ||
                      JSON.stringify(error).includes('OpenAI API key not found'))
                      ? "OpenAI API key not found. Upgrade to Pro or set your API key in settings to continue."
                      : ((error as Error)?.message?.includes('invalid x-api-key') || 
                          JSON.stringify(error).includes('authentication_error'))
                          ? "Your Anthropic API key is invalid. Upgrade to Pro or try updating it in settings and try again."
                          : ((error as Error)?.message?.includes('Incorrect API key provided') ||
                              JSON.stringify(error).includes('invalid_api_key'))
                              ? "Your OpenAI API key is invalid. Upgrade to Pro or try updating it in settings and try again."
                              : ((error as Error)?.message?.includes('Rate limit exceeded') ||
                                  JSON.stringify(error).includes('Rate limit exceeded'))
                                  ? `You've exceeded the rate limit. Please try again after ${(() => {
                                      try {
                                        const errorData = JSON.parse((error as Error).message);
                                        const expiration = errorData.expirationTimestamp 
                                          ? new Date(errorData.expirationTimestamp)
                                          : new Date(Date.now() + ((errorData.timeLeft || 30) * 1000));
                                        
                                        return expiration.toLocaleTimeString([], { 
                                          hour: 'numeric', 
                                          minute: '2-digit',
                                          hour12: true 
                                        });
                                      } catch {
                                        const fallbackTime = new Date(Date.now() + 30_000);
                                        return fallbackTime.toLocaleTimeString([], {
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        });
                                      }
                                    })()}. Upgrade to Pro for higher limits.`
                                  : "An error occurred. Please try again or check your settings."}
          </div>
        </div>

        {((error as Error)?.message?.includes('API key') || 
          JSON.stringify(error).includes('API key') || 
          JSON.stringify(error).includes('authentication_error')) &&
          !((error as Error)?.name === 'DataCloneError' || 
            (error as Error)?.message?.includes('structuredClone') ||
            (error as Error)?.message?.includes('could not be cloned')) ? (
          <>
            <div className="w-full h-px bg-red-100" />
            <div className="text-sm text-red-400 mb-2">
              Unlock premium features and advanced AI capabilities
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <ProUpgradeButton />
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs text-gray-500 hover:text-gray-600",
                  "hover:bg-gray-50/50 bg-gray-200",
                  "border border-gray-400",
                  "h-8"
                )}
                onClick={() => router.push('/settings')}
              >
                Set API Keys
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
} 