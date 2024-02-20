import styled from 'styled-components';
import { format } from 'd3-format';
import { useTranslation } from 'react-i18next';
import { HoverDataType } from '../Types';

interface Props {
  data: HoverDataType;
}

interface TooltipElProps {
  x: number;
  y: number;
  verticalAlignment: string;
  horizontalAlignment: string;
}

const TooltipEl = styled.div<TooltipElProps>`
  display: block;
  position: fixed;
  z-index: 8;
  background-color: var(--gray-300);
  padding: var(--spacing-05);
  word-wrap: break-word;
  width:${(props) => (props.horizontalAlignment === 'right' ? 'auto' : (props.x < 280 ? `${props.x - 60}px` : '280px'))};
  max-width: 280px;
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

export const Tooltip = (props: Props) => {
  const {
    data,
  } = props;
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;
    if (d < 1) return parseFloat(d.toFixed(3));
    if (d < 100) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  // translation
  const { t } = useTranslation();
  return (
    <TooltipEl x={data.xPosition} y={data.yPosition} verticalAlignment={data.yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={data.xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <div className='flex-div flex-wrap' style={{ alignItems: 'baseline' }}>
        <h5 className='undp-typography bold margin-bottom-02 bold'>
          {data.country}
          {' '}
          <span
            className='undp-typography'
            style={{
              color: 'var(--gray-600)', fontWeight: 'normal', fontSize: '0.875rem', textTransform: 'none',
            }}
          >
            (
            {data.continent}
            )
          </span>
        </h5>
      </div>
      <div className='margin-bottom-05'>
        { data.peopleDirectlyBenefiting !== 0
          ? (
            <p className='small-font margin-bottom-00'>
              {`${t('people-benefiting')}:`}
              {' '}
              <span className='bold'>
                {formatData(data.peopleDirectlyBenefiting)}
              </span>
            </p>
          ) : (
            <p className='small-font margin-bottom-00'>
              Indirect beneficiaries
            </p>
          )}
        { data.grantAmount !== 0
          ? (
            <p className='small-font margin-bottom-00'>
              {`${t('grant-amount')}:`}
              {' '}
              <span className='bold'>
                USD
                {' '}
                {formatData(data.grantAmount)}
              </span>
            </p>
          ) : ''}
        { data.energySaved !== 0
          ? (
            <p className='small-font margin-bottom-00'>
              {`${t('energy-saved-mj')}:`}
              {' '}
              <span className='bold'>
                {formatData(data.energySaved)}
              </span>
            </p>
          ) : ''}
        { data.mwAdded !== 0
          ? (
            <p className='small-font margin-bottom-00'>
              {`${t('mw-added')}:`}
              {' '}
              <span className='bold'>
                {formatData(data.mwAdded)}
              </span>
            </p>
          ) : ''}
        { data.ghgEmissions !== 0
          ? (
            <p className='small-font margin-bottom-00'>
              {`${t('ghg-emissions-reduction')}:`}
              {' '}
              <span className='bold'>
                {formatData(data.ghgEmissions)}
              </span>
            </p>
          ) : ''}
        <p className='small-font margin-bottom-00'>
          {`${t('number-projects')}:`}
          {' '}
          <span className='bold'>
            {data.numberProjects === undefined ? 'N/A' : formatData(data.numberProjects)}
          </span>
        </p>
      </div>
    </TooltipEl>
  );
};
