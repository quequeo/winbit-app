export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} Winbit. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Portfolio updates daily. Requests processed between 8am-6pm.
          </p>
        </div>
      </div>
    </footer>
  );
};

