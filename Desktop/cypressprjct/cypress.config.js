const { defineConfig } = require("cypress");

module.exports = {
  user: {
    email: "marko.cena@gmail.com",
    password: "7raX9A.QHq84!6p",
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
