import { Component, h, Prop, Event, EventEmitter, State, JSX, Env, Element as HostEl } from '@stencil/core'

const PYAS_BASE_URL = Env.PYAS_BASE_URL || 'https://api.pyas.io'
const PYAS_REDIRECT_URL = Env.PYAS_REDIRECT_URL || 'https://api.pyas.io/oauth/callback'

const GoogleIcon = () => (
  <svg 
      xmlns="http://www.w3.org/2000/svg" 
      x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
    <rect width="22" height="22" x="13" y="13" fill="#fff"></rect><polygon fill="#1e88e5" points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"></polygon><path fill="#1e88e5" d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168 c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44 c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64 c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368 C24.24,25.281,23.736,24.363,22.943,23.745z"></path><polygon fill="#fbc02d" points="34,42 14,42 13,38 14,34 34,34 35,38"></polygon><polygon fill="#4caf50" points="38,35 42,34 42,14 38,13 34,14 34,34"></polygon><path fill="#1e88e5" d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"></path><polygon fill="#e53935" points="34,34 34,42 42,34"></polygon><path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"></path><path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"></path>
  </svg>
)

const OutlookIcon = () => (
    <svg 
          xmlns="http://www.w3.org/2000/svg" 
          x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
          <path fill="#103262" d="M43.255,23.547l-6.81-3.967v11.594H44v-6.331C44,24.309,43.716,23.816,43.255,23.547z"></path><path fill="#0084d7" d="M13,10h10v9H13V10z"></path><path fill="#33afec" d="M23,10h10v9H23V10z"></path><path fill="#54daff" d="M33,10h10v9H33V10z"></path><path fill="#027ad4" d="M23,19h10v9H23V19z"></path><path fill="#0553a4" d="M23,28h10v9H23V28z"></path><path fill="#25a2e5" d="M33,19h10v9H33V19z"></path><path fill="#0262b8" d="M33,28h10v9H33V28z"></path><polygon points="13,37 43,37 43,24.238 28.99,32.238 13,24.238" opacity=".019"></polygon><polygon points="13,37 43,37 43,24.476 28.99,32.476 13,24.476" opacity=".038"></polygon><polygon points="13,37 43,37 43,24.714 28.99,32.714 13,24.714" opacity=".057"></polygon><polygon points="13,37 43,37 43,24.952 28.99,32.952 13,24.952" opacity=".076"></polygon><polygon points="13,37 43,37 43,25.19 28.99,33.19 13,25.19" opacity=".095"></polygon><polygon points="13,37 43,37 43,25.429 28.99,33.429 13,25.429" opacity=".114"></polygon><polygon points="13,37 43,37 43,25.667 28.99,33.667 13,25.667" opacity=".133"></polygon><polygon points="13,37 43,37 43,25.905 28.99,33.905 13,25.905" opacity=".152"></polygon><polygon points="13,37 43,37 43,26.143 28.99,34.143 13,26.143" opacity=".171"></polygon><polygon points="13,37 43,37 43,26.381 28.99,34.381 13,26.381" opacity=".191"></polygon><polygon points="13,37 43,37 43,26.619 28.99,34.619 13,26.619" opacity=".209"></polygon><polygon points="13,37 43,37 43,26.857 28.99,34.857 13,26.857" opacity=".229"></polygon><polygon points="13,37 43,37 43,27.095 28.99,35.095 13,27.095" opacity=".248"></polygon><polygon points="13,37 43,37 43,27.333 28.99,35.333 13,27.333" opacity=".267"></polygon><polygon points="13,37 43,37 43,27.571 28.99,35.571 13,27.571" opacity=".286"></polygon><polygon points="13,37 43,37 43,27.81 28.99,35.81 13,27.81" opacity=".305"></polygon><polygon points="13,37 43,37 43,28.048 28.99,36.048 13,28.048" opacity=".324"></polygon><polygon points="13,37 43,37 43,28.286 28.99,36.286 13,28.286" opacity=".343"></polygon><polygon points="13,37 43,37 43,28.524 28.99,36.524 13,28.524" opacity=".362"></polygon><polygon points="13,37 43,37 43,28.762 28.99,36.762 13,28.762" opacity=".381"></polygon><polygon points="13,37 43,37 43,29 28.99,37 13,29" opacity=".4"></polygon><linearGradient id="Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1" x1="38.925" x2="32.286" y1="24.557" y2="36.024" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#31abec"></stop><stop offset="1" stop-color="#1582d5"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1)" d="M15.441,42h26.563c1.104,0,1.999-0.889,2-1.994C44.007,35.485,44,24.843,44,24.843	s-0.007,0.222-1.751,1.212S14.744,41.566,14.744,41.566S14.978,42,15.441,42z"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2" x1="13.665" x2="41.285" y1="6.992" y2="9.074" gradientUnits="userSpaceOnUse"><stop offset=".042" stop-color="#076db4"></stop><stop offset=".85" stop-color="#0461af"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2)" d="M43,10H13V8c0-1.105,0.895-2,2-2h26c1.105,0,2,0.895,2,2V10z"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3" x1="28.153" x2="23.638" y1="33.218" y2="41.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#33acee"></stop><stop offset="1" stop-color="#1b8edf"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3)" d="M13,25v15c0,1.105,0.895,2,2,2h15h12.004c0.462,0,0.883-0.162,1.221-0.425L13,25z"></path><path d="M21.319,13H13v24h8.319C23.352,37,25,35.352,25,33.319V16.681C25,14.648,23.352,13,21.319,13z" opacity=".05"></path><path d="M21.213,36H13V13.333h8.213c1.724,0,3.121,1.397,3.121,3.121v16.425	C24.333,34.603,22.936,36,21.213,36z" opacity=".07"></path><path d="M21.106,35H13V13.667h8.106c1.414,0,2.56,1.146,2.56,2.56V32.44C23.667,33.854,22.52,35,21.106,35z" opacity=".09"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4" x1="3.53" x2="22.41" y1="14.53" y2="33.41" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1784d8"></stop><stop offset="1" stop-color="#0864c5"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4)" d="M21,34H5c-1.105,0-2-0.895-2-2V16c0-1.105,0.895-2,2-2h16c1.105,0,2,0.895,2,2v16	C23,33.105,22.105,34,21,34z"></path><path fill="#fff" d="M13,18.691c-3.111,0-4.985,2.377-4.985,5.309S9.882,29.309,13,29.309	c3.119,0,4.985-2.377,4.985-5.308C17.985,21.068,16.111,18.691,13,18.691z M13,27.517c-1.765,0-2.82-1.574-2.82-3.516	s1.06-3.516,2.82-3.516s2.821,1.575,2.821,3.516S14.764,27.517,13,27.517z"></path>
    </svg>
)

const ZoomIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="#2196f3"></circle><path fill="#fff" d="M29,31H14c-1.657,0-3-1.343-3-3V17h15c1.657,0,3,1.343,3,3V31z"></path><polygon fill="#fff" points="37,31 31,27 31,21 37,17"></polygon>
    </svg>
)

const ICloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
    <linearGradient id="iSZtP6eSr5wqIgT3aj5c_a_06SDYXN73bSC_gr1" x1="6.896" x2="27.372" y1="21.436" y2="21.46" gradientUnits="userSpaceOnUse"><stop offset=".309" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><ellipse cx="14.279" cy="21.444" fill="url(#iSZtP6eSr5wqIgT3aj5c_a_06SDYXN73bSC_gr1)" rx="7.163" ry="7.259"></ellipse><linearGradient id="iSZtP6eSr5wqIgT3aj5c_b_06SDYXN73bSC_gr2" x1="1.694" x2="39.022" y1="27.617" y2="27.813" gradientUnits="userSpaceOnUse"><stop offset=".309" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><path fill="url(#iSZtP6eSr5wqIgT3aj5c_b_06SDYXN73bSC_gr2)" d="M46,28.185c0-4.868-3.894-8.815-8.698-8.815c-4.804,0-8.698,3.947-8.698,8.815	c0,0.175,0.016,0.346,0.026,0.519h-8.272c0.037-0.341,0.06-0.686,0.06-1.037c0-5.155-4.123-9.333-9.209-9.333	C6.123,18.333,2,22.512,2,27.667S6.123,37,11.209,37H38C42.564,36.73,46,32.878,46,28.185z"></path><linearGradient id="iSZtP6eSr5wqIgT3aj5c_c_06SDYXN73bSC_gr3" x1="14.368" x2="12.779" y1="37.187" y2="7.309" gradientUnits="userSpaceOnUse"><stop offset=".404" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><path fill="url(#iSZtP6eSr5wqIgT3aj5c_c_06SDYXN73bSC_gr3)" d="M20.175,25.562c-0.943-4.14-4.594-7.229-8.966-7.229c-1.323,0-2.578,0.288-3.715,0.797	c-0.242,0.728-0.378,1.504-0.378,2.314c0,4.009,3.207,7.259,7.163,7.259C16.725,28.704,18.883,27.459,20.175,25.562z"></path><linearGradient id="iSZtP6eSr5wqIgT3aj5c_d_06SDYXN73bSC_gr4" x1="-1.81" x2="39.425" y1="42.205" y2="11.822" gradientUnits="userSpaceOnUse"><stop offset=".309" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><ellipse cx="27.07" cy="20.926" fill="url(#iSZtP6eSr5wqIgT3aj5c_d_06SDYXN73bSC_gr4)" rx="11.767" ry="11.926"></ellipse><linearGradient id="iSZtP6eSr5wqIgT3aj5c_e_06SDYXN73bSC_gr5" x1="31.961" x2="10.537" y1="20.784" y2="21.568" gradientUnits="userSpaceOnUse"><stop offset=".246" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><path fill="url(#iSZtP6eSr5wqIgT3aj5c_e_06SDYXN73bSC_gr5)" d="M17.023,14.739c-1.085,1.805-1.721,3.918-1.721,6.186c0,2.608,0.836,5.014,2.237,6.977	c2.315-1.203,3.902-3.64,3.902-6.458C21.442,18.421,19.617,15.831,17.023,14.739z"></path><linearGradient id="iSZtP6eSr5wqIgT3aj5c_f_06SDYXN73bSC_gr6" x1="26.665" x2="11.328" y1="44.761" y2="9.592" gradientUnits="userSpaceOnUse"><stop offset=".415" stop-color="#33bef0"></stop><stop offset=".652" stop-color="#1797e0"></stop><stop offset=".795" stop-color="#0a85d9"></stop></linearGradient><path fill="url(#iSZtP6eSr5wqIgT3aj5c_f_06SDYXN73bSC_gr6)" d="M15.407,19.368c-0.067,0.51-0.105,1.029-0.105,1.558c0,2.608,0.835,5.012,2.236,6.975	c0.005-0.003,0.011-0.005,0.016-0.007c0.565-0.295,1.086-0.665,1.552-1.095c0.04-0.037,0.076-0.079,0.115-0.118	c0.178-0.172,0.349-0.352,0.509-0.542c0.07-0.083,0.133-0.172,0.199-0.258c0.084-0.11,0.163-0.223,0.241-0.337	C19.55,22.847,17.776,20.604,15.407,19.368z"></path><linearGradient id="iSZtP6eSr5wqIgT3aj5c_g_06SDYXN73bSC_gr7" x1="11.891" x2="37.98" y1="52.879" y2="19.674" gradientUnits="userSpaceOnUse"><stop offset=".309" stop-color="#33bef0"></stop><stop offset="1" stop-color="#0a85d9"></stop></linearGradient><path fill="url(#iSZtP6eSr5wqIgT3aj5c_g_06SDYXN73bSC_gr7)" d="M28.605,28.185c0,1.582,0.417,3.063,1.136,4.346c5.21-1.228,9.096-5.952,9.096-11.606	c0-0.483-0.037-0.956-0.092-1.424c-0.47-0.08-0.95-0.131-1.443-0.131C32.499,19.37,28.605,23.317,28.605,28.185z"></path>
  </svg>
)

