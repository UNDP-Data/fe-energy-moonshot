import headerBg from '../assets/header-bg.jpg';

function Banner() {
  return (
    <section
      className='flex-div flex-column flex-hor-align-center padding-left-10'
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: 'cover',
        height: 'calc(100vh - 115px)',
      }}
    >
      <h1
        className='undp-typography banner-heading margin-bottom-05'
        style={{ color: 'var(--white)' }}
      >
        The UNDP Energy Moonshot
      </h1>
      <h5
        className='undp-typography'
        style={{
          color: 'var(--white)',
          maxWidth: '1100px',
        }}
      >
        The
        {' '}
        <b>
          UNDP Energy Moonshot
        </b>
        {' '}
        is to catalyse unprecedented actions and partnerships to support provision of access to
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
      </h5>
    </section>
  );
}

export default Banner;
