import { useEffect, useState, type CSSProperties } from 'react';
import { bobaFlavors, type BobaFlavor } from '../boba';
import { selectBobaFlavor, useBobaFlavor } from '../runtime/boba';
import { useLanguage } from '../i18n';

export function BobaPicker() {
  const selected = useBobaFlavor();
  const { text } = useLanguage();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return <fieldset className="boba-picker" disabled={!ready}>
    <legend>{text('Choose Daniel’s boba', 'Choisissez le boba de Daniel')}</legend>
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
          {text(label, flavor === 'milk-tea' ? 'Thé au lait' : label)}
          <span className="boba-check" aria-hidden="true">✓</span>
        </button>;
      })}
    </div>
  </fieldset>;
}
