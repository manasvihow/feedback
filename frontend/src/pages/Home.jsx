import React, { useContext, useState } from 'react';
import { UserContext } from '../services/contexts';
import WelcomeBanner from "../components/WelcomeBanner";
import FeedbackDetail from "../components/FeedbackDetail";
import FeedbackTable from "../components/FeedbackTable";
import CreateFeedbackForm from '../components/CreateFeedbackForm';
import ActionButtons from "../components/ActionButtons";
import NavBar from "../components/NavBar";

const Home = ({setUser}) => {
  const [selectedId, setSelectedId] = useState(null);
  const { email } = useContext(UserContext);
  const [create, setCreate] = useState(false);

  const handleResetView = () => {
    setSelectedId(null);
    setCreate(false);
  };

  const handleLogout = () => {
    setUser.email(null)
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <NavBar 
        onHomeClick={handleResetView} 
        onLogout={handleLogout} 
      />
      
      <div className="px-6 py-8">
        {!selectedId && !create && <WelcomeBanner />}

        {selectedId ? (
          <FeedbackDetail id={selectedId} email={email} onBack={() => setSelectedId(null)} />
        ) : create ? (
          <CreateFeedbackForm onClose={() => setCreate(false)} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:flex-1">
              <FeedbackTable setSelectedId={setSelectedId} />
            </div>
            <div className="lg:w-[320px]">
              <ActionButtons onCreate={() => setCreate(true)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;