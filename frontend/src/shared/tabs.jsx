import React, { useContext, useMemo, useState } from "react";
import { UserContext } from "../services/contexts";

const Tabs = ({ tabs }) => {
  const { user } = useContext(UserContext);

  const filteredTabs = useMemo(() => {
    if(user?.role === "manager"){
      return tabs.filter(tab => tab.label !== "Feedbacks Received");
    }
    return tabs;
  }, [tabs, user?.role]);

  const [activeTab, setActiveTab] = useState(filteredTabs[0]?.label);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-300">
        {filteredTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.label
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white rounded-b-lg shadow-sm">
        {filteredTabs.map(
          (tab) =>
            tab.label === activeTab && (
              <div key={tab.label} className="animate-fadeIn">
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Tabs;
