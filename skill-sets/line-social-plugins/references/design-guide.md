# Design Guide (Custom Icons)

Source: `https://developers.line.biz/en/docs/line-social-plugins/resources/design-guide/`

When you create a Share button with a **custom icon** (Method 2 in
`share-button.md`), you must follow this design guide. You can either download
the official sample images or design your own icon according to the rules
below.

Custom-icon usage is wired up via the Share URL — see "Method 2 — Custom icons"
in `share-button.md`. The relevant Share-button section is
`/en/docs/line-social-plugins/install-guide/using-line-share-buttons/#using-custom-icons`.

## Sample images

LY Corporation provides ready-made sample images in **6 languages**:

| Language code | Language |
|---|---|
| EN | English |
| JP | 日本語 |
| KR | 한국어 |
| TW | 中文 |
| TH | ภาษาไทย |
| ID | Bahasa Indonesia |

On the doc page, select a language and click **Download image**.

> **Retina note:** The image files are saved at **twice their original size** to
> support Retina (high-DPI) displays. Account for the 2× scale when sizing the
> icon in your layout (display it at half the pixel dimensions).

## Design guide for custom icons

If you design your own icon instead of using the samples, follow two rules:

### Color

Use the official LINE color treatment shown in the design-guide image
(`/media/line-social-plugins/en/guide_custom_icons.png`). Do not alter or
recolor the LINE brand mark outside the permitted color set.

### Text

Show button text such as **"Share with LINE"**. The recommended button text per
language is:

| Language | Text |
|---|---|
| EN | Share |
| JP | LINEで送る |
| KR | 공유하기 |
| TW | 分享 |
| TH | แชร์ |
| ID | Share |

## Guidelines tie-in

The Usage Guidelines (see `guidelines-and-release-notes.md`) also constrain
custom icons. Key points that apply here:

- Installers **must use the Dedicated Icons** (the official LINE Social Plugin
  Button icons) when installing a button — or the **text wordings specified by
  the Company** in place of the icons.
- Installers **may not alter or modify** the Dedicated Icons in any manner.
- Installers **may not display** trademarks, logos, icons, or emblems that are
  **similar to** the Dedicated Icons.
- A button must not be installed where the site design **interferes with the
  readability** of the button.
