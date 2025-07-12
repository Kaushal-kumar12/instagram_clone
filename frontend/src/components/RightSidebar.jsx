import React from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import SuggestedUsers from './SuggestedUsers'
import { useSelector } from 'react-redux'

const RightSidebar = () => {
  const {user} = useSelector(store => store.auth);
  return (
    <div className='w-fit my-10 pr-32'>
      <div className='flex items-center gap-2'>
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt= "post_mage"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className='font-semibold text-sm'> <Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
          <span className='text-gray-600 text-sm'>{user?.bio || 'bio here...'}</span>
        </div>
      </div>

      <SuggestedUsers/>
    </div>
  )
}

export default RightSidebar