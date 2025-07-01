import React from 'react'
import { Outlet } from 'react-router'
import Nav from './Nav'

const Layout = () => {
  return (
    <div>
      <Nav/>
      <Outlet/>
    </div>
  )
}

export default Layout
