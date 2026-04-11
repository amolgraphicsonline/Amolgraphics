import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "orange" | "blue" | "green";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "orange", className }) => {
  const variants = {
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-base font-medium border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
