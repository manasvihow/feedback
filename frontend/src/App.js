import React from "react";
import HomePage from "./pages/Home";
import AuthProvider from "./services/authProvider";
import Navbar from "./components/NavBar";

const App = () => {

  return ( 
    <AuthProvider>
      <HomePage />
    </AuthProvider>
    )
};

export default App;
 