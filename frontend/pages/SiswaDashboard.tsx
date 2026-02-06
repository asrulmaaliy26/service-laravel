
import React, { useState, useEffect, useRef } from 'react';
import { User, Exam, StudentActivity, QuestionType, Answer } from '../types';
import { Clock, Play, AlertCircle, Maximize2, Camera, ShieldAlert, MonitorCheck, ArrowRight, VideoOff, ImageIcon, X, Paperclip, FileText, Download, ArrowLeft, ScanSearch, BookOpen } from 'lucide-react';
import { getBackendUrl } from '../config';

interface SiswaDashboardProps {
  user: User;
  exams: Exam[];
  setActivities: React.Dispatch<React.SetStateAction<StudentActivity[]>>;
  activities: StudentActivity[]; // Needed to listen for remote status changes
  externalExamUrl?: string | null;
  returnUrl?: string | null;
  externalExamId?: string | null;
  externalExamTitle?: string | null;
  externalExamType?: string | null;
}

const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ user, exams, setActivities, activities, externalExamUrl, returnUrl, externalExamId, externalExamTitle, externalExamType }) => {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [suspiciousAlert, setSuspiciousAlert] = useState<string | null>(null);
  const [violationLogs, setViolationLogs] = useState<{ time: string, msg: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const noMotionCounterRef = useRef<number>(0);
  const localNoFaceCountRef = useRef<number>(0);
  const localTabSwitchCountRef = useRef<number>(0);
  const localFullscreenExitCountRef = useRef<number>(0);
  const localAppSwitchCountRef = useRef<number>(0);
  const motionDetectionIntervalRef = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isUploadingRef = useRef(false);


  const saveViolation = async (reason: string, detail: string) => {
    const examId = activeExam?.id || externalExamId;
    if (!examId) return;

    let type = 'UTS';
    if (activeExam) {
      if (activeExam.type === 'UAS') type = 'UAS';
    } else if (externalExamType) {
      if (typeof externalExamType === 'string' && externalExamType.toUpperCase().includes('UAS')) type = 'UAS';
    }

    try {
      await fetch(`${getBackendUrl()}/api/violations/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'exam_id': examId,
          'type': type,
          'note': `[${reason}] ${detail}`
        })
      });
    } catch (e) {
      console.error("Failed to save violation log", e);
    }
  };



  // Timer State
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds

  const isCameraReady = !!stream;
  const classExams = exams.filter(e => e.className === user.class);

  // Timer Logic
  useEffect(() => {
    if (!isExamStarted || !externalExamUrl) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("WAKTU HABIS! Ujian akan dikumpulkan otomatis.");
          handleBackToDashboard();
          return 0;
        }
        // WARNINGS
        if (prev === 15 * 60) alert("PERINGATAN: Waktu tinggal 15 Menit!");
        if (prev === 5 * 60) alert("PERINGATAN: Waktu tinggal 5 Menit!");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, externalExamUrl]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Motion Detection Engine
  useEffect(() => {
    if (!isExamStarted || !stream || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 64;
    canvas.height = 48;

    const detectMotion = () => {
      if (!ctx || !videoRef.current) return;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      if (lastFrameDataRef.current) {
        let diff = 0;
        const lastFrame = lastFrameDataRef.current;

        for (let i = 0; i < currentFrame.length; i += 8) {
          const rDiff = Math.abs(currentFrame[i] - lastFrame[i]);
          const gDiff = Math.abs(currentFrame[i + 1] - lastFrame[i + 1]);
          const bDiff = Math.abs(currentFrame[i + 2] - lastFrame[i + 2]);
          if (rDiff + gDiff + bDiff > 40) diff++;
        }

        const motionThreshold = 20;
        if (diff < motionThreshold) {
          noMotionCounterRef.current += 1;
        } else {
          noMotionCounterRef.current = 0;
        }

        // COMING SOON: Commented out face detection as requested
        /*
        if (noMotionCounterRef.current > 20) {
          localNoFaceCountRef.current += 1;
          setSuspiciousAlert('PERINGATAN: Wajah/Pergerakan tidak terdeteksi!');
          setActivities(prev => {
            const existing = prev.find(a => a.studentId === user.id);
            if (existing) {
              return prev.map(a => a.studentId === user.id ? { ...a, status: 'SUSPICIOUS', violationReason: 'No Movement/Person Detected', noFaceCount: localNoFaceCountRef.current } : a);
            }
            return prev;
          });
          saveViolation('NO_FACE', 'Wajah/Pergerakan tidak terdeteksi selama 10 detik.');
          noMotionCounterRef.current = 0;
        }
        */
      }

      lastFrameDataRef.current = currentFrame;
    };

    motionDetectionIntervalRef.current = window.setInterval(detectMotion, 500);
    return () => { if (motionDetectionIntervalRef.current) clearInterval(motionDetectionIntervalRef.current); };
  }, [isExamStarted, stream, user.id, setActivities]);

  // Tab Switching, Focus, and Fullscreen Detection
  useEffect(() => {
    if (!isExamStarted) return;

    // 1. Tab Switching (Already Existing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH', 'Mahasiswa meninggalkan halaman ujian (Pindah Tab/Minimize).');
      }
    };

    // 2. Fullscreen Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('EXIT_FULLSCREEN', 'Mahasiswa keluar dari mode Fullscreen.');
      }
    };

    // 3. Window Blur (Application Switching)
    const handleWindowBlur = () => {
      // FIX: Wait a bit and check if focus moved to iframe
      setTimeout(() => {
        if (document.activeElement instanceof HTMLIFrameElement) {
          console.log("Focus moved to iframe, ignoring APP_SWITCH violation.");
          return;
        }
        if (!document.hidden) {
          handleViolation('APP_SWITCH', 'Mahasiswa meninggalkan jendela ujian (Membuka App Lain/Word).');
        }
      }, 100);
    };

    // 4. Tracking Link Clicks (New Tab / External)
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        const targetAttr = anchor.getAttribute('target');
        if (targetAttr === '_blank' || (href && href.startsWith('http') && !href.includes(window.location.host))) {
          handleViolation('OPEN_LINK', `Mahasiswa mencoba membuka link eksternal: ${href}`);
        }
      }
    };

    // Helper to handle violations updates state and saves to DB/Iframe
    const handleViolation = (type: string, detail: string) => {
      // SKIP VIOLATION IF UPLOADING FILE
      if (isUploadingRef.current) {
        console.log(`Skipping violation ${type} because student is uploading a file.`);
        return;
      }

      // SILENT TRACKING: No more setSuspiciousAlert calls as requested.
      // We only log it to the UI panel and send to backend.

      if (type === 'TAB_SWITCH') localTabSwitchCountRef.current += 1;
      if (type === 'EXIT_FULLSCREEN') localFullscreenExitCountRef.current += 1;
      if (type === 'APP_SWITCH' || type === 'OPEN_LINK') localAppSwitchCountRef.current += 1;

      setViolationLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: detail }, ...prev].slice(0, 10));

      setActivities(prev => prev.map(a => {
        if (a.studentId === user.id) {
          return {
            ...a,
            status: 'SUSPICIOUS',
            violationReason: detail,
            tabSwitchCount: localTabSwitchCountRef.current + localFullscreenExitCountRef.current + localAppSwitchCountRef.current
          }
        }
        return a;
      }));

      saveViolation(type, detail);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      saveViolation('CONTEXT_MENU', 'Mahasiswa mencoba membuka menu klik kanan.');
      return false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleLinkClick);
    };
  }, [isExamStarted, user.id, setActivities]);

  // Post Message to Iframe when stats change or violation occurs
  useEffect(() => {
    if (!externalExamUrl || !isExamStarted) return;

    const sendStats = () => {
      const payload = {
        tabSwitchCount: localTabSwitchCountRef.current,
        fullscreenExitCount: localFullscreenExitCountRef.current,
        appSwitchCount: localAppSwitchCountRef.current,
        noFaceCount: localNoFaceCountRef.current,
        totalViolation: localTabSwitchCountRef.current + localFullscreenExitCountRef.current + localAppSwitchCountRef.current + localNoFaceCountRef.current
      };

      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'VIOLATION_UPDATE', payload }, '*');
      }
    };

    // Listen for file upload messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FILE_UPLOAD_START') {
        console.log("File upload started in iframe - suspending proctoring.");
        setIsUploading(true);
        isUploadingRef.current = true;
        saveViolation('UPLOAD_START', 'Mahasiswa mulai mengunggah file.');
      } else if (event.data && event.data.type === 'FILE_UPLOAD_END') {
        console.log("File upload finished in iframe - resuming proctoring.");
        setIsUploading(false);
        isUploadingRef.current = false;

        if (event.data.fileName) {
          setViolationLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `Berhasil upload file: ${event.data.fileName}` }, ...prev].slice(0, 10));
          saveViolation('UPLOAD_SUCCESS', `Mahasiswa berhasil mengunggah file: ${event.data.fileName}`);
        } else {
          saveViolation('UPLOAD_FINISHED', 'Mahasiswa selesai/menutup panel unggahan file.');
        }

        // Attempt to return to fullscreen if we exited
        setTimeout(() => {
          if (!document.fullscreenElement) {
            console.log("Re-entering fullscreen after file upload.");
            document.documentElement.requestFullscreen().catch(() => { });
          }
        }, 1000);
      } else if (event.data && event.data.type === 'LOG_TRIGGER') {
        saveViolation(event.data.payload.reason, event.data.payload.detail);
      }
    };

    window.addEventListener('message', handleMessage);
    const interval = setInterval(sendStats, 2000);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [externalExamUrl, isExamStarted, activities, user.id]); // Activities dependency ensures we send updated counts


  useEffect(() => {
    if (stream && videoRef.current) { videoRef.current.srcObject = stream; }
  }, [stream, activeExam, isExamStarted]);

  // Auto-start camera on mount for pre-flight if external exam
  useEffect(() => {
    if (externalExamUrl && !isExamStarted && !stream) {
      startCamera();
    }
  }, [externalExamUrl, isExamStarted]);

  // Auto-start camera when entering internal exam detail
  useEffect(() => {
    if (activeExam && !isExamStarted && !stream && !cameraError) {
      startCamera();
    }
  }, [activeExam]);

  // Auto-register presence for external exams
  useEffect(() => {
    if (externalExamUrl && !isExamStarted) {
      const examId = activeExam?.id || externalExamId || 'external-exam';
      setActivities(prev => {
        const exists = prev.find(a => a.studentId === user.id && a.examId === examId);
        if (exists) return prev;

        return [...prev, {
          studentId: user.id,
          examId: examId,
          status: 'ONLINE',
          cameraEnabled: false,
          tabSwitchCount: 0,
          noFaceCount: 0,
          lastSeen: new Date().toISOString()
        }];
      });
    }
  }, [externalExamUrl, isExamStarted, user.id, externalExamId, activeExam, setActivities]);

  const startCamera = async () => {
    try {
      console.log("Meminta akses kamera...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Browser tidak mendukung camera API atau tidak di lingkungan secure (HTTPS/Localhost).";
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 20 }
        },
        audio: false
      });

      console.log("Kamera berhasil diakses:", mediaStream.id);
      setStream(mediaStream);
      setCameraError(false);
      saveViolation('CAMERA_ON', 'Kamera diaktifkan.');
    } catch (err: any) {
      console.error("Gagal akses kamera:", err);
      setCameraError(true);
      setStream(null);

      let friendlyMsg = "Terjadi kesalahan saat mengaktifkan kamera.";
      if (err.name === 'NotAllowedError') friendlyMsg = "Akses kamera ditolak. Silakan izinkan kamera di browser Anda.";
      else if (err.name === 'NotFoundError') friendlyMsg = "Kamera tidak ditemukan pada perangkat Anda.";
      else if (err.name === 'NotReadableError') friendlyMsg = "Kamera sedang digunakan oleh aplikasi lain.";

      alert(friendlyMsg);
      saveViolation('CAMERA_ERROR', `Kesalahan kamera: ${err.name} - ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Track kamera dihentikan:", track.label);
      });
      setStream(null);
      saveViolation('CAMERA_OFF', 'Kamera dimatikan.');
    }
  };

  // Helper untuk memasang stream ke video element secara otomatis
  const attachVideoRef = (el: HTMLVideoElement | null) => {
    if (el) {
      // @ts-ignore
      videoRef.current = el;
      if (stream && el.srcObject !== stream) {
        console.log("Menempelkan stream ke elemen video...");
        el.srcObject = stream;
      }
    }
  };

  const startExam = (exam: Exam) => {
    if (!exam.isActive) return alert('Ujian belum diaktifkan.');
    setActiveExam(exam);
    startCamera();
  };

  const confirmStart = () => {
    if (!isCameraReady && (activeExam?.isCameraRequired || externalExamUrl)) {
      // Allow proceeding but log that camera is missing
      saveViolation('CAMERA_MISSING', 'Mahasiswa masuk ujian tanpa kamera yang terdeteksi.');
    }
    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) { }
    setIsExamStarted(true);
    saveViolation('EXAM_START', 'Mahasiswa memulai ujian.');

    // Add activity record
    setActivities(prev => {
      // Remove old if exists
      const cleaned = prev.filter(a => a.studentId !== user.id);
      return [...cleaned, {
        studentId: user.id,
        examId: activeExam?.id || externalExamId || 'external-exam',
        status: 'ONLINE',
        cameraEnabled: isCameraReady,
        tabSwitchCount: 0,
        noFaceCount: 0,
        lastSeen: new Date().toISOString()
      }];
    });
  };

  const handleBackToDashboard = () => {
    saveViolation('EXAM_END', 'Mahasiswa mengakhiri sesi ujian.');
    stopCamera();
    setActiveExam(null);
    setIsExamStarted(false);
    try { if (document.exitFullscreen) document.exitFullscreen(); } catch (e) { }

    if (externalExamUrl) {
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        window.location.href = '/';
      }
    }
  };

  // --------------------------------------------------------------------------------
  // MODE: EXTERNAL EXAM (IFRAME)
  // --------------------------------------------------------------------------------
  if (externalExamUrl) {
    if (isExamStarted) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex h-screen overflow-hidden font-sans">
          {suspiciousAlert && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-8 py-6 rounded-2xl shadow-2xl text-center border-4 border-white animate-bounce">
              <ShieldAlert size={48} className="mx-auto mb-4" />
              <p className="text-xl font-black uppercase">{suspiciousAlert}</p>
              <p className="mt-2 text-sm opacity-80">Pelanggaran dicatat oleh Proctor AI.</p>
              <button onClick={() => setSuspiciousAlert(null)} className="mt-6 px-6 py-2 bg-white text-red-600 font-bold rounded-lg">Lanjutkan</button>
            </div>
          )}

          {/* LEFT SIDE: SIAKAD IFRAME */}
          <div className="w-3/4 h-full bg-white shadow-2xl relative">
            <iframe
              src={externalExamUrl}
              className="w-full h-full border-0"
              title="Siakad Exam"
              allow="camera; microphone; fullscreen"
            />
            {/* Overlay to catch focus/clicks if needed, but we typically want user to interact with iframe */}
          </div>

          {/* RIGHT SIDE: MONITORING & TOOLS */}
          <div className="w-1/4 h-full bg-slate-900 flex flex-col p-4 gap-4 border-l border-slate-700">
            {/* Camera Feed */}
            <div className="rounded-xl overflow-hidden border-2 border-slate-700 bg-black aspect-video relative shadow-lg">
              <video ref={attachVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black text-emerald-400 uppercase border border-emerald-400/20">
                <ScanSearch size={10} className="animate-pulse" /> Monitoring Aktif
              </div>
            </div>

            {/* Timer */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center shadow-lg">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Sisa Waktu</p>
              <div className={`text-4xl font-black tracking-tighter ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white font-bold text-sm truncate">{user.name}</p>
                  <p className="text-slate-400 text-xs font-mono">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Info / Detection Stats */}
            <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Log Aktivitas</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">Pindah Tab</span>
                  <span className="text-xs font-black text-red-400">{localTabSwitchCountRef.current}x</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">Keluar Fullscreen</span>
                  <span className="text-xs font-black text-red-400">{localFullscreenExitCountRef.current}x</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">Pindah App</span>
                  <span className="text-xs font-black text-red-400">{localAppSwitchCountRef.current}x</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">Wajah Hilang</span>
                  <span className="text-xs font-black text-red-400">{localNoFaceCountRef.current}x</span>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Riwayat Kejadian</p>
                {violationLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic">Belum ada pelanggaran terdeteksi.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {violationLogs.map((log, i) => (
                      <div key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 p-2 rounded leading-tight">
                        <span className="text-red-400 font-bold">[{log.time}]</span> <span className="text-slate-300">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-yellow-500 text-xs text-center leading-relaxed">
                  <span className="font-bold">PERHATIAN:</span><br />
                  Jangan tinggalkan halaman ini. Rekaman kamera dan layar dimonitor secara otomatis.
                </p>
              </div>
            </div>

            {/* Tools Section */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Alat Bantu</p>
              <button
                onClick={() => {
                  window.location.href = 'ms-word:';
                  saveViolation('OPEN_WORD', 'Mahasiswa mencoba membuka aplikasi Microsoft Word.');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-all text-xs font-bold"
              >
                <FileText size={16} /> Buka Microsoft Word
              </button>
            </div>

            <button onClick={handleBackToDashboard} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider">
              Akhiri Ujian
            </button>
          </div>
        </div>
      );
    } else {
      // EXTERNAL EXAM PRE-FLIGHT
      return (
        <div className="max-w-2xl mx-auto space-y-8 py-10">
          <header className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <BookOpen size={48} />
            </div>

            <h2 className="text-3xl font-black text-slate-800">{externalExamTitle || "Ujian Akademik"}</h2>
            <p className="text-slate-500">{externalExamType ? `${externalExamType} - Mode Pengawasan Ketat (Proctoring)` : "Mode Pengawasan Ketat (Proctoring)"}</p>
          </header>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
            <AlertCircle className="text-amber-600 shrink-0" />
            <div className="space-y-2 text-sm text-amber-900">
              <p className="font-bold">Ketentuan Ujian:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Durasi pengerjaan adalah <strong>90 Menit</strong>.</li>
                <li>Wajib menyalakan kamera selama ujian berlangsung.</li>
                <li>Dilarang membuka tab lain atau aplikasi lain.</li>
                <li>Segala bentuk kecurangan akan tercatat otomatis.</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-32 h-24 bg-black rounded-xl overflow-hidden relative shadow-inner">
              {isCameraReady ? (
                <video ref={attachVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-200 bg-slate-800"><Camera size={32} /></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-indigo-900">Pengecekan Kamera</h4>
              <p className="text-sm text-indigo-600 mb-2">{isCameraReady ? 'Kamera aktif dan siap digunakan.' : 'Izinkan akses kamera untuk melanjutkan.'}</p>
              {!isCameraReady && (<button onClick={startCamera} className="text-xs font-black bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">AKTIFKAN KAMERA</button>)}
            </div>
          </div>

          <button
            onClick={confirmStart}
            className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            MULAI UJIAN SEKARANG <ArrowRight />
          </button>

          {!isCameraReady && <p className="text-center text-xs text-slate-400 pb-2">Tombol akan aktif setelah kamera menyala.</p>}
        </div>
        // </div >
      );
    }
  }

  // --------------------------------------------------------------------------------
  // MODE: INTERNAL EXAM (EXISTING CODE)
  // --------------------------------------------------------------------------------

  if (isExamStarted && activeExam) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col h-screen">
        {suspiciousAlert && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-8 py-6 rounded-2xl shadow-2xl text-center border-4 border-white animate-bounce">
            <ShieldAlert size={48} className="mx-auto mb-4" />
            <p className="text-xl font-black uppercase">{suspiciousAlert}</p>
            <p className="mt-2 text-sm opacity-80">Pelanggaran dicatat oleh Proctor AI.</p>
            <button onClick={() => setSuspiciousAlert(null)} className="mt-6 px-6 py-2 bg-white text-red-600 font-bold rounded-lg">Lanjutkan</button>
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 bg-white rounded-tr-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-12 border-b pb-6">
                <div><h1 className="text-3xl font-black text-slate-800">{activeExam.title}</h1><p className="text-slate-500 font-medium">{user.name}</p></div>
                <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 flex items-center gap-4"><Clock className="text-indigo-600" size={24} /><div className="text-right"><p className="text-xs font-bold text-indigo-400 uppercase">Sisa Waktu</p><p className="text-2xl font-black text-indigo-700">01:29:59</p></div></div>
              </div>
              <div className="space-y-12">
                {activeExam.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-6 pb-8 border-b border-slate-50">
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-xl font-bold shrink-0">{idx + 1}</span>
                      <p className="text-xl text-slate-800 font-medium">{q.text}</p>
                    </div>
                    <textarea className="w-full ml-14 p-5 rounded-2xl border-2 border-slate-100 min-h-[150px]" placeholder="Jawaban Anda..." />
                  </div>
                ))}
              </div>
              <div className="mt-12 flex justify-end"><button onClick={handleBackToDashboard} className="px-10 py-4 bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl">Kumpulkan Jawaban</button></div>
            </div>
          </div>
          <div className="w-80 bg-slate-900 p-6 flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-video relative">
              <video ref={attachVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black text-emerald-400 uppercase border border-emerald-400/20">
                <ScanSearch size={10} className="animate-pulse" /> Monitoring Aktif
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Sesi Info</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-300 font-bold"><span>Tab Switch:</span> <span className="text-red-400">0x</span></div>
                <div className="flex justify-between text-[10px] text-slate-300 font-bold"><span>Camera Out:</span> <span className="text-red-400">{localNoFaceCountRef.current}x</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeExam) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-10">
        <button onClick={handleBackToDashboard} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50">
          <ArrowLeft size={20} /> Kembali
        </button>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-8">
          <h2 className="text-3xl font-black text-slate-800">{activeExam.title}</h2>
          <div className="bg-indigo-50 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-24 h-24 bg-black rounded-xl overflow-hidden relative shadow-inner">
              {isCameraReady ? (<video ref={attachVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />) : (<div className="w-full h-full flex items-center justify-center text-indigo-200 bg-slate-800"><Camera size={32} /></div>)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-indigo-900">Validasi Kamera</h4>
              <p className="text-sm text-indigo-600">{isCameraReady ? 'Sudah siap.' : 'Aktifkan kamera untuk mulai.'}</p>
              {!isCameraReady && (<button onClick={startCamera} className="mt-3 text-xs font-black bg-indigo-600 text-white px-4 py-2 rounded-lg">AKTIFKAN</button>)}
            </div>
          </div>
          <button onClick={confirmStart} className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl bg-indigo-600 text-white hover:bg-indigo-700`}>MULAI UJIAN <ArrowRight className="inline ml-2" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div><h2 className="text-2xl font-black text-slate-800">CBT Student Center</h2><p className="text-slate-500">Pilih ujian yang tersedia untuk kelas Anda.</p></div>
      <div className="space-y-4 max-w-2xl">
        {classExams.map(exam => (
          <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
            <div><h4 className="font-bold text-slate-800 text-lg">{exam.title}</h4><p className="text-slate-500 text-sm">{exam.subject} • {exam.durationMinutes} Menit</p></div>
            <button onClick={() => startExam(exam)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${exam.isActive ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white' : 'bg-slate-50 text-slate-300'}`}>MASUK</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiswaDashboard;
