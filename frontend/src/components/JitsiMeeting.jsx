//<script src="https://meet.yourdomain.com/external_api.js"></script>
import { useEffect, useRef } from "react";

const MAX_PARTICIPANTS = 5;

const JITSI_DOMAIN = import.meta.env.DEV
  ? "meet.jit.si"
  : "meet.yourdomain.com";

const JITSI_SCRIPT_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${JITSI_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.onload = resolve;
      return;
    }

    const script = document.createElement("script");
    script.src = JITSI_SCRIPT_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function JitsiMeeting({
  roomId,
  displayName,
  email,
  role, // "DOCTOR" | "PATIENT"
  onClose,
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    let disposed = false;

    (async () => {
      try {
        await loadJitsiScript();
        if (disposed) return;

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: roomId,
          parentNode: containerRef.current,
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
      } catch (e) {
        console.error("Failed to load Jitsi", e);
        alert("Video service unavailable");
      }
    })();

    return () => {
      disposed = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomId, role, displayName, email]);

  return <div ref={containerRef} />;
}
