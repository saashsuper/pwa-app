import React, { useState, useRef, useEffect } from 'react';

interface DragToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: 'warning' | 'success' | 'primary';
  id?: string;
  height?: string;
}

const DragToggle: React.FC<DragToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  variant = 'primary',
  id,
  height = '2rem',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const toggleRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const variantColors = {
    primary: { checked: '#0d6efd', unchecked: '#dee2e6' },
    warning: { checked: '#ffc107', unchecked: '#dee2e6' },
    success: { checked: '#198754', unchecked: '#dee2e6' },
  };

  const currentColor = variantColors[variant];
  const thumbSize = '1.75rem';
  const thumbSizePx = 28; // 1.75rem = 28px
  const padding = 4; // 0.25rem padding on each side

  // Calculate max position based on actual element width
  const updatePosition = () => {
    if (!toggleRef.current) return;
    const trackWidth = toggleRef.current.offsetWidth;
    const maxPosition = trackWidth - thumbSizePx - padding * 2;
    
    if (!isDragging) {
      setDragPosition(checked ? maxPosition : 0);
    }
    return maxPosition;
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [checked, isDragging]);

  const handleStart = (clientX: number) => {
    if (disabled || !toggleRef.current) return;
    setIsDragging(true);
    const rect = toggleRef.current.getBoundingClientRect();
    const trackWidth = rect.width;
    const maxPosition = trackWidth - thumbSizePx - padding * 2;
    const currentPos = checked ? maxPosition : 0;
    setDragPosition(currentPos);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || !toggleRef.current) return;
    
    const rect = toggleRef.current.getBoundingClientRect();
    const trackWidth = rect.width;
    const maxPosition = trackWidth - thumbSizePx - padding * 2;
    const newPosition = clientX - rect.left - thumbSizePx / 2;
    const clampedPosition = Math.max(0, Math.min(maxPosition, newPosition));
    setDragPosition(clampedPosition);
  };

  const handleEnd = () => {
    if (!isDragging || disabled || !toggleRef.current) return;
    
    setIsDragging(false);
    const trackWidth = toggleRef.current.offsetWidth;
    const maxPosition = trackWidth - thumbSizePx - padding * 2;
    const threshold = maxPosition / 2;
    const newChecked = dragPosition > threshold;
    
    if (newChecked !== checked) {
      onChange(newChecked);
    } else {
      // Reset position if not crossed threshold
      setDragPosition(checked ? maxPosition : 0);
    }
  };

  // Set up touch event listeners with non-passive option
  useEffect(() => {
    const element = toggleRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [disabled]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragPosition, checked, disabled]);

  const trackWidth = toggleRef.current?.offsetWidth || 0;
  const maxPosition = trackWidth > 0 ? trackWidth - thumbSizePx - padding * 2 : 0;
  const leftPosition = isDragging ? dragPosition : (checked ? maxPosition : 0);

  return (
    <div
      ref={toggleRef}
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX);
      }}
      style={{
        width: '100%',
        height: height,
        backgroundColor: checked && !isDragging ? currentColor.checked : currentColor.unchecked,
        borderRadius: '0.25rem',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'grab',
        border: `1px solid ${checked && !isDragging ? currentColor.checked : '#adb5bd'}`,
        transition: isDragging ? 'none' : 'background-color 0.2s ease, border-color 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
    >
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          width: thumbSize,
          height: thumbSize,
          backgroundColor: '#fff',
          borderRadius: '0.125rem',
          top: '50%',
          left: `${Math.max(0, Math.min(100, (leftPosition / Math.max(1, trackWidth)) * 100))}%`,
          transform: 'translateY(-50%)',
          transition: isDragging ? 'none' : 'left 0.2s ease',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.15)',
          marginLeft: '0.25rem',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default DragToggle;
