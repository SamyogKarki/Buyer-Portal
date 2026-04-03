import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [allProperties, setAllProperties] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }
  const [loadingId, setLoadingId] = useState(null); // which property is being toggled
  const [pageLoading, setPageLoading] = useState(true);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const loadData = useCallback(async () => {
    try {
      const [props, favs] = await Promise.all([
        api.properties(),
        api.favourites.list(),
      ]);
      setAllProperties(props);
      setFavourites(favs);
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('token')) {
        handleLogout();
      } else {
        showToast('error', 'Failed to load data. Try refreshing.');
      }
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  async function toggleFavourite(property) {
    const isFav = favourites.some(f => f.id === property.id);
    setLoadingId(property.id);

    try {
      if (isFav) {
        await api.favourites.remove(property.id);
        setFavourites(prev => prev.filter(f => f.id !== property.id));
        showToast('success', `${property.title} removed from favourites`);
      } else {
        await api.favourites.add(property.id);
        setFavourites(prev => [...prev, property]);
        showToast('success', `${property.title} added to favourites`);
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoadingId(null);
    }
  }

  if (pageLoading) {
    return <div className="loading">Loading your dashboard…</div>;
  }

  const favIds = new Set(favourites.map(f => f.id));

  return (
    <div className="dashboard">
      {toast && (
        <div
          className={`alert alert-${toast.type === 'success' ? 'success' : 'error'}`}
          style={{ position: 'fixed', top: 20, right: 20, width: 320, zIndex: 999 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1>
            Hi, {user?.name}
            <span className="role-badge">{user?.role}</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {user?.email}
          </p>
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <h2 className="section-title">My Favourites ({favourites.length})</h2>
      {favourites.length === 0 ? (
        <p className="empty-state">
          You haven't saved any properties yet. Browse the listings below and click "Save" to add them here.
        </p>
      ) : (
        <div className="property-grid">
          {favourites.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              isFav={true}
              onToggle={toggleFavourite}
              loading={loadingId === p.id}
            />
          ))}
        </div>
      )}

      <h2 className="section-title">All Listings ({allProperties.length})</h2>
      <div className="property-grid">
        {allProperties.map(p => (
          <PropertyCard
            key={p.id}
            property={p}
            isFav={favIds.has(p.id)}
            onToggle={toggleFavourite}
            loading={loadingId === p.id}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyCard({ property, isFav, onToggle, loading }) {
  const { title, address, price, beds, baths, sqm, type } = property;

  return (
    <div className="property-card">
      <span className="property-type-tag">{type}</span>
      <h3>{title}</h3>
      <p className="address">{address}</p>
      <p className="price">{price}</p>
      <div className="property-meta">
        <span>{beds} bed</span>
        <span>{baths} bath</span>
        <span>{sqm} m²</span>
      </div>
      <div className="property-card-footer">
        <button
          className={`btn btn-sm btn-fav ${isFav ? 'active' : ''}`}
          onClick={() => onToggle(property)}
          disabled={loading}
        >
          {loading ? '…' : isFav ? '♥ Saved' : '♡ Save'}
        </button>
      </div>
    </div>
  );
}
