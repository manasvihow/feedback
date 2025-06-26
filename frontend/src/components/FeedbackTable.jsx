import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { UserContext } from "../services/contexts";
import CreateFeedbackForm from "./CreateFeedbackForm";
import { Table } from "../shared/table";
import Tabs from "../shared/tabs";
import { MessageSquareShare, MessageSquareDot } from "lucide-react";

export default function FeedbackTable({ setSelectedFeedback, setCreate, feedbacks, handleDelete, setError }) {
    const { user } = useContext(UserContext);

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
