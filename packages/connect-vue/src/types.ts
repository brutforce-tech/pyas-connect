export interface PyasConnectProps {
  clientId: string;
  tokenName: string;
  theme?: 'light' | 'dark';
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
  /** callback for success */
  onAccountConnected?: (account: {
    provider: string;
    accountId: string;
    name: string;
    email: string;
    scopes: string[];
    status: string;
  }) => void;
  /** callback for error */
  onConnectError?: (error: { message: string; code: string; error?: any }) => void;
}
