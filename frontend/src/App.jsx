import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'

function App() {
  const {isAuthenticated,authLoading}=useContext(userDataContext)
  const protectedRoute = (element) => authLoading ? null : isAuthenticated ? element : <Navigate to='/signin' replace />
  return (
   <Routes>
     <Route path='/' element={<Home/>}/>
     <Route path='/signup' element={<SignUp/>}/>
     <Route path='/signin' element={<SignIn/>}/>
    <Route path='/customize' element={protectedRoute(<Customize/>)}/>
    <Route path='/customize2' element={protectedRoute(<Customize2/>)}/>
   </Routes>
  )
}

export default App
