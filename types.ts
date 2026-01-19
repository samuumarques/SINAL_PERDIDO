import React from 'react';

export type Day = 1 | 2 | 3;

export type WindowId = 
  | 'messenger' 
  | 'browser' 
  | 'image_viewer' 
  | 'backup_viewer' 
  | 'logs' 
  | 'audio_player' 
  | 'phone' 
  | 'diary'
  | 'intruder'
  | 'email'
  | 'notepad'
  | 'my_computer'
  | 'recycle_bin';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { w: number; h: number };
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PuzzleState {
  emailRead: boolean;
  articleFound: boolean;
  commentsUnlocked: boolean;
  desaparecidaFound: boolean;
  imageDecrypted: boolean;
  audioSequenceSolved: boolean;
  logsDecrypted: boolean;
  backupDecrypted: boolean;
}

export type PuzzleWord = 'INACTIVE' | 'MEDO' | 'AJUDA' | 'COMPLETE';

export interface MobilePuzzleState {
    currentWord: PuzzleWord;
    typed: string;
}

export interface GameState {
  day: Day;
  puzzles: PuzzleState;
  glitchLevel: number;
  systemIntegrity: number;
  currentNode: string;
  diaryContent: string;
}

export interface DialogueNode {
  npc?: string;
  npcSequence?: { text?: string; action?: string; code?: string; delay?: number }[];
  choices: {
    text: string;
    nextNode: string;
    action?: string;
    requiredPuzzle?: keyof PuzzleState;
    isWrong?: boolean;
  }[];
}