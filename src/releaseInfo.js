import pkg from '../package.json';

export const RELEASE_VERSION = pkg.version;

export const RELEASE_CHANNELS = Object.freeze({
  DESKTOP: 'desktop',
  STEAM: 'steam',
  HTML: 'html',
  DEV: 'dev',
});

const CHANNEL_LABELS = Object.freeze({
  [RELEASE_CHANNELS.DESKTOP]: 'Desktop',
  [RELEASE_CHANNELS.STEAM]: 'Steam',
  [RELEASE_CHANNELS.HTML]: 'HTML',
  [RELEASE_CHANNELS.DEV]: 'Dev',
});

export function normalizeReleaseChannel(rawChannel = RELEASE_CHANNELS.DESKTOP) {
  const channel = String(rawChannel || RELEASE_CHANNELS.DESKTOP).toLowerCase();
  return Object.values(RELEASE_CHANNELS).includes(channel) ? channel : RELEASE_CHANNELS.DESKTOP;
}

export function getReleaseInfo(env = {}) {
  const channel = normalizeReleaseChannel(env.VITE_RELEASE_CHANNEL);
  const channelLabel = CHANNEL_LABELS[channel];
  return {
    version: RELEASE_VERSION,
    channel,
    channelLabel,
    displayLabel: `${channelLabel} v${RELEASE_VERSION}`,
  };
}

export const RELEASE_INFO = getReleaseInfo(import.meta.env);
