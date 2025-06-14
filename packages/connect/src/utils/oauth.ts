export const ENV = {
    PYAS_BASE_URL: 'https://api.pyas.io',
    PYAS_REDIRECT_URL: 'https://api.pyas.io/oauth/callback',
}

interface OAuthPayload {
    provider: string;
    clientId: string;
    tokenName: string;
    state?: string;
    redirectUrl?: string;
    email?: string;
    name?: string;
    url?: string;
}

export const getOauthUrl = async (payload: OAuthPayload ) => {
    try {
        if (!payload.provider || payload.provider === '') {
            throw new Error('Provider is required');
        }

        const authPayload = {
          ...payload
        }

        if (!authPayload.redirectUrl) authPayload.redirectUrl = ENV.PYAS_REDIRECT_URL;

        function getErrorCodeMessage(error: string | undefined): { code: string, message: string } {
            if (!error) return { code: 'invalid_response', message: 'Invalid response from server' };
            const err = error.toLowerCase();
            if (err.includes('token not found')) return { code: 'invalid_token', message: error };
            if (err.includes('invalid client')) return { code: 'invalid_client', message: error };
            if (err.includes('invalid grant')) return { code: 'invalid_grant', message: error };
            if (err.includes('unauthorized')) return { code: 'unauthorized', message: error };
            if (err.includes('expired')) return { code: 'expired', message: error };
            if (err.includes('not allowed')) return { code: 'not_allowed', message: error };
            return {
                code: 'unknown',
                message: error
            };
        }

        const queryString = new URLSearchParams(authPayload).toString()
        try {
            const res = await fetch(`${ENV.PYAS_BASE_URL}/oauth/init?${queryString}`);
            const data = await res.json();
            if (data && data.url) {
                return {
                    success: true,
                    url: data.url,
                };
            } else {
                return {
                    success: false,
                    error: getErrorCodeMessage(data?.error || 'Invalid response from server')
                };
            }
        } catch (e) {
            return {
                success: false,
                error: {
                    code: 'fetch_error',
                    message: 'Failed to fetch OAuth URL',
                    error: e instanceof Error ? e.message : String(e)
                }
            };
        }

    } catch (error) {
        return {
            success: false,
            error: {
                code: 'url_generation_error',
                message: 'Failed to generate OAuth URL',
                error: error instanceof Error ? error.message : String(error)
            }
        };
    }
}

export const openOAuthPopup = (payload: OAuthPayload): Promise<any> => {
    return new Promise((resolve) => {
        const popupWidth = 500;
        const popupHeight = 600;
        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2.5;

        const popup = window.open(
            payload.url,
            'pyas_oauth_popup',
            `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
        );

        if (!popup) {
            resolve({
                success: false,
                error: {
                    code: 'popup_blocked',
                    message: 'Popup blocked. Please allow pop-ups and try again.'
                }
            });
            return;
        }

        let closedByUser = true;

        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== ENV.PYAS_BASE_URL) return;
            if (!event.data || event.data.type !== 'pyas-oauth-complete') return;

            const { code } = event.data;
            window.removeEventListener('message', handleMessage);

            if (!code) {
                closedByUser = false;
                popup?.close();
                resolve({
                    success: false,
                    error: {
                        code: 'invalid_grant',
                        message: 'OAuth connection failed. No grant code received.'
                    }
                });
                return;
            }

            try {
                const query = new URLSearchParams({
                    provider: payload.provider,
                    clientId: payload.clientId,
                    tokenName: payload.tokenName,
                }).toString();

                closedByUser = false;

                const res = await fetch(`${ENV.PYAS_BASE_URL}/oauth/init/connect?${query}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        name: payload.name,
                        redirectUrl: payload.redirectUrl ? payload.redirectUrl : ENV.PYAS_REDIRECT_URL,
                    })
                });

                const result = await res.json();

                if (!res.ok) {
                    popup?.close();
                    resolve({
                        success: false,
                        error: {
                            code: result?.code || 'unknown',
                            message: result?.message || result?.error || 'OAuth connect failed'
                        }
                    });
                    return;
                }
                popup?.close();

                const { account } = result.data;
                resolve({
                    success: true,
                    account
                });
            } catch (error) {
                closedByUser = false;
                popup?.close();
                resolve({
                    success: false,
                    error: {
                        code: 'connect_error',
                        message: 'OAuth connect failed',
                        error: error instanceof Error ? error.message : String(error)
                    }
                });
            }
        };

        window.addEventListener('message', handleMessage);

        const pollId = window.setInterval(() => {
            let hasClosed = false;
            try {
                hasClosed = popup?.closed ?? true;
            } catch {
                hasClosed = true;
            }

            if (hasClosed) {
                window.clearInterval(pollId);
                window.removeEventListener('message', handleMessage);

                if (closedByUser) {
                    resolve({
                        success: false,
                        error: {
                            code: 'user_cancelled',
                            message: 'OAuth window closed by user.'
                        }
                    });
                }
            }
        }, 500);
    });
};
