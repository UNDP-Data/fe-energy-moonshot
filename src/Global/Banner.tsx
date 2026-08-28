import headerBg from '../assets/header-bg.webp';
import { useTranslation } from 'react-i18next';

function Banner() {
  const { t } = useTranslation();

  return (
    <section
      className='banner-section flex-div flex-column flex-hor-align-center padding-left-10'
      data-walkthrough-target='hero'
    >
      <div
        aria-hidden='true'
        className='banner-static-bg'
        style={{ backgroundImage: `url(${headerBg})` }}
      />
      <h1
        className='undp-typography banner-heading margin-bottom-05'
        data-walkthrough-target='hero-title'
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
