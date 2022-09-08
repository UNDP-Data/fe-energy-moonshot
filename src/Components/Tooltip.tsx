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
  z-index: 10;
  border-radius: 1rem;
  font-size: 1.4rem;
  background-color: var(--white);
  box-shadow: 0 0 1rem rgb(0 0 0 / 15%);
  word-wrap: break-word;
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  /* max-width: 24rem; */
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

const TooltipTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--navy);  
  background: var(--yellow);
  width: 100%;
  box-sizing: border-box;
  border-radius: 1rem 1rem 0 0;
  padding: 1.6rem 4rem 1.6rem 2rem;
  position: relative;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.8rem;
`;

const SubNote = styled.span`
  font-size: 1.2rem;
  color: var(--navy);
`;

const TooltipBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem;
`;

const MetricGrp = styled.div`
  margin-bottom: 2rem;
`;

const RowEl = styled.div`
  font-size: 1.3rem;
  color: var(--dark-grey);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start; 
`;

const RowTitleEl = styled.div`
  font-weight: 400;
  font-size: 1.4rem;
  line-height: 2rem;
  margin-right: 5px;
  color: var(--navy);
`;

const RowValue = styled.div`
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 2rem;
  color: var(--navy);
`;

const TooltipHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
      <TooltipHead>
        <TooltipTitle>
          {data.country}
          {' '}
          <SubNote>
            (
            {data.continent}
            )
          </SubNote>
        </TooltipTitle>
      </TooltipHead>
      <TooltipBody>
        <MetricGrp>
          <RowEl>
            <RowTitleEl>
              People directly benefiting
            </RowTitleEl>
            <RowValue>
              { data.peopleDirectlyBenefiting === undefined ? 'N/A' : formatData(data.peopleDirectlyBenefiting) }
            </RowValue>
          </RowEl>
          <RowEl>
            <RowTitleEl>
              CO2 emissions reduced (tonnes):
            </RowTitleEl>
            <RowValue>
              {data.emissionsReduced === undefined ? 'N/A' : formatData(data.emissionsReduced)}
            </RowValue>
          </RowEl>
        </MetricGrp>
        <MetricGrp>
          Vertical Fund Projects:
          <RowEl>
            <RowTitleEl>
              Grant Amount (USD):
            </RowTitleEl>
            <RowValue>
              {data.grantAmountVerticalFund === undefined ? 'N/A' : formatData(data.grantAmountVerticalFund)}
            </RowValue>
          </RowEl>
          <RowEl>
            <RowTitleEl>
              Expenses (USD):
            </RowTitleEl>
            <RowValue>
              {data.expensesVerticalFund === undefined ? 'N/A' : formatData(data.expensesVerticalFund)}
            </RowValue>
          </RowEl>
          <RowEl>
            <RowTitleEl>
              Co-Financing (USD):
            </RowTitleEl>
            <RowValue>
              {data.coFinancingVerticalFund === undefined ? 'N/A' : formatData(data.coFinancingVerticalFund)}
            </RowValue>
          </RowEl>
        </MetricGrp>
        <MetricGrp>
          <RowEl>
            <RowTitleEl>
              Number of projects:
            </RowTitleEl>
            <RowValue>
              {data.numberProjects === undefined ? 'N/A' : formatData(data.numberProjects)}
            </RowValue>
          </RowEl>
        </MetricGrp>
      </TooltipBody>
    </TooltipEl>
  );
};
