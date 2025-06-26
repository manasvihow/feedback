import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { deleteFeedback, getFeedbackList } from "../services/feedback";
import { UserContext } from "../services/contexts";
import CreateFeedbackForm from "./CreateFeedbackForm";
import { Table } from "../shared/table";
import Tabs from "../shared/tabs";
import { MessageSquareShare, MessageSquareDot } from "lucide-react";

export default function FeedbackTable({ setSelectedFeedback, setCreate }) {
    const { user } = useContext(UserContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState("");
    const errorTimeoutRef = useRef();
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getFeedbackList(user?.email);
                setFeedbacks(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchData();
    }, [user?.email]);

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

    useEffect(() => {
      if (errorTimeoutRef.current){
        clearTimeout(errorTimeoutRef.current);
      }

      errorTimeoutRef.current = setTimeout(() => {
        setError("");
      }, 5000);
    }, [error]);

    const tabsData = useMemo(() => {

        return [
            {
                label: "Feedbacks Received",
                icon: MessageSquareDot,
                content: (
                    <Table
                        feedbacks={feedbacks.filter(fb => fb.creator_email !== user?.email)}
                        setCreate={setCreate}
                        setSelectedFeedback={setSelectedFeedback}
                        handleDelete={handleDelete}
                        isInbox={true}
                        setError={setError}
                    />
                ),
            },
            {
              label: "Outgoing Feedbacks",
              icon: MessageSquareShare,
              content: (
                  <Table
                      feedbacks={feedbacks.filter(fb => fb.creator_email === user?.email)}
                      setCreate={setCreate}
                      setSelectedFeedback={setSelectedFeedback}
                      handleDelete={handleDelete}
                      isInbox={false}
                      setError={setError}
                  />
              ),
          }
        ];
    }, [feedbacks, setCreate, handleDelete, setSelectedFeedback, user]);

    return (
        <div className="font-sans">
            {error && (
                <div className="text-red-500 mb-4 p-2 rounded bg-red-50">
                    {error}
                </div>
            )}
            {feedbacks[0] == null ? (
                <div className="p-10 flex justify-center text-2xl text-[#5C2849]">
                    Start Creating Feedbacks
                </div>
            ) : (
                <div className="rounded-xl shadow-sm overflow-hidden border border-gray-100 bg-white">
                    <Tabs tabs={tabsData} />
                </div>
            )}
        </div>
    );
}
