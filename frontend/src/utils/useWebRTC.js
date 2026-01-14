import { socket } from "./socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export async function createPeerConnection({
  roomId,
  localVideoRef,
  remoteVideoRef,
  isCaller,
}) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // ===== Media =====
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  localVideoRef.current.srcObject = stream;
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pc.ontrack = e => {
    remoteVideoRef.current.srcObject = e.streams[0];
  };

  // ===== ICE =====
  pc.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("ice-candidate", {
        roomId,
        candidate: e.candidate,
      });
    }
  };

  // ===== Join Room =====
  socket.emit("join-room", roomId);

  // ===== Caller Flow =====
  if (isCaller) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
      roomId,
      offer,
    });
  }

  // ===== Receive Offer =====
  socket.on("offer", async ({ offer }) => {
    if (pc.signalingState !== "stable") return;

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", {
      roomId,
      answer,
    });
  });

  // ===== Receive Answer =====
  socket.on("answer", async ({ answer }) => {
    if (!pc.currentRemoteDescription) {
      await pc.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  });

  // ===== ICE From Peer =====
  socket.on("ice-candidate", async ({ candidate }) => {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("ICE error:", err);
    }
  });

  return pc;
}