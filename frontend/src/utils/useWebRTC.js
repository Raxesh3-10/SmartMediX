import { getSocket } from "./socket";

export async function createRoomConnection({
  roomId,
  localVideoRef,
  onRemoteStream,
  onStatus, 
}) {
  const socket = getSocket();
  const peers = {}; // Keep track of peer connections
  const pendingICE = {};
  let localStream;

  onStatus?.("CONNECTING");

  /* ===== SOCKET READY ===== */
  if (!socket.connected) {
    await new Promise((res) => socket.once("connect", res));
  }

  /* ===== MEDIA ===== */
  onStatus?.("REQUESTING_MEDIA");

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (err) {
    console.error("Failed to get media", err);
    onStatus?.("MEDIA_ERROR");
    throw err;
  }

  // Ensure the video element exists before attaching stream
  const video = localVideoRef.current;
  if (!video) {
    // If this triggers, it means the <video> tag wasn't rendered in the DOM yet
    console.error("Local video ref missing. Ensure <video> is not conditionally rendered.");
  } else {
    video.srcObject = localStream;
    video.muted = true; // Always mute local video to prevent feedback
    video.playsInline = true;
  }

  /* ===== CLEAN OLD LISTENERS ===== */
  // Important: Remove old listeners to prevent duplicates if component re-renders
  socket.off("user-joined");
  socket.off("offer");
  socket.off("answer");
  socket.off("ice-candidate");
  socket.off("user-left");

  /* ===== JOIN ROOM ===== */
  socket.emit("join-room", roomId);
  onStatus?.("WAITING_FOR_PEER");

  /* ===== SIGNALING ===== */

  // 1. Existing user sees new user join -> Initiates Offer
  socket.on("user-joined", async (remoteId) => {
    console.log("User joined:", remoteId);
    if (peers[remoteId]) return; // Already connected

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
    onStatus?.("OFFERING");
  });

  // 2. New user receives Offer -> Sends Answer
  socket.on("offer", async ({ offer, from }) => {
    console.log("Received offer from:", from);
    if (peers[from]) return;

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
    
    // Process any ICE candidates that arrived before the offer
    flushICE(from);
    onStatus?.("ANSWERING");
  });

  // 3. Original user receives Answer
  socket.on("answer", async ({ answer, from }) => {
    console.log("Received answer from:", from);
    if (peers[from]) {
      await peers[from].setRemoteDescription(answer);
      onStatus?.("CONNECTED");
    }
  });

  // 4. Exchange ICE Candidates
  socket.on("ice-candidate", ({ candidate, from }) => {
    if (peers[from]?.remoteDescription) {
      peers[from].addIceCandidate(candidate).catch(console.error);
    } else {
      pendingICE[from] ||= [];
      pendingICE[from].push(candidate);
    }
  });

  socket.on("user-left", (id) => {
    console.log("User left:", id);
    if (peers[id]) {
      peers[id].close();
      delete peers[id];
    }
    onStatus?.("USER_LEFT");
  });

  /* ===== HELPER: Create Peer Connection ===== */
  function createPeer(remoteId) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN servers here for production
      ],
    });

    // Add local tracks to the connection
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    // Handle remote stream
    pc.ontrack = (e) => {
      console.log("Received remote stream");
      onRemoteStream(remoteId, e.streams[0]);
      onStatus?.("ON_CALL");
    };

    // Handle ICE candidates
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
    if (pendingICE[id]) {
      pendingICE[id].forEach((c) => peers[id].addIceCandidate(c).catch(console.error));
      delete pendingICE[id];
    }
  }

  return {
    leave() {
      // Close all peer connections
      Object.values(peers).forEach((p) => p.close());
      // Stop local camera/mic
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      socket.emit("leave-room", roomId);
      console.log("Left room");
    },
  };
}