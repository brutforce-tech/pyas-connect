/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import '@pyas/connect/dist/theme/main.css';
import './PyasConnect.css';
import {
    getOauthUrl,
    openOAuthPopup,
    CloseIconSvg as CloseIcon
} from '@pyas/connect';
import { ProviderButton } from './ProviderButton';
import { getProviderIcon } from '../utils';

export interface PyasConnectProps extends PropsWithChildren {
    clientId: string;
    tokenName: string;
    theme?: 'light'|'dark';
    productName?: string;
    userName?: string;
    userEmail?: string;
    showLabels?: boolean;
    showGoogle?: boolean;
    showOutlook?: boolean;
    showZoom?: boolean;
    showIcloud?: boolean;
    showDisclaimer?: boolean;
    state?: string;
    modalTitle?: string;
    modalDescription?: string;
    formTitle?: string;
    formDescription?: string;
    children?: React.ReactNode;

    /** Called when the OAuth flow completes successfully */
    onAccountConnected?: (account: {
        provider: string;
        accountId: string;
        name: string;
        email: string;
        scopes: string[];
        status: string;
    }) => void;

    /** Called when there’s an error starting or completing OAuth */
    onConnectError?: (error: { message: string; code: string; error?: any }) => void;
}


export const PyasConnect: React.FC<PyasConnectProps> = ({
    children,
    clientId,
    tokenName,
    theme = 'light',
    productName = 'This app',
    userName='',
    userEmail='',
    showLabels = true,
    showGoogle=true,
    showOutlook=true,
    showZoom=true,
    showIcloud=false,
    showDisclaimer=true,
    state='',
    modalTitle='Connect an Account',
    modalDescription='',
    formTitle='Enter Your Details',
    formDescription='',
    onAccountConnected,
    onConnectError,
}) => {
    const [ open, setOpen ] = useState(false);
    const [ step, setStep ] = useState<1|2>(1);
    const [ name, setName ] = useState(userName);
    const [ email, setEmail ] = useState(userEmail);
    const [ loading, setLoading ] = useState(false);
    const [ selectedProvider, setSelectedProvider ] = useState<string | null>(null);

    const logoSrc = 'data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27UTF-8%27?%3e%3csvg%20id=%27Layer_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20183%20100%27%3e%3cdefs%3e%3cstyle%3e.cls-1{fill:%23290066;}.cls-2{fill:%23ff9b19;}.cls-3{fill:%23b70053;}.cls-4{fill:%233d0099;}.cls-5{fill:%230f0b3a;}.cls-6{fill:%23ffd701;}.cls-7{fill:%23fb0062;}%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class=%27cls-5%27%20d=%27M96.12,39.39c0,6.17-4.85,10.84-11.17,10.84h-5.18v10.84h-6.5V28.55h11.69c6.32,0,11.17,4.67,11.17,10.84Zm-6.69,0c0-2.69-1.98-4.71-4.62-4.71h-5.04v9.43h5.04c2.64,0,4.62-2.03,4.62-4.71Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M124.16,37.03l-13.71,32.99h-6.6l3.86-9.19-9.85-23.8h6.97l6.22,16.35,6.22-16.35h6.88Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M150.27,37.03v24.04h-6.13v-3.16c-1.89,2.31-4.57,3.72-7.82,3.72-6.69,0-11.73-5.42-11.73-12.58s5.04-12.58,11.73-12.58c3.25,0,5.94,1.41,7.82,3.72v-3.16h6.13Zm-6.13,12.02c0-3.77-2.83-6.65-6.64-6.65s-6.6,2.87-6.6,6.65,2.83,6.64,6.6,6.64,6.64-2.87,6.64-6.64Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M154.6,53.86h6.17c0,1.51,1.27,2.73,2.87,2.73,1.51,0,2.69-.94,2.69-2.17,0-1.65-1.84-2.45-4.01-3.02-3.58-.85-7.4-2.69-7.4-7.54s4.01-7.4,8.62-7.4c4.95,0,8.67,3.3,8.67,7.4h-6.17c0-1.27-1.08-2.36-2.54-2.36-1.32,0-2.4,.9-2.4,1.98,0,1.51,1.7,2.4,4.19,3.02,3.72,.94,7.26,2.78,7.26,7.4,0,4.9-4.05,7.73-8.95,7.73-5.18,0-9-3.49-9-7.78Z%27/%3e%3c/g%3e%3cg%3e%3cpath%20class=%27cls-6%27%20d=%27M54.12,30.12H16.82c-.31-.48-.49-1.04-.49-1.65V8.39c0-1,.81-1.81,1.82-1.81,.37,0,.72,.11,1.01,.3,0,0,.01,0,.02,.01l31.39,20.38,1.13,.74h0c.87,.63,1.68,1.33,2.42,2.11Z%27/%3e%3cpath%20class=%27cls-4%27%20d=%27M23.35,39.35s-.09-.06-.14-.09l-12.37-8.03s-.05-.03-.07-.05c-.28-.18-.61-.28-.97-.28-1,0-1.81,.81-1.81,1.82v57.47c0,1,.81,1.82,1.81,1.82,.42,0,.8-.14,1.11-.38,.02-.01,.03-.03,.05-.04l12.48-9.75s.08-.06,.11-.09c.34-.28,.62-.64,.82-1.05,.19-.39,.29-.83,.29-1.3V41.85c0-1.04-.52-1.96-1.32-2.5Z%27/%3e%3cpath%20class=%27cls-2%27%20d=%27M58.31,38.19H28.28c-.22-.33-.49-.62-.82-.85-.02-.02-.04-.03-.07-.05l-9.68-6.29s-.04-.03-.06-.04c-.33-.23-.62-.52-.83-.86H54.12c2.09,2.2,3.57,4.98,4.19,8.08Z%27/%3e%3cpath%20class=%27cls-7%27%20d=%27M58.63,41.44c0,4.98-2.21,9.44-5.7,12.45-.03,.03-.06,.05-.1,.08,0,0-14.65,11.44-21.09,16.48-.01,0-.02,.02-.04,.03-.31,.25-.71,.39-1.13,.39-1,0-1.81-.81-1.81-1.82v-29.22c0-.61-.18-1.17-.49-1.65h30.03c.21,1.05,.32,2.13,.32,3.24Z%27/%3e%3cpath%20class=%27cls-3%27%20d=%27M28.76,43.28v-3.44c0-.61-.18-1.17-.49-1.65h30.03l-29.54,5.09Z%27/%3e%3cpath%20class=%27cls-1%27%20d=%27M24.38,80.69c-.19,.41-.47,.76-.82,1.05-.04,.03-.08,.06-.11,.09l-12.48,9.75s-.03,.03-.05,.04c-.31,.24-.69,.38-1.11,.38-1,0-1.81-.81-1.81-1.82V32.72c0,27.4,7.06,37.35,16.39,47.98Z%27/%3e%3c/g%3e%3c/svg%3e';

    const selectedProviderLabel = () => {
        switch (selectedProvider) {
            case 'google': return 'Google Calendar';
            case 'microsoft': return 'Microsoft Outlook';
            case 'zoom': return 'Zoom';
            case 'icloud': return 'iCloud Calendar';
            default: return '';
        }
    };

    const handleClose = () => {
        setOpen(false);
        setStep(1);
        setLoading(false);
        setSelectedProvider(null);
        setName(userName);
        setEmail(userEmail);
    }


    async function handleContinue(provider:string) {
        setSelectedProvider(provider);
        setStep(2);
    }

    async function handleSubmit() {
        const provider = selectedProvider as string;
        setLoading(true);

        try {
            const payload = { provider, clientId, tokenName, state, email, name };
            const res = await getOauthUrl(payload);

            if (!res.success || !res.url) {
            // emit connectError
                onConnectError?.({
                    message: res.error?.message || 'Failed to get OAuth URL',
                    code: res.error?.code || 'fetch_error',
                    error: res.error,
                });
                setLoading(false);
                return;
            }

            const popupRes = await openOAuthPopup({ ...payload, url: res.url });

            if (popupRes.success && popupRes.account) {
                // emit accountConnected
                onAccountConnected?.(popupRes.account);

            } else {
            // emit connectError
            onConnectError?.({
                message: popupRes.error?.message || 'OAuth popup failed',
                code: popupRes.error?.code || 'popup_error',
                error: popupRes.error,
            });
            }
        } catch (e: any) {
            // catch any unexpected exception
            onConnectError?.({
                message: 'Unexpected error during OAuth flow',
                code: e.code || 'unknown_error',
                error: e,
            });

        } finally {
                setLoading(false);
            }
    }

    return (
        <div className="pyas-connect" data-theme={theme}>
            <button className="pyas-button" onClick={()=>setOpen(true)}>
                {children ?? 'Connect a Provider'}
            </button>

            {open && (
                <div className="pyas-modal">
                    <div className="pyas-modal-content">

                        <div className="pyas-modal-header">

                            {step === 1 && (
                                <div className="modal-header-row">
                                    <div>
                                        <h3>{modalTitle}</h3>
                                        <p>{modalDescription}</p>
                                    </div>
                                    <div className="close-modal-wrapper" onClick={handleClose}>
                                        <span
                                            className="close-icon"
                                            dangerouslySetInnerHTML={{ __html: CloseIcon }}>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="modal-header-row step2">
                                        <span className="form-icon">
                                            <span
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: getProviderIcon(selectedProvider || '') }}
                                            />
                                            <span className="provider-label">{selectedProviderLabel()}</span>
                                        </span>
                                        <div className="close-modal-wrapper" onClick={handleClose}>
                                            <span
                                                className="close-icon"
                                                dangerouslySetInnerHTML={{ __html: CloseIcon }}>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="form-header-divider" />
                                    <div className="modal-subheader">
                                        <h3>{formTitle}</h3>
                                        <p>{formDescription}</p>
                                    </div>
                                </>
                            )}

                        </div>

                        {step === 1 && (
                            <div className="pyas-modal-body">
                                <div className="pyas-provider-buttons">
                                {showGoogle && (
                                    <ProviderButton
                                    provider="google"
                                    label="Google Calendar"
                                    showLabel={showLabels}
                                    onClick={() => handleContinue('google')}
                                    />
                                )}
                                {showOutlook && (
                                    <ProviderButton
                                    provider="microsoft"
                                    label="Microsoft Outlook"
                                    showLabel={showLabels}
                                    onClick={() => handleContinue('microsoft')}
                                    />
                                )}
                                {showIcloud && (
                                    <ProviderButton
                                    provider="icloud"
                                    label="iCloud Calendar"
                                    showLabel={showLabels}
                                    onClick={() => handleContinue('icloud')}
                                    />
                                )}
                                {showZoom && (
                                    <ProviderButton
                                    provider="zoom"
                                    label="Zoom"
                                    showLabel={showLabels}
                                    onClick={() => handleContinue('zoom')}
                                    />
                                )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-form">
                                <div className="step-form-content form-group">
                                    <label className="form-label">
                                        <span>Name</span>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        disabled={loading}
                                        />
                                    </label>

                                    <label className="form-label">
                                        <span>Email</span>
                                        <input
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        disabled={loading}
                                        />
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="form-back"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                        Back
                                    </button>
                                <button
                                    className="form-submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <span className="spinner"/> : 'Continue'}
                                </button>
                                </div>
                            </div>
                        )}

                        {showDisclaimer && (
                            <div>
                                <div className="divider"><hr/></div>
                                <div className="pyas-disclaimer">
                                <span>{productName} uses</span>
                                <a href="https://pyas.io/" target="_blank">
                                    <img
                                        className="pyas-logo"
                                        src={logoSrc}
                                        alt="Pyas Logo"
                                    />
                                </a>
                                <span>to securely connect your account</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};
