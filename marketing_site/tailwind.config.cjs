/** Static build config for the marketing site only.
 *  Scans the marketing_site HTML/JS files (including the header/footer
 *  fragments that are injected at runtime) so the compiled stylesheet
 *  contains every utility class actually used, without needing the
 *  Tailwind Play CDN (which recompiles client-side and causes a visible
 *  flash/reflow on every page load).
 *
 *  IMPORTANT: this site has no build step at deploy time - tailwind.generated.css
 *  is committed and served as-is. If you add/change a Tailwind class in any
 *  marketing_site HTML/JS file, run `npm run build:marketing-css` from the repo
 *  root and commit the updated tailwind.generated.css, or the new class will
 *  silently have no effect in production.
 */
module.exports = {
  content: [
    "./*.html",
    "./*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
