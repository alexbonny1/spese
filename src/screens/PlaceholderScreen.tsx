import './PlaceholderScreen.css';

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="placeholder-screen">
      <h3>{title}</h3>
      <p>Questa sezione è in costruzione.</p>
    </div>
  );
}
