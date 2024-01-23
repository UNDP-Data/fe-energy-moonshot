import { Logo } from '../Icons';

function Footer() {
  return (
    <footer>
      <div className='undp-footer'>
        <div
          className='flex-div flex-space-between margin-bottom-07'
          style={{
            padding: '0 0.75rem var(--spacing-09) 0.75rem',
            borderBottom: '1px solid var(--white)',
          }}
        >
          <div
            className='flex-div flex-vert-align-center'
            style={{ margin: 0 }}
          >
            <a
              href='https://www.undp.org/'
              target='_blank'
              rel='noreferrer'
            >
              <Logo height={130} white />
            </a>
            <h5 className='undp-typography margin-bottom-00'>
              United Nations
              <br />
              Development Programme
            </h5>
          </div>
          <div>
            <div className='margin-bottom-03 '>
              <a
                className='undp-footer-link undp-footer-right-link'
                href='mailto:data@undp.org'
                target='_blank'
                rel='noreferrer'
              >
                Contact Us
              </a>
            </div>
            <div className='margin-bottom-03'>
              <a
                className='undp-footer-link undp-footer-right-link'
                href='https://data.undp.org/'
                target='_blank'
                rel='noreferrer'
              >
                Data Futures Exchange
              </a>
            </div>
          </div>
        </div>
        <div className='flex-div flex-space-between'>
          <div>
            <p
              className='undp-typography margin-top-05 margin-bottom-00'
              style={{ padding: '0 0.75rem', fontSize: '1rem' }}
            >
              © 2023 United Nations Development Programme
            </p>
          </div>
          <a
            href='https://www.undp.org/copyright-terms-use'
            target='_blank'
            rel='noreferrer'
            style={{ textDecoration: 'none' }}
          >
            <p className='undp-typography margin-top-05 undp-footer-link undp-footer-right-link'>
              Terms Of Use
            </p>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
