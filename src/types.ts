/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  cover: string;
  color: string;
}

export const PLAYLIST: Song[] = [
  {
    id: '1',
    title: 'PROTOCOL_A.V2',
    artist: 'SYS_DAEMON',
    duration: 184,
    cover: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=400&fit=crop',
    color: '#00FFFF',
  },
  {
    id: '2',
    title: 'KERNEL_LOG_ERR',
    artist: 'CORE_DUMP',
    duration: 215,
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
    color: '#FF00FF',
  },
  {
    id: '3',
    title: 'NULL_POINTER',
    artist: 'ST@CK_OVERFLOW',
    duration: 168,
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    color: '#00FFFF',
  },
];

export interface Point {
  x: number;
  y: number;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export const DIFFICULTY_SETTINGS = {
  EASY: { initialSpeed: 180, increment: 0.8 },
  MEDIUM: { initialSpeed: 140, increment: 1.2 },
  HARD: { initialSpeed: 90, increment: 1.8 },
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
