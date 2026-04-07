// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

Future<void> requestWebNotifPermission() async {
  await html.Notification.requestPermission();
}

bool get webNotifGranted => html.Notification.permission == 'granted';

void showWebNotif(String title, String body) {
  if (html.Notification.permission == 'granted') {
    html.Notification(title, body: body);
  }
}
