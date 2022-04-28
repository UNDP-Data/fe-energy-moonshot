import { useContext, useState } from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';
import { CtxDataType, DataType, IndicatorMetaDataWithYear } from '../Types';
import { Logo } from '../Icons';
import Context from '../Context/Context';
import { Settings } from './Settings';
import { Graph } from './Graph';
import { DataSources } from './DataSources';
import { GetEmbedParams } from '../Components/GetEmbedParams';

interface Props {
  data: DataType[];
  indicators: IndicatorMetaDataWithYear[];
  regions: string[];
  countries: string[];
}

const Container = styled.div`
  max-width: 132rem;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const RootEl = styled.div`
  background-color: var(--white);
  color: var(--black-600);
  box-shadow: var(--shadow);
`;

const HeadingEl = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 0;
  align-items: center;
`;

const TitleEl = styled.div`
  display: flex;
  align-items: center;
`;

const GraphEl = styled.div`
  display: flex;
  align-items: stretch;
  @media (max-width: 960px) {
    display: inline;
  }  
`;

const H1 = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-blue);
  line-height: 2rem;
  margin: 1rem 0 0.5rem 1rem;
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;
const H2 = styled.div`
  font-size: 2rem;
  font-weight: bold;
  line-height: 2rem;
  margin: 0 0 0.5rem 1rem;
  @media (max-width: 600px) {
    font-size: 1.6rem;
  }
`;

export const GrapherComponent = (props: Props) => {
  const {
    data,
    indicators,
    regions,
    countries,
  } = props;
  const {
    showSource,
  } = useContext(Context) as CtxDataType;
  const [modalVisibility, setModalVisibility] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  return (
    <>
      <Container>
        <HeadingEl>
          <TitleEl>
            <Logo height={50} />
            <div>
              <H1>Energy Hub Dashboard</H1>
              <H2>Explore All Data</H2>
            </div>
          </TitleEl>
        </HeadingEl>
        <RootEl>
          <GraphEl>
            {
              queryParams.get('showSettings') === 'false' ? null
                : (
                  <Settings
                    indicators={indicators}
                    regions={regions}
                    countries={countries}
                  />
                )
            }
            {
            showSource
              ? (
                <DataSources
                  indicators={indicators}
                  data={data}
                />
              )
              : (
                <Graph
                  data={data}
                  indicators={indicators}
                  fullWidth={queryParams.get('showSettings') === 'false'}
                />
              )
          }
          </GraphEl>
        </RootEl>
      </Container>
      <Modal
        visible={modalVisibility}
        title='Embed Code'
        onOk={() => { setModalVisibility(false); }}
        onCancel={() => { setModalVisibility(false); }}
        footer={[
          <button className='primary' key='back' type='button' onClick={() => { setModalVisibility(false); }}>
            Close
          </button>,
        ]}
      >
        <GetEmbedParams />
      </Modal>
    </>
  );
};