@Component({
  tag: 'pyas-connect',
  styleUrl: 'pyas-connect.css',
  shadow: true,
})
export class PyasConnect {
  @HostEl() el!: HTMLElement;
  /** Required: OAuth Client ID  and Token Name */
  @Prop() clientId: string
  @Prop() tokenName: string

  /** Optional: Show provider labels */
  @Prop() showLabels: boolean = true

  /** Optional: Theme (light/dark) */
  @Prop({ reflect: true }) theme: 'light' | 'dark' = 'light';

  /** Optional: Automatically open modal */
  @Prop() autoOpen: boolean = false

  @Prop() googleIcon?: string // SVG markup
  @Prop() outlookIcon?: string
  @Prop() zoomIcon?: string
  @Prop() icloudIcon?: string

  @Prop() modalTitle: string = 'Connect an Account'
  @Prop() modalDescription: string = ''
  @Prop() formTitle: string = 'Enter Your Details'
  @Prop() formDescription: string = ''

  @Prop() showIcloud: boolean = false
  @Prop() showZoom: boolean = true
  @Prop() showGoogle: boolean = true
  @Prop() showOutlook: boolean = true

  @Prop() userName?: string
  @Prop() userEmail?: string

  @Prop() showDisclaimer: boolean = true
  @Prop() appName: string = 'This app'

