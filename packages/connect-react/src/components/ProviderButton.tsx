// src/ProviderButton.tsx
import React from 'react';
import { getProviderIcon } from '../utils';

interface Props {
  provider: 'google' | 'microsoft' | 'zoom' | 'icloud';
  label: string;
  showLabel: boolean;
  onClick: () => void;
}

export const ProviderButton: React.FC<Props> = ({
  provider, label, showLabel, onClick,
}) => (
    <button className="pyas-provider-button" onClick={onClick}>
        <span className="icon" dangerouslySetInnerHTML={{ __html: getProviderIcon(provider) }} />
        {showLabel && <span className="label">{label}</span>}
        <span className="arrow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                className="arrow-icon">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
            </svg>
        </span>
    </button>
);
