"use client";

export default function HowItWorks() {
  return (
    <section id="how" className="bg-cream px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.22em] text-mute-dark">
            The Method
          </span>
          <h2 className="font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
            How <span className="italic">majority voting</span> works
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
            Each model votes independently. The majority wins, and confidence
            is weighted — agreeing models count for more, dissenters less.
          </p>
        </div>

        <div className="mt-14 rounded-card bg-ink p-10 text-cream md:p-14">
          <div className="grid grid-cols-3 gap-6">
            {[
              { name: "Model A", tag: "DeepCNN", color: "#E8773A" },
              { name: "Model B", tag: "FocusCNN", color: "#C9A5E8" },
              { name: "Model C", tag: "HybridNet", color: "#5CB85C" },
            ].map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-cream/10 bg-ink-soft px-4 py-5 text-center"
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: m.color }}
                >
                  {m.tag}
                </p>
                <p className="mt-2 font-serif text-xl">{m.name}</p>
              </div>
            ))}
          </div>

          <svg
            viewBox="0 0 600 200"
            className="mt-6 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M100 0 Q 100 80 300 100"
              stroke="rgba(250,245,237,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M300 0 L 300 100"
              stroke="rgba(250,245,237,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M500 0 Q 500 80 300 100"
              stroke="rgba(250,245,237,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle
              cx="300"
              cy="100"
              r="22"
              fill="#E8773A"
              opacity="0.18"
            />
            <circle cx="300" cy="100" r="9" fill="#E8773A" />
            <path
              d="M300 110 L 300 180"
              stroke="rgba(250,245,237,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M294 174 L 300 184 L 306 174"
              stroke="rgba(250,245,237,0.6)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mx-auto mt-2 max-w-md rounded-2xl border border-orange/30 bg-orange/10 px-6 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">
              Majority Vote
            </p>
            <p className="mt-2 font-serif text-lg">
              Final Verdict + Weighted Confidence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
