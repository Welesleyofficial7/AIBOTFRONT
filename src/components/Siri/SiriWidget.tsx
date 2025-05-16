import React, { useRef, useEffect, useState } from 'react';

const SiriWidget: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isListening, setIsListening] = useState(false);
    const isListeningRef = useRef(isListening);

    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = 150; // For the main Siri shape
        const points = 200;
        const mainShapeAmplitude = 15;

        const harmonics = 7;
        const frequencies = Array.from({ length: harmonics }, (_, h) => h + 1);
        const amplitudesArr = Array.from({ length: harmonics }, (_, h) => 1 / (h + 1));
        const phases = Array.from({ length: harmonics }, () => Math.random() * Math.PI * 2);
        const speeds = Array.from({ length: harmonics }, () => 0.002 + 0.002 * Math.random());

        const siriBaseColors = ['#0A84FF', '#5AC8FA'];

        function hexToRgb(hex: string) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            const num = parseInt(hex, 16);
            return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
        }
        function rgbToHex(r: number, g: number, b: number) {
            return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        }
        function blendColors(color1: string, color2: string, factor: number) {
            const c1 = hexToRgb(color1);
            const c2 = hexToRgb(color2);
            const r = Math.round(c1.r + (c2.r - c1.r) * factor);
            const g = Math.round(c1.g + (c2.g - c1.g) * factor);
            const b = Math.round(c1.b + (c2.b - c1.b) * factor);
            return rgbToHex(r, g, b);
        }
        function easeInOutCubic(t: number): number {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        function getAnimatedColor(colors: string[], offset: number, phase: number): string {
            const totalPhase = (phase + offset) % 1;
            const scaled = totalPhase * colors.length;
            const index = Math.floor(scaled) % colors.length;
            const nextIndex = (index + 1) % colors.length;
            const rawBlend = scaled - index;
            const blendFactor = easeInOutCubic(rawBlend);
            return blendColors(colors[index], colors[nextIndex], blendFactor);
        }

        const particles: {
            angle: number;
            speed: number;
            targetOrbitRadius: number; // Renamed from baseRadius
            targetSize: number;
            appearFactor: number;
        }[] = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.01,
                targetOrbitRadius: 50 + Math.random() * 100, // The orbit radius when fully appeared
                targetSize: 2 + Math.random() * 3,
                appearFactor: 0,
            });
        }

        let animationFrameId: number;
        const APPEAR_FADE_SPEED = 0.05;
        const PARTICLE_SOUND_RADIUS_SENSITIVITY = 25; // How much sound affects particle orbit radius

        const drawWidget = (time: number) => {
            if (!ctx || !canvasRef.current) return;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            let soundLevel = 0;
            if (analyserRef.current) {
                const analyser = analyserRef.current;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
                soundLevel = average / 255;
            }

            const pulseAmplitude = 10 + 20 * soundLevel;
            const pulseFrequency = 0.001;
            const pulsedRadius = baseRadius + pulseAmplitude * Math.sin(time * pulseFrequency);
            const dynamicAmplitude = mainShapeAmplitude + 30 * soundLevel;
            const maxRadius = baseRadius + pulseAmplitude + dynamicAmplitude;

            const gradient = ctx.createRadialGradient(
                centerX, centerY, pulsedRadius * 0.1,
                centerX, centerY, maxRadius
            );

            const cycleDuration = 10000;
            const globalPhase = (time % cycleDuration) / cycleDuration;
            const animatedColor = getAnimatedColor(siriBaseColors, 0, globalPhase);

            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.5, animatedColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

            ctx.shadowColor = animatedColor;
            ctx.shadowBlur = 20 + 30 * soundLevel;

            const auraLayers = 3;
            for (let layer = 0; layer < auraLayers; layer++) {
                const layerFactor = (layer + 1) / auraLayers;
                const layerRadius = pulsedRadius * (1 + layerFactor * (0.5 + soundLevel));
                const layerOpacity = 0.1 * (1 - layerFactor) * (0.5 + soundLevel);

                ctx.beginPath();
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    let deformation = 0;
                    for (let h = 0; h < harmonics; h++) {
                        deformation += amplitudesArr[h] * Math.sin(frequencies[h] * angle + phases[h] + time * speeds[h]);
                    }
                    const r = layerRadius + dynamicAmplitude * deformation;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = `rgba(0, 0, 0, ${layerOpacity})`;
                ctx.fill();
            }

            ctx.beginPath();
            let firstX = 0, firstY = 0;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                let deformation = 0;
                for (let h = 0; h < harmonics; h++) {
                    deformation += amplitudesArr[h] * Math.sin(frequencies[h] * angle + phases[h] + time * speeds[h]);
                }
                const r = pulsedRadius + dynamicAmplitude * deformation;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (i === 0) {
                    firstX = x; firstY = y;
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.lineTo(firstX, firstY);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.stroke();

            // Update and Render Particles
            ctx.shadowColor = animatedColor;
            ctx.shadowBlur = 10 + 20 * soundLevel;

            particles.forEach(particle => {
                if (isListeningRef.current) {
                    particle.appearFactor = Math.min(1, particle.appearFactor + APPEAR_FADE_SPEED);
                } else {
                    particle.appearFactor = Math.max(0, particle.appearFactor - APPEAR_FADE_SPEED);
                }

                particle.angle += particle.speed * (1 + soundLevel);

                if (particle.appearFactor > 0) {
                    const easedAppearFactor = easeInOutCubic(particle.appearFactor);
                    const currentSize = particle.targetSize * easedAppearFactor;
                    const currentOpacity = (0.3 + soundLevel * 0.7) * easedAppearFactor;

                    // Particles fly out from center: current orbit radius depends on appearFactor
                    const currentBaseOrbitRadius = particle.targetOrbitRadius * easedAppearFactor;
                    // Sound effect on radius also scales with appearance
                    const soundEffectOnRadius = soundLevel * PARTICLE_SOUND_RADIUS_SENSITIVITY * easedAppearFactor;
                    const finalOrbitRadius = currentBaseOrbitRadius + soundEffectOnRadius;

                    const x = centerX + finalOrbitRadius * Math.cos(particle.angle);
                    const y = centerY + finalOrbitRadius * Math.sin(particle.angle);

                    ctx.beginPath();
                    ctx.arc(x, y, currentSize, 0, Math.PI * 2);
                    const color = hexToRgb(animatedColor);
                    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, Math.min(1, currentOpacity))})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(drawWidget);
        };
        animationFrameId = requestAnimationFrame(drawWidget);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        const closeAudioContext = async () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                await audioContextRef.current.close().catch(e => console.error("Error closing audio context", e));
            }
            audioContextRef.current = null;
            analyserRef.current = null;
        };

        if (isListening) {
            const startAudio = async () => {
                try {
                    await closeAudioContext();
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    const newAudioContext = new AudioContext();
                    audioContextRef.current = newAudioContext;
                    const source = newAudioContext.createMediaStreamSource(stream);
                    const analyser = newAudioContext.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    analyserRef.current = analyser;
                } catch (error) {
                    console.error('Error accessing microphone:', error);
                    setIsListening(false);
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                        streamRef.current = null;
                    }
                    await closeAudioContext();
                }
            };
            startAudio();
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            closeAudioContext();
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            closeAudioContext();
        };
    }, [isListening]);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
            onClick={() => setIsListening(prev => !prev)}
        />
    );
};

export default SiriWidget;