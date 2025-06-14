import {
  GoogleIconSvg as GoogleIcon,
  OutlookIconSvg as OutlookIcon,
  ZoomIconSvg as ZoomIcon,
  ICloudIconSvg as ICloudIcon,
} from '@pyas/connect';

type Provider = 'google' | 'microsoft' | 'zoom' | 'icloud';

const iconsMap: Record<Provider, string> = {
  google:    GoogleIcon,
  microsoft: OutlookIcon,
  zoom:      ZoomIcon,
  icloud:    ICloudIcon,
};

export const getProviderIcon = (provider: string) => {
  return iconsMap[provider as Provider] || '';
};
