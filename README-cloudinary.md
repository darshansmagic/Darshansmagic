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

## Next Build Idea

- Admin upload page for Darshan
- Guest upload page for audience photos
- Gallery page grouped by event date
- Automatic optimized image delivery from Cloudinary
