import { atom } from 'jotai';

// Stores the selected background color
export const backgroundColorAtom = atom<string>('#ffffff');

// Stores the position of the draggable color picker
export const colorPickerPositionAtom = atom<{ x: number; y: number }>({ x: 50, y: 50 });
