import LoginPage from "../pages/LoginPage";
import { ROLES, UserContext } from "./contexts";
import { useState } from "react";

const AuthProvider = ({children}) => {
    const [user, setUser] = useState({
        email: "",
        name: "",
        role: ROLES.manager
    });

    return (
        user.email === "" ? <LoginPage setUser={setUser}/> :
        <UserContext.Provider value={user} >
            {children}
        </UserContext.Provider>
    )
}

export default AuthProvider;