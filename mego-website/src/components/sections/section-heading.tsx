export default function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold text-white md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-white/70">{subtitle}</p>
      )}
    </div>
  );
}
