import { useTranslation, Trans } from 'react-i18next';
import { format } from 'd3-format';
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
    <div className='undp-table-row'>
      <div style={{ width: '30%' }} className='undp-table-row-cell'>
        <div className='padding-left-05 padding-right-05'>
          <h6 className='undp-typography'>
            {project.projectTitle}
            {' - '}
            {project.projectId}
            {' - '}
            {project.genderMarker}
          </h6>
          <p className='undp-typography'>
            {project.projectDescription}
          </p>
        </div>
      </div>
      <div style={{ width: '20%' }} className='undp-table-row-cell'>
        <div className='padding-left-05 padding-right-05'>
          <p className='undp-typography'>
            {t('country')}
            {' - '}
            <b>{project.countryName}</b>
          </p>
          <p className='undp-typography'>
            {t('budget')}
            {' - '}
            <b>{Math.abs(project.budget) < 1 ? project.budget : format('~s')(project.budget).replace('G', 'B')}</b>
          </p>
          <p className='undp-typography'>
            {t('type')}
            {' - '}
            <b>{t(project.verticalFunded ? 'vf' : 'non-vf')}</b>
          </p>
          {
            project.genderMarker ? (
              <p className='undp-typography'>
                {t('gender-equality')}
                {' - '}
                <b>{t(`${project.genderMarker}-contribution`)}</b>
              </p>
            ) : ''
          }
          {
            project.ghgEmissions ? (
              <p className='undp-typography'>
                {t('ghg-emissions-reduction')}
                {' - '}
                <b>
                  {project.ghgEmissions}
                  M
                  {' '}
                  {t('tonnes')}
                </b>
              </p>
            ) : ''
          }
        </div>
      </div>
      <div style={{ width: '50%' }} className='undp-table-row-cell'>
        {
          project.outputs.map((o, i) => (
            <div key={`${i}output`} className='flex-div'>
              <div
                style={{ width: '40%' }}
                className={`undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`}
              >
                <p className='undp-typography'>
                  { o.directBeneficiaries !== 0 ? (
                    <Trans
                      i18nKey='output-data-text'
                      values={{
                        nBeneficaries: format('~s')(o.directBeneficiaries).replace('G', 'B'),
                        outputType: o.beneficiaryCategory,
                        outputCategory: o.outputCategory,
                      }}
                    />
                  ) : t('indirect-beneficiaries')}
                </p>
              </div>
              <div
                style={{ width: '60%' }}
                className={
                  `undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`
                }
              >
                {o.outputDescription}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export const DataTable = (props: TableProps) => {
  const {
    projects,
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <div className='undp-scrollbar' style={{ height: '20rem' }}>
        <div className='undp-table-head undp-table-head-sticky'>
          <div style={{ width: '30%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('project-title-and-description')}
            </div>
          </div>
          <div style={{ width: '20%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('project-info')}
            </div>
          </div>
          <div style={{ width: '20%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('output-beneficiaries')}
            </div>
          </div>
          <div style={{ width: '30%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('output-description')}
            </div>
          </div>
        </div>
        {
          projects.map((project, i) => (<Project key={`${i}project`} project={project} />))
        }
      </div>
    </>
  );
};
