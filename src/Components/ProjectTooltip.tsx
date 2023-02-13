import styled from 'styled-components';
import { format } from 'd3-format';
import { ProjectHoverDataType } from '../Types';

interface Props {
  data: ProjectHoverDataType;
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
  width:${(props) => (props.horizontalAlignment === 'right' ? 'auto' : (props.x < 200 ? `${props.x - 60}px` : '200px'))};
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

export const ProjectTooltip = (props: Props) => {
  const {
    data,
  } = props;
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(2))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };

  return (
    <TooltipEl x={data.xPosition} y={data.yPosition} verticalAlignment={data.yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={data.xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <h6 className='undp-typography bold margin-bottom-05'>
        {data.name}
      </h6>
      <div className='margin-bottom-07'>
        <p className='undp-typography margin-bottom-01'>
          Donor:
          {' '}
          <span className='bold'>
            {data.donor === undefined ? 'N/A' : data.donor}
          </span>
        </p>
        <p className='undp-typography margin-bottom-01'>
          Budget (USD):
          {' '}
          <span className='bold'>
            {data.grantAmount === undefined ? 'N/A' : formatData(data.grantAmount)}
          </span>
        </p>
      </div>
    </TooltipEl>
  );
};
