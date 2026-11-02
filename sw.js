/* Blood Moon: Service Worker für Benachrichtigungen (neben index.html hochladen) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (er) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    // spielt man gerade (Fenster vorne): keine Benachrichtigung, das Spiel zeigt es selbst
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (list.some((c) => c.focused && c.visibilityState === 'visible')) return;
    await self.registration.showNotification(d.title || 'Blood Moon', {
      body: d.body || '', tag: d.tag || 'bloodmoon', renotify: true,
      icon: d.icon || undefined, badge: d.badge || undefined,
      data: { url: d.url || './' },
    });
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope)) { c.postMessage({ t: 'push-open', url }); return c.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
