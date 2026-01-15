import { socket } from "./socket";

export async function createRoomConnection({
  roomId,
  localVideoRef,
  onRemoteStream,
  role,
}) {
  const peers = {};
  const pendingICE = {};
  let localStream;

  const isDoctor = role === "DOCTOR";

  /* ===== ENSURE SOCKET READY ===== */
  if (!socket.connected) {
    await new Promise((resolve) => socket.once("connect", resolve));
  }

  /* ===== MEDIA ===== */
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const videoEl = localVideoRef.current;
  if (!videoEl) throw new Error("Local video element missing");

  videoEl.srcObject = localStream;
  videoEl.muted = true;
  videoEl.playsInline = true;

  /* ===== JOIN ROOM ===== */
  socket.emit("join-room", roomId);

  /* ================= SIGNALING ================= */

  socket.off(); // 🚨 critical: remove duplicates

  socket.on("user-joined", async (remoteId) => {
    if (!isDoctor || peers[remoteId]) return;

    const pc = createPeer(remoteId);
    peers[remoteId] = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
      roomId,
      target: remoteId,
      from: socket.id,
      offer,
    });
  });

  socket.on("offer", async ({ offer, from }) => {
    if (isDoctor || peers[from]) return;

    const pc = createPeer(from);
    peers[from] = pc;

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", {
      roomId,
      target: from,
      from: socket.id,
      answer,
    });

    flushICE(from);
  });

  socket.on("answer", async ({ answer, from }) => {
    const pc = peers[from];
    if (!pc) return;
    await pc.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", ({ candidate, from }) => {
    const pc = peers[from];
    if (pc?.remoteDescription) {
      pc.addIceCandidate(candidate);
    } else {
      pendingICE[from] ||= [];
      pendingICE[from].push(candidate);
    }
  });

  socket.on("user-left", (id) => {
    peers[id]?.close();
    delete peers[id];
  });

  /* ================= PEER ================= */

  function createPeer(remoteId) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    });

    localStream.getTracks().forEach((t) =>
      pc.addTrack(t, localStream)
    );

    pc.ontrack = (e) => {
      onRemoteStream(remoteId, e.streams[0]);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          target: remoteId,
          from: socket.id,
          candidate: e.candidate,
        });
      }
    };

    return pc;
  }

  function flushICE(id) {
    (pendingICE[id] || []).forEach((c) =>
      peers[id].addIceCandidate(c)
    );
    delete pendingICE[id];
  }

  /* ===== CLEANUP ===== */
  return {
    leave() {
      Object.values(peers).forEach((p) => p.close());
      localStream.getTracks().forEach((t) => t.stop());

      socket.emit("leave-room", roomId);
      socket.off();
    },
  };
}