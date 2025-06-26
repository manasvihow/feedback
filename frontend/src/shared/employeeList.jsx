import { useContext, useEffect, useState } from "react";
import { Required } from "./required";
import { UserContext } from "../services/contexts";
import { getEmployeeList } from "../services/dashboard";

const EmployeeList = ({form, handleChange, handleFirstChange, isCreateForm}) => {
    const {user } = useContext(UserContext);
    const [employeeList, setEmployeeList] = useState([]);

    useEffect(() => {
        async function fetchEmployeeList(){
          const data = await getEmployeeList(user?.email);
            
          if(isCreateForm){
            setEmployeeList(data.filter(emp => emp.role !== "manager"));
          } else {
            setEmployeeList(data);
          }
        if(handleFirstChange){
            handleFirstChange(data[0].email);
        }

        }
        fetchEmployeeList();

      },[]);
    
      console.log(form)

    return (
        <div>
            <div className="flex">
                <label className="block text-sm font-medium text-[#555555] mb-2">
                    Employee
                </label>
                <Required />
            </div>
            <select
                name="employee_email"
                value={form.employee_email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5D4E6D] focus:border-transparent"
            >
                <option value="" disabled selected>Select an option</option>
                {employeeList.map((emp) => {
                    return <option value={emp.email}>{emp.name}</option>;
                })}
            </select>
        </div>
    );
};

export default EmployeeList;
