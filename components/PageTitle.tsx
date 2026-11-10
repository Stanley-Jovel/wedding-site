import { Sprig } from "./Sprig";

export function PageTitle({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <Sprig className="sprig" />
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}
