import { useContext } from "react";
import { UserContext } from "../services/contexts";

export default function NavBar({
    selectedPage,
    onHomeClick,
    onCreateClick,
    onDashboardClick,
    onLogout,
}) {
  const user = useContext(UserContext).user;
  console.log(user);
    return (
      
        <div className="fixed w-[100%] z-[1200]">
            <nav className="w-full py-3 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo/Title - clickable for home */}
                    <div
                        className="text-2xl font-semibold text-[#5C2849] tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={onHomeClick}
                    >
                        FeedLoop
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                onHomeClick();
                            }}
                            className={`${
                                selectedPage === "Home" && "bg-slate-300"
                            } text-[#555555] hover:text-[#5C2849] rounded-md font-medium px-3 py-1 transition-colors`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => {
                                onCreateClick();
                            }}
                            className={`${
                                selectedPage === "Create" && "bg-slate-300"
                            } text-[#555555] hover:text-[#5C2849] font-medium px-3 py-1 rounded-md transition-colors`}
                        >
                            Create
                        </button>
                          
                        {user?.role == "manager" && <button
                            onClick={() => {
                                onDashboardClick();
                            }}
                            className={`${
                                selectedPage === "Dashboard" && "bg-slate-300"
                            } text-[#555555] hover:text-[#5C2849] font-medium px-3 py-1 rounded-md transition-colors`}
                        >
                            Dashboard
                        </button>}

                        <button
                            onClick={onLogout}
                            className="text-[#A63A3A] hover:text-white hover:bg-[#A63A3A] rounded-md font-medium px-3 py-1 border border-[#A63A3A] hover:border-transparent transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
