import type { ReactNode } from "react";

export function ToolExample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="tool-example">
      <figcaption>{title}</figcaption>
      {children}
    </figure>
  );
}

export function ExampleValues({
  items,
}: {
  items: { label: string; value: ReactNode; detail: string }[];
}) {
  return (
    <dl className="example-values">
      {items.map(({ label, value, detail }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <strong>{value}</strong>
            <span>{detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ExampleBars({
  items,
}: {
  items: { label: string; value: number; amount: string }[];
}) {
  const maxValue = Math.max(...items.map(({ value }) => value));
  return (
    <dl className="example-bars">
      {items.map(({ label, value, amount }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <strong>{amount}</strong>
            <span className="example-track" aria-hidden="true">
              <span style={{ width: `${(value / maxValue) * 100}%` }} />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
