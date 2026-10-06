import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import MainLayout from "../layouts/MainLayout";
import { getMeetingDetails } from "../services/meetingService";

export default function OnlineMeeting() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadMeeting();
    }, [appointmentId]);

    const loadMeeting = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMeetingDetails(appointmentId);
            setMeeting(data.meeting);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to open the online meeting"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto py-16 px-4 text-center">
                    <p className="text-gray-500">
                        Preparing your secure video consultation...
                    </p>
                </div>
            </MainLayout>
        );
    }

    if (error || !meeting) {
        return (
            <MainLayout>
                <div className="max-w-xl mx-auto py-16 px-4">
                    <div className="bg-white border rounded-xl shadow-sm p-8 text-center">
                        <h1 className="text-2xl font-bold mb-3">
                            Unable to Join Meeting
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error || "Meeting information is unavailable."}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/my-appointments")}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
                        >
                            Back to Appointments
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Online Consultation
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {meeting.startTime} - {meeting.endTime}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/my-appointments")}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Leave Meeting
                    </button>
                </div>

                <div className="bg-black rounded-xl overflow-hidden shadow-lg min-h-[600px]">
                    <JitsiMeeting
                        domain={meeting.domain}
                        roomName={meeting.roomName}
                        configOverwrite={{
                            startWithAudioMuted: false,
                            startWithVideoMuted: false,
                            prejoinPageEnabled: true,
                            disableModeratorIndicator: true,
                            enableWelcomePage: false,
                        }}
                        interfaceConfigOverwrite={{
                            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        }}
                        userInfo={{
                            displayName:
                                meeting.participantName ||
                                "Doctor Connect User",
                        }}
                        onReadyToClose={() => {
                            navigate("/my-appointments");
                        }}
                        getIFrameRef={(iframeRef) => {
                            iframeRef.style.height = "600px";
                            iframeRef.style.width = "100%";
                            iframeRef.style.border = "0";
                        }}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
