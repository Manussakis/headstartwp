# @10up/headless-wp-plugin

## 0.6.0-next.0

### Minor Changes

- 2c62120: Rewriting feed URLs with front-end URLs (except for admin and wp-content upload links)
- fdde401: Introduces a new feature: The PolyLang Integration. To use simply enable the integration

  ```js title="headless.config.js"
  module.exports = {
    // other settings
    integrations: {
      yoastSEO: {
        enable: true,
      },
      polylang: {
        enable: true,
      },
    },
  };
  ```

  and add the supported locales to next.config.js.

  ```js title="next.config.js"
  module.exports = {
    i18n: {
      // These are all the locales you want to support in
      // your application
      locales: ["en", "fr", "nl"],
      // This is the default locale you want to be used when visiting
      // a non-locale prefixed path e.g. `/hello`
      defaultLocale: "en",
    },
  };
  ```

## 0.5.2

### Patch Changes

- e827579: Instead of only checking for HEAD requests, check for a custom header for skiping redirect to the front-end url

## 0.5.2-next.0

### Patch Changes

- e827579: Instead of only checking for HEAD requests, check for a custom header for skiping redirect to the front-end url

## 0.5.1

### Patch Changes

- 9fa4319: Fix previews handling for multisite with locale