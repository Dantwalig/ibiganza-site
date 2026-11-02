# IBIGANZA Website

One-page site for IBIGANZA with a contact form that saves messages, sends emails, and a password protected admin page. It uses the same stack and logic as the wedding site (Next.js, Supabase, Gmail or Resend, signed admin cookie).

Pages
- `/` the website
- `/admin` messages list (sign in with ADMIN_PASSWORD)

## Setup (about 20 minutes)

### 1. Database (Supabase, free)
1. Create a project at supabase.com.
2. Open SQL Editor, paste the contents of `supabase/schema.sql`, and run it.
3. Open Project Settings > API and copy the Project URL and the `service_role` key.
   The service_role key stays on the server only. Never put it in front-end code.

### 2. Email
**Option A, Gmail (no domain needed).** On the Gmail account that should send the emails, turn on 2-Step Verification, then go to myaccount.google.com/apppasswords, create an app password, and set `SMTP_USER` (the Gmail address) and `SMTP_PASS` (the 16 characters).

**Option B, Resend (free tier, needs a domain).** Create an API key at resend.com, verify your domain, and set `RESEND_API_KEY` and `EMAIL_FROM` (for example `IBIGANZA <hello@yourdomain.org>`).

Set `NOTIFY_EMAIL` (comma separated) to the addresses that should get an email for every new message, and `REPLY_TO_EMAIL` to the address replies should go to. You can also put these in `lib/config.js`.

### 3. Deploy (Vercel, free)
1. Push this folder to a GitHub repository.
2. Import it in vercel.com as a new project.
3. Under Environment Variables, add every key from `.env.example` with real values.
4. Deploy. Then set NEXT_PUBLIC_SITE_URL to the final address and redeploy.

## Run locally
```
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## How it works
- The contact form posts to `/api/contact`. The server checks the fields, ignores spam (hidden honeypot field), saves the message in Supabase, emails a confirmation to the sender, and emails the team with the running total.
- Unlike the wedding RSVP, every message is saved as a new row. The RSVP form replaced an earlier answer with the same email; for a contact form that would erase earlier messages.
- The admin page has the same tools as the wedding guest list: sign in, totals, search, filter tabs (one per partnership interest), select and delete with a confirmation window, Download CSV, Refresh and Sign out. Sessions last 12 hours.
- The CSV opens in Excel and Google Sheets and ends with a total row. Cells starting with = + - @ are neutralised so they cannot run as formulas.

## Editing
- Page wording: `lib/content.js` (sample impact figures, stories and the events list are marked).
- Contact details, social links, notification emails, partnership interest options and photos: `lib/config.js`.
- Photos: put files in `public/img` and list them in `lib/config.js` under `images`. An empty value shows a placeholder.
- Resource downloads: put files in `public/files` and set `href` in `lib/content.js`.
- Colors and layout: `app/globals.css`.
