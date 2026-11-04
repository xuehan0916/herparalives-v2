import type { Dimension } from "@/lib/dimensions";

export default function FragmentGem({
  dimension,
  className = "",
}: {
  dimension?: Dimension;
  className?: string;
}) {
  return (
    <svg
      className={"fragment-gem " + className}
      viewBox="0 0 80 94"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M40 3 70 26 65 67 40 91 14 67 10 26Z"
        fill="currentColor"
        fillOpacity=".12"
        stroke="currentColor"
        strokeOpacity=".7"
      />
      <path
        d="m40 3-9 32 9 56 12-56L40 3ZM10 26l21 9 21 0 18-9M14 67l17-32m34 32L52 35"
        stroke="currentColor"
        strokeOpacity=".45"
      />
      <path
        d="m40 25 3 13 10 5-10 5-3 14-4-14-10-5 10-5Z"
        fill="currentColor"
        fillOpacity=".85"
      />
      {dimension === "relationship" && (
        <circle
          cx="40"
          cy="44"
          r="22"
          stroke="currentColor"
          strokeOpacity=".4"
        />
      )}
    </svg>
  );
}
