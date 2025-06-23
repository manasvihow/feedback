import { useContext } from "react";
import { UserContext } from "../services/contexts";
import NavBar from "../components/NavBar";

const HomePage = () => {
    const userContext = useContext(UserContext);
    
    return (
        <NavBar />
    )
}

export default HomePage;