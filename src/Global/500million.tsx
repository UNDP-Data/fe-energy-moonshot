import bgLeft from '../assets/million-bg-left.png';
import bgRight from '../assets/million-bg-right.png';

function Million() {
  return (
    <section
      id='million'
      className='flex-div flex-column flex-hor-align-center padding-top-12 padding-left-10 padding-right-10 padding-bottom-5'
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
          The path to 500 million
        </h2>
        <div
          className='padding-left-13 padding-right-13'
        >
          <p className='undp-typography'>
            To enhance
            {' '}
            <b>
              monitoring of collective progress
            </b>
            {' '}
            towards the
            {' '}
            <b>
              Energy Moonshot
            </b>
            {' '}
            , this tracker aims to identify the targeted beneficiaries for all UNDP energy-related projects active during the period of the UNDP Strategic Plan 2022 – 2025. These targets are compiled from project documents and validated with UNDP Country Offices.
          </p>
          <p className='undp-typography'>
            {' '}
            <b>
              Direct and indirect beneficiaries
            </b>
            {' '}
            are estimated based on project outputs supporting:
          </p>
          <ul
            className='undp-typography'
            style={{
              listStyle: 'none',
            }}
          >
            <li>
              {'> '}
              <b>
                Access to clean electricity and cooking
              </b>
              {' '}
              for solar, wind, biomass, hydro, and geothermal
            </li>
            <li>
              {'> '}
              <b>
                Productive use of energy
              </b>
              {' '}
              related to health, water, food systems, education, and transport
            </li>
            <li>
              {'> '}
              <b>
                Energy governance
              </b>
              {' '}
              including policies, regulatory frameworks, roadmaps, and plans
            </li>
            <li>
              {'> '}
              <b>
                Market development
              </b>
              {' '}
              by access to finance and innovative finance mechanisms
            </li>
            <li>
              {'> '}
              <b>
                Energy efficiency
              </b>
              {' '}
              interventions to reduce energy costs and emissions
            </li>
          </ul>
          <p className='undp-typography'>
            A key priority of this effort is to advance
            {' '}
            <b>
              integrating gender equality
            </b>
            {' '}
            by capturing the gender marker ratings for each project and providing outputs disaggregated by sex when available.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Million;
