import { atom } from 'jotai';

export const backgroundColorAtom = atom<string>('#ffffff');

export const colorPickerPositionAtom = atom<{ x: number; y: number }>({ x: 50, y: 50 });
