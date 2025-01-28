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

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const textElement = textRef.current;
      if (container && textElement) {
        setIsOverflow(textElement.scrollWidth > container.clientWidth);
      }
    };

    checkOverflow();

    // Optional: Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
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
        style={{ opacity: isOverflow ? 0 : 1, padding: '0 0.25rem' }}
        ref={textRef}
      >
        {text}
      </div>
    </div>
  );
};

export default Label;
