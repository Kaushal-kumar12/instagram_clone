import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link, useParams } from 'react-router-dom'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { updateFollowing, updateUserProfileFollowers } from '@/redux/authSlice';

export const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const dispatch = useDispatch();

  const { userProfile, user } = useSelector(store => store.auth);
  const [isFollowing, setIsFollowing] = useState(false);
  const isLoggedInUserProfile = user?._id == userProfile?._id;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab == 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  useEffect(() => {
    if (userProfile && user && userProfile.followers) {
      setIsFollowing(userProfile.followers.includes(user._id));
    }
  }, [userProfile, user]);

  const handleFollowToggle = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const { updatedUser, updatedProfile } = res.data;

        // Update redux store
        dispatch(updateFollowing({ following: updatedUser.following }));
        dispatch(updateUserProfileFollowers({ followers: updatedProfile.followers }));

        // Immediately toggle local state for UI
        setIsFollowing(prev => !prev);
      }
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };


  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className='h-8 cursor-pointer' onClick={handleFollowToggle}>Unfollow</Button>
                        <Link to={`/chat`}>
                          <Button variant='secondary' className='h-8 cursor-pointer'>Message</Button>
                        </Link>
                      </>
                    ) : (
                      <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8 cursor-pointer' onClick={handleFollowToggle}>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts?.length || 0}</span>posts</p>
                <Link to={`/profile/${userProfile._id}/followers`}>
                  <p><span className='font-semibold'>{userProfile?.followers?.length || 0}</span> followers</p>
                </Link>
                <Link to={`/profile/${userProfile._id}/following`}>
                  <p><span className='font-semibold'>{userProfile?.following?.length || 0}</span> following</p>
                </Link>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span></Badge>
                <span>😊 A full stack developer</span>
                <span>😊 Mern Stack Developer </span>
                <span>😊 DM for sortware Development</span>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-2000'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab == 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            {
              isLoggedInUserProfile && (
                <span className={`py-3 cursor-pointer ${activeTab == 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
                  SAVED
                </span>
              )
            }
            <span className='py-3 cursor-pointer' >REELS</span>
            <span className='py-3 cursor-pointer' > TAGS </span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {activeTab === 'posts' && userProfile?.posts?.map(post => (
              <div key={post?._id} className='relative group cursor-pointer'>
                <img src={post.image} alt='post_image' className='rounded-sm my-2 w-full aspect-square object-cover' />
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='flex items-center text-white space-x-4'>
                    <button className='flex items-center gap-2  hover:text-gray-300 cursor-pointer'>
                      <Heart />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className='flex items-center gap-2  hover:text-gray-300 cursor-pointer'>
                      <MessageCircle />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'saved' && isLoggedInUserProfile && userProfile?.bookmarks?.map(post => (
              <div key={post?._id} className='relative group cursor-pointer'>
                <img src={post.image} alt='post_image' className='rounded-sm my-2 w-full aspect-square object-cover' />
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='flex items-center text-white space-x-4'>
                    <button className='flex items-center gap-2  hover:text-gray-300 cursor-pointer'>
                      <Heart />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className='flex items-center gap-2  hover:text-gray-300 cursor-pointer'>
                      <MessageCircle />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
export default Profile