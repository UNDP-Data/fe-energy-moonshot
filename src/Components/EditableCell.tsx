import { useState, FocusEvent } from 'react';

interface Props {
  text:string | 0 | null;
  fieldName:string;
  sendUpdate: Function;
  outputId?: string;
}

export const EditableCell = (props: Props) => {
  const {
    text,
    fieldName,
    sendUpdate,
    outputId,
  } = props;

  const [cachedValue, setCachedValue] = useState('');

  async function callUpdateWithNewValues(e:FocusEvent) {
    if (e.target.textContent !== cachedValue) {
      await sendUpdate(e.target.textContent, fieldName, outputId);
    }
  }

  return (
    <span
      style={{ color: 'var(--blue-700)' }}
      contentEditable
      onFocus={(e) => {
        setCachedValue(e.target.innerText);
      }}
      onBlur={callUpdateWithNewValues}
    >
      {text}
    </span>
  );
};
