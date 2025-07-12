const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Custom watch options
    config.watchOptions = {
      ignored: ["!**/node_modules/your-package-name/**"],
    };

    // Add PDF.js worker loader
    config.module.rules.push({
      test: /pdf\.worker\.min\.mjs$/,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;
