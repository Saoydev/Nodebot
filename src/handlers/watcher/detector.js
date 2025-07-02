function extractVarKeyword(line) {
  const match = line.match(/\b(const|let|var)\b/);
  return match ? match[0] : null;
}

function isMeaningfulChange(newLine, oldLine = '') {
  const oldKeyword = extractVarKeyword(oldLine);
  const newKeyword = extractVarKeyword(newLine);

  if (oldKeyword && newKeyword && oldKeyword !== newKeyword) {
    return true;
  }

  if (oldKeyword && newKeyword && oldKeyword === newKeyword && newLine !== oldLine) {
    return true;
  }

  const stringChange = /(["'`])(?:\\.|[^\\])*?\1/.test(newLine);
  if (stringChange && newLine !== oldLine) return true;

  const patterns = [
    /\b(const|let|var)\b/, /\bfunction\b/, /=>/, /\bclass\b/, /\bmodule\.exports\b/,
    /require\(/, /import\s+/, /export\s+/, /new\s+\w+/,
    /\.set\(/, /\.get\(/, /\.delete\(/, /\.reply\(/, /\.editReply\(/, /\.updateReply\(/,
    /client\.commands\.set\(/,
    /\.map\(/, /\.filter\(/, /\.reduce\(/, /\.forEach\(/, /\.some\(/, /\.every\(/,
    /\.find\(/, /\.findIndex\(/, /\.flat\(/, /\.flatMap\(/,
    /\.includes\(/, /\.startsWith\(/, /\.endsWith\(/, /\.indexOf\(/,
    /\.split\(/, /\.join\(/, /\.trim\(/, /\.replace\(/, /\.slice\(/, /\.splice\(/,
    /\.push\(/, /\.pop\(/, /\.shift\(/, /\.unshift\(/,
    /\.test\(/, /\.exec\(/,
    /\.toLowerCase\(/, /\.toUpperCase\(/,
    /\.concat\(/, /\.fill\(/, /\.copyWithin\(/, /\.entries\(/, /\.every\(/,
    /\.fill\(/, /\.find\(/, /\.findIndex\(/, /\.flat\(/, /\.flatMap\(/,
    /\.forEach\(/, /\.from\(/, /\.includes\(/, /\.indexOf\(/,
    /\.join\(/, /\.keys\(/, /\.lastIndexOf\(/, /\.map\(/, /\.reduce\(/,
    /\.reduceRight\(/, /\.reverse\(/, /\.slice\(/, /\.some\(/,
    /\.sort\(/, /\.splice\(/, /\.toJSON\(/, /\.toLocaleString\(/,
    /\.toString\(/, /\.unshift\(/, /\.values\(/,
  ];

  return patterns.some(p => p.test(newLine));
}

module.exports = { isMeaningfulChange };
