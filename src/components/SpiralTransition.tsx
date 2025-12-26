interface SpiralTransitionProps {
  onComplete: () => void;
}

export function SpiralTransition({ onComplete }: SpiralTransitionProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onAnimationEnd={onComplete}
    >
      <div className="spiral-container">
        <div className="spiral"></div>
      </div>
      <style>{`
        .spiral-container {
          width: 200px;
          height: 200px;
          position: relative;
        }

        .spiral {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: #f59e0b;
          border-right-color: #ef4444;
          animation: spiral-spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes spiral-spin {
          0% {
            transform: rotate(0deg) scale(0.1);
            opacity: 0;
          }
          50% {
            transform: rotate(360deg) scale(1.5);
            opacity: 1;
          }
          100% {
            transform: rotate(720deg) scale(0.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
