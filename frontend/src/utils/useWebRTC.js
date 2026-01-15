import { socket } from "./socket";

export async function createRoomConnection({
  roomId,
  localVideoRef,
  onRemoteStream,
  role, // "DOCTOR" | "PATIENT"
}) {
  const peers = {};
  const pendingSignals = {};
  let localStream;

  const isDoctor = role === "DOCTOR";

  /* ===== SOCKET READY ===== */
  await new Promise((resolve) => {
    if (socket.connected && socket.id) return resolve();
    socket.once("connect", resolve);
  });

  /* ===== MEDIA ===== */
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  localVideoRef.current.srcObject = localStream;
  localVideoRef.current.muted = true;
  localVideoRef.current.playsInline = true;

  /* ===== JOIN ROOM ===== */
  socket.emit("join-room", roomId);

  /* ======================================================
     SIGNALING LOGIC
     ====================================================== */

  // 🔹 Doctor creates offer for each patient
  socket.on("user-joined", async (remoteId) => {
    if (!isDoctor) return;
    if (Object.keys(peers).length >= 4) return;
    if (peers[remoteId]) return;

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

  // 🔹 Patient receives offer only from doctor
  socket.on("offer", async (data) => {
    if (!data?.offer || !data?.from) return;
    if (isDoctor) return; // doctor never answers
    if (peers[data.from]) return;

    const pc = createPeer(data.from);
    peers[data.from] = pc;

    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", {
      roomId,
      target: data.from,
      from: socket.id,
      answer,
    });

    flushPending(data.from);
  });

  // 🔹 Doctor receives answers
  socket.on("answer", async (data) => {
    if (!data?.answer || !data?.from) return;
    if (!isDoctor) return;

    if (!peers[data.from]) {
      pendingSignals[data.from] ||= [];
      pendingSignals[data.from].push({
        type: "answer",
        answer: data.answer,
      });
      return;
    }

    await peers[data.from].setRemoteDescription(data.answer);
  });

  // 🔹 ICE (both sides)
  socket.on("ice-candidate", (data) => {
    if (!data?.candidate || !data?.from) return;

    if (peers[data.from]) {
      peers[data.from].addIceCandidate(data.candidate);
    } else {
      pendingSignals[data.from] ||= [];
      pendingSignals[data.from].push({
        type: "ice",
        candidate: data.candidate,
      });
    }
  });

  socket.on("user-left", (id) => {
    peers[id]?.close();
    delete peers[id];
  });

  /* ======================================================
     PEER FACTORY
     ====================================================== */

  function createPeer(remoteId) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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

  function flushPending(id) {
    (pendingSignals[id] || []).forEach((s) => {
      if (s.type === "answer") {
        peers[id].setRemoteDescription(s.answer);
      } else {
        peers[id].addIceCandidate(s.candidate);
      }
    });
    delete pendingSignals[id];
  }

  /* ===== CLEANUP ===== */
  return {
    leave() {
      Object.values(peers).forEach((p) => p.close());
      localStream.getTracks().forEach((t) => t.stop());

      socket.emit("leave-room", roomId);

      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    },
  };
}