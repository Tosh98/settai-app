import React, { createContext, useState, useEffect } from 'react';
import { restaurants as initialRestaurants, gifts as initialGifts } from '../data/mockData';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  getDocs,
  setDoc,
  increment
} from 'firebase/firestore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple user ID for like/bad tracking (only for the current device to remember what they voted)
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('settai_user_id');
    if (saved) return saved;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem('settai_user_id', newId);
    return newId;
  });

  // User's own likes/bads (keep in local storage per device)
  const [userLikes, setUserLikes] = useState(() => {
    const saved = localStorage.getItem('settai_user_likes');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('settai_user_likes', JSON.stringify(userLikes));
  }, [userLikes]);

  // Initial Data Sync and Real-time Listening
  useEffect(() => {
    const syncData = async () => {
      // 1. Check if we need to seed the data (only if empty)
      const resSnapshot = await getDocs(collection(db, 'restaurants'));
      if (resSnapshot.empty) {
        console.log("Seeding initial restaurants data...");
        for (const item of initialRestaurants) {
          await setDoc(doc(db, 'restaurants', item.id), item);
        }
      }

      const giftSnapshot = await getDocs(collection(db, 'gifts'));
      if (giftSnapshot.empty) {
        console.log("Seeding initial gifts data...");
        for (const item of initialGifts) {
          await setDoc(doc(db, 'gifts', item.id), item);
        }
      }
    };

    syncData().then(() => {
      // 2. Real-time Listeners
      const qRes = query(collection(db, 'restaurants'), orderBy('id', 'desc'));
      const unsubRes = onSnapshot(qRes, (snapshot) => {
        setRestaurants(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });

      const qGifts = query(collection(db, 'gifts'), orderBy('id', 'desc'));
      const unsubGifts = onSnapshot(qGifts, (snapshot) => {
        setGifts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
      });

      return () => {
        unsubRes();
        unsubGifts();
      };
    });
  }, []);

  const addRestaurant = async (restaurant) => {
    const id = `r_${Date.now()}`;
    const newRestaurant = {
      ...restaurant,
      id: id,
      rating: 0,
      like_count: 0,
      bad_count: 0,
      image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
      created_at: new Date()
    };
    await setDoc(doc(db, 'restaurants', id), newRestaurant);
  };

  const addGift = async (gift) => {
    const id = `g_${Date.now()}`;
    const newGift = {
      ...gift,
      id: id,
      rating: 0,
      like_count: 0,
      bad_count: 0,
      image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
      created_at: new Date()
    };
    await setDoc(doc(db, 'gifts', id), newGift);
  };

  const toggleLike = async (itemId, type) => {
    const currentVote = userLikes[itemId];
    const isRestaurant = itemId.startsWith('r');
    const collectionName = isRestaurant ? 'restaurants' : 'gifts';
    const itemRef = doc(db, collectionName, itemId);

    if (currentVote?.type === type) {
      // Remove vote
      await updateDoc(itemRef, {
        [type === 'like' ? 'like_count' : 'bad_count']: increment(-1)
      });
      setUserLikes(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      // Add or switch vote
      const updates = {};
      if (currentVote) {
        // Remove old vote
        updates[currentVote.type === 'like' ? 'like_count' : 'bad_count'] = increment(-1);
      }
      // Add new vote
      updates[type === 'like' ? 'like_count' : 'bad_count'] = increment(1);
      
      await updateDoc(itemRef, updates);
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
      currentUser,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