  @Prop() state: string = '' // Optional state parameter for OAuth flow


  @State() selectedProvider: string = ''
  @State() modalStep: 1 | 2 = 1
  @State() name: string = ''
  @State() email: string = ''
  @State() isLoading: boolean = false;


  /** Emit connection result */
  @Event() accountConnected: EventEmitter<{ provider: string; user: any }>
  /** Emit error result */
  @Event() connectError: EventEmitter<{ message: string, code: string|number|undefined }>


  @State() modalOpen: boolean = false

  connectedCallback() {
    if (this.autoOpen) this.modalOpen = true
  }

  private handleNext(provider: string) {
    this.selectedProvider = provider
    this.name = this.userName || ''
    this.email = this.userEmail || ''
    this.modalStep = 2
  }

  private handlePrev() {
    this.modalStep = 1
  }

  private renderProviderButton(provider: string, label: string, defaultIcon: JSX.Element, slotName: string) {
      return (
        <button
          class="pyas-provider-button"
          onClick={() => this.handleNext(provider)}
        >
          <span class="icon">
            <slot name={slotName}>{defaultIcon}</slot>
          </span>
          <span class="label">{label}</span>
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

  private openOAuthPopup(provider: string, url: string) {
      const popupWidth = 500
      const popupHeight = 600
      const left = window.screenX + (window.outerWidth - popupWidth) / 2
      const top = window.screenY + (window.outerHeight - popupHeight) / 2.5

      const popup = window.open(
        url,
        'pyas_oauth_popup',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
      )

      if (!popup) {
        this.connectError.emit({
          message: 'Popup blocked. Please allow pop-ups and try again.',
          code: 'popup_blocked',
        });
        return;
      }

      const pollId = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(pollId);
          window.removeEventListener('message', handleMessage);

          this.isLoading = false;

          /* Emit a “cancelled” event so host app can react */
          this.connectError.emit({
            message: 'OAuth window closed by user.',
            code: 'user_cancelled',
          });
        }
      }, 500)

