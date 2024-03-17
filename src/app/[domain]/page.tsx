export default function DomainPage({ params }: { params: { domain: string } }) {
  return (
    <div>
      <h1>Domain page</h1>
      <p>{params.domain}</p>
    </div>
  );
}
