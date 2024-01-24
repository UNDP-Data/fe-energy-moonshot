import headerBg from '../assets/header-bg.jpg';
import logo from '../assets/undp-logo-white.svg';
import set from '../assets/set.png';
import greenEnergy from '../assets/greenEnergy.png';

function Header() {
  return (
    <header style={{
      backgroundImage: `url(${headerBg})`,
      paddingBottom: '2rem',
    }}
    >
      <div
        className='flex-div'
        style={{
          color: 'var(--white)',
          alignItems: 'baseline',
          justifyContent: 'center',
          marginBottom: '130px',
        }}
      >
        <a
          href='/'
          className='flex-div margin-left-05'
          style={{
            color: 'var(--white)',
            alignItems: 'end',
            textDecoration: 'none',
          }}
        >
          <img src={logo} alt='UNDP logo' />
          <span
            className='margin-left-00'
            style={{
              fontWeight: 'bold',
              marginBottom: '-6px',
            }}
          >
            Sustainable
            <br />
            Energy
            <br />
            Hub
          </span>
        </a>
        <h1
          className='undp-typography'
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            textTransform: 'uppercase',
            fontWeight: '700',
            color: 'var(--white)',
            fontSize: '40px',
            letterSpacing: '2px',
          }}
        >
          UNDP Energy Moonshot tracker
        </h1>
        <div
          style={{
            marginLeft: 'auto',
          }}
        />
      </div>
      <div
        style={{
          maxWidth: '1100px',
          marginLeft: 'auto',
          marginRight: 'auto',
          background: `url(${greenEnergy}) 36px 85px no-repeat, url(${set}) 100% 12px no-repeat, rgba(255,255,255,.8)`,
          padding: '2rem 4rem',
          boxSizing: 'border-box',
        }}
      >
        <h2
          className='undp=typography'
          style={{
            fontSize: '2rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          The PathWay to 500 Million
        </h2>
        <p
          style={{
            marginLeft: '96px',
            marginRight: '120px',
          }}
        >
          The
          {' '}
          <b>
            UNDP Energy Moonshot
          </b>
          {' '}
          endeavors to catalyse unprecedented actions and partnerships to support provision of access to
          {' '}
          <b>
            sustainable, affordable, and reliable energy
          </b>
          {' '}
          to
          {' '}
          <b>
            500 million more people
          </b>
          {' '}
          by
          {' '}
          <b>
            2025
          </b>
          {' '}
          and
          {' '}
          <b>
            accelerate the transition to renewable energy
          </b>
          {' '}
          through systemic changes that lead to inclusive green economies.
        </p>
      </div>
    </header>
  );
}

export default Header;
