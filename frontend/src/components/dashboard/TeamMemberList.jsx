import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../services/contexts";
import { getEmployeeList } from "../../services/dashboard";
import { capitalizeFirstLetter } from "../../utils/helpers";

export const Card = ({emp, children}) => {
    return(
<div className="bg-white p-2 rounded-2xl mb-2 shadow-md border border-gray-100 max-w-xl">
    <h1 className="text-2xl">{emp?.name}</h1>
    <div className="mb-2">{capitalizeFirstLetter(emp?.role) }</div>
    <div className="text-gray-500">{emp?.email}</div>
    {children}
</div>
    )
}

const TeamMemberList = () => {
    const { user } = useContext(UserContext);
    const [employeeList, setEmployeeList] = useState([]);

    const manager = useMemo(() => {
        return employeeList.filter((emp) => emp.role === "manager")[0];
    }, [employeeList]);

    const employees = useMemo(() => {
        return employeeList.filter((emp) => emp.role !== "manager");
    }, [employeeList]);

    useEffect(() => {
        async function fetchEmployeeList() {
            const data = await getEmployeeList(user?.email);
            setEmployeeList(data);
        }
        fetchEmployeeList();
    }, []);

    return (
        <>
            {manager && <Card emp={manager}/>}
            <div className="text-xl font-bold mb-2">Employees</div>
            <div className="max-h-screen h-2/3 overflow-scroll">
            {employees.map((emp) => {
                return (
                    <div className="mb-4">
                        <div>{emp.name}</div>
                        <div>{emp.email}</div>
                    </div>
                );
            })}
            </div>
        </>
    );
};

export default TeamMemberList;