      const handleMessage = async (event: MessageEvent) => {
          if (event.origin !== PYAS_BASE_URL) return; // Optional: lock this down
          if (!event.data || event.data.type !== 'pyas-oauth-complete') return;
      
          const { code } = event.data;
          window.removeEventListener('message', handleMessage);
      
          if (!code) {
            this.connectError.emit({
              message: 'OAuth connection failed. No grant code received.',
              code: 'unknown',
            })
            this.isLoading = false
            return popup?.close();
          }

          const query = new URLSearchParams({
            provider,
            clientId: this.clientId,
            tokenName: this.tokenName,
          }).toString();

          const res = await fetch(`${PYAS_BASE_URL}/oauth/init/connect?${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              name: this.name,
              redirectUrl: PYAS_REDIRECT_URL,
            })
          });

          const result = await res.json();
          
          if (!res.ok) {
            console.error('OAuth connect failed:', result?.message);
            this.connectError.emit({
              message: result?.message || result?.error || 'OAuth connect failed',
              code: result?.code || 'unknown',
            })
            this.isLoading = false
            return popup?.close();
          }

          popup?.close();

          const { account } = result.data

          this.accountConnected.emit(account);
          this.isLoading = false
      };

      window.addEventListener('message', handleMessage);
  }

  private getOauthUrl(provider: string) {
    if (!provider || provider === '') return
      const authPayload = {
        provider,
        clientId: this.clientId,
        tokenName: this.tokenName,
        state: this.state,
        redirectUrl: PYAS_REDIRECT_URL,
        email: this.email,
      }

      this.isLoading = true

      const queryString = new URLSearchParams(authPayload).toString()
      fetch(`${PYAS_BASE_URL}/oauth/init?${queryString}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.url) {
            this.openOAuthPopup(this.selectedProvider, data.url)
          } else {
            this.isLoading = false
            console.error('Invalid response from server')
            this.connectError.emit({
              message: 'Invalid response from server',
              code: 'invalid_response',
            })
          }
        })
        .catch((e) => {
          this.isLoading = false
          console.error('Failed to fetch OAuth URL:', e)
          this.connectError.emit({
            message: 'Failed to fetch OAuth URL',
            code: 'fetch_error',
          })
        })
  }

  private closeModal() {
    this.modalOpen = false
    this.modalStep = 1
    this.selectedProvider = ''
    this.isLoading = false
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
                  <div>
                    <h3>{this.modalTitle}</h3>
                    <p>{this.modalDescription}</p>
                  </div>
                 )}
                 {this.modalStep === 2 && (
                    <div>
                      <h3>{this.formTitle}</h3>
                      <p>{this.formDescription}</p>
                    </div>
                 )}
                  
                  <div class="close-modal-wrapper">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke-width="2"
                      stroke="currentColor" 
                      class="pyas-modal-close"
                      onClick={() => this.closeModal()}>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </div>
              </div>
              {this.modalStep === 1 && (
                <div>
                  <div class="pyas-modal-body">
                    <div class="pyas-provider-buttons">
                      { this.showGoogle ? this.renderProviderButton('google', this.showLabels ? 'Google Calendar' : '', <GoogleIcon />, 'google-icon') : null }
                      { this.showOutlook ? this.renderProviderButton('microsoft', this.showLabels ? 'Microsoft Outlook' : '', <OutlookIcon />, 'outlook-icon') : null}
                      { this.showIcloud ? this.renderProviderButton('icloud', this.showLabels ? 'iCloud Calendar' : '', <ICloudIcon />, 'icloud-icon') : null }
                      { this.showZoom ? this.renderProviderButton('zoom', this.showLabels ? 'Zoom' : '', <ZoomIcon />, 'zoom-icon') : null }
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
                      onClick={() => this.getOauthUrl(this.selectedProvider)}
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
                        {this.appName} uses
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
