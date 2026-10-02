# Company logo sources

Retrieved September 15, 2026. These local assets identify the employers listed in Daniel's experience timeline. They are company trademarks, not portfolio artwork or a claim of company endorsement.

| Local file | Source and variant | Delivered size | Processing |
| --- | --- | --- | --- |
| `public/assets/companies/ericsson.png` | Ericsson Brand House, full black vertical corporate lockup | 916 × 802 PNG; 8,902 bytes | Original PNG extracted unchanged from the official archive. |
| `public/assets/companies/csl-group.png` | The CSL Group's maritime website, header logo | 432 × 184 PNG; 11,863 bytes | Official 108 × 46 SVG rasterized at 4× with the complete viewBox and original dark slate/red colors. |
| `public/assets/companies/ubisoft.png` | Ubisoft Press Center, black stacked corporate logo | 384 × 353 PNG; 28,769 bytes | Official 2032 × 1867 PNG proportionally resized; complete artwork and transparency retained. |
| `public/assets/companies/categen.png` | Categen's official LinkedIn company avatar, matching the reference supplied by the user | 200 × 200 PNG | Browser Canvas conversion of the original 200 × 200 JPEG, with its embedded color profile honored; no crop or recoloring. |

## Ericsson

- Official starting page: [Ericsson logo media kit](https://www.ericsson.com/en/newsroom/media-kits/logo).
- Public library linked by that page: [Ericsson Brand House - light](https://mediabank.ericsson.net/admin/mb/?h=dbeb87a1bcb16fa379c0020bdf713872).
- Library entry: **Ericsson Logotype and Econ**, media ID `107977`, internal ID `90980`.
- [Official archive download](https://mediabank.ericsson.net/admin/mb/_download.php?media_ids=107977&template=original&h=dbeb87a1bcb16fa379c0020bdf713872&p=dccda36951e6721097a93eae5c593859).
- Selected archive member: `_Digital/Vertical Lockup/Black/PNG/ERI_vertical_RGB.png`.

The full wordmark and symbol are retained together. The media-kit page identifies the logo as an Ericsson trademark and says co-branding undertakings need case-by-case approval. The public download does not itself establish approval for a partnership or co-branding campaign; no such approval is claimed here.

## The CSL Group

- Official source: [CSL's marine shipping website](https://cslships.com/).
- [Original header SVG](https://cslships.com/wp-content/themes/csl/dist/assets/images/header-logo.svg), also identified as the organization's logo in the homepage metadata.
- Native viewBox: `0 0 108 46`; colors: `#2A3741` and `#EE3E42`.

This is the maritime company employing Daniel, not the similarly named biotechnology company. The PNG preserves the complete CSL lettering and maple leaf.

## Ubisoft

- Official source: [Ubisoft Press Center](https://www.ubisoft.com/en-us/company/press), **Media Assets → Ubisoft Logos**.
- [Official logo ZIP](https://staticctf.ubisoft.com/8aefmxkxpxwl/7evFGmjt94zJALDLMtedq9/7ece3bbbff176e1cb1d281ac2c5e5c47/Ubisoft_logos1116.zip).
- Selected archive member: `Ubisoft_logos/ubisoft stacked logo_black.png`.

The stacked symbol and wordmark are retained together. The linked press page supplies these media assets; no additional license or endorsement is inferred from their availability.

## Categen Ventures

- User-supplied visual reference: Categen logo screenshot shared in the task conversation.
- Official company source: [Categen on LinkedIn](https://ca.linkedin.com/company/categen).
- [Company avatar used by the official page](https://media.licdn.com/dms/image/v2/C4D0BAQFgHQs10qY51g/company-logo_200_200/company-logo_200_200/0/1640810731762/categen_logo?e=2147483647&v=beta&t=GQH4wttF0PBR0Dl1x5NVkA3abTK2jQRfmGsivA2K1RU).

The source JPEG contains an embedded ICC profile. Browser rendering preserves the charcoal background as displayed in the user's reference (approximately RGB 53, 54, 58), avoiding a color shift from ignoring that profile. The PNG retains the entire square image.

## Display and maintenance

- Keep native proportions with `object-fit: contain`; never stretch, crop the marks, apply theme color filters, or substitute text approximations.
- Use a consistent light badge surface in both themes for the transparent dark logos; preserve Categen's own background.
- A 56px badge gives the full stacked wordmarks more room than the former 39px initials. Company names remain readable beside the badges.
- Ship these local PNGs rather than hotlinking third-party assets. Replacing a logo should update this source record and retain its native colors and proportions.
