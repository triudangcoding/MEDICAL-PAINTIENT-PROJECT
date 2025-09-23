import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RecordRTCPromisesHandler } from "recordrtc";

interface JitsiMeetExternalAPI {
  executeCommand: (command: string) => void;
  addEventListeners: (listeners: Record<string, () => void>) => void;
}

const VideoCall: React.FC = () => {
  const { meetingId, name } = useParams<{ meetingId: string; name: string }>();
  const navigate = useNavigate();

  // Debug parameters từ URL
  console.log('VideoCall params:', { meetingId, name });

  // Function to format meeting name
  const formatMeetingName = (name: string | undefined): string => {
    console.log('formatMeetingName input:', name);

    if (!name || name === 'meeting') {
      return "Cuộc họp trực tuyến";
    }

    // Replace dashes with spaces and convert to title case
    const formatted = name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    console.log('formatMeetingName output:', formatted);
    return formatted;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  //   const [isMuted, setIsMuted] = useState(false);
  //   const [isVideoOff, setIsVideoOff] = useState(false);
  //   const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [api, setApi] = useState<JitsiMeetExternalAPI | null>(null);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const recorderRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meeting.minhtuandng.id.vn/external_api.js";
    script.async = true;
    script.onload = () => setIsLoading(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!api || !isMeetingStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          api.executeCommand("hangup");
          toast.error("Cuộc họp đã kết thúc do hết thời gian!", {
            duration: 3000,
            position: "top-right",
          });
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [api, navigate, isMeetingStarted]);

  useEffect(() => {
    if (!isLoading && meetingId) {
      const domain = "meeting.minhtuandng.id.vn";
      const options = {
        roomName: meetingId,
        width: "100%",
        height: "100%",
        parentNode: document.querySelector("#jitsi-container"),
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Người tham gia",
          TOOLBAR_ALWAYS_VISIBLE: true,
        },
      };

      const jitsiApi = new (window as any).JitsiMeetExternalAPI(
        domain,
        options
      );
      setApi(jitsiApi);

      jitsiApi.addEventListeners({
        videoConferenceJoined: () => {
          setIsMeetingStarted(true);
          startRecordRTC();
          toast.success("Đã tham gia cuộc họp!", {
            duration: 3000,
            position: "top-right",
          });
        },
        participantJoined: () => {
          setParticipantCount((prev) => prev + 1);
        },
        participantLeft: () => {
          setParticipantCount((prev) => prev - 1);
        },
        videoConferenceLeft: () => {
          stopRecordRTC();
          setIsMeetingStarted(false);
          toast.success("Đã rời khỏi cuộc họp!", {
            duration: 3000,
            position: "top-right",
          });
          navigate("/dashboard");
        },
      });
    }
  }, [isLoading, meetingId, navigate]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  //   const handleMute = () => {
  //     setIsMuted(!isMuted);
  //     // Implement mute functionality with Jitsi API
  //   };

  //   const handleVideoToggle = () => {
  //     setIsVideoOff(!isVideoOff);
  //     // Implement video toggle functionality with Jitsi API
  //   };

  //   const handleScreenShare = () => {
  //     setIsScreenSharing(!isScreenSharing);
  //     // Implement screen sharing functionality with Jitsi API
  //   };

  //   const handleLeave = () => {
  //     if (window.confirm("Bạn có chắc chắn muốn rời khỏi cuộc họp?")) {
  //       navigate(-1);
  //     }
  //   };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Bắt đầu ghi âm audio từ micro bằng RecordRTC
  const startRecordRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new RecordRTCPromisesHandler(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTCPromisesHandler.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
      });
      recorderRef.current = recorder;
      await recorder.startRecording();
      console.log("Bắt đầu ghi âm audio định dạng WAV");
      // toast.success("Bắt đầu ghi âm audio từ micro (WAV)", {
      //   duration: 3000,
      //   position: "top-right",
      // });
    } catch (error) {
      console.error('Lỗi khi khởi tạo ghi âm:', error);
      // toast.error("Không thể truy cập micro để ghi âm!", {
      //   duration: 4000,
      //   position: "top-right",
      // });
    }
  };

  const stopRecordRTC = async () => {
    if (recorderRef.current) {
      const recorder = recorderRef.current as any;
      await recorder.stopRecording();
      const blob = await recorder.getBlob();

      console.log("RecordRTC blob info:", {
        size: blob.size,
        type: blob.type
      });

      // Luôn sử dụng extension .wav vì đã cấu hình mimeType là audio/wav
      const fileName = `${meetingId}.wav`;
      const file = new File([blob], fileName, { type: "audio/wav" });

      console.log("File created:", {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("accessToken");
      const apiUrl = `https://apisns.imt.org.vn/api/media/upload/${meetingId}`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });
        if (response.ok) {
          toast.success("Đã upload file ghi âm WAV lên server!", {
            duration: 4000,
            position: "top-right",
          });
        } else {
          toast.error("Upload file ghi âm WAV thất bại!", {
            duration: 4000,
            position: "top-right",
          });
        }
      } catch (err) {
        toast.error("Lỗi khi upload file ghi âm WAV!", {
          duration: 4000,
          position: "top-right",
        });
        console.error("Upload error:", err);
      }

      recorderRef.current = null;
    } else {
      console.log("recorderRef.current is null, không thể upload file audio!");
    }
  };

  useEffect(() => {
    const handleUnload = () => {
      if (recorderRef.current) {
        stopRecordRTC();
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Đang chuẩn bị cuộc họp...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {formatMeetingName(name)}
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {participantCount} người tham gia
                </p>
                {isMeetingStarted && (
                  <p className="text-sm text-muted-foreground">
                    Thời gian còn lại: {formatTime(timeLeft)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isFullscreen
                      ? "M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15H4.5M15 15h4.5M9 15v4.5"
                      : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)]">
        <div id="jitsi-container" className="w-full h-full"></div>
      </div>
    </div>
  );
};

export default VideoCall;
