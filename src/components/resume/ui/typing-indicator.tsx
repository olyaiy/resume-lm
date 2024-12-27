import { motion } from "framer-motion";

interface TypingIndicatorProps {
  text?: string;
}

export function TypingIndicator({ text }: TypingIndicatorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {text && (
        <span className="text-[11px] text-purple-600/70 font-medium">{text}</span>
      )}
      <div className="flex items-center gap-0.5">
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
        />
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
        />
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
        />
      </div>
    </div>
  );
} 