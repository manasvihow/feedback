import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../services/contexts";
import WelcomeBanner from "../components/WelcomeBanner";
import FeedbackDetail from "../components/FeedbackDetail";
import FeedbackTable from "../components/FeedbackTable";
import CreateFeedbackForm from "../components/CreateFeedbackForm";
import ActionButtons from "../components/ActionButtons";
import NavBar from "../components/NavBar";
import RequestForm from "../components/RequestForm";
import Dashboard from "../components/DashboardPage";
import { deleteFeedback, getFeedbackList } from "../services/feedback";

const Home = () => {
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const { user, setUser } = useContext(UserContext);
    const [create, setCreate] = useState(false);
    const [requestorEmail, setRequestorEmail] = useState("");
    const [showRequesterModal, setShowRequesterModal] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [selectedPage, setSelectedPage] = useState("Home");
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState("");

    const errorTimeoutRef = useRef();

    const pollingRef = useRef();

    useEffect(() => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }

        errorTimeoutRef.current = setTimeout(() => {
            setError("");
        }, 3000);
    }, [error]);

    const handleResetView = () => {
        setSelectedFeedback(null);
        setShowDashboard(false);
        setCreate(false);
    };

    const handleLogout = () => {
        setUser({});
        localStorage.setItem("user", "{}");
        window.location.href = "/login";
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getFeedbackList(user?.email);
                setFeedbacks(data);
            } catch (err) {
                setError(err.message);
            }
        }

        if (selectedPage !== "Home") {
            clearInterval(pollingRef.current);
        } else {
            fetchData();
            pollingRef.current = setInterval(() => {
                fetchData();
            }, 1000);
        }
    }, [selectedPage]);

    const handleDelete = (id) => {
        async function deleteFB() {
            try {
                await deleteFeedback(id);
                const data = await getFeedbackList(user?.email);
                setFeedbacks(data);
            } catch (err) {
                setError(err.message);
            }
        }

        deleteFB();
    };

    return (
        <>
            <div className="w-full bg-[#F9F9F9]">
                <NavBar
                    selectedPage={selectedPage}
                    onHomeClick={() => {
                        handleResetView();
                        setSelectedPage("Home");
                    }}
                    onCreateClick={() => {
                        setShowDashboard(false);
                        setCreate(true);
                        setSelectedPage("Create");
                    }}
                    onDashboardClick={() => {
                        setShowDashboard(true);
                        setCreate(false);
                        setSelectedPage("Dashboard");
                    }}
                    onLogout={handleLogout}
                />

                <div className="px-20 py-8">
                    {!selectedFeedback &&
                        !create &&
                        !showDashboard && <WelcomeBanner />}
                    {error && (
                        <div className="text-red-500 mb-4 p-2 rounded bg-red-50">
                            {error}
                        </div>
                    )}
                    {showDashboard ? (
                        <Dashboard
                            onClose={() => {
                                setShowDashboard(false);
                                setSelectedPage("Home");
                            }}
                        />
                    ) : create ? (
                        <CreateFeedbackForm
                            setSelectedPage={() => setSelectedPage("Create")}
                            setRequestorEmail={setRequestorEmail}
                            requestorEmail={selectedFeedback?.employee_email}
                            onClose={() => {
                                setSelectedPage("Home");
                                setSelectedFeedback(null);
                                setCreate(false);
                            }}
                            selectedFeedback={selectedFeedback}
                        />
                    ) : selectedFeedback ? (
                        <FeedbackDetail
                            id={selectedFeedback?.id}
                            email={user?.email}
                            onBack={() => setSelectedFeedback(null)}
                        />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:flex-1">
                                <FeedbackTable
                                    handleDelete={handleDelete}
                                    feedbacks={feedbacks}
                                    requestorEmail={requestorEmail}
                                    setRequestorEmail={setRequestorEmail}
                                    setCreate={setCreate}
                                    setSelectedFeedback={setSelectedFeedback}
                                    setError={setError}
                                />
                            </div>
                            {user?.role === "employee" && (
                                <div className="lg:w-[320px]">
                                    <ActionButtons
                                        onRequest={() =>
                                            setShowRequesterModal(true)
                                        }
                                        onCreate={() => setCreate(true)}
                                        onDashboard={() =>
                                            setShowDashboard(true)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showRequesterModal && (
                <>
                    <div className="fixed inset-0 bg-gray-500/75 transition-opacity"></div>
                    <div
                        className={`absolute w-[50%] h-[50%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}
                    >
                        <RequestForm
                            onBack={() => setShowRequesterModal(false)}
                            setRequestorEmail={user?.email}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default Home;
