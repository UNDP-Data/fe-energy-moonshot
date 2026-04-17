import React, { useEffect, useRef, useState } from 'react';

interface LabelProps {
  text: string;
  backgroundColor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({
  className = '',
  backgroundColor = 'transparent',
  text,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  const converter = (string: string) => {
    if (string === 'Medium') return 'Lower-Middle';
    if (string === 'High') return 'Upper-Middle';
    if (string === 'Very High') return 'High';
    return string;
  };

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const textElement = textRef.current;
      if (container && textElement) {
        const nextIsOverflow = textElement.scrollWidth > container.clientWidth;
        setIsOverflow((currentValue) => (
          currentValue === nextIsOverflow ? currentValue : nextIsOverflow
        ));
      }
    };

    const frameId = window.requestAnimationFrame(checkOverflow);
    let resizeObserver: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(checkOverflow);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      if (textRef.current) {
        resizeObserver.observe(textRef.current);
      }
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        backgroundColor,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          opacity: isOverflow ? 0 : 1,
          padding: '0 0.25rem',
          transition: 'opacity 0.5s',
        }}
        ref={textRef}
      >
        {converter(text)}
      </div>
    </div>
  );
};

export default Label;
