import React, { useEffect, useMemo, useState } from 'react';
import { profileApi, swipesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, EmptyState, Loader } from '../components/UI';
import { getDisplayName, getUserId } from '../utils/format';
import { Link } from 'react-router-dom';

function normalizeProfiles(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.profiles)) return data.profiles;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function FeedPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const current = items[0];

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await profileApi.feed();
      setItems(normalizeProfiles(data));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Could not load feed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const remaining = useMemo(() => items.length, [items]);

  const swipe = async (action) => {
    if (!current) return;
    const targetUserId = getUserId(current);
    if (!targetUserId) return;
    setBusyId(targetUserId);
    setError('');
    try {
      await swipesApi.send({ targetUserId, action });
      setItems((prev) => prev.slice(1));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Swipe failed';
      setError(msg);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <Loader label="Loading people nearby" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="page-card">
        <EmptyState
          title="No more profiles right now"
          description="Check back later for fresh matches."
          action={<Button onClick={fetchFeed}>Refresh feed</Button>}
        />
      </div>
    );
  }

  return (
    <div className="feed-wrap">
      <div className="feed-topline">
        <div>
          <span className="eyebrow">Nearby</span>
          <h2>{remaining} profiles ready</h2>
        </div>
        <Link to="/app/matches" className="text-link">View matches</Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <section className="feed-card">
        <div className="feed-photo">
          <div className="feed-photo-glow" />
          <div className="feed-photo-mark">🍑</div>
        </div>

        <div className="feed-content">
          <div className="feed-name-row">
            <h3>{getDisplayName(current)}</h3>
            <span className="pill">{current.age ?? '—'}</span>
          </div>

          <div className="feed-meta">
            <span>{current.gender || 'Gender unknown'}</span>
            <span>•</span>
            <span>{current.location || 'Location unknown'}</span>
          </div>

          <p className="feed-bio">{current.bio || 'No bio provided.'}</p>

          <div className="tag-row">
            <span className="badge">Open to chat</span>
            <span className="badge">Active nearby</span>
          </div>

          <div className="swipe-actions">
            <Button variant="secondary" onClick={() => swipe('dislike')} disabled={Boolean(busyId)}>
              Pass
            </Button>
            <Button onClick={() => swipe('like')} disabled={Boolean(busyId)}>
              {busyId ? 'Saving…' : 'Like'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
