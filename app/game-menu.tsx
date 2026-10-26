type Props = {
  onEnter: () => void;
  onPersonal: () => void;
  onCollection: () => void;
  onContinue?: () => void;
};

export default function GameMenu({
  onEnter,
  onPersonal,
  onCollection,
  onContinue,
}: Props) {
  return (
    <section className="game-menu" aria-label="游戏主界面">
      <div className="menu-art" aria-hidden="true">
        <div className="orbit" />
        <div className="arch">
          <div className="sun" />
          <div className="hill back" />
          <div className="hill" />
          <div className="path" />
        </div>
        <span className="star">✦</span>
      </div>
      <div className="menu-content">
        <p className="eyebrow">HERPARALIVES</p>
        <h1>她的平行人生</h1>
        <p className="menu-subtitle">
          在她们的人生岔路里，看见自己会如何选择。
        </p>
        <div className="menu-actions">
          <button className="primary menu-start" onClick={onEnter}>
            体验她的平行人生 <span aria-hidden="true">→</span>
          </button>
          {onContinue && (
            <button className="menu-resume" onClick={onContinue}>
              继续这一段人生
            </button>
          )}
        </div>
        <button className="menu-personal" onClick={onPersonal}>
          <span aria-hidden="true">✧</span>
          <span>
            <strong>也想走进自己的平行人生？</strong>
            <small>收集故事里的碎片，开启属于你的另一种可能。</small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <button className="menu-collection" onClick={onCollection}>
          ✦ 我的人生图鉴
        </button>
      </div>
      <p className="menu-promise">
        不替你选择人生，陪你把每种人生多走一段。<span>人物与未来均为虚构</span>
      </p>
    </section>
  );
}
