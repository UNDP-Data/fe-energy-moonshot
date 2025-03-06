import React, { useEffect, useRef, useState } from 'react';

interface LabelProps {
  text: string;
  backgroundColor?: string;
  className?: string;
  refresh?: number;
}

const Label: React.FC<LabelProps> = ({
  className = '',
  backgroundColor = 'transparent',
  text,
  refresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const timeoutId = useRef<any>(-1);

  const converter = (string: string) => {
    if (string === 'Medium') return 'Lower-Middle';
    if (string === 'High') return 'Upper-Middle';
    if (string === 'Very High') return 'High';
    return string;
  };

  useEffect(() => {
    const checkOverflow = () => {
      clearTimeout(timeoutId.current);
      const container = containerRef.current;
      const textElement = textRef.current;
      if (container && textElement) {
        setIsOverflow(textElement.scrollWidth > container.clientWidth);
      }
    };

    checkOverflow();

    timeoutId.current = setTimeout(checkOverflow, 500); // Delayed check to ensure correct width

    // Optional: Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, refresh]);

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
