import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const BackButton = ({ 
  to = "/dashboard", 
  label = "Back to Dashboard",
  variant = "ghost",
  size = "sm",
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`btn-soft ${className}`}
      onClick={() => navigate(to)}
      title={label}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
};
