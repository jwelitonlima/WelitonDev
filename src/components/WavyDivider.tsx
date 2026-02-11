const WavyDivider = ({ direction = "dark-to-light" }: { direction?: "dark-to-light" | "light-to-dark" }) => {
  if (direction === "light-to-dark") {
    return (
      <div className="wavy-divider wavy-divider-dark">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C300,80 600,0 900,40 C1050,60 1150,30 1200,40 L1200,80 L0,80 Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="wavy-divider wavy-divider-light">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,40 C300,80 600,0 900,40 C1050,60 1150,30 1200,40 L1200,80 L0,80 Z" />
      </svg>
    </div>
  );
};

export default WavyDivider;
