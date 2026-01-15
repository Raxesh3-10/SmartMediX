import { useEffect, useRef } from "react";

const MAX_PARTICIPANTS = 5; // 1 doctor + 4 patients

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
    if (!window.JitsiMeetExternalAPI) return;

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: roomId,
      parentNode: ref.current,
      width: "100%",
      height: 500,
      userInfo: {
        displayName,
        email,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        maxParticipants: MAX_PARTICIPANTS, // 🔒 HARD LIMIT
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
      },
    });

    apiRef.current = api;

    /* ================= PARTICIPANT CONTROL ================= */

    api.addEventListener("participantJoined", async () => {
      const participants = await api.getParticipantsInfo();

      // Hard safety check
      if (participants.length > MAX_PARTICIPANTS) {
        alert("This consultation room is full.");
        api.executeCommand("hangup");
        return;
      }

      // Soft enforcement: doctor should not be kicked
      if (role === "PATIENT" && participants.length > MAX_PARTICIPANTS) {
        api.executeCommand("hangup");
      }
    });

    api.addEventListener("readyToClose", () => {
      api.dispose();
      onClose?.();
    });

    return () => {
      api.dispose();
    };
  }, [roomId]);

  return <div ref={ref} />;
}