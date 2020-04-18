import threading
from django.core.mail import EmailMessage


class EmailThread(threading.Thread):
    def __init__(self, subject, message, recipient_list, sender=None):
        self.subject = subject
        self.recipient_list = recipient_list
        self.message = message
        self.sender = sender
        threading.Thread.__init__(self)

    def run(self):
        msg = EmailMessage(self.subject, self.message, self.sender,[self.recipient_list])
        msg.send()


def send_html_mail(subject, message, recipient_list, sender=None):
    EmailThread(subject, message, recipient_list, sender=None).start()