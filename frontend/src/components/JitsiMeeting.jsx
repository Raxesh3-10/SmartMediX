import { useEffect, useRef } from "react";

const MAX_PARTICIPANTS = 5;
const JITSI_DOMAIN = "meet.yourdomain.com";

export default function JitsiMeeting({
  roomId,
  displayName,
  email,
  role, // "DOCTOR" | "PATIENT"
  onClose,
}) {
  const ref = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI || !roomId) return;

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName: roomId,
      parentNode: ref.current,
      width: "100%",
      height: 520,
      userInfo: { displayName, email },

      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: role === "PATIENT",
        startWithVideoMuted: false,
        enableLayerSuspension: false,
        maxParticipants: MAX_PARTICIPANTS,
      },

      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    });

    apiRef.current = api;

    api.addEventListener("participantJoined", async () => {
      const participants = await api.getParticipantsInfo();
      if (participants.length > MAX_PARTICIPANTS) {
        alert("Room is full");
        api.executeCommand("hangup");
      }
    });

    api.addEventListener("readyToClose", () => {
      api.dispose();
      onClose?.();
    });

    return () => api.dispose();
  }, [roomId]);

  return <div ref={ref} />;
}