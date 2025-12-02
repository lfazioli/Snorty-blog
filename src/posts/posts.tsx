import Post1 from './Post1'; // ← senza .tsx

export const posts = [
  {
    slug: "kali-virtualbox",
    title: "⚡ Kali Linux on VirtualBox",
    date: "2025-12-02",
    image: "/images/kali-virtualbox.png",
    content: <Post1 /> // JSX valido perché il file è .tsx
  },
  // altri post qui
];
