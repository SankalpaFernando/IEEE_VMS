import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import './App.css';
import supabase from './supabase/client';
import { useEffect, useState } from 'react';
import Layout from './pages/Layout';
import SignUp from './pages/SignUp';
import { useUserStore } from './util/store';
import { getUserAuth } from './util/auth';
import AuthError from './pages/AuthError';
import { Spinner } from '@nextui-org/react';

function App() {

  const fetchUser = useUserStore(state => state.fetchUser);

  useEffect(() => {
    (async()=>{await fetchUser()})()
  },[])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/auth/error' element={<AuthError />} />
          <Route path='/signup/:resetKey' element={<SignUp />} />
          <Route path='/' element={<PrivateRoute />}>
            <Route path='/dashboard/*' element={<Layout/>}  />
          </Route>
        </Routes>


      </BrowserRouter>
    </>
  )
}

function PrivateRoute() {

  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getUser();

      console.log(session);
     
      if (session?.data?.user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    })();
  }, []);


  return (
    isAuth==null ? <></>: isAuth ? <Outlet /> : <Navigate to='/login' />
  )
}


export function AuthRoute({ element,allowed}) {

  const user = useUserStore(state => state.user);
  const loading = useUserStore(state => state.loading);


  const allowedAccess = allowed.includes(user?.account_type);

  useEffect(() => {
    console.log(user);
  }, [loading])


  return (
    !loading ? allowedAccess ? element : <Navigate to='/auth/error' /> : <div className="h-screen w-screen flex justify-center items-center"> <Spinner size="lg" /> </div>
  )
}


export default App
