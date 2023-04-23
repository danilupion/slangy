const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;

const measurementIdPresent = () => {
  return measurementId !== undefined;
};

let initializationPromise: Promise<void> | undefined;

export const initialize = () => {
  if (measurementIdPresent() && !initializationPromise) {
    initializationPromise = new Promise((resolve) => {
      const googleScript = document.createElement('script');
      googleScript.async = true;
      googleScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      googleScript.addEventListener('load', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).dataLayer = (window as any).dataLayer || [];
        window.gtag = function gtag() {
          // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
          (window as any).dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId || '');
        resolve();
      });
      document.head.appendChild(googleScript);
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeGtag: Gtag.Gtag = (...args: any[]) => {
  if (initializationPromise) {
    return initializationPromise.then(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (gtag as any)(...args);
    });
  }
  return undefined;
};

type PageviewParams = {
  pathname?: string;
  title?: string;
};

export const pageview = async ({ pathname, title }: PageviewParams) => {
  await safeGtag('event', 'page_view', {
    page_path: pathname,
    page_title: title,
    send_to: measurementId,
  });
};
