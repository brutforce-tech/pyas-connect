import { Component, h, Prop, Event, EventEmitter, State, Element as HostEl, Watch } from '@stencil/core'
import { getOauthUrl, openOAuthPopup } from '../../utils/oauth'
import { renderProviderButton } from '../../utils/provider-button';
import { renderProviderIcon } from '../../utils/provider-icons';
import { CloseIcon } from '../../icons';

@Component({
    tag: 'pyas-connect',
    styleUrl: '../../theme/main.css',
    shadow: true,
})
export class PyasConnect {
    @HostEl() el!: HTMLElement;
    // Required
    @Prop({ attribute: 'client-id' }) clientId: string;
    @Prop({ attribute: 'token-name' }) tokenName: string;

    // Optional UI
    @Prop({ attribute: 'show-labels', reflect: true }) showLabels: boolean = true;
    @Prop({ attribute: 'theme', reflect: true }) theme: 'light' | 'dark' = 'light';
    @Prop({ attribute: 'modal-title', reflect: true  }) modalTitle: string = 'Connect an Account';
    @Prop({ attribute: 'modal-description', reflect: true  }) modalDescription: string = '';
    @Prop({ attribute: 'form-title', reflect: true  }) formTitle: string = 'Enter Your Details';
    @Prop({ attribute: 'form-description' }) formDescription: string = '';

    // Providers
    @Prop({ attribute: 'show-icloud', reflect: true }) showIcloud: boolean = false;
    @Prop({ attribute: 'show-zoom', reflect: true }) showZoom: boolean = true;
    @Prop({ attribute: 'show-google', reflect: true  }) showGoogle: boolean = true;
    @Prop({ attribute: 'show-outlook', reflect: true }) showOutlook: boolean = true;

    // User Info Props
    @Prop({ attribute: 'user-email', reflect: true }) userEmail?: string;
    @Prop({ attribute: 'user-name', reflect: true  }) userName?: string;

    // Misc
    @Prop({ attribute: 'show-disclaimer', reflect: true  }) showDisclaimer: boolean = true;
    @Prop({ attribute: 'product-name', reflect: true  }) productName: string = 'This app';
    @Prop({ attribute: 'state', reflect: true  }) state: string = '';

    // Internal reactive state
    @State() email: string = '';
    @State() name: string = '';
    @State() selectedProvider: string = '';
    @State() modalStep: 1 | 2 = 1;
    @State() isLoading: boolean = false;
    @State() modalOpen: boolean = false;
    @State() selectedProviderLabel: string = '';

    /** Emit connection result */
    @Event() accountConnected: EventEmitter<{ provider: string; accountId: string, name: string, email: string, scopes: string[], status: string }>
    /** Emit error result */
    @Event() connectError: EventEmitter<{ message: string, code: string|number|undefined, error?: any }>

    // Watchers to sync prop changes
    @Watch('userEmail')
    handleUserEmailChange(newVal: string) {
        this.email = newVal || '';
    }

    @Watch('userName')
    handleUserNameChange(newVal: string) {
        this.name = newVal || '';
    }

    private getProviderLabel(provider: string): string {
        switch (provider) {
            case 'google':
                return 'Google Calendar';
            case 'microsoft':
                return 'Microsoft Outlook';
            case 'icloud':
                return 'iCloud Calendar';
            case 'zoom':
                return 'Zoom';
            default:
                return '';
        }
    }

    componentWillLoad() {
        this.syncPropsToState();
    }

    private syncPropsToState() {
        this.name = this.userName || '';
        this.email = this.userEmail || '';
    }

    private resetState() {
        this.syncPropsToState();
        this.selectedProvider = '';
        this.selectedProviderLabel = '';
    }


    private handleNext(provider: string) {
        this.selectedProvider = provider
        this.modalStep = 2
        this.selectedProviderLabel = this.getProviderLabel(provider);
    }

    private handlePrev() {
        this.modalStep = 1
    }

    private async startOauthFlow(provider: string) {
        try {
            const payload = {
                provider,
                clientId: this.clientId,
                tokenName: this.tokenName,
                state: this.state,
                email: this.email,
            }

            this.isLoading = true

            const res = await getOauthUrl(payload)

            if (!res || !res.url || !res.success) {
                this.isLoading = false
                this.connectError.emit(res?.error)
                return
            }

            const popupPayload = {
                ...payload,
                url: res.url,
                name: this.name,
            }

            const popupRes = await openOAuthPopup(popupPayload)

            if (!popupRes || !popupRes.success) {
                this.isLoading = false
                this.connectError.emit(popupRes?.error)
                return
            }

            this.accountConnected.emit(popupRes?.account);
            this.isLoading = false


        } catch(e) {
            console.error('[Pyas] OAuth flow error:', e)
            this.connectError.emit({
                message: 'Failed to start OAuth flow',
                code: 'oauth_flow_error',
                error: e
            })
        }
    }

