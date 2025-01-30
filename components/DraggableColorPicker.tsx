'use client';

import { useAtom } from 'jotai';
import { SketchPicker } from 'react-color';
import Draggable from 'react-draggable';
import { useState, useRef, useEffect } from 'react';
import { backgroundColorAtom, colorPickerPositionAtom } from '@/app/atoms/color';
import { useTheme } from 'next-themes';

export const DraggableColorPicker = () => {
  const [color, setColor] = useAtom(backgroundColorAtom);
  const [pickerPosition, setPickerPosition] = useAtom(colorPickerPositionAtom);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const nodeRef = useRef(null);
  const { theme } = useTheme();

  // Update the Tailwind CSS variable dynamically
  useEffect(() => {
    document.documentElement.style.setProperty('--background', color);
    localStorage.setItem(`background-${theme}`, color); // Persist color per theme
  }, [color, theme]);

  // Load saved background color when component mounts
  useEffect(() => {
    const savedColor = localStorage.getItem(`background-${theme}`);
    if (savedColor) {
      setColor(savedColor);
      document.documentElement.style.setProperty('--background', savedColor);
    }
  }, [theme, setColor]);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pickerPosition}
      onStop={(_, data) => setPickerPosition({ x: data.x, y: data.y })}
      bounds="parent"
      handle=".draggable-handle"
    >
      <div ref={nodeRef} className="fixed z-50 cursor-grab">
        {/* Toggle Button */}
        <button
          className="p-2 bg-gray-900 text-white rounded-md shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          🎨 Pick Color
        </button>

        {/* Color Picker */}
        {isOpen && (
          <div className="absolute top-12 left-0 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg">
            <SketchPicker
              color={color}
              onChange={(updatedColor) => setColor(updatedColor.hex)}
            />
          </div>
        )}
      </div>
    </Draggable>
  );
};
