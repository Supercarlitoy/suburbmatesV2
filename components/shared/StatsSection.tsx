"use client";

interface StatItem {
  number: string;
  label: string;
  color: "primary" | "accent" | "success";
}

interface StatsSectionProps {
  stats: StatItem[];
  backgroundColor?: "white" | "gray" | "transparent";
  title?: string;
  description?: string;
}

const colorVariants = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
};

const backgroundVariants = {
  white: "bg-white",
  gray: "bg-gray-50",
  transparent: "",
};

export function StatsSection({
  stats,
  backgroundColor = "transparent",
  title,
  description
}: StatsSectionProps) {
  return (
    <section className={`py-16 ${backgroundVariants[backgroundColor]}`} aria-labelledby={title ? "stats-title" : "stats"}>
      <div className="container mx-auto px-4 text-centre">
        {title ? (
          <div className="mb-12">
            <h2 id="stats-title" className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
            )}
          </div>
        ) : (
          <h2 id="stats" className="sr-only">Key statistics</h2>
        )}
        <div className={`grid ${stats.length === 3 ? 'md:grid-cols-3' : stats.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-8`}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div className={`text-4xl font-bold ${colorVariants[stat.color]} mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}