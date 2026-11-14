import { DEFAULT_STRINGS } from './strings'
import { LOCALES, matchLocale, resolveLocale, TRANSLATIONS } from './locales'

/** Every built-in language is complete, and the widget finds the right one. */

const slotsOf = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort()

describe('the built-in languages', () => {
    it.each(LOCALES)('%s has every string, each with the same {slots} as English', (locale) => {
        const strings = TRANSLATIONS[locale] as Record<string, string>
        expect(Object.keys(strings).sort()).toEqual(Object.keys(DEFAULT_STRINGS).sort())
        for (const [key, english] of Object.entries(DEFAULT_STRINGS)) {
            expect(typeof strings[key]).toBe('string')
            expect(strings[key].trim().length).toBeGreaterThan(0)
            expect([key, slotsOf(strings[key])]).toEqual([key, slotsOf(english)])
        }
    })

    it.each(LOCALES.filter((locale) => locale !== 'en'))('%s is translated, not English left in place', (locale) => {
        const strings = TRANSLATIONS[locale] as Record<string, string>
        // Brand names stay as they are; the sentences do not.
        const sentences = Object.entries(DEFAULT_STRINGS).filter(([, english]) => english.split(' ').length > 3)
        const untranslated = sentences.filter(([key, english]) => strings[key] === english).map(([key]) => key)
        expect(untranslated).toEqual([])
    })

    it('no language uses an em dash', () => {
        for (const locale of LOCALES) expect(JSON.stringify(TRANSLATIONS[locale])).not.toContain('—')
    })
})

describe('choosing the language', () => {
    it('matches tags to ours: regions, Norwegian and Portuguese', () => {
        expect(matchLocale('de-AT')).toBe('de')
        expect(matchLocale('nb-NO')).toBe('nb')
        expect(matchLocale('nn')).toBe('nb')
        expect(matchLocale('no')).toBe('nb')
        expect(matchLocale('pt-PT')).toBe('pt-BR')
        expect(matchLocale('pt_BR')).toBe('pt-BR')
        expect(matchLocale('FR')).toBe('fr')
        expect(matchLocale('ja')).toBeNull()
        expect(matchLocale('')).toBeNull()
    })

    it('takes the first one we have: the property, the page, then the browser, then English', () => {
        expect(resolveLocale('sv', 'de', 'fr')).toBe('sv')
        expect(resolveLocale(undefined, 'de', 'fr')).toBe('de')
        expect(resolveLocale(undefined, 'ja', 'fr-CA', 'en')).toBe('fr')
        expect(resolveLocale(undefined, '', 'zh')).toBe('en')
    })
})
