const { desktopCapturer } = require('electron');

function isRusscordUrl(url) {
  if (!url || url === 'about:blank') return false;
  try {
    const u = new URL(url);
    return u.hostname === 'app.russcord.ru';
  } catch {
    return false;
  }
}

function isRusscordSecurityOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return u.hostname === 'app.russcord.ru';
  } catch {
    return origin.includes('app.russcord.ru');
  }
}

/**
 * Разрешения для демо видео/экрана и медиа на app.russcord.ru
 * @param {import('electron').Session} ses
 */
function registerAppPermissions(ses) {
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const reqUrl =
      details && 'requestingUrl' in details && details.requestingUrl
        ? details.requestingUrl
        : webContents.getURL();

    const allowed = new Set([
      'media',
      'display-capture',
      'fullscreen',
      'notifications',
      'clipboard-read',
      'clipboard-sanitized-write',
    ]);

    if (isRusscordUrl(reqUrl) && allowed.has(permission)) {
      callback(true);
      return;
    }

    callback(false);
  });

  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const allowed = new Set(['media', 'fullscreen', 'notifications']);

    const originOk =
      isRusscordSecurityOrigin(requestingOrigin) ||
      (webContents && isRusscordUrl(webContents.getURL()));

    if (originOk && allowed.has(permission)) {
      return true;
    }
    return false;
  });

  ses.setDisplayMediaRequestHandler(async (request, callback) => {
    if (!isRusscordSecurityOrigin(request.securityOrigin)) {
      callback({});
      return;
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1, height: 1 },
      });

      const primaryScreen =
        sources.find((s) => String(s.id).includes('screen')) ?? sources[0];

      if (!primaryScreen) {
        callback({});
        return;
      }

      callback({
        video: { id: primaryScreen.id, name: primaryScreen.name },
      });
    } catch {
      callback({});
    }
  });
}

module.exports = {
  registerAppPermissions,
  isRusscordUrl,
};
