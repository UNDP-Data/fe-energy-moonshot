import { useState } from 'react';

function Header() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className='undp-country-header'>
      <div className='undp-header-bg flex-space-between flex-div flex-vert-align-center'>
        <div className='flex-div flex-vert-align-center'>
          <a
            href='./'
            style={{ textDecoration: 'none' }}
            className='logo-sub-head flex-div flex-vert-align-center'
          >
            <img
              src='https://design.undp.org/static/media/undp-logo-blue.4f32e17f.svg'
              alt='UNDP Logo'
              width='60'
              height='122'
            />
            <div className='undp-site-title'>
              <span
                style={{
                  textDecoration: 'none',
                  color: 'var(--black)',
                  lineHeight: 1.25,
                }}
              >
                Sustainable
                <br />
                Energy Hub
              </span>
            </div>
          </a>
        </div>
        <div
          className='undp-nav-div flex-div'
          style={{ justifyContent: 'space-between', flexGrow: 1 }}
        >
          <div
            className='flex-div gap-09'
            style={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <a href='#million' className='header-link'>
              500 MILLION
            </a>
          </div>
          <div
            className='flex-div gap-09'
            style={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <a href='#tracker' className='header-link'>
              MOONSHOT TRACKER
            </a>
          </div>
          <div />
        </div>
        <div
          className='undp-nav-div'
          style={{ width: '320px' }}
        />
        <button
          type='button'
          className={showMenu ? 'undp-menu-hamburger is-active' : 'undp-menu-hamburger'}
          aria-label='menu-icon'
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <span className='undp-hamburger-line undp-line-top' />
          <span className='undp-hamburger-line undp-line-middle' />
          <span className='undp-hamburger-line undp-line-bottom' />
          Nav Toggle
        </button>
      </div>
      <div
        className={showMenu ? 'undp-mobile-nav mobile-nav-show' : 'undp-mobile-nav'}
      >
        <div>
          <a href='#million' className='header-link'>
            500 MILLION
          </a>
        </div>
        <div>
          <a href='#tracker' className='header-link'>
            MOONSHOT TRACKER
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;

//
//
//
// import headerBg from '../assets/header-bg.jpg';
// import logo from '../assets/undp-logo-white.svg';
// import set from '../assets/set.png';
// import greenEnergy from '../assets/greenEnergy.png';
//
// function Header() {
//   return (
//     <header style={{
//       backgroundImage: `url(${headerBg})`,
//       paddingBottom: '2rem',
//     }}
//     >
//       <div
//         className='flex-div'
//         style={{
//           color: 'var(--white)',
//           alignItems: 'baseline',
//           justifyContent: 'center',
//           marginBottom: '130px',
//         }}
//       >
//         <a
//           href='/'
//           className='flex-div margin-left-05'
//           style={{
//             color: 'var(--white)',
//             alignItems: 'end',
//             textDecoration: 'none',
//           }}
//         >
//           <img src={logo} alt='UNDP logo' />
//           <span
//             className='margin-left-00'
//             style={{
//               fontWeight: 'bold',
//               marginBottom: '-6px',
//             }}
//           >
//             Sustainable
//             <br />
//             Energy
//             <br />
//             Hub
//           </span>
//         </a>
//         <h1
//           className='undp-typography'
//           style={{
//             marginLeft: 'auto',
//             marginRight: 'auto',
//             textTransform: 'uppercase',
//             fontWeight: '700',
//             color: 'var(--white)',
//             fontSize: '40px',
//             letterSpacing: '2px',
//           }}
//         >
//           UNDP Energy Moonshot tracker
//         </h1>
//         <div
//           style={{
//             marginLeft: 'auto',
//           }}
//         />
//       </div>
//       <div
//         style={{
//           maxWidth: '1100px',
//           marginLeft: 'auto',
//           marginRight: 'auto',
//           background: `url(${greenEnergy}) 36px 85px no-repeat, url(${set}) 100% 12px no-repeat, rgba(255,255,255,.8)`,
//           padding: '2rem 4rem',
//           boxSizing: 'border-box',
//         }}
//       >
//         <h2
//           className='undp=typography'
//           style={{
//             fontSize: '2rem',
//             textTransform: 'uppercase',
//             fontWeight: 700,
//             marginTop: 0,
//             marginBottom: 0,
//           }}
//         >
//           The PathWay to 500 Million
//         </h2>
//         <p
//           style={{
//             marginLeft: '96px',
//             marginRight: '120px',
//           }}
//         >
//           The
//           {' '}
//           <b>
//             UNDP Energy Moonshot
//           </b>
//           {' '}
//           endeavors to catalyse unprecedented actions and partnerships to support provision of access to
//           {' '}
//           <b>
//             sustainable, affordable, and reliable energy
//           </b>
//           {' '}
//           to
//           {' '}
//           <b>
//             500 million more people
//           </b>
//           {' '}
//           by
//           {' '}
//           <b>
//             2025
//           </b>
//           {' '}
//           and
//           {' '}
//           <b>
//             accelerate the transition to renewable energy
//           </b>
//           {' '}
//           through systemic changes that lead to inclusive green economies.
//         </p>
//       </div>
//     </header>
//   );
// }
//
// export default Header;
