import bgLeft from '../assets/million-bg-left.png';
import bgRight from '../assets/million-bg-right.png';
import { useTranslation } from 'react-i18next';

function Million() {
  const { t } = useTranslation();

  return (
    <section
      id='million'
      className='flex-div flex-column flex-hor-align-center padding-top-12 padding-left-10 padding-right-10 padding-bottom-12'
      style={{
        background: `no-repeat 0% center url(${bgLeft}), no-repeat 100% center url(${bgRight}), #F6F6F6`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        >
        <h2 className='undp-typography margin-bottom-05 page-title'>
          {t('million-title')}
        </h2>
        <div
          className='padding-left-13 padding-right-13'
        >
          <p className='undp-typography'>
            <span dangerouslySetInnerHTML={{ __html: t('million-paragraph-1') }} />
          </p>
          <p className='undp-typography'>
            <span dangerouslySetInnerHTML={{ __html: t('million-paragraph-2') }} />
          </p>
          <ul
            className='undp-typography'
            style={{
              listStyle: 'none',
            }}
          >
            <li>
              <span dangerouslySetInnerHTML={{ __html: t('million-list-1') }} />
            </li>
            <li>
              <span dangerouslySetInnerHTML={{ __html: t('million-list-2') }} />
            </li>
            <li>
              <span dangerouslySetInnerHTML={{ __html: t('million-list-3') }} />
            </li>
            <li>
              <span dangerouslySetInnerHTML={{ __html: t('million-list-4') }} />
            </li>
            <li>
              <span dangerouslySetInnerHTML={{ __html: t('million-list-5') }} />
            </li>
          </ul>
          <p className='undp-typography'>
            <span dangerouslySetInnerHTML={{ __html: t('million-paragraph-3') }} />
          </p>
        </div>
      </div>
    </section>
  );
}

export default Million;
