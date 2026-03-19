import React, { createContext, useState, useEffect } from 'react';
import { restaurants as initialRestaurants, gifts as initialGifts } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Simple user ID for like/bad tracking (persisted)
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('settai_user_id');
    if (saved) return saved;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem('settai_user_id', newId);
    return newId;
  });

  const [restaurants, setRestaurants] = useState(() => {
    const saved = localStorage.getItem('settai_restaurants_v4');
    if (saved) return JSON.parse(saved);
    return initialRestaurants;
  });

  const [gifts, setGifts] = useState(() => {
    const saved = localStorage.getItem('settai_gifts_v4');
    if (saved) return JSON.parse(saved);
    return initialGifts;
  });

  // Likes tracking: { [itemId]: { type: 'like' | 'bad' } }
  const [userLikes, setUserLikes] = useState(() => {
    const saved = localStorage.getItem('settai_user_likes');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('settai_restaurants_v4', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('settai_gifts_v4', JSON.stringify(gifts));
  }, [gifts]);

  useEffect(() => {
    localStorage.setItem('settai_user_likes', JSON.stringify(userLikes));
  }, [userLikes]);

  const addRestaurant = (restaurant) => {
    const newRestaurant = {
      ...restaurant,
      id: `r_${Date.now()}`,
      rating: 0,
      like_count: 0,
      bad_count: 0,
      image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
    };
    setRestaurants(prev => [newRestaurant, ...prev]);
  };

  const addGift = (gift) => {
    const newGift = {
      ...gift,
      id: `g_${Date.now()}`,
      rating: 0,
      like_count: 0,
      bad_count: 0,
      image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"
    };
    setGifts(prev => [newGift, ...prev]);
  };

  const toggleLike = (itemId, type) => {
    // type: 'like' or 'bad'
    const currentVote = userLikes[itemId];
    const isRestaurant = itemId.startsWith('r');
    const setter = isRestaurant ? setRestaurants : setGifts;

    if (currentVote?.type === type) {
      // Remove vote (toggle off)
      setter(prev => prev.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          like_count: type === 'like' ? Math.max(0, (item.like_count || 0) - 1) : (item.like_count || 0),
          bad_count: type === 'bad' ? Math.max(0, (item.bad_count || 0) - 1) : (item.bad_count || 0)
        };
      }));
      setUserLikes(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      // Add or switch vote
      setter(prev => prev.map(item => {
        if (item.id !== itemId) return item;
        let newLike = item.like_count || 0;
        let newBad = item.bad_count || 0;

        // Remove old vote if switching
        if (currentVote) {
          if (currentVote.type === 'like') newLike = Math.max(0, newLike - 1);
          if (currentVote.type === 'bad') newBad = Math.max(0, newBad - 1);
        }

        // Add new vote
        if (type === 'like') newLike += 1;
        if (type === 'bad') newBad += 1;

        return { ...item, like_count: newLike, bad_count: newBad };
      }));
      setUserLikes(prev => ({ ...prev, [itemId]: { type } }));
    }
  };

  return (
    <AppContext.Provider value={{
      restaurants,
      gifts,
      addRestaurant,
      addGift,
      toggleLike,
      userLikes,
      currentUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
