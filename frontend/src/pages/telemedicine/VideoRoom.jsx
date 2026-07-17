import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineAPI } from '../../services/api';
import { showToast } from '../../components/Toast';

export default function VideoRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    initRoom();
    return () => cleanup();
  }, [roomCode]);

  const initRoom = async () => {
    try {
      const sess = await telemedicineAPI.getByRoom(roomCode);
      setSession(sess);
      
      // Request camera/mic access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // LOCAL DEMO MODE: Since we don't have a WebRTC signaling server,
      // we will display the local stream in the remote video element as well to demonstrate the UI.
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      startTimer();
      setLoading(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to join room. It may be invalid or ended.', 'error');
      navigate(-1);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = async () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      try {
        if (user.role === 'DOCTOR') {
          await telemedicineAPI.end(session.sessionId);
        }
        cleanup();
        navigate(-1);
      } catch (err) {
        showToast('Error ending call', 'error');
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="video-loading">Connecting to secure room...</div>;

  return (
    <div className="video-room-container">
      {/* Header */}
      <div className="video-header">
        <div>
          <h2>Telemedicine Consultation</h2>
          <p>{user.role === 'DOCTOR' ? `Patient: ${session.patientName}` : `Dr. ${session.doctorName}`}</p>
        </div>
        <div className="video-status">
          <div className="live-indicator"></div>
          <span>{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {/* Remote Video (Main) */}
        <div className="video-tile main-video">
          <video ref={remoteVideoRef} autoPlay playsInline muted={user.role === 'PATIENT'} />
          <div className="video-nameplate">
            {user.role === 'DOCTOR' ? session.patientName : `Dr. ${session.doctorName}`}
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div className="video-tile pip-video">
          <video ref={localVideoRef} autoPlay playsInline muted />
          <div className="video-nameplate">You</div>
          {isVideoOff && <div className="video-off-overlay">Camera Off</div>}
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button className={`control-btn ${isMuted ? 'danger' : ''}`} onClick={toggleMute}>
          {isMuted ? '🔇' : '🎙️'}
        </button>
        <button className={`control-btn ${isVideoOff ? 'danger' : ''}`} onClick={toggleVideo}>
          {isVideoOff ? '🚫📷' : '📷'}
        </button>
        <button className="control-btn end-call" onClick={handleEndCall}>
          End Call
        </button>
      </div>
    </div>
  );
}
