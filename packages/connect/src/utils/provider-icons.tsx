import {h, JSX } from '@stencil/core';
import { GoogleIcon, OutlookIcon, ZoomIcon, ICloudIcon } from '../icons';

export type Provider = 'google' | 'microsoft' | 'zoom' | 'icloud';

const ICON_MAP: Record<Provider, () => JSX.Element> = {
  google: GoogleIcon,
  microsoft: OutlookIcon,
  zoom: ZoomIcon,
  icloud: ICloudIcon,
} as const

export const renderProviderIcon = (provider: string): JSX.Element => {
  const Icon = ICON_MAP[provider as Provider];
  return Icon ? <Icon /> : <span></span>;
};
