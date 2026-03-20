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
  deleteDoc,
  increment
} from 'firebase/firestore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('settai_user_id');
    if (saved) return saved;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem('settai_user_id', newId);
    return newId;
  });

  const [userLikes, setUserLikes] = useState(() => {
    const saved = localStorage.getItem('settai_user_likes');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('settai_user_likes', JSON.stringify(userLikes));
  }, [userLikes]);

  useEffect(() => {
    const syncData = async () => {
      // 1. Check/Seed Data
      const resSnapshot = await getDocs(collection(db, 'restaurants'));
      if (resSnapshot.empty) {
        for (const item of initialRestaurants) {
          await setDoc(doc(db, 'restaurants', item.id), item);
        }
      }

      const giftSnapshot = await getDocs(collection(db, 'gifts'));
      
      // Special fix for Toraya image (g1)
      const torayaId = "g1";
      const correctTorayaImg = "https://images.unsplash.com/photo-1582722872445-443592859ef1?w=800&q=80";
      
      if (giftSnapshot.empty) {
        for (const item of initialGifts) {
          const data = item.id === torayaId ? { ...item, image_url: correctTorayaImg } : item;
          await setDoc(doc(db, 'gifts', item.id), data);
        }
      } else {
        // Force update toraya image if it exists
        const torayaRef = doc(db, 'gifts', torayaId);
        await updateDoc(torayaRef, { image_url: correctTorayaImg }).catch(() => {});
      }
    };

    syncData().then(() => {
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

  const addRestaurant = async (data) => {
    const id = `r_${Date.now()}`;
    await setDoc(doc(db, 'restaurants', id), {
      ...data,
      id: id,
      rating: data.rating || 0,
      like_count: 0,
      bad_count: 0,
      image_url: data.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
      created_at: new Date()
    });
  };

  const updateRestaurant = async (id, data) => {
    await updateDoc(doc(db, 'restaurants', id), data);
  };

  const deleteRestaurant = async (id) => {
    await deleteDoc(doc(db, 'restaurants', id));
  };

  const addGift = async (data) => {
    const id = `g_${Date.now()}`;
    await setDoc(doc(db, 'gifts', id), {
      ...data,
      id: id,
      rating: data.rating || 0,
      like_count: 0,
      bad_count: 0,
      image_url: data.image_url || "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
      created_at: new Date()
    });
  };

  const updateGift = async (id, data) => {
    await updateDoc(doc(db, 'gifts', id), data);
  };

  const deleteGift = async (id) => {
    await deleteDoc(doc(db, 'gifts', id));
  };

  const toggleLike = async (itemId, type) => {
    const currentVote = userLikes[itemId];
    const isRestaurant = itemId.startsWith('r');
    const collectionName = isRestaurant ? 'restaurants' : 'gifts';
    const itemRef = doc(db, collectionName, itemId);

    if (currentVote?.type === type) {
      await updateDoc(itemRef, { [type === 'like' ? 'like_count' : 'bad_count']: increment(-1) });
      setUserLikes(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      const updates = {};
      if (currentVote) {
        updates[currentVote.type === 'like' ? 'like_count' : 'bad_count'] = increment(-1);
      }
      updates[type === 'like' ? 'like_count' : 'bad_count'] = increment(1);
      await updateDoc(itemRef, updates);
      setUserLikes(prev => ({ ...prev, [itemId]: { type } }));
    }
  };

  return (
    <AppContext.Provider value={{
      restaurants, gifts, addRestaurant, updateRestaurant, deleteRestaurant, 
      addGift, updateGift, deleteGift, toggleLike, userLikes, currentUser, loading
    }}>
      {children}
    </AppContext.Provider>
  );
};


