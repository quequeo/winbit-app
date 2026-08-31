const LOGO_SRC = '/images/login/logo-winbit.png';

// The artwork already includes the "GESTIÓN ACTIVA EN USD" descriptor, so sizes are
// tuned to keep that second line readable without outgrowing the 3.5rem header.
export const WinbitLogo = ({ className = '', centered = false, size = 'header' }) => {
  const heights = {
    header: 'h-11 md:h-12',
    login: 'h-[5.25rem] sm:h-[6.5rem] md:h-[7rem]',
    compact: 'h-10 md:h-11',
  };

  return (
    <div className={`flex flex-col ${centered ? 'items-center' : 'items-start'} ${className}`}>
      <img
        src={LOGO_SRC}
        alt="Winbit"
        className={`${heights[size] ?? heights.header} w-auto object-contain`}
        width={662}
        height={207}
      />
    </div>
  );
};
