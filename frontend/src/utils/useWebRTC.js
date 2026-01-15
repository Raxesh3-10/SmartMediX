import { getSocket } from "./socket";

export async function createRoomConnection({
  roomId,
  localVideoRef,
  onRemoteStream,
  role,
  onStatus, // 👈 loading callback
}) {
  const socket = getSocket();
  const peers = {};
  const pendingICE = {};
  let localStream;

  const isDoctor = role === "DOCTOR";

  onStatus?.("CONNECTING");

  /* ===== SOCKET READY ===== */
  if (!socket.connected) {
    await new Promise((res) => socket.once("connect", res));
  }

  /* ===== MEDIA ===== */
  onStatus?.("REQUESTING_MEDIA");

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const video = localVideoRef.current;
  if (!video) throw new Error("Local video ref missing");

  video.srcObject = localStream;
  video.muted = true;
  video.playsInline = true;

  /* ===== CLEAN OLD LISTENERS ===== */
  socket.off("user-joined");
  socket.off("offer");
  socket.off("answer");
  socket.off("ice-candidate");
  socket.off("user-left");

  /* ===== JOIN ROOM ===== */
  socket.emit("join-room", roomId);
  onStatus?.("WAITING_FOR_PEER");

  /* ===== SIGNALING ===== */

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
    await peers[from]?.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", ({ candidate, from }) => {
    if (peers[from]?.remoteDescription) {
      peers[from].addIceCandidate(candidate);
    } else {
      pendingICE[from] ||= [];
      pendingICE[from].push(candidate);
    }
  });

  socket.on("user-left", (id) => {
    peers[id]?.close();
    delete peers[id];
  });

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
      onStatus?.("CONNECTED");
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

  return {
    leave() {
      Object.values(peers).forEach((p) => p.close());
      localStream.getTracks().forEach((t) => t.stop());
      socket.emit("leave-room", roomId);
    },
  };
}