BAASH Vendor Registration — V2

This package upgrades the existing frontend while keeping the working Google Apps Script backend.

Included:
- Poppins typography
- BAASH logo in header/welcome/footer
- Welcome/landing page + Start Registration
- 4-step vendor registration
- State/city dropdowns using CountriesNow API
- Strong client-side validation and required-field markers
- File validation (PDF/JPG/PNG, max 10 MB)
- Processing overlay after final submission
- Professional responsive UI
- Terms & Conditions and Privacy Policy pages (drafts — legal review required)
- Social/contact footer

IMPORTANT:
1. The frontend is already configured with the current Google Apps Script Web App URL supplied earlier.
2. Keep your currently working Apps Script Code.gs/backend. Do not replace it with an older backend from an earlier package.
3. Upload all files preserving this structure, including assets/baash-logo.png.
4. The state/city API is CountriesNow. If your hosting environment blocks cross-origin API calls, use a backend proxy or replace the location API implementation.
5. The Terms & Conditions and Privacy Policy included here are portal drafts. Have BAASH legal counsel approve/rewrite them before production.
6. Your backend currently handles sensitive KYC documents. Review Drive sharing/access settings before production; avoid making Aadhaar/PAN/cancelled-cheque files publicly accessible unless that is deliberately required.
