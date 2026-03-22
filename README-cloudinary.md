# Cloudinary Setup

This project can use Cloudinary for phone-friendly photo uploads, image hosting,
and automatic event galleries grouped by date.

## Account

- Email: `darsaranya@gmail.com`
- Password: do not store in this file or commit it to the project

## Recommended Use

- Use Cloudinary to upload event photos from a phone
- Save event metadata such as:
  - event name
  - event date
  - optional caption
- Build galleries grouped by event date or upload date

## Required Environment Variables

Store these in a local `.env` file or your hosting provider's environment
variable settings:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Notes

- Do not commit passwords or API secrets to the repository
- The Cloudinary free plan uses monthly credits shared across storage,
  bandwidth, and transformations
- A phone upload page can be added later for admin uploads and guest uploads

## Current Integration In This Project

- The site now includes a Cloudinary upload section in [index.html](C:\Users\vigne\Downloads\Magic\index.html)
- It uses the Cloudinary Upload Widget, which is a good fit for this static project
- Recent uploads are shown back on the page from browser local storage for convenience

## Cloudinary Console Setup

1. In the onboarding screen, choose `Integrate Cloudinary with my tech stack`
2. In Cloudinary, go to `Settings` -> `Upload`
3. Create an `Unsigned` upload preset
4. Optionally restrict formats to images only
5. Copy your `Cloud name` from the Cloudinary dashboard
6. Paste both values into the `cloudinaryConfig` object inside [index.html](C:\Users\vigne\Downloads\Magic\index.html)

Example:

```js
const cloudinaryConfig = {
  cloudName: "your-cloud-name",
  uploadPreset: "darshan_magic_unsigned",
  folder: "darshan-magic",
  tags: ["darshan-magic", "live-show"]
};
```

## Important Security Note

- Only use an `unsigned` upload preset on the frontend
- Never put `CLOUDINARY_API_SECRET` into `index.html` or any browser-side code
- If you later want private admin-only uploads or automatic gallery syncing, add a small backend upload/signature route

## Next Build Idea

- Admin upload page for Darshan
- Guest upload page for audience photos
- Gallery page grouped by event date
- Automatic optimized image delivery from Cloudinary
