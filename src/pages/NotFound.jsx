import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button, EmptyState } from "../components/ui";
import { LogoMark } from "../components/Logo";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page-center">
      <EmptyState
        icon={<LogoMark size={40} />}
        title="Page not found"
        description="The link may be broken or the page may have moved."
        action={
          <Button icon={<Compass size={18} />} onClick={() => navigate("/")}>
            Go home
          </Button>
        }
      />
    </div>
  );
}
