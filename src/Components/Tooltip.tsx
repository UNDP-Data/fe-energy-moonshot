import styled from 'styled-components';
import { format } from 'd3-format';
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

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };

  return (
    <TooltipEl x={data.xPosition} y={data.yPosition} verticalAlignment={data.yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={data.xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <div className='flex-div flex-wrap' style={{ alignItems: 'baseline' }}>
        <h5 className='undp-typography bold margin-bottom-05 bold'>
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
        <p className='undp-typography margin-bottom-01'>
          People directly benefiting:
          {' '}
          <span className='bold'>
            { data.peopleDirectlyBenefiting === undefined ? 'N/A' : formatData(data.peopleDirectlyBenefiting) }
          </span>
        </p>
      </div>
      <div className='margin-bottom-05'>
        <p className='undp-typography margin-bottom-01'>
          Grant Amount (USD):
          {' '}
          <span className='bold'>
            {data.grantAmount === undefined ? 'N/A' : formatData(data.grantAmount)}
          </span>
        </p>
      </div>
      <div>
        <p className='undp-typography margin-bottom-01'>
          Number of projects:
          {' '}
          <span className='bold'>
            {data.numberProjects === undefined ? 'N/A' : formatData(data.numberProjects)}
          </span>
        </p>
      </div>
    </TooltipEl>
  );
};
