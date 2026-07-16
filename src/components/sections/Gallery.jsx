import { useGalleryItems } from '../../hooks/useGalleryItems'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

const aspectClasses = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
  square: 'aspect-square',
}

const Gallery = () => {
  const { items, loading, error } = useGalleryItems(12)

  return (
    <section id="gallery" className="bg-navy px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Gallery"
          title="Moments worth remembering"
          description="A collection of landscapes, night skies, and everyday scenes — mostly captured around Lake Tekapo."
          align="center"
          theme="dark"
        />

        {!loading && error ? (
          <Reveal className="py-10 text-center text-alpine/70">
            Couldn&rsquo;t load photos right now — please try again shortly.
          </Reveal>
        ) : !loading && items.length === 0 ? (
          <Reveal className="py-10 text-center text-alpine/70">
            Photos are on their way — check back soon.
          </Reveal>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.1} className="break-inside-avoid">
                <figure
                  className={`group relative overflow-hidden rounded-3xl ${aspectClasses[item.aspect]}`}
                >
                  <img
                    src={item.media?.url}
                    alt={item.media?.alt_text ?? item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/85 via-navy/10 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <figcaption>
                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-turquoise">
                        {item.category?.name ?? 'Gallery'}
                      </span>
                      <p className="mt-1 text-base font-medium text-alpine">{item.title}</p>
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
