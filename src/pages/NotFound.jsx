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
    </div>
  );
}
