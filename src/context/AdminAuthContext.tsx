"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext<any>(null);

export function AdminAuthProvider({ children }: any) {

  const [admin,setAdmin] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const logged = localStorage.getItem("adminLoggedIn");

    if(logged === "true"){
      setAdmin(true);
    }

    setLoading(false);

  },[]);


  const login = () => {

    localStorage.setItem("adminLoggedIn","true");
    setAdmin(true);

  };


  const logout = () => {

    localStorage.removeItem("adminLoggedIn");
    setAdmin(false);

  };


  return(

    <AdminAuthContext.Provider value={{admin,login,logout,loading}}>

      {children}

    </AdminAuthContext.Provider>

  );

}

export function useAdminAuth(){

  return useContext(AdminAuthContext);

}
