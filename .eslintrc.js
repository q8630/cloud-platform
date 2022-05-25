// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  globals: {
    APP_ENV: false
  },
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    /**
     * ES6
     */
    "no-var": 2, // http://eslint.org/docs/rules/no-var
    "prefer-const": 2, // http://eslint.org/docs/rules/prefer-const
    "arrow-parens": 'off', // http://eslint.org/docs/rules/arrow-parens
    "arrow-body-style": [1, "as-needed"], // http://eslint.org/docs/rules/arrow-body-style
    "prefer-destructuring": 0, // http://eslint.org/docs/rules/prefer-destructuring
    "object-curly-newline": 0, // http://eslint.org/docs/rules/object-curly-newline

    /**
     * Variables
     */
    "no-shadow-restricted-names": 2, // http://eslint.org/docs/rules/no-shadow-restricted-names
    "no-unused-vars": [1, { // http://eslint.org/docs/rules/no-unused-vars
      "vars": "local",
      "args": "after-used"
    }],
    "no-use-before-define": 2, // http://eslint.org/docs/rules/no-use-before-define

    /**
     * Possible errorsF
     */
    "no-cond-assign": [2, "always"], // http://eslint.org/docs/rules/no-cond-assign
    "no-constant-condition": 1, // http://eslint.org/docs/rules/no-constant-condition
    "no-dupe-keys": 2, // http://eslint.org/docs/rules/no-dupe-keys
    "no-duplicate-case": 2, // http://eslint.org/docs/rules/no-duplicate-case
    "no-empty": 2, // http://eslint.org/docs/rules/no-empty
    "no-ex-assign": 2, // http://eslint.org/docs/rules/no-ex-assign
    "no-extra-boolean-cast": 0, // http://eslint.org/docs/rules/no-extra-boolean-cast
    "no-extra-semi": 1, // http://eslint.org/docs/rules/no-extra-semi
    "no-func-assign": 2, // http://eslint.org/docs/rules/no-func-assign
    "no-inner-declarations": 2, // http://eslint.org/docs/rules/no-inner-declarations
    "no-invalid-regexp": 0, // http://eslint.org/docs/rules/no-invalid-regexp
    "no-irregular-whitespace": 0, // http://eslint.org/docs/rules/no-irregular-whitespace
    "no-obj-calls": 2, // http://eslint.org/docs/rules/no-obj-calls
    "no-reserved-keys": 0, // http://eslint.org/docs/rules/no-reserved-keys
    "no-sparse-arrays": 0, // http://eslint.org/docs/rules/no-sparse-arrays
    "no-unreachable": 2, // http://eslint.org/docs/rules/no-unreachable
    "use-isnan": 2, // http://eslint.org/docs/rules/use-isnan
    "block-scoped-var": 0, // http://eslint.org/docs/rules/block-scoped-var
    "global-require": 1, // http://eslint.org/docs/rules/global-require
    "no-unused-expressions": 0, // http://eslint.org/docs/rules/no-unused-expressions
    "class-methods-use-this": 0, // http://eslint.org/docs/rules/class-methods-use-this

    /**
     * Best practices
     */
    "consistent-return": 0, // http://eslint.org/docs/rules/consistent-return
    "curly": [2, "multi-line"], // http://eslint.org/docs/rules/curly
    "default-case": 2, // http://eslint.org/docs/rules/default-case
    "eqeqeq": 2, // http://eslint.org/docs/rules/eqeqeq
    "guard-for-in": 0, // http://eslint.org/docs/rules/guard-for-in
    "no-caller": 0, // http://eslint.org/docs/rules/no-caller
    "no-else-return": 2, // http://eslint.org/docs/rules/no-else-return
    "no-eq-null": 1, // http://eslint.org/docs/rules/no-eq-null
    "no-eval": 2, // http://eslint.org/docs/rules/no-eval
    "no-extend-native": 2, // http://eslint.org/docs/rules/no-extend-native
    "no-extra-bind": 2, // http://eslint.org/docs/rules/no-extra-bind
    "no-fallthrough": 2, // http://eslint.org/docs/rules/no-fallthrough
    "no-floating-decimal": 2, // http://eslint.org/docs/rules/no-floating-decimal
    "no-implied-eval": 2, // http://eslint.org/docs/rules/no-implied-eval
    "no-lone-blocks": 2, // http://eslint.org/docs/rules/no-lone-blocks
    "no-loop-func": 2, // http://eslint.org/docs/rules/no-loop-func
    "no-multi-str": 2, // http://eslint.org/docs/rules/no-multi-str
    "no-native-reassign": 2, // http://eslint.org/docs/rules/no-native-reassign
    "no-new": 0, // http://eslint.org/docs/rules/no-new
    "no-new-func": 2, // http://eslint.org/docs/rules/no-new-func
    "no-new-wrappers": 0, // http://eslint.org/docs/rules/no-new-wrappers
    "no-octal": 2, // http://eslint.org/docs/rules/no-octal
    "no-octal-escape": 2, // http://eslint.org/docs/rules/no-octal-escape
    "no-param-reassign": 2, // http://eslint.org/docs/rules/no-param-reassign
    "no-proto": 2, // http://eslint.org/docs/rules/no-proto
    "no-redeclare": 2, // http://eslint.org/docs/rules/no-redeclare
    "no-return-assign": 1, // http://eslint.org/docs/rules/no-return-assign
    "no-script-url": 2, // http://eslint.org/docs/rules/no-script-url
    "no-self-compare": 2, // http://eslint.org/docs/rules/no-self-compare
    "no-sequences": 1, // http://eslint.org/docs/rules/no-sequences
    "no-throw-literal": 2, // http://eslint.org/docs/rules/no-throw-literal
    "no-with": 2, // http://eslint.org/docs/rules/no-with
    "radix": 2, // http://eslint.org/docs/rules/radix
    "vars-on-top": 2, // http://eslint.org/docs/rules/vars-on-top
    "wrap-iife": [2, "any"], // http://eslint.org/docs/rules/wrap-iife
    "yoda": 2, // http://eslint.org/docs/rules/yoda
    "comma-dangle": 0, // http://eslint.org/docs/rules/comma-dangle

    /**
     * Style
     */
    "brace-style": [1, // http://eslint.org/docs/rules/brace-style
      "1tbs", {
        "allowSingleLine": false
      }
    ],
    "block-spacing": 1, // http://eslint.org/docs/rules/block-spacing
    "quotes": [
      2, "single", "avoid-escape" // http://eslint.org/docs/rules/quotes
    ],
    "camelcase": [2, { // http://eslint.org/docs/rules/camelcase
      "properties": "never"
    }],
    "comma-spacing": [2, { // http://eslint.org/docs/rules/comma-spacing
      "before": false,
      "after": true
    }],
    "eol-last": 2, // http://eslint.org/docs/rules/eol-last
    "func-names": 1, // http://eslint.org/docs/rules/func-names
    "key-spacing": [2, { // http://eslint.org/docs/rules/key-spacing
      "beforeColon": false,
      "afterColon": true
    }],
    "new-cap": [2, { // http://eslint.org/docs/rules/new-cap
      "newIsCap": true
    }],
    "no-multiple-empty-lines": [2, { // http://eslint.org/docs/rules/no-multiple-empty-lines
      "max": 2
    }],
    "no-nested-ternary": 1, // http://eslint.org/docs/rules/no-nested-ternary
    "no-new-object": 2, // http://eslint.org/docs/rules/no-new-object
    "no-spaced-func": 2, // http://eslint.org/docs/rules/no-spaced-func
    "no-trailing-spaces": 2, // http://eslint.org/docs/rules/no-trailing-spaces
    // "no-wrap-func": 1, // http://eslint.org/docs/rules/no-wrap-func
    "no-underscore-dangle": 0, // http://eslint.org/docs/rules/no-underscore-dangle
    "padded-blocks": 0, // http://eslint.org/docs/rules/padded-blocks
    "semi": [1, "never"], // http://eslint.org/docs/rules/semi
    "keyword-spacing": 2, // http://eslint.org/docs/rules/keyword-spacing
    // "space-after-keywords": 2, // http://eslint.org/docs/rules/space-after-keywords
    "space-before-blocks": 2, // http://eslint.org/docs/rules/space-before-blocks
    "space-before-function-paren": [2, "never"], // http://eslint.org/docs/rules/space-before-function-paren
    "space-infix-ops": 2, // http://eslint.org/docs/rules/space-infix-ops
    // was removed and replaced by: keyword-spacing
    // "space-return-throw-case": 2, // http://eslint.org/docs/rules/space-return-throw-case
    "spaced-comment": 2, // http://eslint.org/docs/rules/spaced-comment
    // "spaced-line-comment": 2, // http://eslint.org/docs/rules/spaced-line-comment
    "linebreak-style": 0, // http://eslint.org/docs/rules/linebreak-style
    "object-curly-spacing": 0, // http://eslint.org/docs/rules/object-curly-spacing
    "lines-between-class-members": [1, "always"], // http://eslint.org/docs/rules/lines-between-class-members
    "linebreak-style": 0, // http://eslint.org/docs/rules/linebreak-style
    "max-len": 0, // http://eslint.org/docs/rules/max-len
    "no-plusplus": [1, { // http://eslint.org/docs/rules/no-plusplus
      "allowForLoopAfterthoughts": true
    }],
    "quote-props": [1, "as-needed"], // // http://eslint.org/docs/rules/quote-props
    "no-restricted-syntax": 1, // http://eslint.org/docs/rules/no-restricted-syntax
    "import/prefer-default-export": 0, // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/prefer-default-export.md

  }
}
