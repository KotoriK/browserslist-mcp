/**
 * Browserslist Query Documentation
 * This provides comprehensive information about how to write browserslist queries
 */

export const BROWSERSLIST_DOCUMENTATION = `
# Browserslist Query Syntax

Browserslist is a tool to share target browsers between different front-end tools.

## Basic Query Types

### Browser Versions
- \`last 2 versions\` - the last 2 versions for each browser
- \`last 2 Chrome versions\` - the last 2 versions of Chrome
- \`> 5%\` - versions with more than 5% global usage
- \`>= 5%\` - versions with 5% or more global usage
- \`> 5% in US\` - versions with more than 5% usage in the US
- \`> 5% in alt-AS\` - versions with more than 5% in region (alt-AS is Asia)
- \`> 5% in my stats\` - versions with more than 5% in custom usage data

### Browser Names
- \`Chrome > 90\` - Chrome versions newer than 90
- \`Chrome >= 90\` - Chrome 90 or newer
- \`Chrome < 90\` - Chrome versions older than 90
- \`Chrome <= 90\` - Chrome 90 or older
- \`Chrome 90\` - Chrome version 90
- \`Firefox ESR\` - the latest Firefox ESR version

### Date Ranges
- \`since 2015\` - all versions released since year 2015 (including 2015)
- \`last 2 years\` - all versions released during last 2 years
- \`since 2015-03\` - all versions since March 2015
- \`since 2015-03-10\` - all versions since 10 March 2015

### Special Queries
- \`defaults\` - Browserslist's default browsers (> 0.5%, last 2 versions, Firefox ESR, not dead)
- \`dead\` - browsers without official support or updates for 24 months
- \`not dead\` - exclude dead browsers
- \`maintained node versions\` - all Node.js versions still maintained by the Node.js Foundation
- \`node 10\` - Node.js 10.x.x
- \`current node\` - Node.js version used during browserslist execution

### Coverage
- \`cover 99.5%\` - most popular browsers that provide coverage
- \`cover 99.5% in US\` - coverage in the US
- \`cover 99.5% in my stats\` - coverage in custom usage data

## Combining Queries

You can combine queries using boolean operators:

- **OR (comma)**: \`last 1 version, > 1%\`
- **AND (and)**: \`last 1 version and > 1%\`
- **NOT (not)**: \`> 0.5%, not IE 11\`

### Examples
- \`last 1 version or > 1%\` - last version OR more than 1%
- \`> 0.5%, not IE 11\` - more than 0.5% usage AND not IE 11
- \`Firefox > 20, Chrome > 20\` - Firefox newer than 20 OR Chrome newer than 20

## Browser Names

Supported browser names (case insensitive):
- \`Android\` - Android WebView
- \`Baidu\` - Baidu Browser
- \`BlackBerry\` / \`bb\` - BlackBerry browser
- \`Chrome\` - Google Chrome
- \`ChromeAndroid\` / \`and_chr\` - Chrome for Android
- \`Edge\` - Microsoft Edge
- \`Electron\` - Electron framework
- \`Explorer\` / \`ie\` - Internet Explorer
- \`ExplorerMobile\` / \`ie_mob\` - Internet Explorer Mobile
- \`Firefox\` / \`ff\` - Mozilla Firefox
- \`FirefoxAndroid\` / \`and_ff\` - Firefox for Android
- \`iOS\` / \`ios_saf\` - iOS Safari
- \`Node\` - Node.js
- \`Opera\` - Opera
- \`OperaMini\` / \`op_mini\` - Opera Mini
- \`OperaMobile\` / \`op_mob\` - Opera Mobile
- \`QQAndroid\` / \`and_qq\` - QQ Browser for Android
- \`Safari\` - desktop Safari
- \`Samsung\` - Samsung Internet
- \`UCAndroid\` / \`and_uc\` - UC Browser for Android
- \`kaios\` - KaiOS Browser

## Configuration Files

Browserslist will search for configuration in:
1. \`browserslist\` field in \`package.json\`
2. \`.browserslistrc\` file in current or parent directories
3. \`browserslist\` config file in current or parent directories
4. \`BROWSERSLIST\` environment variable

## Environment-specific Queries

You can specify different queries for different environments:

\`\`\`
[production]
> 1%
not dead

[development]
last 1 chrome version
last 1 firefox version
\`\`\`

## Best Practices

1. **Use \`defaults\`** as a starting point
2. **Exclude dead browsers**: add \`not dead\`
3. **Consider maintenance**: use \`not ie 11\` if you don't support IE
4. **Be specific**: define exact requirements for your project
5. **Test your queries**: verify the output matches your expectations

## Common Query Examples

- \`defaults\` - recommended default
- \`> 0.5%, last 2 versions, Firefox ESR, not dead\` - comprehensive coverage
- \`last 2 versions, > 1%, not ie 11\` - modern browsers
- \`Chrome > 90, Firefox > 88, Safari > 14\` - specific modern versions
- \`cover 99.5%\` - maximum coverage approach
`;

export const BROWSERSLIST_EXAMPLES = [
  {
    query: 'defaults',
    description: 'Browserslist default browsers (recommended starting point)'
  },
  {
    query: 'last 2 versions',
    description: 'Last 2 versions of all browsers'
  },
  {
    query: '> 1%',
    description: 'Browsers with more than 1% global usage'
  },
  {
    query: 'not dead',
    description: 'Exclude browsers without updates for 24 months'
  },
  {
    query: 'last 2 versions and not dead',
    description: 'Last 2 versions excluding dead browsers'
  },
  {
    query: 'Chrome > 90',
    description: 'Chrome versions newer than 90'
  },
  {
    query: 'last 1 year',
    description: 'All versions released in the last year'
  },
  {
    query: '> 0.5%, not IE 11',
    description: 'More than 0.5% usage, excluding IE 11'
  }
];
