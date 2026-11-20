import React, { useEffect } from 'react'
import Home from './pages/Home.jsx'
import getCurrentUser from './features/getCurrentUser.js'
import { useDispatch } from 'react-redux'
import { setUserdata } from './redux/userSlice.js'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser()
      if (data && data._id && !data.isGuest) {
        dispatch(setUserdata(data))
      }
    }
    getUser()
  }, [dispatch])

  return (
    <>
      <Home />
    </>
  )
}

export default App
