import React, { useRef, useEffect } from 'react';

const SiriWidget: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        const baseRadius = 150;
        const points = 200;
        const amplitude = 15;

        const harmonics = 5;
        const frequencies = Array.from({ length: harmonics }, (_, h) => h + 1);
        const amplitudes = Array.from({ length: harmonics }, (_, h) => 1 / (h + 1));
        const phases = Array.from({ length: harmonics }, () => Math.random() * Math.PI * 2);
        const speeds = Array.from({ length: harmonics }, () => 0.001 + 0.001 * Math.random());

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

        let animationFrameId: number;

        const drawWidget = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const pulseAmplitude = 5;
            const pulseFrequency = 0.001;
            const pulsedRadius = baseRadius + pulseAmplitude * Math.sin(time * pulseFrequency);
            const maxRadius = baseRadius + pulseAmplitude + amplitude;

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

            ctx.fillStyle = gradient;
            ctx.shadowColor = animatedColor;
            ctx.shadowBlur = 20;

            ctx.beginPath();
            let firstX = 0, firstY = 0;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                let deformation = 0;
                for (let h = 0; h < harmonics; h++) {
                    deformation += amplitudes[h] * Math.sin(frequencies[h] * angle + phases[h] + time * speeds[h]);
                }
                const r = pulsedRadius + amplitude * deformation;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (i === 0) {
                    firstX = x;
                    firstY = y;
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.lineTo(firstX, firstY);
            ctx.closePath();

            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.stroke();

            animationFrameId = requestAnimationFrame(drawWidget);
        };

        animationFrameId = requestAnimationFrame(drawWidget);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
        />
    );
};

export default SiriWidget;