    private closeModal() {
        this.modalOpen = false
        this.modalStep = 1
        this.isLoading = false
        this.resetState()
    }

    render() {
        return (
            <div class="pyas-connect">
                <button
                    class="pyas-button"
                    onClick={() => (this.modalOpen = true)}
                >
                    <slot>Connect a Provider</slot>
                </button>

                {this.modalOpen && (
                    <div class="pyas-modal">
                        <div class="pyas-modal-content">
                            <div class="pyas-modal-header">
                                {this.modalStep === 1 && (
                                    <div class="modal-header-row">
                                        <div>
                                            <h3>{this.modalTitle}</h3>
                                            <p>{this.modalDescription} test description</p>
                                        </div>
                                        <div class="close-modal-wrapper" onClick={() => this.closeModal()}>
                                            <CloseIcon  />
                                        </div>
                                    </div>
                                )}

                                {this.modalStep === 2 && (
                                    <>
                                    <div class="modal-header-row">
                                        <span class="form-icon">
                                            {renderProviderIcon(this.selectedProvider)}
                                            <span class="provider-label">{this.selectedProviderLabel}</span>
                                        </span>
                                        <div class="close-modal-wrapper" onClick={() => this.closeModal()}>
                                            <CloseIcon />
                                        </div>
                                    </div>
                                    <div class="form-header-divider">
                                    </div>
                                    <div class="modal-subheader">
                                        <h3>{this.formTitle}</h3>
                                        <p>{this.formDescription}</p>
                                    </div>
                                    </>
                                )}
                            </div>

                            {this.modalStep === 1 && (
                                <div>
                                    <div class="pyas-modal-body">
                                        <div class="pyas-provider-buttons">
                                        { this.showGoogle && renderProviderButton('google', 'Google Calendar', this.showLabels, () => this.handleNext('google') ) }
                                        { this.showOutlook && renderProviderButton('microsoft', 'Microsoft Outlook', this.showLabels, () => this.handleNext('microsoft') ) }
                                        { this.showIcloud && renderProviderButton('icloud', 'iCloud Calendar', this.showLabels, () => this.handleNext('icloud')) }
                                        { this.showZoom && renderProviderButton('zoom', 'Zoom', this.showLabels, () => this.handleNext('zoom') ) }
                                        </div>
                                    </div>
                                </div>
                            )}

                            {this.modalStep === 2 && (
                                <div class="step-form">
                                    <div class="step-form-content form-group">
                                        <label class="form-label">
                                        <span>Name</span>
                                        <input
                                            type="text"
                                            class="form-input"
                                            value={this.name}
                                            onInput={(e: any) => (this.name = e.target.value)}
                                            placeholder="Your name"
                                            disabled={this.isLoading}
                                        />
                                        </label>

                                        <label class="form-label">
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            class="form-input"
                                            value={this.email}
                                            onInput={(e: any) => (this.email = e.target.value)}
                                            placeholder="you@example.com"
                                            disabled={this.isLoading}
                                        />
                                        </label>
                                    </div>
                                <div class="form-actions">
                                    <button
                                        disabled={this.isLoading}
                                        class="form-back"
                                        onClick={() => this.handlePrev()}>
                                        Back
                                    </button>
                                    <button
                                        disabled={this.isLoading}
                                        class="form-submit"
                                        onClick={() => this.startOauthFlow(this.selectedProvider)}
                                    >
                                        {this.isLoading ? (
                                            <span class="spinner" part="spinner" aria-label="loading"></span>
                                            ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </div>
                                </div>
                            )}

                            {this.showDisclaimer && (
                                <div>
                                    <div class="divider">
                                        <hr />
                                    </div>

                                    <div class="pyas-disclaimer">
                                        <span>
                                            {this.productName} uses
                                        </span>
                                        <a href="https://pyas.io/" target="_blank">
                                            <img class="pyas-logo" src="data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27UTF-8%27?%3e%3csvg%20id=%27Layer_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20183%20100%27%3e%3cdefs%3e%3cstyle%3e.cls-1{fill:%23290066;}.cls-2{fill:%23ff9b19;}.cls-3{fill:%23b70053;}.cls-4{fill:%233d0099;}.cls-5{fill:%230f0b3a;}.cls-6{fill:%23ffd701;}.cls-7{fill:%23fb0062;}%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class=%27cls-5%27%20d=%27M96.12,39.39c0,6.17-4.85,10.84-11.17,10.84h-5.18v10.84h-6.5V28.55h11.69c6.32,0,11.17,4.67,11.17,10.84Zm-6.69,0c0-2.69-1.98-4.71-4.62-4.71h-5.04v9.43h5.04c2.64,0,4.62-2.03,4.62-4.71Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M124.16,37.03l-13.71,32.99h-6.6l3.86-9.19-9.85-23.8h6.97l6.22,16.35,6.22-16.35h6.88Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M150.27,37.03v24.04h-6.13v-3.16c-1.89,2.31-4.57,3.72-7.82,3.72-6.69,0-11.73-5.42-11.73-12.58s5.04-12.58,11.73-12.58c3.25,0,5.94,1.41,7.82,3.72v-3.16h6.13Zm-6.13,12.02c0-3.77-2.83-6.65-6.64-6.65s-6.6,2.87-6.6,6.65,2.83,6.64,6.6,6.64,6.64-2.87,6.64-6.64Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M154.6,53.86h6.17c0,1.51,1.27,2.73,2.87,2.73,1.51,0,2.69-.94,2.69-2.17,0-1.65-1.84-2.45-4.01-3.02-3.58-.85-7.4-2.69-7.4-7.54s4.01-7.4,8.62-7.4c4.95,0,8.67,3.3,8.67,7.4h-6.17c0-1.27-1.08-2.36-2.54-2.36-1.32,0-2.4,.9-2.4,1.98,0,1.51,1.7,2.4,4.19,3.02,3.72,.94,7.26,2.78,7.26,7.4,0,4.9-4.05,7.73-8.95,7.73-5.18,0-9-3.49-9-7.78Z%27/%3e%3c/g%3e%3cg%3e%3cpath%20class=%27cls-6%27%20d=%27M54.12,30.12H16.82c-.31-.48-.49-1.04-.49-1.65V8.39c0-1,.81-1.81,1.82-1.81,.37,0,.72,.11,1.01,.3,0,0,.01,0,.02,.01l31.39,20.38,1.13,.74h0c.87,.63,1.68,1.33,2.42,2.11Z%27/%3e%3cpath%20class=%27cls-4%27%20d=%27M23.35,39.35s-.09-.06-.14-.09l-12.37-8.03s-.05-.03-.07-.05c-.28-.18-.61-.28-.97-.28-1,0-1.81,.81-1.81,1.82v57.47c0,1,.81,1.82,1.81,1.82,.42,0,.8-.14,1.11-.38,.02-.01,.03-.03,.05-.04l12.48-9.75s.08-.06,.11-.09c.34-.28,.62-.64,.82-1.05,.19-.39,.29-.83,.29-1.3V41.85c0-1.04-.52-1.96-1.32-2.5Z%27/%3e%3cpath%20class=%27cls-2%27%20d=%27M58.31,38.19H28.28c-.22-.33-.49-.62-.82-.85-.02-.02-.04-.03-.07-.05l-9.68-6.29s-.04-.03-.06-.04c-.33-.23-.62-.52-.83-.86H54.12c2.09,2.2,3.57,4.98,4.19,8.08Z%27/%3e%3cpath%20class=%27cls-7%27%20d=%27M58.63,41.44c0,4.98-2.21,9.44-5.7,12.45-.03,.03-.06,.05-.1,.08,0,0-14.65,11.44-21.09,16.48-.01,0-.02,.02-.04,.03-.31,.25-.71,.39-1.13,.39-1,0-1.81-.81-1.81-1.82v-29.22c0-.61-.18-1.17-.49-1.65h30.03c.21,1.05,.32,2.13,.32,3.24Z%27/%3e%3cpath%20class=%27cls-3%27%20d=%27M28.76,43.28v-3.44c0-.61-.18-1.17-.49-1.65h30.03l-29.54,5.09Z%27/%3e%3cpath%20class=%27cls-1%27%20d=%27M24.38,80.69c-.19,.41-.47,.76-.82,1.05-.04,.03-.08,.06-.11,.09l-12.48,9.75s-.03,.03-.05,.04c-.31,.24-.69,.38-1.11,.38-1,0-1.81-.81-1.81-1.82V32.72c0,27.4,7.06,37.35,16.39,47.98Z%27/%3e%3c/g%3e%3c/svg%3e" alt="Pyas Logo" />
                                        </a>

                                        <span>
                                            to securely connect your account
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
