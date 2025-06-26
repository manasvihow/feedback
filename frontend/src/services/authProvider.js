import LoginPage from "../pages/LoginPage";
import {UserContext } from "./contexts";
import { useState } from "react";

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

    return (
        user?.email ? <UserContext.Provider value={{user, setUser}}>
        {children}
    </UserContext.Provider> : <LoginPage setUser={setUser}/>
        
    )
}

export default AuthProvider;