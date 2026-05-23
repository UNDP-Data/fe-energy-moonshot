import { useEffect, useRef } from 'react';
import headerBg from '../assets/header-bg.jpg';
import { useTranslation } from 'react-i18next';

function Banner() {
  const { t } = useTranslation();
  const bannerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || typeof window === 'undefined') return undefined;

    let frameId: number | undefined;
    const updateParallax = () => {
      frameId = undefined;
      const rect = banner.getBoundingClientRect();
      const offset = Math.max(-24, Math.min(24, rect.top * -0.08));
      banner.style.setProperty('--banner-parallax-offset', `${offset}px`);
    };

    const requestUpdate = () => {
      if (frameId !== undefined) return;
      frameId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section
      ref={bannerRef}
      className='banner-section flex-div flex-column flex-hor-align-center padding-left-10'
    >
      <div
        aria-hidden='true'
        className='banner-parallax-bg'
        style={{ backgroundImage: `url(${headerBg})` }}
      />
      <h1
        className='undp-typography banner-heading margin-bottom-05'
        style={{ color: 'var(--white)' }}
      >
        {t('banner-title')}
      </h1>
      <h5
        className='undp-typography'
        style={{
          color: 'var(--white)',
          maxWidth: '1100px',
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: t('banner-description') }} />
      </h5>
    </section>
  );
}

export default Banner;
