import { Instagram } from 'lucide-react';

type ReelConfig = {
  url: string;
  embedUrl: string;
  primary?: boolean;
};

function toEmbed(url: string): string {
  const reelId = url.split('/').filter(Boolean).pop();
  return `https://www.instagram.com/reel/${reelId}/embed/`;
}

const REELS: ReelConfig[] = [
  { url: 'https://www.instagram.com/hotelsistermoon/reel/DaYEkNrR_3G/', embedUrl: toEmbed('https://www.instagram.com/hotelsistermoon/reel/DaYEkNrR_3G/'), primary: true },
  { url: 'https://www.instagram.com/hotelsistermoon/reel/Dcw89_-tkmo/', embedUrl: toEmbed('https://www.instagram.com/hotelsistermoon/reel/Dcw89_-tkmo/') },
];

export default function InstagramReels() {
  return (
    <div className="ig-reels-grid">
      {REELS.map((reel) => (
        <div key={reel.url} className={`ig-reel-card ${reel.primary ? 'ig-reel-primary' : ''}`}>
          <div className="ig-reel-frame-wrap">
            <iframe
              src={reel.embedUrl}
              title="Reel de Sister Moon en Instagram"
              loading="lazy"
              allowFullScreen
              frameBorder={0}
              scrolling="no"
              allow="encrypted-media; picture-in-picture"
              className="ig-reel-iframe"
            />
          </div>
          <a href={reel.url} target="_blank" rel="noopener noreferrer" className="ig-reel-direct-link">
            <Instagram size={13} /> Ver en Instagram
          </a>
        </div>
      ))}
    </div>
  );
}
