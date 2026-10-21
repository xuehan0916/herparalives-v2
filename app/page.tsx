import { stories } from "@/content/stories";

export default function Home() {
  return (
    <main className="home">
      <header className="hero">
        <p className="eyebrow">HERPARALIVES · 女性人生故事馆</p>
        <h1>在她们的人生岔路里，<br />看见自己会如何选择。</h1>
        <p className="lead">不替你选择人生，陪你把每种人生多走一段。</p>
      </header>

      <section className="deck" aria-label="她们的人生">
        <h2>她们的人生</h2>
        {stories.length === 0 ? (
          <p className="muted">第一批故事正在制作和审校中。</p>
        ) : (
          <ul className="cards">
            {stories.map((story) => (
              <li key={story.id} className="card">
                <strong>{story.card.name}</strong>
                <span>{story.card.tagline}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="promise">人物和未来都是虚构的，不预测现实人生。</footer>
    </main>
  );
}
