import { useEffect, useState } from 'react'
import { getPublishedAbout, listCollection } from '../services/aboutService'

const COLLECTIONS = {
  skills: 'about_skills',
  technologies: 'about_technologies',
  socialLinks: 'about_social_links',
  statistics: 'about_statistics',
  interests: 'about_interests',
  funFacts: 'about_fun_facts',
  timeline: 'about_timeline',
}

/** Public About section: one fetch for the published profile document + every list. */
export function useAboutPublic() {
  const [about, setAbout] = useState(null)
  const [collections, setCollections] = useState({
    skills: [],
    technologies: [],
    socialLinks: [],
    statistics: [],
    interests: [],
    funFacts: [],
    timeline: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const keys = Object.keys(COLLECTIONS)

    Promise.all([getPublishedAbout(), ...keys.map((key) => listCollection(COLLECTIONS[key]))])
      .then(([aboutData, ...lists]) => {
        if (cancelled) return
        setAbout(aboutData)
        setCollections(Object.fromEntries(keys.map((key, i) => [key, lists[i]])))
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { about, ...collections, loading, error }
}
