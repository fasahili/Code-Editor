self.addEventListener('push', e => {
  var data = e.data.json();
  const options = {
    icon: '\letscode.png',
    body: 'here is the invitation',
    actions: [{
      action: 'open-invitation-link',
      title: 'Open Invitation Link',
    }]
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  if (e.action === 'open-invitation-link') {
    clients.openWindow('https://www.facebook.com/');
  }
  e.notification.close();
});
