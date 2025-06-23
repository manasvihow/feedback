import { createContext } from "react";

export const ROLES = {
    "manager": "manager",
    "employee": "employee"
}

export const UserContext = createContext({
    name: "",
    role: ROLES.employee,
    email: ""
});
