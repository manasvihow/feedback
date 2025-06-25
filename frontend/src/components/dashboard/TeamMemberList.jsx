import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../services/contexts";
import { getEmployeeList } from "../../services/dashboard";

export const Card = ({emp, children}) => {
    return(
<div className="bg-white p-2 rounded-2xl mb-2 shadow-md border border-gray-100 max-w-xl">
    <h1 className="text-2xl">{emp?.name}</h1>
    <div className="mb-2">{emp?.role}</div>
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
            <div className="overflow-auto">
            {employees.map((emp) => {
                return (
                    <Card emp={emp}/>
                );
            })}
            </div>
        </>
    );
};

export default TeamMemberList;
