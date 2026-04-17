import { useState, useEffect } from 'react';
import { json } from 'd3-request';
import { queue } from 'd3-queue';
import { useTranslation } from 'react-i18next';
import { getAssetPath, ROOT_DIR } from '../Types';

interface ResourceInterface {
  img:string;
  title:string;
  description:string;
  link:string;
}

interface ResourceProps {
  resource:ResourceInterface;
}

function Resource(props: ResourceProps) {
  const { resource } = props;
  const { t } = useTranslation();
  return (
    <div style={{ minWidth: 'calc(33.333vw - 1.6rem)' }}>
      <img
        style={{ maxWidth: '100%' }}
        src={`${ROOT_DIR}${resource.img}`}
        alt={resource.title}
      />
      <div className='undp-typography'>
        <h4>{resource.title}</h4>
        <p>{resource.description}</p>
      </div>
      <div>
        <a
          target='_blank'
          rel='noreferrer'
          href={resource.link}
          className='undp-button button-tertiary button-arrow'
          style={{
            display: 'inline-flex',
            textDecoration: 'none',
          }}
        >
          {t('resources-explore')}
        </a>
      </div>
    </div>
  );
}

function Resources() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<ResourceInterface[]>([]);
  useEffect(() => {
    queue()
      .defer(json, getAssetPath('/data/resources.json'))
      .await((err: any, resourcesData: ResourceInterface[]) => {
        setResources(resourcesData);
      });
  }, []);
  return (
    <section id='resources'>
      <h2 className='undp-typography margin-bottom-03 page-title'>
        {t('resources-title')}
      </h2>
      <p className='undp-typography margin-bottom-08' style={{ maxWidth: 'calc(75vw - 3.2rem)' }}>
        {t('resources-description')}
      </p>
      <div
        className='undp-scrollbar'
        style={{
          width: 'calc(100vw - 3rem)',
          overflow: 'auto',
        }}
      >
        <div className='flex-div'>
          {resources.map((r:ResourceInterface, i) => (<Resource key={i} resource={r} />))}
        </div>
      </div>
    </section>
  );
}

export default Resources;
