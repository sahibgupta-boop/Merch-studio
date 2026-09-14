import { svgDataUri } from '../lib/export.js'

// The flat separations as a print shop receives them: artwork alone, transparent
// background, shown on a checkerboard so transparency is visibly transparent
// rather than an assumed white.
export default function ArtworkSheet({ artworks, garmentColour, onGround }) {
  if (!artworks?.length) return null

  const ground = onGround ? garmentColour.hex : null

  return (
    <div className="grid grid-cols-2 gap-3">
      {artworks.map((art) => (
        <figure key={art.placement.id} className="space-y-1.5">
          <div className="relative overflow-hidden rounded-lg border border-edge"
            style={ground
              ? { background: ground }
              : {
                  backgroundImage:
                    'linear-gradient(45deg,#2a2e36 25%,transparent 25%),linear-gradient(-45deg,#2a2e36 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2e36 75%),linear-gradient(-45deg,transparent 75%,#2a2e36 75%)',
                  backgroundSize: '14px 14px',
                  backgroundPosition: '0 0,0 7px,7px -7px,-7px 0',
                  backgroundColor: '#1b1e24'
                }}>
            <img src={svgDataUri(art.svg)} alt={art.placement.label}
              className="mx-auto block max-h-[210px] w-auto" />
          </div>
          <figcaption className="flex items-baseline justify-between gap-2 text-[11px]">
            <span className="truncate text-white/80">{art.placement.label}</span>
            <span className="shrink-0 font-mono text-muted">{art.pxWidth}×{art.pxHeight}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
