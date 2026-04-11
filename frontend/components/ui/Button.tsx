import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  className, 
  ...props 
}) => {
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700",
    secondary: "bg-gray-800 text-white hover:bg-gray-900",
    outline: "border-2 border-orange-600 text-orange-600 hover:bg-orange-50",
  };

  return (
    <button
      className={cn(
        "px-6 py-2 rounded-lg transition font-medium disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
