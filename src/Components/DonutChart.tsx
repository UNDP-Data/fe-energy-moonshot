import styled from 'styled-components';
import { format } from 'd3-format';

interface Props {
  vertFund?: number;
  nonVertFund?: number;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const radian = Math.PI / 180.0;
  const angleInRadians = (angleInDegrees - 90) * radian;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
};

export const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
  return d;
};
interface ColorElProps {
  color: string;
}

const ColorEl = styled.div<ColorElProps>`
  width: 0.675rem;
  height: 0.675rem;
  background-color: ${(props) => props.color};
`;

export const DonutChartCard = (props: Props) => {
  const {
    vertFund,
    nonVertFund,
  } = props;

  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  const vertFundFormated = vertFund === undefined ? 0 : vertFund;
  const nonVertFundFormated = nonVertFund === undefined ? 0 : nonVertFund;
  return (
    <div>
      <div className='flex-div flex-vert-align-center gap-02'>
        <ColorEl color='var(--primary-blue)' />
        <div>
          Vertical Fund:
          {' '}
          <span className='bold'>{vertFundFormated === undefined ? 'N/A' : `USD ${formatData(vertFundFormated)}`}</span>
        </div>
      </div>
      <div className='flex-div flex-vert-align-center gap-02'>
        <ColorEl color='var(--yellow)' />
        <div>
          Non Vertical Fund:
          {' '}
          <span className='bold'>{nonVertFundFormated === undefined ? 'N/A' : `USD ${formatData(nonVertFundFormated)}`}</span>
        </div>
      </div>
      <div className='flex-div' style={{ alignItems: 'flex-end' }}>
        <svg width='180px' viewBox='0 0 360 360' style={{ margin: 'auto' }}>
          <path
            d={describeArc(180, 180, 140, 0, 360 * (vertFundFormated / (vertFundFormated + nonVertFundFormated)))}
            fill='none'
            strokeWidth={40}
            style={{ stroke: 'var(--primary-blue)' }}
          />
          <path
            d={describeArc(180, 180, 140, 360 * (vertFundFormated / (vertFundFormated + nonVertFundFormated)), 360)}
            fill='none'
            strokeWidth={40}
            style={{ stroke: 'var(--yellow)' }}
          />
          <text
            x={180}
            y={180}
            textAnchor='middle'
            fontFamily='proxima-nova'
            fontWeight='bold'
            fontSize='60px'
            dy={10}
          >
            {formatData(vertFundFormated + nonVertFundFormated)}
          </text>
          <text
            x={180}
            y={180}
            textAnchor='middle'
            fontFamily='proxima-nova'
            fontWeight='bold'
            fontSize='20px'
            dy={35}
          >
            Total Grant Amount
          </text>
        </svg>
      </div>
    </div>
  );
};
