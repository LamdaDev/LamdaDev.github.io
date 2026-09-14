import { useEffect, useState, type CSSProperties } from 'react';
import { bobaFlavors, type BobaFlavor } from '../boba';
import { selectBobaFlavor, useBobaFlavor } from '../runtime/boba';

export function BobaPicker() {
  const selected = useBobaFlavor();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return <fieldset className="boba-picker" disabled={!ready}>
    <legend>Choose Daniel’s boba</legend>
    <div className="boba-options">
      {(Object.keys(bobaFlavors) as BobaFlavor[]).map(flavor => {
        const { label, tea } = bobaFlavors[flavor];
        return <button
          key={flavor}
          type="button"
          className="boba-option"
          aria-pressed={selected === flavor}
          onClick={() => selectBobaFlavor(flavor)}
          style={{ '--boba-color': tea } as CSSProperties}
        >
          <span className="boba-swatch" aria-hidden="true" />
          {label}
          <span className="boba-check" aria-hidden="true">✓</span>
        </button>;
      })}
    </div>
  </fieldset>;
}
