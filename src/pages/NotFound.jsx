<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-center">
      <div className="page-card">
        <div className="empty-state">
          <div className="empty-icon">🍑</div>
          <h3>Page not found</h3>
          <p>The route you opened does not exist.</p>
          <Link className="text-link" to="/app/feed">Back to feed</Link>
        </div>
      </div>
=======
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
>>>>>>> 8a08bf3 (updated ui)
    </div>
  );
}
