'use client';

import { cloneElement, isValidElement } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthTab, useAuthDialog } from "@/components/auth/auth-dialog-provider";

const gradientClasses = {
  base: "bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600",
  hover: "hover:from-violet-500 hover:via-blue-500 hover:to-violet-500",
  animation: "transition-all duration-500 animate-gradient-x",
};

interface AuthDialogProps {
  children?: React.ReactNode;
  defaultTab?: AuthTab;
}

export function AuthDialog({ children, defaultTab = "signup" }: AuthDialogProps) {
  const { openDialog } = useAuthDialog();

  const handleOpen = () => {
    openDialog(defaultTab);
  };

  if (!children) {
    return (
      <Button
        size="lg"
        onClick={handleOpen}
        className={`${gradientClasses.base} ${gradientClasses.hover} text-white font-semibold
          text-lg py-6 px-10 ${gradientClasses.animation} group
          shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40
          ring-2 ring-white/20 hover:ring-white/30
          scale-105 hover:scale-110 transition-all duration-300
          rounded-xl relative overflow-hidden`}
        aria-label="Open authentication dialog"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10 flex items-center justify-center">
          Start Now
          <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Button>
    );
  }

  if (typeof children === "string") {
    return (
      <button type="button" onClick={handleOpen}>
        {children}
      </button>
    );
  }

  if (isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler }>;

    return cloneElement(child, {
      ...child.props,
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) {
          handleOpen();
        }
      },
    });
  }

  return (
    <span role="button" tabIndex={0} onClick={handleOpen} onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpen();
      }
    }}>
      {children}
    </span>
  );
}
