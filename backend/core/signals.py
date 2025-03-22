from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.dispatch import receiver

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, **kwargs):
    reset_link = f"{instance.request.build_absolute_uri('/reset-password/')}?token={reset_password_token.key}"

    # Render the email content
    context = {
        "reset_password_token": reset_password_token,
        "reset_link": reset_link,
    }
    email_subject = "Password Reset Request"
    email_body = render_to_string("password_reset_email.html", context)

    # Send the email
    email = EmailMultiAlternatives(
        subject=email_subject,
        body=email_body,
        from_email="noreply@yourapp.com",
        to=[reset_password_token.user.email],
    )
    email.attach_alternative(email_body, "text/html")
    email.send()
