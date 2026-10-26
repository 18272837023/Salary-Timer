export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="hero">
      <div className="blob m" />
      <div className="blob p" />
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              The <span className="hl">salary timer</span>
              <br />
              for every second you work.
            </h1>
            <p className="lede">
              This free salary timer turns your pay into a live counter — per second, per minute,
              per hour. Type it in once, then watch the number climb through meetings, coffee
              breaks and that last impossible hour before clock-out.
            </p>
          </div>

          <div className="hero-stickers" aria-hidden="true">
            <div className="sticker">
              <span>🪙</span>
              <div>
                <b>Every second counts</b>
                <small>literally — down to the cent</small>
              </div>
            </div>
            <div className="sticker">
              <span>☕</span>
              <div>
                <b>Breaks are unpaid</b>
                <small>so the timer pauses for them</small>
              </div>
            </div>
            <div className="sticker">
              <span>🎯</span>
              <div>
                <b>Save for something real</b>
                <small>priced in hours, not dollars</small>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
