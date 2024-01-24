import { useTranslation } from 'react-i18next';
import { Collapse } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectLevelDataType } from '../Types';

interface TableProps {
  projects: ProjectLevelDataType[];
}

interface ProjectProps {
  project: ProjectLevelDataType;
}

const Project = (props:ProjectProps) => {
  const {
    project,
  } = props;

  const { t } = useTranslation();

  return (
    <div className='margin-left-05 margin-right-04'>
      <p className='undp-typography small-font'>
        <b>{project.projectId}</b>
        {' '}
        -
        {' '}
        {project.countryName}
        {' '}
        -
        {' '}
        {project.projectTitle}
        {' '}
        -
        {' '}
        {t('budget')}
        {' '}
        {project.budget}
        {' '}
        -
        {' '}
        {t('energy-saved-mj')}
        {' '}
        {project.energySaved}
        {' '}
        -
        {' '}
        {t('ghg-emissions-reduction')}
        {' '}
        {project.ghgEmissions}
      </p>
      <Collapse
        accordion
        className='undp-accordion no-background'
        bordered={false}
        // items={items}
        destroyInactivePanel
        expandIcon={({ isActive }) => (
          isActive
            ? (
              <ChevronDown size={16} strokeWidth={1} stroke='var(--blue-600)' />
            ) : (
              <ChevronRight size={16} strokeWidth={1} stroke='var(--blue-600)' />
            )
        )}
        size='small'
        expandIconPosition='end'
      >
        <Collapse.Panel header={t('outputs')} key='1'>
          {
            project.outputs.map((o, i) => (
              <div key={i}>
                <hr className='undp-style light' />
                <p className='margin-left-05 undp-typography small-font'>
                  {o.outputCategory}
                  {' '}
                  -
                  {' '}
                  {o.beneficiaryCategory}
                  {' '}
                  -
                  {' '}
                  {t('direct-beneficiaries')}
                  {' '}
                  {o.directBeneficiaries}
                </p>
              </div>
            ))
          }
        </Collapse.Panel>
      </Collapse>
      <hr className='undp-style' />
    </div>
  );
};

export const DataTable = (props: TableProps) => {
  const {
    projects,
  } = props;

  const { t } = useTranslation();

  return (
    <div
      className='undp-scrollbar'
      style={{
        overflow: 'auto', position: 'absolute', top: 0, height: '100%', maxWidth: '100%', width: '100%',
      }}
    >
      <div
        style={{ overflow: 'auto', backgroundColor: 'var(--gray-200)' }}
      >
        <h5 className='margin-left-04'>{t('filtered-projects')}</h5>
        {
          projects.map((p, i) => (<Project key={i} project={p} />))
        }
      </div>
    </div>
  );
};
