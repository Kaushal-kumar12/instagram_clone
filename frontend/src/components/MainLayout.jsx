import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

export const MainLayout = () => {
  return (
    <div>
        <LeftSidebar/>
            <div>
                <Outlet/>
            </div>
    </div>
  )
}

export default MainLayout