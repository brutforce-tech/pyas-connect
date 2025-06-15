import { h, JSX} from '@stencil/core';
import { renderProviderIcon, Provider } from './provider-icons';

export const renderProviderButton = (
    provider: Provider,
    label: string,
    showLabel: boolean,
    onClick: () => void
): JSX.Element => {
    return (
        <button
            class="pyas-provider-button"
            onClick={ onClick }
            >
            <span class="icon">{renderProviderIcon(provider) }</span>
            { showLabel && <span class="label">{label}</span> }
            <span class="arrow">
                {/* your arrow SVG here or import it the same way */}
            </span>
            <span class="arrow">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="arrow-icon"
                >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
                </svg>
            </span>
        </button>
    )
}
