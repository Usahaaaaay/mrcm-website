const WORDS_PER_MINUTE = 200

export function estimateReadingMinutes(wordCount) {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
