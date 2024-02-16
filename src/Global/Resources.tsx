import { ROOT_DIR } from '../Types';
import resources from '../Data/resources'
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
        <button
          type='button'
          className='undp-button button-tertiary button-arrow'
          onClick={() => { console.log('button pressed'); }}
        >
          Explore
        </button>
      </div>
    </div>
  );
}

function Resources() {
  return (
    <section id='resources'>
      <h2 className='undp-typography margin-bottom-03 page-title'>
        Resources
      </h2>
      <p className='undp-typography margin-bottom-08' style={{ maxWidth: 'calc(75vw - 3.2rem)' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
