export interface Prompt {
  id: string;
  text: string;
  category: Category;
}

export type Category = 'story' | 'art' | 'coding' | 'startup' | 'content' | 'random';

export const CATEGORIES = [
  { id: 'story', label: 'Story Writing', icon: 'BookOpen', color: 'from-blue-500 to-indigo-600' },
  { id: 'art', label: 'AI Art', icon: 'Palette', color: 'from-purple-500 to-pink-600' },
  { id: 'coding', label: 'Coding Projects', icon: 'Code', color: 'from-emerald-500 to-teal-600' },
  { id: 'startup', label: 'Startup Ideas', icon: 'Rocket', color: 'from-orange-500 to-red-600' },
  { id: 'content', label: 'Content Creation', icon: 'Youtube', color: 'from-rose-500 to-pink-600' },
  { id: 'random', label: 'Surprise Me!', icon: 'Sparkles', color: 'from-indigo-500 via-purple-500 to-pink-500' },
] as const;

export const PROMPTS: Prompt[] = [
  // Story Writing
  { id: 's1', category: 'story', text: "Write a short story about a robot chef opening a restaurant on Mars where the only ingredient available is red dust." },
  { id: 's2', category: 'story', text: "A detective who can talk to ghosts is hired to solve the murder of a man who hasn't died yet." },
  { id: 's3', category: 'story', text: "In a world where memories can be traded like currency, a young girl discovers a memory that doesn't belong to anyone." },
  { id: 's4', category: 'story', text: "The last tree on Earth starts speaking, but it only speaks in riddles about the future." },
  { id: 's5', category: 'story', text: "An astronaut discovers a library at the edge of the universe containing every book ever written, and every book never written." },
  
  // AI Art
  { id: 'a1', category: 'art', text: "Design a futuristic cyberpunk city with neon lights and flying cars, seen from the perspective of a street cat." },
  { id: 'a2', category: 'art', text: "A surreal portrait of a person whose hair is made of swirling galaxies and eyes are glowing nebulae." },
  { id: 'a3', category: 'art', text: "An ancient underwater temple reclaimed by bioluminescent coral and giant mechanical jellyfish." },
  { id: 'a4', category: 'art', text: "A steampunk version of a modern smartphone, made of brass, gears, and tiny steam vents." },
  { id: 'a5', category: 'art', text: "A floating island in the sky with a waterfall that flows upwards into a giant crystal sun." },

  // Coding
  { id: 'c1', category: 'coding', text: "Build a small project using JavaScript that solves a daily problem, like a 'Decision Fatigue' reducer for choosing dinner." },
  { id: 'c2', category: 'coding', text: "Create a mobile app idea that helps students manage their time using a gamified RPG system." },
  { id: 'c3', category: 'coding', text: "Develop a browser extension that replaces all negative news headlines with pictures of baby animals." },
  { id: 'c4', category: 'coding', text: "Design a CSS-only animation of a solar system where each planet represents a different programming language." },
  { id: 'c5', category: 'coding', text: "Write a Python script that analyzes your most used emojis and generates a 'mood of the month' report." },

  // Startup
  { id: 'st1', category: 'startup', text: "A subscription service that sends you a 'mystery hobby kit' every month to help people find new passions." },
  { id: 'st2', category: 'startup', text: "An AI-powered platform that connects local farmers directly with urban residents for same-day harvest delivery." },
  { id: 'st3', category: 'startup', text: "A virtual reality workspace that mimics famous historical libraries to boost deep focus and productivity." },
  { id: 'st4', category: 'startup', text: "A smart mirror that gives you fashion advice based on your calendar events and the current weather." },
  { id: 'st5', category: 'startup', text: "A platform for 'micro-mentorship' where experts give 5-minute advice sessions for a small fee." },

  // Content Creation
  { id: 'cc1', category: 'content', text: "Generate a YouTube video idea explaining AI in simple terms using only kitchen appliances as metaphors." },
  { id: 'cc2', category: 'content', text: "Create a TikTok series where you 'debug' real-life situations like they are pieces of broken code." },
  { id: 'cc3', category: 'content', text: "Write a script for a 60-second podcast episode about the history of the most useless invention ever made." },
  { id: 'cc4', category: 'content', text: "Design a social media challenge that encourages people to take photos of 'hidden faces' in everyday objects." },
  { id: 'cc5', category: 'content', text: "A blog post series titled 'The Future of X' where you predict how mundane things like socks will evolve in 100 years." },
];

export const BACKGROUND_MUSIC = [
  { title: 'Cyberpunk City', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73056.mp3' },
  { title: 'Energetic Hip Hop', url: 'https://cdn.pixabay.com/audio/2021/11/23/audio_030588649b.mp3' },
  { title: 'Modern Phonk', url: 'https://cdn.pixabay.com/audio/2023/09/18/audio_1031304f32.mp3' },
  { title: 'Action Rock', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
  { title: 'Digital World', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783cd5a651.mp3' },
  { title: 'Future Bass', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3' },
  { title: 'Street Drive', url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c6ff1ecd.mp3' }
];
