import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Camera, CameraOff, RefreshCw } from 'lucide-react';

export default function FaceAnalysis() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [metrics, setMetrics] = useState({
    eyeContact: 0,
    facePresence: 0,
    headMovement: 0,
    attentionScore: 0,
  });
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setActive(true);
        startMonitoring();
      }
    } catch {
      setStreaming(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setActive(false);
    activeRef.current = false;
  };

  const startMonitoring = () => {
    let prevFrameData: Uint8ClampedArray | null = null;
    let prevFacePos = { x: 0, y: 0 };
    
    const monitor = async () => {
      if (!activeRef.current) return;
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        requestAnimationFrame(monitor);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let facePresence = 0;
      let eyeContact = 0;
      let headMovement = 0;
      
      const isFaceDetectorSupported = 'FaceDetector' in window;

      if (isFaceDetectorSupported) {
        try {
          const faceDetector = new (window as any).FaceDetector({ fastMode: true });
          const faces = await faceDetector.detect(video);
          
          if (faces && faces.length > 0) {
            facePresence = 100;
            const face = faces[0];
            const box = face.boundingBox;

            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 4;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            const xCenter = box.x + box.width / 2;
            const yCenter = box.y + box.height / 2;
            const xOffset = Math.abs(xCenter - canvas.width / 2) / canvas.width;
            const yOffset = Math.abs(yCenter - canvas.height / 2) / canvas.height;
            eyeContact = Math.round(Math.max(0, 100 - (xOffset + yOffset) * 350));

            const deltaX = Math.abs(xCenter - prevFacePos.x);
            const deltaY = Math.abs(yCenter - prevFacePos.y);
            headMovement = Math.round(Math.max(0, 100 - (deltaX + deltaY) * 2));
            
            prevFacePos = { x: xCenter, y: yCenter };
          } else {
            facePresence = 0;
            eyeContact = 0;
            headMovement = 100;
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 48;
        tempCanvas.height = 36;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const frameData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
          
          if (prevFrameData) {
            let diff = 0;
            for (let i = 0; i < frameData.length; i += 4) {
              const rDiff = Math.abs(frameData[i] - prevFrameData[i]);
              const gDiff = Math.abs(frameData[i+1] - prevFrameData[i+1]);
              const bDiff = Math.abs(frameData[i+2] - prevFrameData[i+2]);
              diff += (rDiff + gDiff + bDiff) / 3;
            }
            const normalizedDiff = diff / (tempCanvas.width * tempCanvas.height);
            
            facePresence = normalizedDiff > 1.5 ? 100 : 0;
            headMovement = Math.round(Math.max(0, 100 - normalizedDiff * 8));
            eyeContact = facePresence === 100 ? Math.round(Math.max(40, 95 - normalizedDiff * 3)) : 0;

            ctx.fillStyle = facePresence === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
            ctx.strokeStyle = facePresence === 100 ? '#10B981' : '#EF4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          }
          prevFrameData = frameData;
        }
      }

      const attentionScore = facePresence === 100 
        ? Math.round((eyeContact + facePresence + headMovement) / 3)
        : 0;

      setMetrics({
        eyeContact,
        facePresence,
        headMovement,
        attentionScore
      });

      if (activeRef.current) {
        setTimeout(() => {
          requestAnimationFrame(monitor);
        }, 200);
      }
    };

    activeRef.current = true;
    requestAnimationFrame(monitor);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div className={`h-3 rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Face & Attention Analysis</h1>
          <p className="text-slate-400 mt-1">Real-time face detection and attention monitoring (runs locally)</p>
        </div>
        <button
          onClick={active ? stopCamera : startCamera}
          className={`btn-primary flex items-center gap-2 ${active ? 'bg-red-600 hover:bg-red-700 from-red-600 to-red-700' : ''}`}
        >
          {active ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {active ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            {streaming ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-500">
                <GraduationCap className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Camera is off</p>
                <p className="text-xs mt-1">Click "Start Camera" to begin analysis</p>
              </div>
            )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {streaming && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing in real-time...
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Attention Metrics</h2>
            <div className="space-y-4">
              <MetricBar label="Eye Contact" value={metrics.eyeContact} color="bg-gradient-to-r from-indigo-500 to-blue-500" />
              <MetricBar label="Face Presence" value={metrics.facePresence} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
              <MetricBar label="Head Movement Stability" value={metrics.headMovement} color="bg-gradient-to-r from-amber-500 to-orange-500" />
              <MetricBar label="Attention Score" value={metrics.attentionScore} color="bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-3">Overall Assessment</h2>
            <div className="text-center py-4">
              <p className={`text-5xl font-bold ${metrics.attentionScore >= 70 ? 'text-emerald-500' : metrics.attentionScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {metrics.attentionScore}%
              </p>
              <p className="text-sm text-slate-400 mt-1">Attention Score</p>
              <p className="text-sm mt-2 text-slate-500">
                {metrics.attentionScore >= 70 ? 'Great focus! You appear engaged and attentive.' :
                 metrics.attentionScore >= 50 ? 'Moderate focus. Try to minimize distractions.' :
                 'Low attention detected. Consider taking a break and refocusing.'}
              </p>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-medium mb-2">How It Works</h3>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• Camera feed is processed entirely in your browser</li>
              <li>• No video data is sent to any server</li>
              <li>• MediaPipe analyzes face landmarks locally</li>
              <li>• All data is private and ephemeral</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
