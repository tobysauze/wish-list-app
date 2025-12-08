# Customize Supabase Signup Email

## Step 1: Access Email Templates in Supabase

1. Go to your Supabase dashboard
2. Click **Authentication** in the left sidebar
3. Click **Email Templates** (under CONFIGURATION)
4. Select **Confirm signup** template

## Step 2: Customize the Email

You can customize:
- **Subject**: Change the email subject line
- **Body**: Customize the HTML email content
- **Redirect URL**: Where users go after clicking the confirmation link

## Step 3: Email Template Variables

Supabase provides these variables you can use:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - Confirmation token (if needed)

## Step 4: Recommended Customizations

### Subject Line:
```
Welcome to Wish List App - Confirm Your Email
```

### Email Body Template:
See `email-templates/confirm-signup.html` for a complete HTML template.

## Step 5: Test Your Email

1. Save your changes in Supabase
2. Try signing up with a test email
3. Check that the email looks correct

## Additional Email Templates

You can also customize:
- **Magic Link** - For passwordless login
- **Change Email Address** - When users change their email
- **Reset Password** - Password reset emails
- **Invite User** - If you add user invitations later

