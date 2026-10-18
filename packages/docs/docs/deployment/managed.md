# Managed hosting

Everything else in these docs describes running the guide yourself, which is free and stays free. If you would rather not, SmartCompanion offers hosting with a content management system on top.

This page exists so the option is visible. It is not a requirement, and the self-hosted path is not a lesser version of the product — the demo apps and the customers' apps run the same code.

## The plans

Current pricing is on [smartcompanion.app](https://www.smartcompanion.app/); this is a summary.

**Community Edition — free.** The open-source version, which is what these docs are about.

- Entirely self-managed and self-maintained
- Fully customizable at the source level
- Community support through GitHub

**Managed Plan — €599 per year.** Hosting and support for an organisation.

- Content management system
- Hosting, maintenance and support
- Individual branding
- Starts immediately

**Custom Plan — individual pricing.** For requirements the standard product does not cover.

- Custom features and design
- App store publication
- Personal support and training
- Content production
- Support for large visitor numbers

## What the CMS changes

The substantial difference is content editing. Self-hosted, your content is a `data.json` file you edit and publish; the managed plan puts an editor in front of it, so stations, translations and media are managed in a browser by people who do not want to see JSON.

Everything else — the app, the data format, the features — is the same code.

## When self-hosting is the right call

- You have someone comfortable with git and a build step
- Your content changes rarely, or is produced in bulk and published at once
- You already have hosting and a domain
- You want the deployment inside your own infrastructure
- The budget is zero

## When the managed plan is

- Nobody on staff wants to own a build pipeline
- Content is edited often, by people who are not developers
- You want someone to call when it breaks on the morning of an opening
- You need app store publication, which a PWA does not give you

## Moving between them

Both directions are practical, because the data format is the same either way and the app is open source.

**Self-hosted → managed.** Your `data.json` and media come across as they are, and your branding is a values file.

**Managed → self-hosted.** The content exports in the same format, and you run it yourself. There is no proprietary content format and no lock-in.

## Contact

- **Web** — <https://www.smartcompanion.app/>
- **Email** — <hello@smartcompanion.app>
