import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateFollowing } from '@/redux/authSlice';

const FollowingList = () => {
  const { id } = useParams();
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    if (user?.following) {
      const map = {};
      user.following.forEach(followingId => {
        map[followingId] = true;
      });
      setFollowingMap(map);
    }
  }, [user]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/${id}/following`, { withCredentials: true });
        setFollowingUsers(res.data.following || []);
      } catch (err) {
        console.error("Failed to load following users:", err);
      }
    };
    fetchFollowing();
  }, [id]);

  const handleFollowToggle = async (targetUserId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/followorunfollow/${targetUserId}`, {}, { withCredentials: true });

      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));

      let newFollowing;
      if (followingMap[targetUserId]) {
        newFollowing = user.following.filter(id => id !== targetUserId);
      } else {
        newFollowing = [...user.following, targetUserId];
      }
      dispatch(updateFollowing({ following: newFollowing }));

    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Following</h2>
      {followingUsers.length === 0 && <p>No following users found.</p>}
      {followingUsers.map(followingUser => {
        const isFollowing = followingMap[followingUser._id];
        const isSelf = followingUser._id === user._id;

        return (
          <div key={followingUser._id} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${followingUser._id}`)}>
              <Avatar>
                <AvatarImage src={followingUser.profilePicture} alt={followingUser.username} />
                <AvatarFallback>{followingUser.username[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span>{followingUser.username}</span>
            </div>
            {!isSelf && (
              <button
                onClick={() => handleFollowToggle(followingUser._id)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FollowingList;
