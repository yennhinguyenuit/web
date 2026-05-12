const defaultImages = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1000&q=85',
];

export default function InfoPage({ eyebrow, title, description, sections = [], stats = [], cta, heroImage }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">{description}</p>
          </div>
          <img
            src={heroImage || defaultImages[0]}
            alt={title}
            className="aspect-[16/10] w-full rounded-lg object-cover shadow-sm"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {stats.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-black text-zinc-950">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section, index) => (
            <article key={section.title} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              <img
                src={section.image || defaultImages[index % defaultImages.length]}
                alt={section.title}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{section.kicker}</p>
                <h2 className="mt-2 text-xl font-black text-zinc-950">{section.title}</h2>
                <p className="mt-3 leading-7 text-zinc-600">{section.body}</p>
                {section.items?.length > 0 && (
                  <div className="mt-5 grid gap-2">
                    {section.items.map((item) => (
                      <div key={item} className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {cta && (
          <div className="mt-8 grid gap-6 overflow-hidden rounded-lg bg-zinc-950 text-white md:grid-cols-[1fr_320px]">
            <div className="p-8">
              <h2 className="text-2xl font-black">{cta.title}</h2>
              <p className="mt-2 max-w-2xl text-zinc-300">{cta.body}</p>
              {cta.href && (
                <a href={cta.href} className="mt-5 inline-flex rounded-md bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100">
                  {cta.label}
                </a>
              )}
            </div>
            <img src={cta.image || defaultImages[1]} alt={cta.title} className="hidden h-full w-full object-cover md:block" />
          </div>
        )}
      </div>
    </div>
  );
}
